import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

// ... rest of your code

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { progress: true },
    });
    
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, grade } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role || 'STUDENT',
        grade: grade || null,
      },
    });
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Don't send password hash to client
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        progress: true,
        attempts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        badges: true,
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't send password hash to client
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, grade, password } = req.body;
    
    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(grade !== undefined && { grade }),
    };
    
    // If password is being updated, hash it
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    
    // Don't send password hash to client
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete user (related records will cascade delete based on schema)
    await prisma.user.delete({
      where: { id },
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get exercises
app.get('/api/exercises', async (req, res) => {
  try {
    const exercises = await prisma.exercise.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit answer
app.post('/api/exercises/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, selectedAnswer, timeSpent } = req.body;
    
    const exercise = await prisma.exercise.findUnique({ where: { id } });
    const isCorrect = selectedAnswer === exercise.correctAnswer;
    
    // Create attempt
    await prisma.attempt.create({
      data: {
        userId,
        exerciseId: id,
        selectedAnswer,
        isCorrect,
        timeSpentSeconds: timeSpent,
      },
    });
    
    // Update progress
    const progress = await prisma.progress.upsert({
      where: { userId },
      update: {
        exercisesCompleted: { increment: 1 },
        totalAnswers: { increment: 1 },
        correctAnswers: { increment: isCorrect ? 1 : 0 },
        totalPoints: { increment: isCorrect ? exercise.difficulty * 10 : 0 },
        lastActivity: new Date(),
      },
      create: {
        userId,
        exercisesCompleted: 1,
        totalAnswers: 1,
        correctAnswers: isCorrect ? 1 : 0,
        totalPoints: isCorrect ? exercise.difficulty * 10 : 0,
      },
    });
    
    res.json({ isCorrect, progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      database: 'connected',
      env: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
