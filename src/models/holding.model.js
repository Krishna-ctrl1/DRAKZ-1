const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  // Link to the user who owns this holding
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assumes your user model is named 'User' or 'Person'
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // e.g., 'Stock', 'Bond', 'Crypto'
  type: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  purchaseValue: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true 
});

const Holding = mongoose.model('Holding', holdingSchema);

module.exports = Holding;