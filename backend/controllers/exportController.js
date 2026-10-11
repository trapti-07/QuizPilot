const QuizAttempt = require('../models/QuizAttempt');
const ImprovementService = require('../services/improvementService');

function escapeCsvField(field) {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

// GET /api/results/export
exports.exportResults = async (req, res) => {
  try {
    const userId = req.user._id;
    const attempts = await QuizAttempt.find({ userId })
      .sort({ completedAt: -1 })
      .lean();

    const headers = [
      'Date',
      'Subject',
      'Unit / Chapter',
      'Difficulty',
      'Total Questions',
      'Correct Answers',
      'Score',
      'Accuracy (%)',
      'Time Taken (s)',
      'Points Awarded',
    ];

    const rows = [headers.join(',')];

    attempts.forEach(a => {
      const dateStr = a.completedAt ? new Date(a.completedAt).toISOString().replace('T', ' ').slice(0, 19) : 'N/A';
      const row = [
        escapeCsvField(dateStr),
        escapeCsvField(a.subject),
        escapeCsvField(a.unit),
        escapeCsvField(a.difficulty),
        escapeCsvField(a.totalQuestions),
        escapeCsvField(a.correctAnswers),
        escapeCsvField(a.score),
        escapeCsvField(`${a.accuracy}%`),
        escapeCsvField(a.timeTaken || 0),
        escapeCsvField(a.pointsAwarded || 0),
      ];
      rows.push(row.join(','));
    });

    const csvContent = '\uFEFF' + rows.join('\r\n'); // BOM for Excel UTF-8 compatibility
    const filename = `QuizPilot_Results_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('[Export Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export quiz results.',
      error: error.message,
    });
  }
};

// GET /api/results/export-improvement
exports.exportImprovementReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const report = await ImprovementService.getImprovementReport(userId);

    const headers = [
      'Topic / Concept',
      'Subject',
      'Unit',
      'Total Attempts',
      'Correct Count',
      'Incorrect Count',
      'Initial Accuracy (%)',
      'Latest Accuracy (%)',
      'Score Delta (%)',
      'Mastery Status',
    ];

    const rows = [headers.join(',')];

    (report.topicTrajectories || []).forEach(t => {
      const row = [
        escapeCsvField(t.topic),
        escapeCsvField(t.subject),
        escapeCsvField(t.unit),
        escapeCsvField(t.totalAttempts),
        escapeCsvField(t.correctCount),
        escapeCsvField(t.incorrectCount),
        escapeCsvField(`${t.initialAccuracy}%`),
        escapeCsvField(`${t.latestAccuracy}%`),
        escapeCsvField(`${t.delta > 0 ? '+' : ''}${t.delta}%`),
        escapeCsvField(t.masteryStatus),
      ];
      rows.push(row.join(','));
    });

    const csvContent = '\uFEFF' + rows.join('\r\n');
    const filename = `QuizPilot_Learning_Improvement_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('[Export Improvement Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export learning improvement report.',
      error: error.message,
    });
  }
};
