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
    // Dynamically allow any local development origin
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

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
  })
  .catch(err => {
    console.error('❌ FATAL DATABASE ERROR:', err.message);
    console.error('💡 PRO-TIP: Ensure your local MongoDB service is started (run "mongod" or start via Services).');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  });
