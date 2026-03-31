// src/routes/card.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/cardController");
const { auth } = require("../middlewares/auth.middleware.js");

/**
 * @swagger
 * tags:
 *   name: Cards
 *   description: Card management
 */

/**
 * @swagger
 * /cards:
 *   get:
 *     summary: List cards
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cards
 *   post:
 *     summary: Create card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - holderName
 *               - type
 *               - cardNumber
 *               - expiryMonth
 *               - expiryYear
 *             properties:
 *               holderName:
 *                 type: string
 *                 description: Name on the card
 *               type:
 *                 type: string
 *                 enum: [credit, debit]
 *                 description: Card type
 *               brand:
 *                 type: string
 *                 description: Card brand (e.g., Visa, Mastercard)
 *               cardNumber:
 *                 type: string
 *                 description: Card number (12+ digits)
 *               expiryMonth:
 *                 type: integer
 *                 description: Expiry month (1-12)
 *               expiryYear:
 *                 type: integer
 *                 description: Expiry year (4 digits, e.g., 2025)
 *               colorTheme:
 *                 type: string
 *                 description: Card color theme
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       201:
 *         description: Card created successfully
 *       400:
 *         description: Missing required fields or invalid data
 *       401:
 *         description: Unauthorized
 */
router.get("/", auth, controller.listCards);
router.post("/", auth, controller.createCard);

/**
 * @swagger
 * /cards/{cardId}:
 *   delete:
 *     summary: Delete card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Card deleted
 */
router.delete("/:cardId", auth, controller.deleteCard);

/**
 * @swagger
 * /cards/{cardId}/reveal:
 *   post:
 *     summary: Reveal card number
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: User password for security verification
 *     responses:
 *       200:
 *         description: Card number revealed
 *       400:
 *         description: Password required
 *       401:
 *         description: Unauthorized or invalid password
 */
router.post("/:cardId/reveal", auth, controller.revealCardNumber);

module.exports = router;
