const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema({
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Person', 
    required: true 
  },
  adminName: { type: String, required: true },
  action: { type: String, required: true }, // e.g., 'SUSPEND_USER', 'APPROVE_KYC'
  targetId: { type: String }, // ID of the user/blog/ticket affected
  targetName: { type: String }, // Human readable name of the target
  targetType: { type: String }, // e.g., 'USER', 'BLOG', 'TICKET'
  details: { type: String }, // Extra info like "Suspended User John due to fraud"
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminLog', AdminLogSchema);
