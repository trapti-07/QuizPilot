const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastCompletedQuizDate: {
    type: String,
    default: null, // Stored as 'YYYY-MM-DD'
  },
  points: {
    type: Number,
    default: 0,
  },
  quizzesCompleted: {
    type: Number,
    default: 0,
  },
  dailyGoalType: {
    type: String,
    enum: ['quizzes', 'questions', 'study_minutes'],
    default: 'questions',
  },
  dailyGoalTarget: {
    type: Number,
    default: 20,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
