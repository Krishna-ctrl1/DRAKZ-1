// src/routes/investments.routes.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth.middleware");

const {
  getStockApiKey,
  getRealTimeStock,
  getUserStocks,
  getUserLoans,
  getInvestmentHistory,
} = require("../controllers/investments.controller");

/**
 * @swagger
 * tags:
 *   name: Investments
 *   description: Investment management
 */

/**
 * @swagger
 * /getStockApiKey:
 *   get:
 *     summary: Get Stock API Key
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API Key retrieved
 */
// API KEY for Stock APIs (protected)
router.get("/getStockApiKey", auth, getStockApiKey);

/**
 * @swagger
 * /stocks/realtime:
 *   get:
 *     summary: Get real-time stock price
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock price
 */
// Real-time Single Stock Price (Finnhub) (protected)
router.get("/stocks/realtime", auth, getRealTimeStock);

/**
 * @swagger
 * /user-investments:
 *   get:
 *     summary: Get user stocks
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User stocks
 */
// Stocks (Your Stocks table, now real-time) (protected)
router.get("/user-investments", auth, getUserStocks);

/**
 * @swagger
 * /user-loans:
 *   get:
 *     summary: Get user loans
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User loans
 */
// Loans (Your Loans section) (protected)
router.get("/user-loans", auth, getUserLoans);

/**
 * @swagger
 * /investment-history:
 *   get:
 *     summary: Get investment history
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: History
 */
// Investment Chart (Total Investment graph) (protected)
router.get("/investment-history", auth, getInvestmentHistory);

module.exports = router;
