const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { seedQuestionBankIfEmpty } = require('./services/questionBankService');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/results', require('./routes/exportRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/planner', require('./routes/plannerRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'QuizPilot API',
  });
});

// 404 handler for unknown API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `API route ${req.originalUrl} not found.`,
    });
  }
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server and Connect Database
const startServer = async () => {
  try {
    await connectDB();
    // Auto-seed question bank if empty
    await seedQuestionBankIfEmpty();

    app.listen(PORT, () => {
      console.log(`[QuizPilot Server] Running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Fatal Error] Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
