// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db.config.js');
const authRoutes = require('./src/routes/auth.route.js');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// Test route
app.get('/api/test-all', (req, res) => {
  res.json({ msg: 'Backend is LIVE!', time: new Date().toISOString() });
});

// Routes 
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});