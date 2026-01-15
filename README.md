# PhonicsLearn

> A gamified phonics and word recognition platform designed to help middle school students (grades 6-8) master essential literacy skills through engaging exercises and data-driven insights.

[![License: Apache 2.0 ](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)

[Live Demo](https://phonicslearn.vercel.app) • [Documentation](./docs) • [Report Bug](https://github.com/KhalilM0H/phonicslearn/issues) • [Request Feature](https://github.com/KhalilM0H/phonicslearn/issues)

---

## Problem Statement

Middle school students often have undiagnosed gaps in foundational phonics and word recognition skills. Traditional one-size-fits-all approaches fail to:
- Identify individual student weaknesses
- Provide engaging, age-appropriate practice
- Give teachers actionable insights
- Enable independent learning outside the classroom

**PhonicsLearn** bridges this gap with adaptive, gamified learning that meets students where they are.

---

## Key Features

### For Students
- **Gamified Learning** - Earn points, unlock badges, and maintain streaks
- **Adaptive Exercises** - AI-driven difficulty adjustment based on performance
- **5 Core Skill Areas** - Syllables, rhyming, blends, sight words, suffixes/prefixes
- **Mobile-Friendly** - Practice anywhere, anytime
- **Achievements & Leaderboards** - Student compete to earn points/rewards

### For Teachers
- **Real-Time Analytics** - Class and individual student performance dashboards
- **Assignment Management** - Create custom exercise sets and deadlines
- **Gap Analysis** - Identify struggling students and specific skill deficits
- **Standards Alignment** - Track progress against Common Core standards
- **Feedback Tools** - Provide personalized encouragement and tips

### For Parents
- **Progress Monitoring** - View child's daily/weekly activity and growth
- **Email Reports** - Weekly summaries of achievements and areas for focus
- **Practice Reminders** - Configurable notifications for consistency

---

## Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand / React Query
- **Routing:** React Router v6
- **Charts:** Recharts / Chart.js
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js 20.x
- **Framework:** Express.js / Fastify
- **Language:** TypeScript
- **Authentication:** JWT + bcrypt
- **API:** RESTful (future: GraphQL)
- **Validation:** Zod

### Database & Storage
- **Primary DB:** PostgreSQL 15+
- **ORM:** Prisma / Drizzle
- **Caching:** Redis (for sessions, leaderboards)
- **File Storage:** AWS S3 / Cloudinary (future: audio pronunciations)

### DevOps & Infrastructure
- **Hosting:** Vercel (Frontend) + Railway/Render (Backend)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (errors), PostHog (analytics)
- **Email:** SendGrid / Resend

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL 15+
- npm/yarn/pnpm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/KhalilM0H/phonicslearn.git
cd phonicslearn

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys

# Run database migrations
npm run db:migrate

# Seed initial data (exercises, badges)
npm run db:seed

# Start development server
npm run dev

Visit http://localhost:3000 to see the app running.

Project Structure
phonicslearn/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── stores/        # State management
│   │   ├── utils/         # Helper functions
│   │   └── types/         # TypeScript definitions
│   └── public/            # Static assets
│
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Business logic
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Auth, validation, etc.
│   │   ├── services/      # External services (email, AI)
│   │   └── utils/         # Helper functions
│   └── prisma/            # Database schema & migrations
│
├── docs/                  # Documentation
├── scripts/               # Build & deployment scripts
└── tests/                 # E2E and integration tests


Product Roadmap
Phase 1: MVP - CURRENT
[x] Basic authentication (email/password)
[x] Student dashboard with metrics
[x] 5 core exercise types (10 questions each)
[x] Points & streak tracking
[x] Basic badge system
[x] Teacher/parent view (read-only)
[x] Responsive design
Phase 2: Core Enhancement 
[ ] Database Integration
PostgreSQL setup with Prisma
User management (CRUD)
Exercise attempt logging
Progress persistence
[ ] Advanced Gamification
15+ badges with progression tiers
Class leaderboards (opt-in)
Daily challenges
Avatar customization
[ ] Teacher Tools
Create custom assignments
Set due dates and reminders
Bulk student import (CSV)
Class performance heatmaps
[ ] Enhanced Exercises
100+ total questions across all types
Audio pronunciation support
Contextual hints
Explanation after incorrect answers
Phase 3: Intelligence Layer
[ ] Adaptive Learning
Difficulty auto-adjustment based on accuracy
Skill gap detection algorithm
Personalized exercise recommendations
Spaced repetition for weak areas
[ ] Analytics Dashboard
Time-series performance graphs
Skill mastery breakdown
Predictive insights (at-risk students)
Export reports (PDF/CSV)
[ ] Parent Portal Enhancement
Weekly email summaries
Practice reminders via SMS/email
Suggested offline activities
Communication with teachers
Phase 4: Scale & Polish
[ ] Performance Optimization
Redis caching layer
Database query optimization
Lazy loading & code splitting
CDN for static assets
[ ] Accessibility (WCAG 2.1 AA)
Screen reader support
Keyboard navigation
High contrast mode
Text-to-speech for questions
[ ] Content Expansion
300+ exercises total
Multi-level difficulty (3 tiers)
Video tutorials
Printable worksheets
[ ] Integrations
Google Classroom sync
Canvas LMS integration
Clever SSO
Stripe for subscriptions

Database Schema (Core Tables)
-- Users
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  role ENUM('student', 'teacher', 'parent', 'admin'),
  name VARCHAR,
  grade INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Student Progress
progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2),
  last_activity TIMESTAMP
)

-- Exercises
exercises (
  id UUID PRIMARY KEY,
  type ENUM('syllable', 'rhyme', 'blend', 'sight', 'suffix'),
  question TEXT,
  options JSONB,
  correct_answer INTEGER,
  difficulty INTEGER (1-3),
  explanation TEXT,
  tags VARCHAR[]
)

-- Attempt History
attempts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  exercise_id UUID REFERENCES exercises(id),
  selected_answer INTEGER,
  is_correct BOOLEAN,
  time_spent_seconds INTEGER,
  created_at TIMESTAMP
)

-- Badges
badges (
  id UUID PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  icon VARCHAR,
  requirement_type VARCHAR,
  requirement_value INTEGER
)

-- User Badges (join table)
user_badges (
  user_id UUID REFERENCES users(id),
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMP,
  PRIMARY KEY (user_id, badge_id)
)

-- Classes (for teachers)
classes (
  id UUID PRIMARY KEY,
  name VARCHAR,
  teacher_id UUID REFERENCES users(id),
  grade INTEGER,
  year INTEGER
)

-- Class Enrollment
enrollments (
  student_id UUID REFERENCES users(id),
  class_id UUID REFERENCES classes(id),
  enrolled_at TIMESTAMP,
  PRIMARY KEY (student_id, class_id)
)

-- Assignments
assignments (
  id UUID PRIMARY KEY,
  class_id UUID REFERENCES classes(id),
  title VARCHAR,
  description TEXT,
  exercise_ids UUID[],
  due_date TIMESTAMP,
  created_at TIMESTAMP
)


Testing Strategy
Unit Tests: Jest + React Testing Library (target: 80% coverage)
Integration Tests: Supertest for API endpoints
E2E Tests: Playwright for critical user flows
Performance Tests: Lighthouse CI (target: 90+ score)

Contributing
We welcome contributions!
Fork the repository
Create a feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request

License
This project is licensed under the Apache 2.0 License

Acknowledgments
Inspired by evidence-based literacy research from Reading Rockets
Exercise content aligned with Common Core State Standards

Contact & Support
Email: Khalil.ib.Mohamed@gmail.com
Issues: GitHub Issues

Built with ❤️ for educators and students
