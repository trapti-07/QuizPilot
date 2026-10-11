const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generate', authMiddleware, quizController.generateQuiz);
router.get('/history', authMiddleware, quizController.getQuizHistory);
router.get('/attempts/:attemptId', authMiddleware, quizController.getAttemptById);
router.get('/:id', authMiddleware, quizController.getQuizById);
router.post('/:id/submit', authMiddleware, quizController.submitQuiz);

module.exports = router;
