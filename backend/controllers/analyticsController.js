const QuizAttempt = require('../models/QuizAttempt');
const ImprovementService = require('../services/improvementService');

// GET /api/analytics/weak-topics
exports.getWeakTopics = async (req, res) => {
  try {
    const report = await ImprovementService.getImprovementReport(req.user._id);

    const weakTopics = [];
    const improvingTopics = [];
    const strongTopics = [];
    const insufficientDataTopics = [];

    const allTopics = report.topicTrajectories.map(t => {
      let category = t.masteryStatus; // 'Weak' | 'Improving' | 'Strong' | 'Insufficient Data'
      let recommendedAction = 'Maintain current study rhythm';

      if (category === 'Insufficient Data') {
        recommendedAction = 'Complete at least 1 more quiz in this topic to establish a reliable baseline';
      } else if (category === 'Weak') {
        recommendedAction = t.latestAccuracy < 40
          ? 'Urgent remediation: Revisit NCERT/textbook theory definitions and attempt Easy-level MCQs'
          : 'Targeted practice: Solve 5-10 medium board questions to consolidate understanding';
      } else if (category === 'Improving') {
        recommendedAction = 'Consistent progress: Attempt timed problems to boost speed and retention';
      } else if (category === 'Strong') {
        recommendedAction = 'Mastery achieved! Move to higher-order thinking (HOTS) questions';
      }

      const item = {
        topic: t.topic,
        subject: t.subject,
        unit: t.unit,
        questionsAttempted: t.totalAttempts,
        correctAnswers: t.correctCount,
        incorrectAnswers: t.incorrectCount,
        accuracy: t.latestAccuracy,
        overallAccuracy: t.overallAccuracy,
        delta: t.delta,
        category,
        urgencyScore: t.urgencyScore,
        recommendedAction,
        isWeak: category === 'Weak',
        suggestedDifficulty: t.latestAccuracy < 50 ? 'Easy' : t.latestAccuracy >= 80 ? 'Hard' : 'Medium',
      };

      if (category === 'Weak') weakTopics.push(item);
      else if (category === 'Improving') improvingTopics.push(item);
      else if (category === 'Strong') strongTopics.push(item);
      else insufficientDataTopics.push(item);

      return item;
    });

    // Prioritized by urgency score descending
    weakTopics.sort((a, b) => b.urgencyScore - a.urgencyScore);
    improvingTopics.sort((a, b) => b.delta - a.delta);
    strongTopics.sort((a, b) => b.accuracy - a.accuracy);

    return res.status(200).json({
      success: true,
      weakTopics,
      improvingTopics,
      strongTopics,
      insufficientDataTopics,
      allTopics,
      prioritizedWeakTopics: weakTopics.slice(0, 5),
    });
  } catch (error) {
    console.error('[Weak Topics Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze weak topics.',
      error: error.message,
    });
  }
};

// GET /api/analytics/difficulty
exports.getDifficultyRecommendation = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(6)
      .lean();

    if (attempts.length === 0) {
      return res.status(200).json({
        success: true,
        recommendedDifficulty: 'Medium',
        confidence: 'Baseline',
        reason: 'No completed quizzes yet. Starting with Medium questions builds initial baseline assessment.',
        availableOptions: ['Easy', 'Medium', 'Hard', 'Adaptive'],
      });
    }

    const recentAvg = Math.round(
      attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length
    );

    let recommended = 'Medium';
    let reason = '';

    if (attempts.length < 3) {
      recommended = 'Medium';
      reason = `Initial sample size (${attempts.length} quiz${attempts.length > 1 ? 'zes' : ''}). Continue attempting quizzes to calibrate personalized adaptive recommendations.`;
    } else if (recentAvg >= 75) {
      recommended = 'Hard';
      reason = `Consistently high performance (Recent average accuracy: ${recentAvg}% across last ${attempts.length} quizzes). Leveling up to Hard questions will test critical exam applications and HOTS problems.`;
    } else if (recentAvg < 50) {
      recommended = 'Easy';
      reason = `Recent accuracy is ${recentAvg}%. Rebuilding core concepts with Easy practice and detailed solutions is recommended before advancing.`;
    } else {
      recommended = 'Medium';
      reason = `Well-balanced performance (Recent average accuracy: ${recentAvg}%). Medium difficulty is optimal for board syllabus retention and pacing.`;
    }

    return res.status(200).json({
      success: true,
      recommendedDifficulty: recommended,
      confidence: attempts.length >= 3 ? 'Calibrated' : 'Preliminary',
      recentAverageAccuracy: recentAvg,
      quizzesEvaluated: attempts.length,
      reason,
      availableOptions: ['Easy', 'Medium', 'Hard', 'Adaptive'],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to compute difficulty recommendation.',
      error: error.message,
    });
  }
};

// GET /api/analytics/improvement-report
exports.getImprovementReport = async (req, res) => {
  try {
    const report = await ImprovementService.getImprovementReport(req.user._id);
    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('[Improvement Report Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate learning improvement report.',
      error: error.message,
    });
  }
};
