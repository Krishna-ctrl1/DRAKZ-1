const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'advisor', 'user'], default: 'user' },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Person', PersonSchema);