const Property = require('../models/property.model.js');
const Insurance = require('../models/insurance.model.js');
const PreciousHolding = require('../models/preciousHolding.model.js');
const Transaction = require('../models/transaction.model.js');

// --- Existing Controllers (No changes needed here) ---
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

// --- MODIFIED: SEED ONLY INSURANCES ---
const seedData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Only delete existing insurances so we don't get duplicates
    await Insurance.deleteMany({ userId });

    // Create 2 Random Insurances
    const providers = ['Geico', 'BlueCross', 'StateFarm', 'Allstate'];
    const types = ['Auto', 'Health', 'Life', 'Home'];
    
    const randomInsurances = [];
    for(let i=0; i<2; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        randomInsurances.push({
            userId,
            provider: providers[Math.floor(Math.random() * providers.length)],
            type: type,
            coverageAmount: Math.floor(Math.random() * 500000) + 10000,
            premium: Math.floor(Math.random() * 500) + 50
        });
    }

    const insurances = await Insurance.create(randomInsurances);

    // Fetch everything else to return full state (but don't change them)
    const properties = await Property.find({ userId });
    const holdings = await PreciousHolding.find({ userId });
    const transactions = await Transaction.find({ userId });

    res.status(200).json({ msg: "Insurances updated!", insurances, properties, holdings, transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addProperty, getProperties, deleteProperty,
  getInsurances, getPreciousHoldings, addPreciousHolding, getTransactions,
  seedData 
};