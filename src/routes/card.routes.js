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
 *     responses:
 *       200:
 *         description: Card created
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
 *     responses:
 *       200:
 *         description: Card number revealed
 */
router.post("/:cardId/reveal", auth, controller.revealCardNumber);

module.exports = router;
