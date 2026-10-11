const RevisionPlan = require('../models/RevisionPlan');
const QuizAttempt = require('../models/QuizAttempt');
const ImprovementService = require('./improvementService');
const GeminiService = require('./geminiService');

function getTodayDateString(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getPastDatesList(days = 7) {
  const dates = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

class PlannerService {
  /**
   * Get or generate today's revision plan for the authenticated user
   */
  static async getOrCreateTodayPlan(userId) {
    const today = getTodayDateString();

    let plan = await RevisionPlan.findOne({ userId, date: today });
    if (plan) {
      return plan.toObject();
    }

    // Generate new revision plan for today based on real student performance
    const report = await ImprovementService.getImprovementReport(userId);
    const tasks = [];

    // 1. Task from highest urgency struggling concept if exists
    if (report.strugglingConcepts && report.strugglingConcepts.length > 0) {
      const topWeak = report.strugglingConcepts[0];
      tasks.push({
        topic: topWeak.topic,
        subject: topWeak.subject,
        unit: topWeak.unit,
        priority: 'High',
        reason: `Accuracy is currently ${topWeak.latestAccuracy}% with ${topWeak.incorrectCount} mistakes recorded.`,
        action: `Complete 5 targeted ${topWeak.latestAccuracy < 40 ? 'Easy' : 'Medium'} practice questions to reinforce foundational concepts.`,
        targetQuestions: 5,
        completed: false,
      });

      if (report.strugglingConcepts.length > 1) {
        const secondWeak = report.strugglingConcepts[1];
        tasks.push({
          topic: secondWeak.topic,
          subject: secondWeak.subject,
          unit: secondWeak.unit,
          priority: 'High',
          reason: `Requires concept remediation (${secondWeak.latestAccuracy}% accuracy).`,
          action: `Review textbook key formulas and attempt a 5-question focused revision.`,
          targetQuestions: 5,
          completed: false,
        });
      }
    }

    // 2. Task from improving concepts to consolidate progress
    if (report.improvedConcepts && report.improvedConcepts.length > 0) {
      const topImproving = report.improvedConcepts[0];
      tasks.push({
        topic: topImproving.topic,
        subject: topImproving.subject,
        unit: topImproving.unit,
        priority: 'Medium',
        reason: `Showing strong progress (+${topImproving.delta}% improvement). Consolidate before exams.`,
        action: `Attempt a 5-question timed revision to maintain your edge.`,
        targetQuestions: 5,
        completed: false,
      });
    }

    // 3. Fallback / foundational task if few or no weak areas detected
    if (tasks.length === 0) {
      // Pick recent quiz subject or default core subject
      const latestAttempt = await QuizAttempt.findOne({ userId }).sort({ completedAt: -1 }).lean();
      const subject = latestAttempt?.subject || 'Physics';
      const unit = latestAttempt?.unit || 'Electrostatics';
      const topic = latestAttempt?.answers?.[0]?.topic || 'Core Syllabus Principles';

      tasks.push({
        topic: topic,
        subject: subject,
        unit: unit,
        priority: 'Medium',
        reason: 'Daily revision cadence to build long-term syllabus retention.',
        action: `Generate a 10-question adaptive board exam quiz to test comprehensive unit understanding.`,
        targetQuestions: 10,
        completed: false,
      });

      tasks.push({
        topic: 'Speed & Accuracy Pacing',
        subject: subject,
        unit: unit,
        priority: 'Low',
        reason: 'Exam pacing practice to build test-taking stamina.',
        action: 'Complete a timed revision session maintaining under 1 minute per multiple-choice question.',
        targetQuestions: 5,
        completed: false,
      });
    }

    // Optional AI summary message enhancement via Gemini
    let summaryMessage = 'Personalized revision plan generated from your actual board performance diagnostic.';
    try {
      const gemini = GeminiService.getClient();
      if (gemini && report.strugglingConcepts.length > 0) {
        const topTopic = report.strugglingConcepts[0].topic;
        const prompt = `Give a 1-sentence supportive study coach tip for a board exam student who is revising the topic "${topTopic}". Keep it inspiring and actionable.`;
        const res = await gemini.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
        });
        if (res?.text) {
          summaryMessage = res.text.trim();
        }
      }
    } catch {
      // Fallback message
      summaryMessage = `Today's strategic focus: strengthen your understanding of "${tasks[0].topic}" and maintain your daily study streak.`;
    }

    plan = await RevisionPlan.create({
      userId,
      date: today,
      tasks,
      summaryMessage,
    });

    return plan.toObject();
  }

  /**
   * Toggle task completion status
   */
  static async toggleTaskCompletion(userId, taskId) {
    const today = getTodayDateString();
    const plan = await RevisionPlan.findOne({ userId, date: today });

    if (!plan) {
      throw new Error('Revision plan for today not found');
    }

    const task = plan.tasks.id(taskId);
    if (!task) {
      throw new Error('Task not found in today\'s revision plan');
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    plan.updatedAt = new Date();

    await plan.save();
    return plan.toObject();
  }

  /**
   * Get 7-day weekly planner summary
   */
  static async getWeeklyPlannerSummary(userId) {
    const dates = getPastDatesList(7);
    const plans = await RevisionPlan.find({
      userId,
      date: { $in: dates },
    }).lean();

    const planMap = {};
    plans.forEach(p => {
      planMap[p.date] = p;
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const summary = dates.map(dateStr => {
      const d = new Date(dateStr + 'T00:00:00Z');
      const p = planMap[dateStr];
      const tasks = p?.tasks || [];
      const completedTasks = tasks.filter(t => t.completed).length;

      return {
        date: dateStr,
        day: dayNames[d.getUTCDay()],
        totalTasks: tasks.length,
        completedTasks,
        allCompleted: tasks.length > 0 && completedTasks === tasks.length,
      };
    });

    return summary;
  }
}

module.exports = PlannerService;
