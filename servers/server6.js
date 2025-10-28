// servers/server6.js
const express = require('express');
const router = express.Router();
const {
  Insurance,
  Property,
  PreciousHolding,
  Transaction
} = require('../utils/privilege_models.js');

// --- SEED ROUTE ---
// Visit http://localhost:5000/api/privilege/seed to add sample data
router.get('/seed', async (req, res) => {
  try {
    // Clear existing data
    await Insurance.deleteMany({});
    await Property.deleteMany({});
    await PreciousHolding.deleteMany({});
    await Transaction.deleteMany({});

    // Sample Data
    const sampleInsurances = [
      { type: 'Auto', policyNumber: 'AUTO-123', provider: 'AutoInsure', coverageAmount: 50000, premium: 120, endDate: new Date('2026-10-01') },
      { type: 'Health', policyNumber: 'HLTH-456', provider: 'HealthFirst', coverageAmount: 200000, premium: 300, endDate: new Date('2027-01-01') },
      { type: 'Auto', policyNumber: 'AUTO-789', provider: 'DriveSafe', coverageAmount: 75000, premium: 150, endDate: new Date('2026-05-01') },
    ];
    
    const sampleProperties = [
      { name: 'Sunset Villa', location: '123 Sunset Boulevard', value: 750000, imageUrl: '/1.jpg' },
      { name: 'Downtown Loft', location: '456 Main St, Apt 10', value: 420000, imageUrl: '/2.jpg' },
      { name: 'Lakeview Cabin', location: '789 Lake Rd', value: 1050000, imageUrl: '/3.jpg' },
    ];
    
    const sampleHoldings = [
      { name: 'Gold Necklace (22K)', weight: '50 g', purchasedValue: 275000, currentValue: 310000, date: new Date('2023-01-12') },
      { name: 'Silver Anklet Pair', weight: '200 g', purchasedValue: 14000, currentValue: 16200, date: new Date('2022-06-05') },
      { name: 'Gold Bangle Set (22K)', weight: '80 g', purchasedValue: 440000, currentValue: 505000, date: new Date('2021-09-19') },
    ];
    
    const sampleTransactions = [
      { type: 'Expense', amount: 79000, status: 'Pending', date: new Date('2025-10-27') },
      { type: 'Investment', amount: 65500, status: 'Pending', date: new Date('2025-10-26') },
      { type: 'Loan', amount: 45600, status: 'Paid', date: new Date('2025-10-25') },
      { type: 'Insurance', amount: 70400, status: 'Paid', date: new Date('2025-10-24') },
      { type: 'Income', amount: 150000, status: 'Completed', date: new Date('2025-10-23') },
    ];

    // Insert data
    await Insurance.insertMany(sampleInsurances);
    await Property.insertMany(sampleProperties);
    await PreciousHolding.insertMany(sampleHoldings);
    await Transaction.insertMany(sampleTransactions);
    
    res.json({ message: 'Database seeded successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to seed database: ' + err.message });
  }
});

// --- Insurances ---
router.get('/insurances', async (req, res) => {
  try {
    const insurances = await Insurance.find();
    res.json(insurances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Properties ---
router.get('/properties', async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/properties', async (req, res) => {
  try {
    const newProperty = new Property({ ...req.body });
    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/properties/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    
    await property.deleteOne();
    res.json({ message: 'Property removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Holdings ---
router.get('/precious_holdings', async (req, res) => {
  try {
    const holdings = await PreciousHolding.find();
    res.json(holdings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/precious_holdings', async (req, res) => {
    try {
        const newHolding = new PreciousHolding({ ...req.body });
        await newHolding.save();
        res.status(201).json(newHolding);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- Transactions ---
router.get('/transactions', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        const sort = req.query.sort === 'date_desc' ? { date: -1 } : { date: 1 };

        const transactions = await Transaction.find()
            .sort(sort)
            .limit(limit);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;