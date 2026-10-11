const DailyProgress = require('../models/DailyProgress');
const User = require('../models/User');

function getTodayDateString(date = new Date()) {
  return date.toISOString().slice(0, 10); // 'YYYY-MM-DD'
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

function getFriendlyGoalMessage(percentage, isGoalCompleted, goalType) {
  if (isGoalCompleted || percentage >= 100) {
    return '🎉 Daily Goal Crushed! Outstanding consistency and dedication today!';
  }
  if (percentage >= 75) {
    return '⚡ Almost there! Just one more focused sprint to finish your goal.';
  }
  if (percentage >= 50) {
    return '🔥 Strong momentum! You are over halfway to your daily target.';
  }
  if (percentage > 0) {
    return '🚀 Great start today! Keep the revision momentum rolling.';
  }
  return '🎯 Set your daily revision target and complete your first quiz!';
}

class ProgressService {
  /**
   * Fetch or initialize today's DailyProgress document for the user
   */
  static async getOrCreateTodayProgress(userId) {
    const today = getTodayDateString();

    let progress = await DailyProgress.findOne({ userId, date: today });

    if (!progress) {
      const user = await User.findById(userId).lean();
      const goalType = user?.dailyGoalType || 'questions';
      const goalTarget = user?.dailyGoalTarget || 20;

      progress = await DailyProgress.create({
        userId,
        date: today,
        goalType,
        goalTarget,
        quizzesCompleted: 0,
        questionsAttempted: 0,
        correctAnswers: 0,
        studyMinutes: 0,
        accuracy: 0,
        isGoalCompleted: false,
      });
    }

    // Calculate current progress value based on goalType
    let currentValue = progress.questionsAttempted;
    if (progress.goalType === 'quizzes') {
      currentValue = progress.quizzesCompleted;
    } else if (progress.goalType === 'study_minutes') {
      currentValue = progress.studyMinutes;
    }

    const percentage = progress.goalTarget > 0
      ? Math.min(100, Math.round((currentValue / progress.goalTarget) * 100))
      : 0;

    const friendlyMessage = getFriendlyGoalMessage(percentage, progress.isGoalCompleted, progress.goalType);

    return {
      progress: progress.toObject(),
      currentValue,
      percentage,
      friendlyMessage,
    };
  }

  /**
   * Increment daily progress upon quiz attempt completion
   */
  static async recordQuizAttempt(userId, attempt, timeTaken = 0) {
    const today = getTodayDateString();
    const user = await User.findById(userId);

    let progress = await DailyProgress.findOne({ userId, date: today });

    if (!progress) {
      const goalType = user?.dailyGoalType || 'questions';
      const goalTarget = user?.dailyGoalTarget || 20;

      progress = new DailyProgress({
        userId,
        date: today,
        goalType,
        goalTarget,
        quizzesCompleted: 0,
        questionsAttempted: 0,
        correctAnswers: 0,
        studyMinutes: 0,
        accuracy: 0,
        isGoalCompleted: false,
      });
    }

    // Increment metrics
    progress.quizzesCompleted += 1;
    progress.questionsAttempted += (attempt.totalQuestions || 0);
    progress.correctAnswers += (attempt.correctAnswers || 0);
    
    // Convert timeTaken (seconds) into study minutes, minimum 1 minute per session
    const additionalMinutes = Math.max(1, Math.round((timeTaken || 0) / 60));
    progress.studyMinutes += additionalMinutes;

    // Recalculate daily accuracy
    if (progress.questionsAttempted > 0) {
      progress.accuracy = Math.round((progress.correctAnswers / progress.questionsAttempted) * 100);
    }

    // Check goal achievement
    let currentValue = progress.questionsAttempted;
    if (progress.goalType === 'quizzes') currentValue = progress.quizzesCompleted;
    else if (progress.goalType === 'study_minutes') currentValue = progress.studyMinutes;

    if (currentValue >= progress.goalTarget && !progress.isGoalCompleted) {
      progress.isGoalCompleted = true;
      progress.completedAt = new Date();
    }

    progress.updatedAt = new Date();
    await progress.save();

    const percentage = progress.goalTarget > 0
      ? Math.min(100, Math.round((currentValue / progress.goalTarget) * 100))
      : 0;

    return {
      progress: progress.toObject(),
      currentValue,
      percentage,
      justCompletedGoal: currentValue >= progress.goalTarget,
      friendlyMessage: getFriendlyGoalMessage(percentage, progress.isGoalCompleted, progress.goalType),
    };
  }

  /**
   * Update daily study goal preference and update today's active target
   */
  static async updateGoal(userId, goalType, goalTarget) {
    const today = getTodayDateString();

    const validTypes = ['quizzes', 'questions', 'study_minutes'];
    const sanitizedType = validTypes.includes(goalType) ? goalType : 'questions';
    const sanitizedTarget = Math.max(1, parseInt(goalTarget, 10) || 20);

    // Update user default preference
    await User.findByIdAndUpdate(userId, {
      dailyGoalType: sanitizedType,
      dailyGoalTarget: sanitizedTarget,
    });

    // Update today's progress document
    let progress = await DailyProgress.findOne({ userId, date: today });
    if (!progress) {
      progress = new DailyProgress({
        userId,
        date: today,
        quizzesCompleted: 0,
        questionsAttempted: 0,
        correctAnswers: 0,
        studyMinutes: 0,
        accuracy: 0,
      });
    }

    progress.goalType = sanitizedType;
    progress.goalTarget = sanitizedTarget;

    // Recheck if already achieved with new target
    let currentValue = progress.questionsAttempted;
    if (progress.goalType === 'quizzes') currentValue = progress.quizzesCompleted;
    else if (progress.goalType === 'study_minutes') currentValue = progress.studyMinutes;

    progress.isGoalCompleted = currentValue >= sanitizedTarget;
    if (progress.isGoalCompleted && !progress.completedAt) {
      progress.completedAt = new Date();
    }
    progress.updatedAt = new Date();
    await progress.save();

    const percentage = Math.min(100, Math.round((currentValue / sanitizedTarget) * 100));

    return {
      progress: progress.toObject(),
      currentValue,
      percentage,
      friendlyMessage: getFriendlyGoalMessage(percentage, progress.isGoalCompleted, progress.goalType),
    };
  }

  /**
   * Fetch 7-day weekly historical progress for charts
   */
  static async getWeeklyProgress(userId) {
    const datesList = getPastDatesList(7);

    const records = await DailyProgress.find({
      userId,
      date: { $in: datesList },
    }).lean();

    const recordMap = {};
    records.forEach(r => {
      recordMap[r.date] = r;
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const weeklyData = datesList.map(dateStr => {
      const d = new Date(dateStr + 'T00:00:00Z');
      const dayLabel = dayNames[d.getUTCDay()];
      const record = recordMap[dateStr];

      if (record) {
        let currentValue = record.questionsAttempted;
        if (record.goalType === 'quizzes') currentValue = record.quizzesCompleted;
        else if (record.goalType === 'study_minutes') currentValue = record.studyMinutes;

        const percentage = record.goalTarget > 0
          ? Math.min(100, Math.round((currentValue / record.goalTarget) * 100))
          : 0;

        return {
          date: dateStr,
          day: dayLabel,
          questionsAttempted: record.questionsAttempted || 0,
          quizzesCompleted: record.quizzesCompleted || 0,
          correctAnswers: record.correctAnswers || 0,
          studyMinutes: record.studyMinutes || 0,
          accuracy: record.accuracy || 0,
          goalTarget: record.goalTarget,
          goalType: record.goalType,
          currentValue,
          percentage,
          isGoalCompleted: !!record.isGoalCompleted,
        };
      }

      // Default empty day
      return {
        date: dateStr,
        day: dayLabel,
        questionsAttempted: 0,
        quizzesCompleted: 0,
        correctAnswers: 0,
        studyMinutes: 0,
        accuracy: 0,
        goalTarget: 20,
        goalType: 'questions',
        currentValue: 0,
        percentage: 0,
        isGoalCompleted: false,
      };
    });

    return weeklyData;
  }
}

module.exports = ProgressService;
