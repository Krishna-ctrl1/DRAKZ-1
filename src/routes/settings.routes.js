const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth.middleware");
const { profileUpload } = require("../middlewares/upload.middleware");
const {
  getProfile,
  updateProfile,
  updateFinancialPreferences,
  changePassword,
  uploadProfilePicture,
} = require("../controllers/settings.controller");
const {
  validateProfileUpdate,
  validateFinancialUpdate,
  validatePasswordChange,
} = require("../middlewares/settingsValidation.middleware");

// Settings-specific error handler (router-level)
const settingsErrorHandler = (err, req, res, next) => {
  if (!err) return next();
  const status = err.status || 500;
  const payload = {
    success: false,
    msg: err.message || "Settings endpoint error",
  };
  if (err.errors) payload.errors = err.errors;
  res.status(status).json(payload);
};

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *                 minLength: 2
 *                 maxLength: 100
 *               phone:
 *                 type: string
 *                 example: "+91 9876543210"
 *                 description: Phone number (10-15 digits)
 *               occupation:
 *                 type: string
 *                 example: "Software Engineer"
 *                 maxLength: 200
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation failed
 */
// @route   GET /api/settings/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", auth, getProfile);

// @route   PUT /api/settings/profile
// @desc    Update profile information
// @access  Private
router.put("/profile", auth, validateProfileUpdate, updateProfile);

/**
 * @swagger
 * /settings/financial:
 *   put:
 *     summary: Update financial preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency:
 *                 type: string
 *                 enum: [INR, USD, EUR, GBP]
 *                 example: "INR"
 *               riskProfile:
 *                 type: string
 *                 enum: [Conservative, Moderate, Aggressive]
 *                 example: "Moderate"
 *               monthlyIncome:
 *                 type: number
 *                 example: 50000
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Preferences updated
 *       400:
 *         description: Validation failed
 */
// @route   PUT /api/settings/financial
// @desc    Update financial preferences
// @access  Private
router.put(
  "/financial",
  auth,
  validateFinancialUpdate,
  updateFinancialPreferences,
);

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
router.put("/password", auth, validatePasswordChange, changePassword);

/**
 * @swagger
 * /settings/profile-picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded
 */
// @route   POST /api/settings/profile-picture
// @desc    Upload profile picture
// @access  Private
router.post("/profile-picture", auth, profileUpload.single("profilePicture"), uploadProfilePicture);

// Attach router-level error handler for settings
router.use(settingsErrorHandler);

module.exports = router;
