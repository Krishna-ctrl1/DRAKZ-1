// This file is now missing from the context, so I am recreating it.
const Property = require('../models/property.model.js');
const Insurance = require('../models/insurance.model.js');
const PreciousHolding = require('../models/preciousHolding.model.js');
const Transaction = require('../models/transaction.model.js');

// --- Property Controllers ---
const addProperty = async (req, res) => {
  try {
    const { name, value, location, imageUrl } = req.body;
    const newProperty = new Property({
      userId: req.user.id, 
      name, value, location,
      imageUrl: imageUrl || '/1.jpg',
    });
    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({ userId: req.user.id });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    if (!property) return res.status(404).json({ msg: 'Property not found or user not authorized' });
    res.status(200).json({ msg: 'Property removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- Insurance Controller ---
const getInsurances = async (req, res) => {
  try {
    const insurances = await Insurance.find({ userId: req.user.id });
    res.status(200).json(insurances);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- Precious Holding Controllers ---
const getPreciousHoldings = async (req, res) => {
  try {
    const holdings = await PreciousHolding.find({ userId: req.user.id });
    res.status(200).json(holdings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addPreciousHolding = async (req, res) => {
  try {
    const { name, type, amount, purchasedValue, currentValue, purchaseDate } = req.body;
    const newHolding = new PreciousHolding({
      userId: req.user.id,
      name,
      type,
      weight: amount, // Map amount to weight
      purchasedValue,
      currentValue: currentValue || purchasedValue,
      purchaseDate: purchaseDate,
    });
    await newHolding.save();
    res.status(201).json(newHolding);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- Transaction Controller ---
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(4); // Frontend requests a limit of 4
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- EXPORT ALL FUNCTIONS ---
module.exports = {
  addProperty,
  getProperties,
  deleteProperty,
  getInsurances,
  getPreciousHoldings,
  addPreciousHolding,
  getTransactions,
};