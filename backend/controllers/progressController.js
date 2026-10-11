const ProgressService = require('../services/progressService');

// GET /api/progress/today
exports.getTodayProgress = async (req, res) => {
  try {
    const data = await ProgressService.getOrCreateTodayProgress(req.user._id);
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('[Progress Controller Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve today\'s study progress.',
      error: error.message,
    });
  }
};

// PUT /api/progress/goal
exports.updateGoal = async (req, res) => {
  try {
    const { goalType, goalTarget } = req.body;

    if (!goalTarget || parseInt(goalTarget, 10) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid goal target greater than 0.',
      });
    }

    const data = await ProgressService.updateGoal(req.user._id, goalType, goalTarget);
    return res.status(200).json({
      success: true,
      message: 'Daily study goal updated successfully!',
      ...data,
    });
  } catch (error) {
    console.error('[Update Goal Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update study goal.',
      error: error.message,
    });
  }
};

// GET /api/progress/weekly
exports.getWeeklyProgress = async (req, res) => {
  try {
    const weekly = await ProgressService.getWeeklyProgress(req.user._id);
    return res.status(200).json({
      success: true,
      weekly,
    });
  } catch (error) {
    console.error('[Weekly Progress Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve weekly progress history.',
      error: error.message,
    });
  }
};
