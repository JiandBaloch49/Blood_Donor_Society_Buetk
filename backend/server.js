const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Fail-fast if JWT_SECRET is missing
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined in .env');
  process.exit(1);
}

const app = express();

// Manual Cookie Parser (Avoids dependency on 'cookie-parser' package)
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        req.cookies[name] = value;
      }
    });
  }
  next();
});

// Security & Parsing
app.use(cors({
  origin: (origin, callback) => {
    // List of allowed origins or patterns
    // 1. No origin (direct requests, server-to-server)
    if (!origin) return callback(null, true);

    // 2. Exact match check
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:\d+$/ // Standard RFC1918 Class B
    ];

    // Added specific support for the requested IP just in case it falls outside standard Class B regex
    if (origin.includes('172.16.46.226')) {
       return callback(null, true);
    }

    const isMatch = allowedPatterns.some(pattern => pattern.test(origin));

    if (isMatch) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chronicRoutes = require('./routes/chronicRoutes');

app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chronic', chronicRoutes);

const path = require('path');
// Serve frontend static files if in production or dist exists
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('/', (req, res) => {
  res.send('Blood Donor Society API is running. If you are developing locally, please ensure you are visiting the frontend development server (usually http://localhost:5173).');
});

// Catch-all route to serve the frontend index.html for React routing (if built frontend exists)
app.get('*', (req, res) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  // Check if frontend is built
  require('fs').stat(indexPath, (err) => {
    if (!err) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('API route not found or frontend not built. Please run "npm run dev" to start both frontend and backend locally.');
    }
  });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blood_donor_platform';

console.log('🔄 Attempting to connect to MongoDB...');

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');
    try {
       await mongoose.connection.collection('admins').dropIndex('username_1');
       console.log('ℹ️ Cleaned up legacy database indexes');
    } catch (e) {
       // Ignore error if index does not exist
    }
    app.listen(PORT, () => {
      console.log('🚀 SYSTEM READY');
      console.log(`🌐 API Server: http://localhost:${PORT}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    // Phase 3: Start auto-expiry cron jobs
    const { startCronJobs } = require('./utils/cronJobs');
    startCronJobs();
  })
  .catch(err => {
    console.error('❌ FATAL DATABASE ERROR:', err.message);
    console.error('💡 PRO-TIP: Ensure your local MongoDB service is started (run "mongod" or start via Services).');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  });
