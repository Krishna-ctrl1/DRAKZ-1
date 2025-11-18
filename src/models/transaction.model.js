const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  type: { type: String, required: true, enum: ['Expense', 'Investment', 'Loan', 'Insurance', 'Income'] },
  amount: { type: Number, required: true },
  status: { type: String, required: true, enum: ['Completed', 'Pending', 'Failed'], default: 'Completed' },
  description: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;