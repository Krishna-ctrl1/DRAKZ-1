const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  type: { type: String, required: true, enum: ['Auto', 'Health', 'Life', 'Home', 'Insurance', 'Investment'] },
  amount: { type: Number, required: true },
  status: { type: String, required: true, enum: ['Completed', 'Pending', 'Active', 'Failed'], default: 'Pending' },
  description: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;