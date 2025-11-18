const express = require('express');
const router = express.Router();
const { 
  addProperty, getProperties, deleteProperty,
  getInsurances, getPreciousHoldings, addPreciousHolding, getTransactions,
  seedData // Import the new function
} = require('../controllers/privilege.controller.js');

const { auth } = require('../middlewares/auth.middleware.js');

// --- Existing Routes ---
router.get('/properties', auth, getProperties);
router.post('/properties', auth, addProperty);
router.delete('/properties/:id', auth, deleteProperty);

router.get('/insurances', auth, getInsurances);
router.get('/precious_holdings', auth, getPreciousHoldings);
router.post('/precious_holdings', auth, addPreciousHolding);
router.get('/transactions', auth, getTransactions);

// --- NEW SEED ROUTE ---
router.post('/seed', auth, seedData);

module.exports = router;