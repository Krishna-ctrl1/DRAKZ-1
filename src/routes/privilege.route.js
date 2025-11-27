const express = require('express');
const router = express.Router();
const { 
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
  createTransaction,
  getLiveMetalPrices,
  seedData
} = require('../controllers/privilege.controller.js');

const { auth } = require('../middlewares/auth.middleware.js');

// User Profile
router.get('/profile', auth, getUserProfile);

// Properties
router.get('/properties', auth, getProperties);
router.post('/properties', auth, addProperty);
router.put('/properties/:id', auth, updateProperty);
router.delete('/properties/:id', auth, deleteProperty);

// Insurances
router.get('/insurances', auth, getInsurances);

// Precious Holdings
router.get('/precious_holdings', auth, getPreciousHoldings);
router.post('/precious_holdings', auth, addPreciousHolding);
router.delete('/precious_holdings/:id', auth, deletePreciousHolding);

// Transactions
router.get('/transactions', auth, getTransactions);
router.post('/transactions', auth, createTransaction);
router.put('/transactions/:id', auth, updateTransaction);

// Live metal prices
router.get('/live-metal-prices', auth, getLiveMetalPrices);

// Seed Random Insurance Data Only
router.post('/seed', auth, seedData);

module.exports = router;