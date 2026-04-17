const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

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

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('MongoDB Connected');
    try {
       await mongoose.connection.collection('admins').dropIndex('username_1');
       console.log('Dropped legacy unique username index to prevent conflicts');
    } catch (e) {
       // Ignore error if index does not exist
    }
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });
