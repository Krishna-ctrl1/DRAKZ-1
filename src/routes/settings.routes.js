const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const {
  getProfile,
  updateProfile,
  updateFinancialPreferences,
  changePassword
} = require('../controllers/settings.controller');

// @route   GET /api/settings/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, getProfile);

// @route   PUT /api/settings/profile
// @desc    Update profile information
// @access  Private
router.put('/profile', auth, updateProfile);

// @route   PUT /api/settings/financial
// @desc    Update financial preferences
// @access  Private
router.put('/financial', auth, updateFinancialPreferences);

// @route   PUT /api/settings/password
// @desc    Change password
// @access  Private
router.put('/password', auth, changePassword);

module.exports = router;
