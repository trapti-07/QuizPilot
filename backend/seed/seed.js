const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const QuestionBank = require('../models/QuestionBank');
const { VERIFIED_QUESTIONS } = require('../services/questionBankService');

dotenv.config({ path: '../.env' });

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quizpilot';
  console.log(`Connecting to MongoDB at ${uri}...`);
  await mongoose.connect(uri);

  console.log('Clearing existing QuestionBank & sample data (preserving user accounts if any)...');
  await QuestionBank.deleteMany({});
  await QuestionBank.insertMany(VERIFIED_QUESTIONS);
  console.log(`✓ Inserted ${VERIFIED_QUESTIONS.length} verified board questions.`);

  // Seed sample leaderboard students if no sample students exist
  const existingUsers = await User.countDocuments();
  if (existingUsers < 4) {
    console.log('Seeding sample leaderboard students...');
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('Password123!', salt);

    const sampleUsersData = [
      {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        passwordHash: passHash,
        points: 420,
        quizzesCompleted: 14,
        currentStreak: 7,
        longestStreak: 12,
        lastCompletedQuizDate: new Date().toISOString().slice(0, 10),
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        passwordHash: passHash,
        points: 360,
        quizzesCompleted: 11,
        currentStreak: 5,
        longestStreak: 9,
        lastCompletedQuizDate: new Date().toISOString().slice(0, 10),
      },
      {
        name: 'Rohan Deshmukh',
        email: 'rohan.d@example.com',
        passwordHash: passHash,
        points: 290,
        quizzesCompleted: 9,
        currentStreak: 3,
        longestStreak: 6,
        lastCompletedQuizDate: new Date().toISOString().slice(0, 10),
      },
      {
        name: 'Ananya Verma',
        email: 'ananya.v@example.com',
        passwordHash: passHash,
        points: 210,
        quizzesCompleted: 7,
        currentStreak: 2,
        longestStreak: 5,
        lastCompletedQuizDate: new Date().toISOString().slice(0, 10),
      },
    ];

    for (const uData of sampleUsersData) {
      const u = await User.findOneAndUpdate({ email: uData.email }, uData, { upsert: true, returnDocument: 'after' });
      
      // Seed a couple sample attempts for realistic accuracy calculation
      const dummyAttempt = await QuizAttempt.create({
        userId: u._id,
        quizId: new mongoose.Types.ObjectId(),
        subject: 'Physics',
        unit: 'Electrostatics',
        difficulty: 'Medium',
        score: 8,
        totalQuestions: 10,
        correctAnswers: 8,
        accuracy: 80,
        timeTaken: 240,
        pointsAwarded: 135,
        answers: [],
        completedAt: new Date(Date.now() - 3600000 * 5),
      });
    }

    console.log('✓ Seeded sample leaderboard students and history.');
  }

  console.log('Database seeding completed successfully.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
