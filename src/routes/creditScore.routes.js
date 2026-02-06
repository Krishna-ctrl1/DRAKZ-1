const express = require("express");
const router = express.Router();
const creditController = require("../controllers/creditScoreController");
const { auth, requireRole } = require("../middlewares/auth.middleware.js"); // adjust path if your auth is elsewhere

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
router.get("/me", auth, creditController.getMyCreditScore);

/**
 * @swagger
 * /credit-score:
 *   post:
 *     summary: Set credit score
 *     tags: [CreditScore]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Credit score set
 */
// POST set credit score (user can set their own; admins can set for any user)
router.post("/", auth, creditController.setCreditScore);

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
