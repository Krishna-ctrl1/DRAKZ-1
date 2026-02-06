const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const {
  getProfile,
  updateProfile,
  updateFinancialPreferences,
  changePassword
} = require('../controllers/settings.controller');

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: User settings
 */

/**
 * @swagger
 * /settings/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 *   put:
 *     summary: Update profile
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 */
// @route   GET /api/settings/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, getProfile);

// @route   PUT /api/settings/profile
// @desc    Update profile information
// @access  Private
router.put('/profile', auth, updateProfile);

/**
 * @swagger
 * /settings/financial:
 *   put:
 *     summary: Update financial preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences updated
 */
// @route   PUT /api/settings/financial
// @desc    Update financial preferences
// @access  Private
router.put('/financial', auth, updateFinancialPreferences);

/**
 * @swagger
 * /settings/password:
 *   put:
 *     summary: Change password
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 */
// @route   PUT /api/settings/password
// @desc    Change password
// @access  Private
router.put('/password', auth, changePassword);

module.exports = router;
