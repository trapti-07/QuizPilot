const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { seedQuestionBankIfEmpty } = require('./services/questionBankService');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Helper functions for origin normalization and hostname extraction
const normalizeOrigin = (urlStr) => {
  if (!urlStr || typeof urlStr !== 'string') return '';
  return urlStr.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '').toLowerCase();
};

const extractHost = (urlStr) => {
  try {
    const withProto = /^https?:\/\//i.test(urlStr) ? urlStr : `https://${urlStr}`;
    return new URL(withProto).hostname.toLowerCase();
  } catch {
    return '';
  }
};

// Base allowed origins and hosts for local development
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);
const allowedHosts = new Set(['localhost', '127.0.0.1']);

// Allow deployed frontend origin via FRONTEND_URL or CLIENT_URL (supports comma-separated list)
const configuredFrontend = process.env.FRONTEND_URL || process.env.CLIENT_URL;
if (configuredFrontend) {
  const customEntries = configuredFrontend.split(',').map(normalizeOrigin).filter(Boolean);
  customEntries.forEach((entry) => {
    allowedOrigins.add(entry);
    if (!/^https?:\/\//i.test(entry)) {
      allowedOrigins.add(`https://${entry}`);
      allowedOrigins.add(`http://${entry}`);
    } else {
      allowedOrigins.add(entry.replace(/^https?:\/\//i, ''));
    }
    const host = extractHost(entry);
    if (host) {
      allowedHosts.add(host);
    }
  });
}

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const cleanOrigin = normalizeOrigin(origin);
  if (allowedOrigins.has(cleanOrigin)) return true;

  const originHost = extractHost(cleanOrigin);
  if (originHost && allowedHosts.has(originHost)) return true;

  return false;
};

// Enable CORS for allowed origins with credentials
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without Origin header (e.g. mobile apps, curl, server health checks)
    if (!origin || isOriginAllowed(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS Blocked] Unauthorized origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200,
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
