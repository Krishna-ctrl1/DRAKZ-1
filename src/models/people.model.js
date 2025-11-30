const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'advisor', 'user'], default: 'user' },
  
  // --- NEW FIELDS FOR ADVISOR DASHBOARD ---
  portfolioValue: { type: Number, default: 0 },
  riskProfile: { type: String, default: 'Moderate' },
  activeGoals: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  // ----------------------------------------

  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Person', PersonSchema);