// This file is now missing from the context, so I am recreating it.
const express = require('express');
const router = express.Router();
const { 
  addProperty, 
  getProperties,
  deleteProperty,
  getInsurances,
  getPreciousHoldings,
  addPreciousHolding,
  getTransactions
} = require('../controllers/privilege.controller.js');

const { auth } = require('../middlewares/auth.middleware.js');

// --- Property Routes ---
router.get('/properties', auth, getProperties);
router.post('/properties', auth, addProperty);
router.delete('/properties/:id', auth, deleteProperty);

// --- Insurance Routes ---
router.get('/insurances', auth, getInsurances);

// --- Precious Holding Routes ---
router.get('/precious_holdings', auth, getPreciousHoldings);
router.post('/precious_holdings', auth, addPreciousHolding);

// --- Transaction Routes ---
router.get('/transactions', auth, getTransactions);

module.exports = router;