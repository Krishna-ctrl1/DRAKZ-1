const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  provider: { type: String, required: true },
  type: { type: String, required: true, enum: ['Auto', 'Health', 'Life', 'Home'] },
  coverageAmount: { type: Number, required: true },
  premium: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
}, { timestamps: true });

const Insurance = mongoose.model('Insurance', insuranceSchema);
module.exports = Insurance;