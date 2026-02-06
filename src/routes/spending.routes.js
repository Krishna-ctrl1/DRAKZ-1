// src/routes/spending.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/spendingController");
const { auth } = require("../middlewares/auth.middleware.js"); // adjust if path differs

/**
 * @swagger
 * tags:
 *   name: Spendings
 *   description: Spending management
 */

/**
 * @swagger
 * /spendings:
 *   post:
 *     summary: Create spending record
 *     tags: [Spendings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Spending created
 */
// create a spending record
router.post("/", auth, controller.createSpending);

/**
 * @swagger
 * /spendings/weekly:
 *   get:
 *     summary: Get weekly summary
 *     tags: [Spendings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly summary
 */
// weekly summary
router.get("/weekly", auth, controller.getWeeklySummary);

/**
 * @swagger
 * /spendings/list:
 *   get:
 *     summary: Get recent spendings
 *     tags: [Spendings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of spendings
 */
// recent list
router.get("/list", auth, controller.getRecentSpendings);

/**
 * @swagger
 * /spendings/distribution-pie:
 *   get:
 *     summary: Get expense distribution
 *     tags: [Spendings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expense distribution data
 */
// expense distribution pie chart data (past 30 days default)
router.get("/distribution-pie", auth, controller.getExpenseDistributionPie);

/**
 * @swagger
 * /spendings/range:
 *   delete:
 *     summary: Delete spendings in range
 *     tags: [Spendings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Spendings deleted
 */
// delete spendings in date range for the authenticated user
router.delete("/range", auth, controller.deleteSpendingsInRange);

module.exports = router;
