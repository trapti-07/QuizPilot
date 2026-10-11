const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    validate: [val => val.length === 4, 'Must have exactly 4 options'],
    required: true,
  },
  correctAnswer: {
    type: Number, // index 0, 1, 2, or 3
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    default: 'General',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Adaptive'],
    default: 'Medium',
  },
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Board Revision Quiz',
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  unit: {
    type: String,
    required: true,
    trim: true,
  },
  topic: {
    type: String,
    trim: true,
    default: '',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Adaptive'],
    default: 'Medium',
  },
  questions: [questionSchema],
  isAIGenerated: {
    type: Boolean,
    default: false,
  },
  generationSource: {
    type: String,
    enum: ['ai', 'question_bank'],
    default: 'question_bank',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Quiz', quizSchema);
