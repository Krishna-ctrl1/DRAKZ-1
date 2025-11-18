// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db.config.js');
const authRoutes = require('./src/routes/auth.route.js');

// --- 1. IMPORT THE NEW ROUTE HERE ---
const advisorRoutes = require('./src/routes/advisor.route.js'); 

const app = express();

// Connect DB
connectDB();

// Middleware
// NOTE: If your React app runs on port 5173 (Vite default), change 3000 to 5173 below!
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Allowed both common ports
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

// --- 2. USE THE NEW ROUTE HERE ---
app.use('/api/advisor', advisorRoutes); 

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});