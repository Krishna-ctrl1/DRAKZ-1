const express = require("express");
const router = express.Router();
const creditController = require("../controllers/creditScoreController");
const { auth, requireRole } = require("../middlewares/auth.middleware.js"); // adjust path if your auth is elsewhere
const { redisCache } = require("../middlewares/redisCache.middleware");

/**
 * @swagger
 * tags:
 *   name: CreditScore
 *   description: Credit score management
 */

/**
 * @swagger
 * /credit-score/me:
 *   get:
 *     summary: Get my credit score
 *     tags: [CreditScore]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Credit score
 */
// GET my credit score
router.get("/me", auth, redisCache(300), creditController.getMyCreditScore);

/**
 * @swagger
 * /credit-score:
 *   post:
 *     summary: Set credit score (Admin only)
 *     tags: [CreditScore]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: number
 *                 description: Credit score (typically 300-900)
 *               note:
 *                 type: string
 *                 description: Optional note about the score
 *               userId:
 *                 type: string
 *                 description: Target user ID (admin only, if setting for another user)
 *     responses:
 *       200:
 *         description: Credit score set
 *       403:
 *         description: Forbidden - Admin only
 */
// POST set credit score (Admin only)
router.post("/", auth, requireRole(["admin"]), creditController.setCreditScore);

/**
 * @swagger
 * /credit-score/{userId}:
 *   get:
 *     summary: Get credit score by user ID (Admin)
 *     tags: [CreditScore]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User credit score
 */
// Admin only: get by user id
router.get(
  "/:userId",
  auth,
  requireRole(["admin"]),
  creditController.getCreditScoreByUserId,
);

module.exports = router;
