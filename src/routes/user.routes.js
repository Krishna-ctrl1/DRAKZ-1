const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Read
router.get('/users', userController.getAllUsers);
router.get('/dashboard-stats', userController.getDashboardStats);
router.get('/server-metrics', userController.getServerMetrics);

// Create
router.post('/users', userController.createUser);

// Update (we use PUT and include the ID in the URL)
router.put('/users/:id', userController.updateUser);

// Delete (we use DELETE and include the ID in the URL)
router.delete('/users/:id', userController.deleteUser);

module.exports = router;