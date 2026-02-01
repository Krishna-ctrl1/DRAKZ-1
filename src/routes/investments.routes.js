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

// API KEY for Stock APIs (protected)
router.get("/getStockApiKey", auth, getStockApiKey);

// Real-time Single Stock Price (Finnhub) (protected)
router.get("/stocks/realtime", auth, getRealTimeStock);

// Stocks (Your Stocks table, now real-time) (protected)
router.get("/user-investments", auth, getUserStocks);

// Loans (Your Loans section) (protected)
router.get("/user-loans", auth, getUserLoans);

// Investment Chart (Total Investment graph) (protected)
router.get("/investment-history", auth, getInvestmentHistory);

module.exports = router;
