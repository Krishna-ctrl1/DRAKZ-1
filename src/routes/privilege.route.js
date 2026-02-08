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
const { upload } = require('../middlewares/upload.middleware.js');

/**
 * @swagger
 * tags:
 *   name: Privilege
 *   description: Privileged accesses (Properties, Insurances, etc.)
 */

/**
 * @swagger
 * /privilege/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/profile', auth, getUserProfile);

/**
 * @swagger
 * /privilege/properties:
 *   get:
 *     summary: Get properties
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of properties
 *   post:
 *     summary: Add a property
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Property added
 */
// Properties
router.get('/properties', auth, getProperties);
router.post('/properties', auth, addProperty);

/**
 * @swagger
 * /privilege/properties/{id}:
 *   put:
 *     summary: Update a property
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property updated
 *   delete:
 *     summary: Delete a property
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property deleted
 */
router.put('/properties/:id', auth, updateProperty);
router.post('/properties', auth, upload.single('image'), addProperty);
router.put('/properties/:id', auth, upload.single('image'), updateProperty);
router.delete('/properties/:id', auth, deleteProperty);

/**
 * @swagger
 * /privilege/insurances:
 *   get:
 *     summary: Get insurances
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of insurances
 */
// Insurances
router.get('/insurances', auth, getInsurances);

/**
 * @swagger
 * /privilege/precious_holdings:
 *   get:
 *     summary: Get precious holdings
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of holdings
 *   post:
 *     summary: Add precious holding
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Holding added
 */
// Precious Holdings
router.get('/precious_holdings', auth, getPreciousHoldings);
router.post('/precious_holdings', auth, addPreciousHolding);

/**
 * @swagger
 * /privilege/precious_holdings/{id}:
 *   delete:
 *     summary: Delete precious holding
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Holding deleted
 */
router.delete('/precious_holdings/:id', auth, deletePreciousHolding);

/**
 * @swagger
 * /privilege/transactions:
 *   get:
 *     summary: Get transactions
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 *   post:
 *     summary: Create transaction
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction created
 */
// Transactions
router.get('/transactions', auth, getTransactions);
router.post('/transactions', auth, createTransaction);

/**
 * @swagger
 * /privilege/transactions/{id}:
 *   put:
 *     summary: Update transaction
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction updated
 */
router.put('/transactions/:id', auth, updateTransaction);

/**
 * @swagger
 * /privilege/live-metal-prices:
 *   get:
 *     summary: Get live metal prices
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metal prices
 */
// Live metal prices
router.get('/live-metal-prices', auth, getLiveMetalPrices);
// Live metal prices (public endpoint - no auth required)
router.get('/live-metal-prices', getLiveMetalPrices);

/**
 * @swagger
 * /privilege/seed:
 *   post:
 *     summary: Seed random data
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seed successful
 */
// Seed Random Insurance Data Only
router.post('/seed', auth, seedData);

module.exports = router;