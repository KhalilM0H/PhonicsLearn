import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create badges
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: 'First Steps',
        description: 'Complete your first exercise',
        icon: '🎯',
        requirementType: 'exercises',
        requirementValue: 1,
      },
    }),
    prisma.badge.create({
      data: {
        name: '10 Day Streak',
        description: 'Practice for 10 days in a row',
        icon: '🔥',
        requirementType: 'streak',
        requirementValue: 10,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Century',
        description: 'Earn 100 points',
        icon: '💯',
        requirementType: 'points',
        requirementValue: 100,
      },
    }),
  ]);

  // Create sample exercises
  const exercises = await Promise.all([
    prisma.exercise.create({
      data: {
        type: 'SYLLABLE',
        question: 'How many syllables are in "computer"?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 1,
        difficulty: 1,
        explanation: 'Computer has 3 syllables: com-pu-ter',
        tags: ['syllable-counting', 'beginner'],
      },
    }),
    prisma.exercise.create({
      data: {
        type: 'RHYME',
        question: 'Which word rhymes with "light"?',
        options: ['bite', 'might', 'fight', 'all of these'],
        correctAnswer: 3,
        difficulty: 1,
        tags: ['rhyming', 'beginner'],
      },
    }),
  ]);

  // Create demo teacher
  const hashedPassword = await bcrypt.hash('teacher123', 10);
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@school.com',
      passwordHash: hashedPassword,
      name: 'Ms. Johnson',
      role: 'TEACHER',
    },
  });

  console.log('Database seeded successfully!');
  console.log({ badges, exercises, teacher });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
