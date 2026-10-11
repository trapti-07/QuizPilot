const PlannerService = require('../services/plannerService');

// GET /api/planner/today
exports.getTodayPlan = async (req, res) => {
  try {
    const plan = await PlannerService.getOrCreateTodayPlan(req.user._id);
    return res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error('[Planner Controller Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve today\'s revision plan.',
      error: error.message,
    });
  }
};

// PATCH /api/planner/tasks/:taskId/toggle
exports.toggleTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const plan = await PlannerService.toggleTaskCompletion(req.user._id, taskId);
    return res.status(200).json({
      success: true,
      message: 'Revision task status updated.',
      plan,
    });
  } catch (error) {
    console.error('[Toggle Task Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update revision task status.',
      error: error.message,
    });
  }
};

// GET /api/planner/weekly
exports.getWeeklySummary = async (req, res) => {
  try {
    const summary = await PlannerService.getWeeklyPlannerSummary(req.user._id);
    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('[Planner Weekly Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve weekly planner history.',
      error: error.message,
    });
  }
};
