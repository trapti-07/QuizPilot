const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    index: true,
  },
  standard: {
    type: String,
    default: 'Class 12',
    index: true,
  },
  unit: {
    type: String,
    required: true,
    index: true,
  },
  topic: {
    type: String,
    required: true,
    index: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
    index: true,
  },
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
    type: Number, // 0, 1, 2, or 3
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('QuestionBank', questionBankSchema);
