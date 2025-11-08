import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/api/auth', authRoutes);

// ✅ Connect to DB *before* starting server
const startServer = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/checkingdb');
    console.log("✅ Connected to MongoDB");

    app.listen(3005, () => {
      console.log("🚀 Server running on port 3005");
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
  }
};

startServer();
