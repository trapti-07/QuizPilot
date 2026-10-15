const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const { generateQuizQuestions } = require('../services/aiService');
const { evaluateQuizSubmission } = require('../services/evaluationService');
const { updateStreakForUser } = require('../services/streakService');
const ProgressService = require('../services/progressService');

// POST /api/quizzes/generate
exports.generateQuiz = async (req, res) => {
  try {
    const { subject, unit, difficulty = 'Medium', count = 10, topic, focusMistakes = false } = req.body;

    if (!subject || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Subject and Unit / Chapter are required.',
      });
    }

    const questionCount = Math.min(Math.max(parseInt(count, 10) || 10, 5), 50);

    // Fetch user recent attempts for adaptive calibration & mistake targeting
    const recentAttempts = await QuizAttempt.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(6);

    let effectiveDifficulty = difficulty;
    let adaptiveReason = '';

    if (difficulty === 'Adaptive') {
      if (recentAttempts.length < 2) {
        effectiveDifficulty = 'Medium';
        adaptiveReason = 'Initial baseline calibration';
      } else {
        const avgAcc = recentAttempts.reduce((acc, a) => acc + a.accuracy, 0) / recentAttempts.length;
        if (avgAcc >= 75) {
          effectiveDifficulty = 'Hard';
          adaptiveReason = 'Calibrated to Hard based on consistently high recent accuracy (>=75%)';
        } else if (avgAcc < 50) {
          effectiveDifficulty = 'Easy';
          adaptiveReason = 'Calibrated to Easy for foundational concept remediation after recent difficulty (<50%)';
        } else {
          effectiveDifficulty = 'Medium';
          adaptiveReason = 'Calibrated to Medium for steady concept consolidation';
        }
      }
    }

    // If targeted practice based on weak topics / previous mistakes requested
    let effectiveTopic = topic || '';
    if (focusMistakes) {
      const incorrectTopicsMap = {};
      recentAttempts.forEach(a => {
        (a.answers || []).forEach(ans => {
          if (!ans.isCorrect && ans.topic) {
            incorrectTopicsMap[ans.topic] = (incorrectTopicsMap[ans.topic] || 0) + 1;
          }
        });
      });

      const mostFailedTopics = Object.keys(incorrectTopicsMap).sort((a, b) => incorrectTopicsMap[b] - incorrectTopicsMap[a]);
      if (mostFailedTopics.length > 0) {
        effectiveTopic = effectiveTopic ? `${effectiveTopic}, ${mostFailedTopics[0]}` : mostFailedTopics[0];
      }
    }

    const generationResult = await generateQuizQuestions({
      subject,
      unit,
      difficulty: effectiveDifficulty,
      count: questionCount,
      topic: effectiveTopic,
    });

    const quizTitle = focusMistakes
      ? `${subject}: ${unit} (Targeted Mistake Remediation) Quiz`
      : `${subject}: ${unit} ${effectiveTopic ? `(${effectiveTopic})` : ''} Revision Quiz`;

    const newQuiz = await Quiz.create({
      title: quizTitle,
      subject,
      unit,
      topic: effectiveTopic,
      difficulty: effectiveDifficulty,
      questions: generationResult.questions,
      isAIGenerated: generationResult.source === 'ai',
      generationSource: generationResult.source,
      createdBy: req.user._id,
    });

    // Sanitize questions for student attempt (hide correctAnswer & explanation)
    const sanitizedQuestions = newQuiz.questions.map((q, idx) => ({
      index: idx,
      question: q.question,
      options: q.options,
      topic: q.topic,
      difficulty: q.difficulty,
    }));

    return res.status(201).json({
      success: true,
      message: generationResult.message,
      quiz: {
        _id: newQuiz._id,
        title: newQuiz.title,
        subject: newQuiz.subject,
        unit: newQuiz.unit,
        topic: newQuiz.topic,
        difficulty: newQuiz.difficulty,
        totalQuestions: sanitizedQuestions.length,
        questions: sanitizedQuestions,
        generationSource: newQuiz.generationSource,
        isAIGenerated: newQuiz.isAIGenerated,
        createdAt: newQuiz.createdAt,
      },
    });
  } catch (error) {
    console.error('[Quiz Generation Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate quiz. Please try again.',
      error: error.message,
    });
  }
};

// GET /api/quizzes/:id
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.',
      });
    }

    // Strip answers for attempt interface
    const sanitizedQuestions = quiz.questions.map((q, idx) => ({
      index: idx,
      question: q.question,
      options: q.options,
      topic: q.topic,
      difficulty: q.difficulty,
    }));

    return res.status(200).json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        unit: quiz.unit,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        totalQuestions: sanitizedQuestions.length,
        questions: sanitizedQuestions,
        generationSource: quiz.generationSource,
        isAIGenerated: quiz.isAIGenerated,
        createdAt: quiz.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz.',
      error: error.message,
    });
  }
};

// POST /api/quizzes/:id/submit
exports.submitQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const { answers, timeTaken = 0 } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found for submission.',
      });
    }

    // Check if user already submitted this specific quiz
    const existingAttempt = await QuizAttempt.findOne({
      userId: req.user._id,
      quizId: quiz._id,
    });

    // Evaluate answers server-side
    const evaluation = evaluateQuizSubmission(quiz, answers, timeTaken);

    let pointsToAward = evaluation.pointsAwarded;
    let isRetake = false;

    // Prevent duplicate point exploitation: if re-submitting same quiz, do not award duplicate leaderboard points
    if (existingAttempt) {
      isRetake = true;
      pointsToAward = 0; // Prevent duplicate points
    }

    // Create attempt document
    const attempt = await QuizAttempt.create({
      userId: req.user._id,
      quizId: quiz._id,
      subject: quiz.subject,
      unit: quiz.unit,
      difficulty: quiz.difficulty,
      answers: evaluation.evaluatedAnswers,
      score: evaluation.score,
      totalQuestions: evaluation.totalQuestions,
      correctAnswers: evaluation.correctAnswers,
      unansweredCount: evaluation.unansweredCount,
      accuracy: evaluation.accuracy,
      timeTaken: evaluation.timeTaken,
      pointsAwarded: pointsToAward,
      completedAt: new Date(),
    });

    // Update user stats
    const user = await User.findById(req.user._id);
    if (user) {
      if (!isRetake) {
        user.points = (user.points || 0) + pointsToAward;
        user.quizzesCompleted = (user.quizzesCompleted || 0) + 1;
      }
      // Update streak
      updateStreakForUser(user);
      await user.save();
    }

    // Automatically update daily progress tracker in MongoDB
    let progressResult = null;
    try {
      progressResult = await ProgressService.recordQuizAttempt(req.user._id, attempt, timeTaken);
    } catch (progErr) {
      console.warn('[Progress Update Warning]', progErr.message);
    }

    // Recommended revision topics
    const revisionTopics = evaluation.topicBreakdown
      .filter(t => t.accuracy < 70)
      .map(t => ({
        topic: t.topic,
        accuracy: t.accuracy,
        suggestion: t.accuracy < 40 ? 'Needs foundational revision' : 'Requires practice problems',
      }));

    return res.status(200).json({
      success: true,
      message: isRetake
        ? 'Quiz retake submitted. (Duplicate leaderboard points withheld)'
        : 'Quiz submitted and evaluated successfully!',
      attemptId: attempt._id,
      results: {
        attemptId: attempt._id,
        quizId: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        unit: quiz.unit,
        difficulty: quiz.difficulty,
        score: evaluation.score,
        totalQuestions: evaluation.totalQuestions,
        correctAnswers: evaluation.correctAnswers,
        incorrectAnswers: evaluation.incorrectAnswers,
        unansweredCount: evaluation.unansweredCount,
        accuracy: evaluation.accuracy,
        timeTaken: evaluation.timeTaken,
        pointsAwarded: pointsToAward,
        isRetake,
        answers: evaluation.evaluatedAnswers,
        topicBreakdown: evaluation.topicBreakdown,
        revisionTopics,
        currentStreak: user?.currentStreak || 1,
        longestStreak: user?.longestStreak || 1,
        dailyProgress: progressResult,
      },
    });
  } catch (error) {
    console.error('[Quiz Submission Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process quiz submission.',
      error: error.message,
    });
  }
};

// GET /api/quizzes/history
exports.getQuizHistory = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .select('-answers') // exclude verbose answers in list view
      .lean();

    return res.status(200).json({
      success: true,
      attempts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz history.',
      error: error.message,
    });
  }
};

// GET /api/quizzes/attempts/:attemptId
exports.getAttemptById = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      userId: req.user._id,
    }).populate('quizId', 'title subject unit topic difficulty generationSource isAIGenerated questions');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt record not found or access denied.',
      });
    }

    // Ensure all answers contain their options array (even for legacy attempts before schema update)
    const enrichedAnswers = (attempt.answers || []).map((ans, idx) => {
      const a = ans.toObject ? ans.toObject() : { ...ans };
      if ((!a.options || a.options.length === 0) && attempt.quizId?.questions) {
        const qObj = attempt.quizId.questions[a.questionIndex] || attempt.quizId.questions[idx];
        if (qObj && Array.isArray(qObj.options)) {
          a.options = qObj.options;
        }
      }
      return a;
    });

    // Calculate topic breakdown from answers
    const topicStats = {};
    enrichedAnswers.forEach(ans => {
      const t = ans.topic || attempt.unit || 'General';
      if (!topicStats[t]) topicStats[t] = { total: 0, correct: 0 };
      topicStats[t].total += 1;
      if (ans.isCorrect) topicStats[t].correct += 1;
    });

    const topicBreakdown = Object.keys(topicStats).map(t => ({
      topic: t,
      total: topicStats[t].total,
      correct: topicStats[t].correct,
      accuracy: Math.round((topicStats[t].correct / topicStats[t].total) * 100),
    }));

    const revisionTopics = topicBreakdown
      .filter(t => t.accuracy < 70)
      .map(t => ({
        topic: t.topic,
        accuracy: t.accuracy,
        suggestion: t.accuracy < 40 ? 'Needs foundational revision' : 'Requires targeted problem practice',
      }));

    return res.status(200).json({
      success: true,
      attempt: {
        _id: attempt._id,
        quizId: attempt.quizId?._id || attempt.quizId,
        title: attempt.quizId?.title || `${attempt.subject} Quiz`,
        subject: attempt.subject,
        unit: attempt.unit,
        difficulty: attempt.difficulty,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        unansweredCount: attempt.unansweredCount || 0,
        incorrectAnswers: attempt.totalQuestions - attempt.correctAnswers - (attempt.unansweredCount || 0),
        accuracy: attempt.accuracy,
        timeTaken: attempt.timeTaken,
        pointsAwarded: attempt.pointsAwarded,
        completedAt: attempt.completedAt,
        answers: enrichedAnswers,
        topicBreakdown,
        revisionTopics,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve attempt details.',
      error: error.message,
    });
  }
};
