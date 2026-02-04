const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth, requireAdmin } = require('../middlewares/auth.middleware.js');
const validateUserInput = require('../middlewares/validateUserInput.middleware.js');

// Read - Admin only
router.get('/users', auth, requireAdmin, userController.getAllUsers);
router.get('/dashboard-stats', auth, requireAdmin, userController.getDashboardStats);
router.get('/server-metrics', auth, requireAdmin, userController.getServerMetrics);

// Create - Admin only
router.post('/users', auth, requireAdmin, validateUserInput, userController.createUser);

// Update - Admin only (we use PUT and include the ID in the URL)
router.put('/users/:id', auth, requireAdmin, validateUserInput, userController.updateUser);

// Delete - Admin only (we use DELETE and include the ID in the URL)
router.delete('/users/:id', auth, requireAdmin, userController.deleteUser);

module.exports = router;