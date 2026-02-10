const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Person', 
    required: true 
  },
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Person' 
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  messages: [{
    sender: { type: String, enum: ['user', 'admin'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
