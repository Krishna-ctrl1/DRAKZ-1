const Property = require('../models/property.model.js');
const Insurance = require('../models/insurance.model.js');
const PreciousHolding = require('../models/preciousHolding.model.js');
const Transaction = require('../models/transaction.model.js');

// --- Existing Controllers ---
const addProperty = async (req, res) => {
  try {
    const { name, value, location, imageUrl } = req.body;
    const newProperty = new Property({
      userId: req.user.id, name, value, location, imageUrl: imageUrl || '/1.jpg',
    });
    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({ userId: req.user.id });
    res.status(200).json(properties);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const deleteProperty = async (req, res) => {
  try {
    await Property.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.status(200).json({ msg: 'Property removed' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const getInsurances = async (req, res) => {
  try {
    const insurances = await Insurance.find({ userId: req.user.id });
    res.status(200).json(insurances);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const getPreciousHoldings = async (req, res) => {
  try {
    const holdings = await PreciousHolding.find({ userId: req.user.id });
    res.status(200).json(holdings);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const addPreciousHolding = async (req, res) => {
  try {
    const { name, type, amount, purchasedValue, currentValue, purchaseDate } = req.body;
    const newHolding = new PreciousHolding({
      userId: req.user.id, name, type, weight: amount, purchasedValue,
      currentValue: currentValue || purchasedValue, purchaseDate,
    });
    await newHolding.save();
    res.status(201).json(newHolding);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 }).limit(5);
    res.status(200).json(transactions);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// --- NEW: RANDOM DATA GENERATOR ---
const seedData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Clear existing data (optional, safest for demo)
    await Promise.all([
      Property.deleteMany({ userId }),
      Insurance.deleteMany({ userId }),
      PreciousHolding.deleteMany({ userId }),
      Transaction.deleteMany({ userId })
    ]);

    // 2. Create Insurances
    const insurances = await Insurance.create([
      { userId, provider: 'Geico', type: 'Auto', coverageAmount: 25000, premium: 120 },
      { userId, provider: 'BlueCross', type: 'Health', coverageAmount: 100000, premium: 450 }
    ]);

    // 3. Create Properties
    const properties = await Property.create([
      { userId, name: 'Sunset Villa', value: 450000, location: 'California', imageUrl: '/1.jpg' },
      { userId, name: 'Downtown Apt', value: 850000, location: 'New York', imageUrl: '/2.jpg' }
    ]);

    // 4. Create Holdings
    const holdings = await PreciousHolding.create([
      { userId, name: 'Gold Bar', type: 'Gold', weight: '50g', purchasedValue: 3000, currentValue: 3200, purchaseDate: new Date() },
      { userId, name: 'Silver Coin', type: 'Silver', weight: '1kg', purchasedValue: 800, currentValue: 750, purchaseDate: new Date() }
    ]);

    // 5. Create Transactions
    const transactions = await Transaction.create([
      { userId, type: 'Expense', amount: 1200, status: 'Completed', description: 'Rent', date: new Date() },
      { userId, type: 'Income', amount: 5000, status: 'Completed', description: 'Salary', date: new Date() },
      { userId, type: 'Investment', amount: 2000, status: 'Pending', description: 'Stock Buy', date: new Date() }
    ]);

    res.status(200).json({ msg: "Data seeded successfully!", insurances, properties, holdings, transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addProperty, getProperties, deleteProperty,
  getInsurances, getPreciousHoldings, addPreciousHolding, getTransactions,
  seedData // Export the new function
};