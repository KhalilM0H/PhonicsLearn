import React, { useState, useEffect } from 'react';
import { Trophy, Star, Flame, BookOpen, BarChart3, Users, Award, Target, TrendingUp } from 'lucide-react';

// Types
type UserRole = 'student' | 'teacher' | 'parent';
type ExerciseType = 'syllable' | 'rhyme' | 'blend' | 'sight' | 'suffix';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  grade?: number;
  teacherId?: string;
}

interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options: string[];
  correct: number;
  difficulty: number;
}

interface Progress {
  studentId: string;
  exercisesCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  points: number;
  streak: number;
  lastActivity: Date;
  badges: string[];
  exerciseStats: Record<ExerciseType, { completed: number; accuracy: number }>;
}

// Mock Data
const EXERCISES: Record<ExerciseType, Exercise[]> = {
  syllable: [
    { id: 's1', type: 'syllable', question: 'How many syllables are in "computer"?', options: ['2', '3', '4', '5'], correct: 1, difficulty: 1 },
    { id: 's2', type: 'syllable', question: 'How many syllables are in "elephant"?', options: ['2', '3', '4', '5'], correct: 1, difficulty: 1 },
    { id: 's3', type: 'syllable', question: 'How many syllables are in "incredible"?', options: ['2', '3', '4', '5'], correct: 2, difficulty: 2 },
  ],
  rhyme: [
    { id: 'r1', type: 'rhyme', question: 'Which word rhymes with "light"?', options: ['bite', 'might', 'fight', 'all of these'], correct: 3, difficulty: 1 },
    { id: 'r2', type: 'rhyme', question: 'Which word rhymes with "cake"?', options: ['make', 'cat', 'car', 'cap'], correct: 0, difficulty: 1 },
  ],
  blend: [
    { id: 'b1', type: 'blend', question: 'What sound does "ch" make in "chair"?', options: ['/k/', '/ch/', '/sh/', '/th/'], correct: 1, difficulty: 1 },
    { id: 'b2', type: 'blend', question: 'What blend do you hear at the start of "street"?', options: ['st', 'str', 'tr', 'sr'], correct: 1, difficulty: 2 },
  ],
  sight: [
    { id: 'si1', type: 'sight', question: 'Which is the correct spelling?', options: ['becuz', 'because', 'becaus', 'becuase'], correct: 1, difficulty: 1 },
    { id: 'si2', type: 'sight', question: 'Which is the correct spelling?', options: ['definitly', 'definately', 'definitely', 'definatley'], correct: 2, difficulty: 2 },
  ],
  suffix: [
    { id: 'su1', type: 'suffix', question: 'What is the suffix in "hopeless"?', options: ['-hope', '-less', '-ess', '-le'], correct: 1, difficulty: 1 },
    { id: 'su2', type: 'suffix', question: 'What does the suffix "-ful" mean in "beautiful"?', options: ['without', 'full of', 'before', 'after'], correct: 1, difficulty: 2 },
  ],
};

const BADGES = [
  { id: 'first_steps', name: 'First Steps', requirement: 1, icon: '🎯' },
  { id: 'ten_streak', name: '10 Day Streak', requirement: 10, icon: '🔥' },
  { id: 'hundred_points', name: 'Century', requirement: 100, icon: '💯' },
  { id: 'master', name: 'Phonics Master', requirement: 50, icon: '🏆' },
];

export default function PhonicsLearningPlatform() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>('student');
  const [progress, setProgress] = useState<Progress>({
    studentId: '',
    exercisesCompleted: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    points: 0,
    streak: 0,
    lastActivity: new Date(),
    badges: [],
    exerciseStats: {
      syllable: { completed: 0, accuracy: 0 },
      rhyme: { completed: 0, accuracy: 0 },
      blend: { completed: 0, accuracy: 0 },
      sight: { completed: 0, accuracy: 0 },
      suffix: { completed: 0, accuracy: 0 },
    },
  });
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [view, setView] = useState<'dashboard' | 'exercise' | 'progress'>('dashboard');

  // Load random exercise
  const loadNewExercise = () => {
    const types = Object.keys(EXERCISES) as ExerciseType[];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const exercisesOfType = EXERCISES[randomType];
    const randomExercise = exercisesOfType[Math.floor(Math.random() * exercisesOfType.length)];
    setCurrentExercise(randomExercise);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  // Handle login
  const handleLogin = () => {
    if (loginEmail) {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: loginEmail.split('@')[0],
        email: loginEmail,
        role: loginRole,
        grade: loginRole === 'student' ? 7 : undefined,
      };
      setCurrentUser(user);
      if (loginRole === 'student') {
        setProgress(prev => ({ ...prev, studentId: user.id }));
      }
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentExercise) return;
    
    const isCorrect = selectedAnswer === currentExercise.correct;
    const pointsEarned = isCorrect ? 10 * currentExercise.difficulty : 0;
    
    setProgress(prev => {
      const newProgress = {
        ...prev,
        exercisesCompleted: prev.exercisesCompleted + 1,
        totalAnswers: prev.totalAnswers + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        points: prev.points + pointsEarned,
        streak: isCorrect ? prev.streak + 1 : 0,
        lastActivity: new Date(),
        exerciseStats: {
          ...prev.exerciseStats,
          [currentExercise.type]: {
            completed: prev.exerciseStats[currentExercise.type].completed + 1,
            accuracy: ((prev.exerciseStats[currentExercise.type].accuracy * prev.exerciseStats[currentExercise.type].completed + (isCorrect ? 100 : 0)) / 
                      (prev.exerciseStats[currentExercise.type].completed + 1))
          }
        }
      };

      // Check for new badges
      const newBadges = [...prev.badges];
      if (newProgress.exercisesCompleted === 1 && !newBadges.includes('first_steps')) {
        newBadges.push('first_steps');
      }
      if (newProgress.streak >= 10 && !newBadges.includes('ten_streak')) {
        newBadges.push('ten_streak');
      }
      if (newProgress.points >= 100 && !newBadges.includes('hundred_points')) {
        newBadges.push('hundred_points');
      }
      if (newProgress.exercisesCompleted >= 50 && !newBadges.includes('master')) {
        newBadges.push('master');
      }

      return { ...newProgress, badges: newBadges };
    });

    setShowResult(true);
  };

  // Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PhonicsLearn</h1>
            <p className="text-gray-600">Master phonics and word recognition</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your.email@school.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                {(['student', 'teacher', 'parent'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setLoginRole(role)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                      loginRole === role
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">MVP Demo - Authentication simulated</p>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PhonicsLearn</h1>
              <p className="text-xs text-gray-600">Welcome, {currentUser.name}!</p>
            </div>
          </div>

          {currentUser.role === 'student' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-orange-700">{progress.streak} day streak</span>
              </div>
              <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold text-yellow-700">{progress.points} pts</span>
              </div>
            </div>
          )}

          <button
            onClick={() => setCurrentUser(null)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </button>
          {currentUser.role === 'student' && (
            <>
              <button
                onClick={() => setView('exercise')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'exercise' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Practice
              </button>
              <button
                onClick={() => setView('progress')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'progress' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                My Progress
              </button>
            </>
          )}
        </div>

        {/* Dashboard View */}
        {view === 'dashboard' && currentUser.role === 'student' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold text-gray-900">{progress.exercisesCompleted}</span>
              </div>
              <p className="text-gray-600 text-sm">Exercises Completed</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold text-gray-900">
                  {progress.totalAnswers > 0 ? Math.round((progress.correctAnswers / progress.totalAnswers) * 100) : 0}%
                </span>
              </div>
              <p className="text-gray-600 text-sm">Accuracy</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-8 h-8 text-orange-500" />
                <span className="text-2xl font-bold text-gray-900">{progress.streak}</span>
              </div>
              <p className="text-gray-600 text-sm">Day Streak</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-purple-500" />
                <span className="text-2xl font-bold text-gray-900">{progress.badges.length}</span>
              </div>
              <p className="text-gray-600 text-sm">Badges Earned</p>
            </div>

            {/* Quick Start */}
            <div className="md:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Ready to practice?</h3>
              <p className="mb-4 text-indigo-100">Complete exercises to earn points and unlock badges!</p>
              <button
                onClick={() => {
                  loadNewExercise();
                  setView('exercise');
                }}
                className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                Start Practice
              </button>
            </div>

            {/* Badges */}
            <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Your Badges
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {BADGES.map((badge) => {
                  const earned = progress.badges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        earned
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50 opacity-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <p className="text-sm font-semibold text-gray-900">{badge.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Teacher/Parent Dashboard */}
        {view === 'dashboard' && (currentUser.role === 'teacher' || currentUser.role === 'parent') && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600" />
                Student Overview
              </h2>
              <p className="text-gray-600 mb-6">
                Monitor student progress, track completion rates, and identify areas needing support.
              </p>

              {/* Mock Student List */}
              <div className="space-y-3">
                {['Emma Johnson', 'Noah Smith', 'Olivia Williams'].map((student, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{student}</p>
                        <p className="text-sm text-gray-500">Grade 7 • Last active: Today</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">{Math.floor(Math.random() * 500) + 200}</p>
                        <p className="text-xs text-gray-500">Total Points</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-600">
                        <strong>{Math.floor(Math.random() * 30) + 20}</strong> exercises
                      </span>
                      <span className="text-gray-600">
                        <strong>{Math.floor(Math.random() * 20) + 75}%</strong> accuracy
                      </span>
                      <span className="text-gray-600">
                        <strong>{Math.floor(Math.random() * 15) + 1}</strong> day streak
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Exercise View */}
        {view === 'exercise' && currentUser.role === 'student' && (
          <div className="max-w-2xl mx-auto">
            {!currentExercise ? (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <BookOpen className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Ready to Practice?</h2>
                <p className="text-gray-600 mb-6">
                  Challenge yourself with phonics exercises and earn points!
                </p>
                <button
                  onClick={loadNewExercise}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Start Exercise
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold capitalize">
                    {currentExercise.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    Difficulty: {'⭐'.repeat(currentExercise.difficulty)}
                  </span>
                </div>

                <h2 className="text-2xl font-bold mb-6 text-gray-900">{currentExercise.question}</h2>

                <div className="space-y-3 mb-6">
                  {currentExercise.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => !showResult && setSelectedAnswer(idx)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        showResult
                          ? idx === currentExercise.correct
                            ? 'border-green-500 bg-green-50'
                            : idx === selectedAnswer
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-gray-50'
                          : selectedAnswer === idx
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{option}</span>
                    </button>
                  ))}
                </div>

                {showResult && (
                  <div className={`p-4 rounded-lg mb-6 ${
                    selectedAnswer === currentExercise.correct
                      ? 'bg-green-50 border-2 border-green-500'
                      : 'bg-red-50 border-2 border-red-500'
                  }`}>
                    <p className={`font-semibold ${
                      selectedAnswer === currentExercise.correct ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {selectedAnswer === currentExercise.correct
                        ? `🎉 Correct! +${10 * currentExercise.difficulty} points`
                        : '❌ Not quite. Keep practicing!'}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  {!showResult ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={loadNewExercise}
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Next Exercise
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress View */}
        {view === 'progress' && currentUser.role === 'student' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
                Performance by Exercise Type
              </h2>
              <div className="space-y-4">
                {(Object.entries(progress.exerciseStats) as [ExerciseType, typeof progress.exerciseStats[ExerciseType]][]).map(([type, stats]) => (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize text-gray-900">{type}</span>
                      <span className="text-sm text-gray-600">
                        {stats.completed} completed • {Math.round(stats.accuracy)}% accuracy
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${stats.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}