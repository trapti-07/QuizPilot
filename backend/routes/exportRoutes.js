const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/export', authMiddleware, exportController.exportResults);
router.get('/export-improvement', authMiddleware, exportController.exportImprovementReport);

module.exports = router;
