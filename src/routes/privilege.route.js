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

const uploadIfMultipart = (req, res, next) => {
  if (req.is('multipart/form-data')) {
    return upload.single('image')(req, res, next);
  }
  return next();
};

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
 *     description: Returns the authenticated user's profile. No request parameters are required.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/profile', auth, getUserProfile);

/**
 * @swagger
 * /privilege/properties:
 *   get:
 *     summary: Get properties
 *     tags: [Privilege]
 *     description: Returns all properties for the authenticated user. No request parameters are required.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of properties
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Add a property
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, value, location]
 *             properties:
 *               name:
 *                 type: string
 *               value:
 *                 type: number
 *               location:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 description: Public URL or base64 data URL
 *     responses:
 *       201:
 *         description: Property created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// Properties
router.get('/properties', auth, getProperties);
router.post('/properties', auth, uploadIfMultipart, addProperty);

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               value:
 *                 type: number
 *               location:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Property updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server error
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/properties/:id', auth, uploadIfMultipart, updateProperty);
router.delete('/properties/:id', auth, deleteProperty);

/**
 * @swagger
 * /privilege/insurances:
 *   get:
 *     summary: Get insurances
 *     tags: [Privilege]
 *     description: Returns all insurances for the authenticated user. No request parameters are required.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of insurances
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// Insurances
router.get('/insurances', auth, getInsurances);

/**
 * @swagger
 * /privilege/precious_holdings:
 *   get:
 *     summary: Get precious holdings
 *     tags: [Privilege]
 *     description: Returns all precious metal holdings for the authenticated user. No request parameters are required.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of holdings
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Add precious holding
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type, amount, purchasedValue, purchaseDate]
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Gold, Silver, Platinum, Other]
 *               amount:
 *                 type: string
 *                 description: Weight text, e.g. "10 g" or "0.5 oz"
 *               purchasedValue:
 *                 type: number
 *               currentValue:
 *                 type: number
 *               purchaseDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Holding added
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Holding not found
 *       500:
 *         description: Server error
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
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of latest transactions to return
 *     responses:
 *       200:
 *         description: List of transactions
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create transaction
 *     tags: [Privilege]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, amount]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Auto, Health, Life, Home, Insurance, Investment]
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [Pending, Active, Completed, Failed]
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Transaction created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Active, Completed, Failed]
 *     responses:
 *       200:
 *         description: Transaction updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.put('/transactions/:id', auth, updateTransaction);

/**
 * @swagger
 * /privilege/live-metal-prices:
 *   get:
 *     summary: Get live metal prices
 *     tags: [Privilege]
 *     description: Returns live metal prices (Gold/Silver/Platinum). No request parameters are required.
 *     responses:
 *       200:
 *         description: Metal prices
 *       500:
 *         description: Server error
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
// Seed Random Insurance Data Only
router.post('/seed', auth, seedData);

// --- ADMIN ROUTES ---
const { 
  getAnalytics,
  getAllUsers,
  toggleUserStatus,
  approveAdvisor,
  rejectAdvisor,
  assignAdvisor,
  getBusinessAnalytics,
  getSupportTickets,
  updateTicketStatus,
  getSettings,
  updateSettings,
  createAdmin,
  updateAdminPermissions,
  getAdminLogs,
  getActiveChats,
  getChatHistory
} = require('../controllers/privilege.controller.js');

const { requireAdmin } = require('../middlewares/auth.middleware.js');

/**
 * @swagger
 * /privilege/admin/analytics:
 *   get:
 *     summary: Get dashboard analytics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get('/admin/analytics', auth, requireAdmin, getAnalytics);

/**
 * @swagger
 * /privilege/admin/users:
 *   get:
 *     summary: Get all users with filters (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/admin/users', auth, requireAdmin, getAllUsers);

/**
 * @swagger
 * /privilege/admin/users/{id}/status:
 *   patch:
 *     summary: Toggle user status (Active/Suspended)
 *     tags: [Admin]
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
 *         description: Status updated
 */
router.patch('/admin/users/:id/status', auth, requireAdmin, toggleUserStatus);

/**
 * @swagger
 * /privilege/admin/advisors/{id}/approve:
 *   patch:
 *     summary: Approve an advisor account
 *     tags: [Admin]
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
 *         description: Advisor approved
 */
router.patch('/admin/advisors/:id/approve', auth, requireAdmin, approveAdvisor);

/**
 * @swagger
 * /privilege/admin/advisors/{id}/reject:
 *   patch:
 *     summary: Reject an advisor account
 *     tags: [Admin]
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
 *         description: Advisor rejected
 */
router.patch('/admin/advisors/:id/reject', auth, requireAdmin, rejectAdvisor);

/**
 * @swagger
 * /privilege/admin/assign:
 *   post:
 *     summary: Assign advisor to user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               advisorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Advisor assigned
 */
router.post('/admin/assign', auth, requireAdmin, assignAdvisor);

// New Advanced Admin Routes
router.get('/admin/business-analytics', auth, requireAdmin, getBusinessAnalytics);
router.get('/admin/support', auth, requireAdmin, getSupportTickets);
router.patch('/admin/support/:id', auth, requireAdmin, updateTicketStatus);
router.get('/admin/settings', auth, requireAdmin, getSettings);
router.put('/admin/settings', auth, requireAdmin, updateSettings);

// Chat Admin Routes
router.get('/admin/active-chats', auth, requireAdmin, getActiveChats);
router.get('/admin/chat/:userId', auth, requireAdmin, getChatHistory);

// RBAC Routes
router.post('/admin/create-admin', auth, requireAdmin, createAdmin);
router.patch('/admin/update-permissions/:id', auth, requireAdmin, updateAdminPermissions);

// Logs
router.get('/admin/logs', auth, requireAdmin, getAdminLogs);

module.exports = router;