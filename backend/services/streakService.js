/**
 * Server-side streak management logic.
 * Calculates calendar day differences to update currentStreak and longestStreak.
 */
function getTodayDateString(date = new Date()) {
  return date.toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

function getYesterdayDateString(date = new Date()) {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().slice(0, 10);
}

function updateStreakForUser(user) {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const lastDate = user.lastCompletedQuizDate;

  let currentStreak = user.currentStreak || 0;
  let longestStreak = user.longestStreak || 0;

  if (!lastDate) {
    // First completed quiz ever
    currentStreak = 1;
  } else if (lastDate === today) {
    // Quiz already completed today, streak remains intact
    if (currentStreak === 0) currentStreak = 1;
  } else if (lastDate === yesterday) {
    // Completed yesterday -> increment consecutive day streak!
    currentStreak += 1;
  } else {
    // Gap of more than 1 day -> reset streak to 1
    currentStreak = 1;
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  user.currentStreak = currentStreak;
  user.longestStreak = longestStreak;
  user.lastCompletedQuizDate = today;

  return {
    currentStreak,
    longestStreak,
    lastCompletedQuizDate: today,
  };
}

module.exports = {
  getTodayDateString,
  getYesterdayDateString,
  updateStreakForUser,
};
