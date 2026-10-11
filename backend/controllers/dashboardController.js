const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const ProgressService = require('../services/progressService');

// GET /api/dashboard/summary
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).lean();

    const attempts = await QuizAttempt.find({ userId }).sort({ completedAt: -1 }).lean();

    const totalQuizzes = attempts.length;
    let questionsAttempted = 0;
    let totalAccuracySum = 0;

    // Aggregate topic performance to determine weak topics
    const topicStats = {};

    attempts.forEach(attempt => {
      questionsAttempted += (attempt.totalQuestions || 0);
      totalAccuracySum += (attempt.accuracy || 0);

      (attempt.answers || []).forEach(ans => {
        const t = ans.topic || attempt.unit || 'General';
        if (!topicStats[t]) topicStats[t] = { total: 0, correct: 0, subject: attempt.subject };
        topicStats[t].total += 1;
        if (ans.isCorrect) topicStats[t].correct += 1;
      });
    });

    const averageAccuracy = totalQuizzes > 0 ? Math.round(totalAccuracySum / totalQuizzes) : 0;

    // Weak topics: topics with at least 3 attempts and accuracy < 65%
    const weakTopics = Object.keys(topicStats)
      .map(topicName => {
        const stat = topicStats[topicName];
        const accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
        return {
          topic: topicName,
          subject: stat.subject,
          questionsAttempted: stat.total,
          correctAnswers: stat.correct,
          accuracy,
          isWeak: stat.total >= 2 && accuracy < 65,
        };
      })
      .filter(t => t.isWeak)
      .sort((a, b) => a.accuracy - b.accuracy);

    // Adaptive difficulty logic:
    // Start at Medium if insufficient history (< 3 attempts)
    // Recommend Hard after consistently high recent accuracy (>= 75%)
    // Recommend Easy or focused revision after consistently low recent accuracy (< 50%)
    // Otherwise Medium
    const recentAttempts = attempts.slice(0, 5);
    let recommendedDifficulty = 'Medium';
    let difficultyReason = 'Standard baseline for syllabus revision.';

    if (recentAttempts.length < 3) {
      recommendedDifficulty = 'Medium';
      difficultyReason = 'Starting baseline. Complete at least 3 quizzes to calibrate personalized adaptive difficulty.';
    } else {
      const recentAvg = Math.round(
        recentAttempts.reduce((acc, a) => acc + a.accuracy, 0) / recentAttempts.length
      );
      if (recentAvg >= 75) {
        recommendedDifficulty = 'Hard';
        difficultyReason = `Outstanding performance! Your recent average accuracy is ${recentAvg}%. You are ready for high-order thinking problems.`;
      } else if (recentAvg < 50) {
        recommendedDifficulty = 'Easy';
        difficultyReason = `Recent accuracy is ${recentAvg}%. Rebuilding core concepts with Easy questions is recommended before moving up.`;
      } else {
        recommendedDifficulty = 'Medium';
        difficultyReason = `Steady progress! Your recent average accuracy is ${recentAvg}%. Medium questions will consolidate your preparation.`;
      }
    }

    // Fetch today's progress and 7-day weekly history
    const [todayProgressData, weeklyProgress] = await Promise.all([
      ProgressService.getOrCreateTodayProgress(userId),
      ProgressService.getWeeklyProgress(userId),
    ]);

    return res.status(200).json({
      success: true,
      summary: {
        totalQuizzes,
        questionsAttempted,
        averageAccuracy,
        currentStreak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
        totalPoints: user?.points || 0,
        weakTopicsCount: weakTopics.length,
        weakTopicsSummary: weakTopics.slice(0, 3), // Top 3 weakest
        recommendedDifficulty,
        difficultyReason,
        dailyProgress: todayProgressData,
        weeklyProgress,
      },
    });
  } catch (error) {
    console.error('[Dashboard Summary Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary.',
      error: error.message,
    });
  }
};

// GET /api/dashboard/recent-activity
exports.getRecentActivity = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(8)
      .populate('quizId', 'title')
      .lean();

    const activity = attempts.map(attempt => ({
      attemptId: attempt._id,
      quizId: attempt.quizId?._id || attempt.quizId,
      title: attempt.quizId?.title || `${attempt.subject} Quiz`,
      subject: attempt.subject,
      unit: attempt.unit,
      difficulty: attempt.difficulty,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      accuracy: attempt.accuracy,
      pointsAwarded: attempt.pointsAwarded,
      date: attempt.completedAt,
    }));

    return res.status(200).json({
      success: true,
      activity,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity.',
      error: error.message,
    });
  }
};
