const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/today', plannerController.getTodayPlan);
router.patch('/tasks/:taskId/toggle', plannerController.toggleTask);
router.get('/weekly', plannerController.getWeeklySummary);

module.exports = router;
