const mongoose = require('mongoose');

const dailyProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: String, // Format: 'YYYY-MM-DD'
    required: true,
    index: true,
  },
  goalType: {
    type: String,
    enum: ['quizzes', 'questions', 'study_minutes'],
    default: 'questions',
  },
  goalTarget: {
    type: Number,
    required: true,
    default: 20,
    min: 1,
  },
  quizzesCompleted: {
    type: Number,
    default: 0,
    min: 0,
  },
  questionsAttempted: {
    type: Number,
    default: 0,
    min: 0,
  },
  correctAnswers: {
    type: Number,
    default: 0,
    min: 0,
  },
  studyMinutes: {
    type: Number,
    default: 0,
    min: 0,
  },
  accuracy: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  isGoalCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure only one progress document per user per calendar day
dailyProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyProgress', dailyProgressSchema);
