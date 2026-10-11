const mongoose = require('mongoose');
const dns = require('dns');

// On Windows, Node.js c-ares DNS resolver frequently throws querySrv ECONNREFUSED for mongodb+srv URLs.
// Setting public DNS servers (Google / Cloudflare) allows SRV lookups to resolve reliably.
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore in restricted environments
}

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quizpilot';
  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to primary MongoDB: ${error.message}`);
    // If Atlas connection failed and wasn't already local, attempt local MongoDB fallback
    if (primaryUri !== 'mongodb://127.0.0.1:27017/quizpilot') {
      try {
        console.log('[Database] Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/quizpilot)...');
        const fallbackConn = await mongoose.connect('mongodb://127.0.0.1:27017/quizpilot', {
          serverSelectionTimeoutMS: 4000,
        });
        console.log(`[Database] Connected to local MongoDB: ${fallbackConn.connection.host}`);
        return fallbackConn;
      } catch (localError) {
        console.error(`[Database Error] Local MongoDB fallback failed: ${localError.message}`);
      }
    }
    console.warn('[Database Notice] Please ensure MongoDB service is running locally or check your MONGODB_URI in .env');
    throw error;
  }
};

module.exports = connectDB;
