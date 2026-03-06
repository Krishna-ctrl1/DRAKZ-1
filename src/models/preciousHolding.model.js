const mongoose = require('mongoose');

const preciousHoldingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Gold', 'Silver', 'Platinum', 'Other'], required: true },
  weight: { type: String }, 
  purchasedValue: { type: Number, required: true },
  currentValue: { type: Number, required: true },
  purchaseDate: { type: Date, required: true },
}, { timestamps: true });

// Add index on userId for faster queries
preciousHoldingSchema.index({ userId: 1 });

const PreciousHolding = mongoose.model('PreciousHolding', preciousHoldingSchema);
module.exports = PreciousHolding;