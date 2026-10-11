const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const authMiddleware = require('../middleware/authMiddleware');

// All progress routes are private and protected by JWT auth middleware
router.use(authMiddleware);

router.get('/today', progressController.getTodayProgress);
router.put('/goal', progressController.updateGoal);
router.get('/weekly', progressController.getWeeklyProgress);

module.exports = router;
