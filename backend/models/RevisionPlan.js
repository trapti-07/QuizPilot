const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    default: '',
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  reason: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  targetQuestions: {
    type: Number,
    default: 5,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

const revisionPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: String, // 'YYYY-MM-DD'
    required: true,
    index: true,
  },
  tasks: [taskSchema],
  summaryMessage: {
    type: String,
    default: 'Personalized revision agenda based on your recent diagnostic performance.',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure only one revision plan per user per calendar day
revisionPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('RevisionPlan', revisionPlanSchema);
