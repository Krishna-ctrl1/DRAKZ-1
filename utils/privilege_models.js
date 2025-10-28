// utils/privilege_models.js
const mongoose = require('mongoose');

// Based on mongodb/insurances.js
const insuranceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['Auto', 'Health', 'Home', 'Life'], required: true },
  policyNumber: { type: String, required: true, unique: true },
  provider: { type: String, required: true },
  coverageAmount: { type: Number, required: true },
  premium: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true }
}, { timestamps: true });

// Based on mongodb/properties.js
const propertySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  type: { type: String, enum: ['Residential', 'Commercial', 'Land'], default: 'Residential' },
  location: { type: String, required: true },
  value: { type: Number, required: true },
  imageUrl: { type: String }
}, { timestamps: true });

// Based on mongodb/precious_holdings.js
const holdingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  type: { type: String, enum: ['Gold', 'Silver', 'Platinum', 'Diamond', 'Other'], default: 'Gold' },
  weight: { type: String, required: true }, // e.g., "50 g"
  purchasedValue: { type: Number, required: true },
  currentValue: { type: Number, required: true },
  date: { type: Date, required: true } // Date of purchase
}, { timestamps: true });

// Based on mongodb/transactions.js
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, required: true, enum: ['Expense', 'Investment', 'Loan', 'Insurance', 'Income'] },
    amount: { type: Number, required: true },
    status: { type: String, required: true, enum: ['Pending', 'Paid', 'Completed', 'Failed'], default: 'Pending' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });


const Insurance = mongoose.model('Insurance', insuranceSchema);
const Property = mongoose.model('Property', propertySchema);
const PreciousHolding = mongoose.model('PreciousHolding', holdingSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = {
  Insurance,
  Property,
  PreciousHolding,
  Transaction
};