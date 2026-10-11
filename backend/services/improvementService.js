const QuizAttempt = require('../models/QuizAttempt');

class ImprovementService {
  /**
   * Analyze learning trajectories by comparing earlier vs later attempts per concept
   */
  static async getImprovementReport(userId) {
    const attempts = await QuizAttempt.find({ userId })
      .sort({ completedAt: 1 }) // Chronological order
      .lean();

    if (attempts.length === 0) {
      return {
        hasData: false,
        totalAttempts: 0,
        message: 'No quiz history recorded yet. Complete quizzes to generate your comparative learning improvement report.',
        metrics: {
          totalAttempts: 0,
          totalQuestions: 0,
          initialAccuracy: 0,
          latestAccuracy: 0,
          overallDelta: 0,
          masteredCount: 0,
          improvingCount: 0,
          weakCount: 0,
        },
        topicTrajectories: [],
        improvedConcepts: [],
        strugglingConcepts: [],
        masteredConcepts: [],
        summaryNarrative: 'Start practicing board quizzes to calibrate your personalized learning growth analytics.',
        nextSteps: ['Generate your first board quiz in Physics, Chemistry, or Mathematics.'],
      };
    }

    // Group answers and attempts by topic
    const topicStats = {};

    attempts.forEach(attempt => {
      const attemptDate = attempt.completedAt;
      (attempt.answers || []).forEach(ans => {
        const tName = ans.topic || attempt.unit || 'General';
        if (!topicStats[tName]) {
          topicStats[tName] = {
            topic: tName,
            subject: attempt.subject,
            unit: attempt.unit,
            attempts: [], // array of { isCorrect, date, attemptId }
          };
        }
        topicStats[tName].attempts.push({
          isCorrect: ans.isCorrect,
          date: attemptDate,
          attemptId: attempt._id,
        });
      });
    });

    const topicTrajectories = [];
    const improvedConcepts = [];
    const strugglingConcepts = [];
    const masteredConcepts = [];

    let totalInitialCorrect = 0;
    let totalInitialCount = 0;
    let totalLatestCorrect = 0;
    let totalLatestCount = 0;

    Object.values(topicStats).forEach(item => {
      const totalAttemptsCount = item.attempts.length;
      const correctCount = item.attempts.filter(a => a.isCorrect).length;
      const incorrectCount = totalAttemptsCount - correctCount;
      const overallAccuracy = Math.round((correctCount / totalAttemptsCount) * 100);

      // Split into first half vs second half to evaluate trajectory over time
      let initialAccuracy = overallAccuracy;
      let latestAccuracy = overallAccuracy;
      let delta = 0;

      if (totalAttemptsCount >= 2) {
        const splitIndex = Math.ceil(totalAttemptsCount / 2);
        const firstHalf = item.attempts.slice(0, splitIndex);
        const secondHalf = item.attempts.slice(splitIndex);

        const firstCorrect = firstHalf.filter(a => a.isCorrect).length;
        const secondCorrect = secondHalf.filter(a => a.isCorrect).length;

        initialAccuracy = Math.round((firstCorrect / firstHalf.length) * 100);
        latestAccuracy = Math.round((secondCorrect / secondHalf.length) * 100);
        delta = latestAccuracy - initialAccuracy;

        totalInitialCorrect += firstCorrect;
        totalInitialCount += firstHalf.length;
        totalLatestCorrect += secondCorrect;
        totalLatestCount += secondHalf.length;
      } else {
        totalInitialCorrect += correctCount;
        totalInitialCount += totalAttemptsCount;
        totalLatestCorrect += correctCount;
        totalLatestCount += totalAttemptsCount;
      }

      // Mastery classification
      let masteryStatus = 'Insufficient Data';
      if (totalAttemptsCount < 2) {
        masteryStatus = 'Insufficient Data';
      } else if (latestAccuracy >= 80) {
        masteryStatus = 'Strong';
      } else if (latestAccuracy >= 60 || delta >= 15) {
        masteryStatus = 'Improving';
      } else {
        masteryStatus = 'Weak';
      }

      // Urgency score calculation: higher urgency for weak topics with many failures
      const urgencyScore = totalAttemptsCount >= 2 && latestAccuracy < 65
        ? Math.round(((100 - latestAccuracy) * 1.5) + (incorrectCount * 2))
        : 0;

      const record = {
        topic: item.topic,
        subject: item.subject,
        unit: item.unit,
        totalAttempts: totalAttemptsCount,
        correctCount,
        incorrectCount,
        overallAccuracy,
        initialAccuracy,
        latestAccuracy,
        delta,
        masteryStatus,
        urgencyScore,
      };

      topicTrajectories.push(record);

      if (masteryStatus === 'Strong') {
        masteredConcepts.push(record);
      } else if (masteryStatus === 'Improving') {
        improvedConcepts.push(record);
      } else if (masteryStatus === 'Weak') {
        strugglingConcepts.push(record);
      }
    });

    // Overall aggregate comparative stats
    const avgInitial = totalInitialCount > 0 ? Math.round((totalInitialCorrect / totalInitialCount) * 100) : 0;
    const avgLatest = totalLatestCount > 0 ? Math.round((totalLatestCorrect / totalLatestCount) * 100) : 0;
    const overallDelta = avgLatest - avgInitial;

    // Sort struggling concepts by urgency descending
    strugglingConcepts.sort((a, b) => b.urgencyScore - a.urgencyScore);
    // Sort improved concepts by delta descending
    improvedConcepts.sort((a, b) => b.delta - a.delta);

    // Formulate personalized summary narrative
    let summaryNarrative = '';
    const nextSteps = [];

    if (attempts.length === 1) {
      summaryNarrative = `You completed your initial diagnostic attempt with ${avgLatest}% accuracy. Complete at least one more quiz to map your comparative trajectory.`;
      nextSteps.push('Take a follow-up revision quiz on your first topic to establish a learning trend.');
    } else if (overallDelta > 0) {
      summaryNarrative = `Excellent momentum! Your recent accuracy increased by +${overallDelta}% compared to early attempts (from ${avgInitial}% to ${avgLatest}%). You have mastered ${masteredConcepts.length} concepts and improved ${improvedConcepts.length} areas.`;
      if (strugglingConcepts.length > 0) {
        nextSteps.push(`Focus immediate revision on your highest-urgency concept: "${strugglingConcepts[0].topic}" (${strugglingConcepts[0].latestAccuracy}% accuracy).`);
      }
      nextSteps.push('Consolidate your strong concepts with timed board-level exam simulations.');
    } else if (overallDelta === 0) {
      summaryNarrative = `Your overall retention is holding steady at ${avgLatest}%. Dedicated practice on priority weak topics will push your scores into the distinction bracket.`;
      if (strugglingConcepts.length > 0) {
        nextSteps.push(`Review foundational definitions in "${strugglingConcepts[0].topic}".`);
      }
      nextSteps.push('Increase daily question volume to accelerate concept retention.');
    } else {
      summaryNarrative = `Recent attempts show a slight accuracy dip (${overallDelta}%). Shifting to foundational revision and reviewing step-by-step explanations will help rebuild confidence.`;
      if (strugglingConcepts.length > 0) {
        nextSteps.push(`Target "${strugglingConcepts[0].topic}" with Easy-level practice questions before advancing.`);
      }
      nextSteps.push('Review the detailed explanations for incorrect questions on your recent results pages.');
    }

    return {
      hasData: true,
      totalAttempts: attempts.length,
      metrics: {
        totalAttempts: attempts.length,
        totalQuestions: attempts.reduce((acc, a) => acc + (a.totalQuestions || 0), 0),
        initialAccuracy: avgInitial,
        latestAccuracy: avgLatest,
        overallDelta,
        masteredCount: masteredConcepts.length,
        improvingCount: improvedConcepts.length,
        weakCount: strugglingConcepts.length,
      },
      topicTrajectories,
      improvedConcepts,
      strugglingConcepts,
      masteredConcepts,
      summaryNarrative,
      nextSteps,
    };
  }
}

module.exports = ImprovementService;
