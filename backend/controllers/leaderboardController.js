const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');

// Format user name cleanly for public privacy if needed, or provide clean display name
function formatDisplayName(fullName) {
  if (!fullName) return 'Anonymous Student';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

// GET /api/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const currentUserId = req.user?._id?.toString();

    // Query top 50 users by points desc, then quizzesCompleted desc
    const users = await User.find({})
      .sort({ points: -1, quizzesCompleted: -1, createdAt: 1 })
      .limit(50)
      .select('name points quizzesCompleted currentStreak longestStreak _id')
      .lean();

    // Compute public accuracy for each ranked user from their attempts
    const userIds = users.map(u => u._id);
    const attempts = await QuizAttempt.find({ userId: { $in: userIds } })
      .select('userId accuracy')
      .lean();

    const userAccMap = {};
    attempts.forEach(a => {
      const uId = a.userId.toString();
      if (!userAccMap[uId]) userAccMap[uId] = { sum: 0, count: 0 };
      userAccMap[uId].sum += (a.accuracy || 0);
      userAccMap[uId].count += 1;
    });

    let currentUserRank = null;
    let rankCounter = 1;

    const leaderboard = users.map(u => {
      const uId = u._id.toString();
      const accStat = userAccMap[uId];
      const avgAccuracy = accStat && accStat.count > 0 ? Math.round(accStat.sum / accStat.count) : 0;
      const isCurrentUser = currentUserId && uId === currentUserId;

      const entry = {
        rank: rankCounter++,
        userId: uId,
        displayName: formatDisplayName(u.name),
        fullName: isCurrentUser ? u.name : formatDisplayName(u.name),
        points: u.points || 0,
        quizzesCompleted: u.quizzesCompleted || 0,
        accuracy: avgAccuracy,
        currentStreak: u.currentStreak || 0,
        isCurrentUser,
      };

      if (isCurrentUser) {
        currentUserRank = entry;
      }

      return entry;
    });

    // If current user is not in top 50, fetch their rank specifically
    if (currentUserId && !currentUserRank) {
      const currentUser = await User.findById(currentUserId).lean();
      if (currentUser) {
        const higherCount = await User.countDocuments({
          $or: [
            { points: { $gt: currentUser.points } },
            { points: currentUser.points, quizzesCompleted: { $gt: currentUser.quizzesCompleted } },
          ],
        });

        const myAttempts = await QuizAttempt.find({ userId: currentUserId }).select('accuracy').lean();
        const myAvgAcc = myAttempts.length > 0
          ? Math.round(myAttempts.reduce((s, a) => s + (a.accuracy || 0), 0) / myAttempts.length)
          : 0;

        currentUserRank = {
          rank: higherCount + 1,
          userId: currentUserId,
          displayName: currentUser.name,
          fullName: currentUser.name,
          points: currentUser.points || 0,
          quizzesCompleted: currentUser.quizzesCompleted || 0,
          accuracy: myAvgAcc,
          currentStreak: currentUser.currentStreak || 0,
          isCurrentUser: true,
        };
      }
    }

    return res.status(200).json({
      success: true,
      leaderboard,
      currentUserRank,
    });
  } catch (error) {
    console.error('[Leaderboard Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve leaderboard.',
      error: error.message,
    });
  }
};
