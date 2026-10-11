const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/weak-topics', authMiddleware, analyticsController.getWeakTopics);
router.get('/difficulty', authMiddleware, analyticsController.getDifficultyRecommendation);
router.get('/improvement-report', authMiddleware, analyticsController.getImprovementReport);

module.exports = router;
