const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    default: 'General',
  },
  options: {
    type: [String],
    default: [],
  },
  selectedOption: {
    type: Number, // index 0, 1, 2, 3 or -1 for unattempted
    default: -1,
  },
  correctOption: {
    type: Number,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  explanation: {
    type: String,
    default: '',
  },
});

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  unansweredCount: {
    type: Number,
    default: 0,
  },
  accuracy: {
    type: Number,
    required: true,
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0,
  },
  pointsAwarded: {
    type: Number,
    default: 0,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
