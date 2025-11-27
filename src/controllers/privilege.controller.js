const Property = require('../models/property.model.js');
const Insurance = require('../models/insurance.model.js');
const PreciousHolding = require('../models/preciousHolding.model.js');
const Transaction = require('../models/transaction.model.js');
const Person = require('../models/people.model.js');

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await Person.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Property
const addProperty = async (req, res) => {
  try {
    const { name, value, location, imageUrl } = req.body;
    
    // Validate inputs
    if (!name || !value || !location) {
      return res.status(400).json({ error: 'Name, value, and location are required' });
    }

    // Check if imageUrl is too large (MongoDB has 16MB document limit)
    if (imageUrl && imageUrl.length > 10000000) { // ~10MB limit for base64
      return res.status(400).json({ error: 'Image size is too large. Please use a smaller image.' });
    }

    const newProperty = new Property({
      userId: req.user.id, 
      name, 
      value, 
      location, 
      imageUrl: imageUrl || '/1.jpg',
    });
    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) { 
    console.error('Add property error:', error);
    res.status(500).json({ error: error.message }); 
  }
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

const updateProperty = async (req, res) => {
  try {
    const { name, value, location, imageUrl } = req.body;
    
    // Validate inputs
    if (!name || !value || !location) {
      return res.status(400).json({ error: 'Name, value, and location are required' });
    }

    // Check if imageUrl is too large
    if (imageUrl && imageUrl.length > 10000000) { // ~10MB limit for base64
      return res.status(400).json({ error: 'Image size is too large. Please use a smaller image.' });
    }

    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, value, location, imageUrl },
      { new: true, runValidators: true }
    );
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.status(200).json(property);
  } catch (error) { 
    console.error('Update property error:', error);
    res.status(500).json({ error: error.message }); 
  }
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
    const limit = parseInt(req.query.limit) || 5;
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(limit);
    res.status(200).json(transactions);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

// Delete Precious Holding
const deletePreciousHolding = async (req, res) => {
  try {
    const holding = await PreciousHolding.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    if (!holding) {
      return res.status(404).json({ error: 'Holding not found' });
    }
    res.status(200).json({ msg: 'Holding removed successfully' });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

// --- Seed ONLY Insurances with Random Data ---
const seedData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Only delete existing insurances so we don't get duplicates
    await Insurance.deleteMany({ userId });

    // Create 2-4 Random Insurances
    const providers = ['Geico', 'BlueCross', 'StateFarm', 'Allstate', 'Progressive', 'Aetna'];
    const types = ['Auto', 'Health', 'Life', 'Home'];
    const insuranceCount = Math.floor(Math.random() * 3) + 2; // 2-4 insurances
    
    const randomInsurances = [];
    for(let i = 0; i < insuranceCount; i++) {
      const type = types[i % types.length]; // Cycle through types
      randomInsurances.push({
        userId,
        provider: providers[Math.floor(Math.random() * providers.length)],
        type: type,
        coverageAmount: Math.floor(Math.random() * 500000) + 50000, // $50k - $550k
        premium: Math.floor(Math.random() * 500) + 100, // $100 - $600
        startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random date in last year
      });
    }

    const insurances = await Insurance.create(randomInsurances);

    res.status(200).json({ 
      msg: "Insurances generated successfully!", 
      insurances 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update Transaction Status
const updateTransaction = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserProfile,
  addProperty, 
  getProperties, 
  deleteProperty,
  updateProperty,
  getInsurances, 
  getPreciousHoldings, 
  addPreciousHolding,
  deletePreciousHolding,
  getTransactions,
  updateTransaction,
  seedData
};