const mongoose = require('mongoose');

const AccessLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  type: { type: String, enum: ['access', 'error'], default: 'access', index: true },
  method: String,
  path: String,
  statusCode: Number,
  ip: String,
  duration: Number, // ms
  userAgent: String,
  message: String,
}, { timestamps: false });

// Auto-expire logs after 30 days to prevent unbounded growth
AccessLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('AccessLog', AccessLogSchema);
