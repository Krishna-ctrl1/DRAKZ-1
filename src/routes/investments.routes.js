// src/routes/investments.routes.js
const express = require("express");
const router = express.Router();

const {
  getStockApiKey,
  getRealTimeStock,
  getUserStocks,
  getUserLoans,
  getInvestmentHistory,
} = require("../controllers/investments.controller");

// API KEY for Stock APIs
router.get("/getStockApiKey", getStockApiKey);

// Real-time Single Stock Price (Finnhub)
router.get("/stocks/realtime", getRealTimeStock);

// Stocks (Your Stocks table, now real-time)
router.get("/user-investments", getUserStocks);

// Loans (Your Loans section)
router.get("/user-loans", getUserLoans);

// Investment Chart (Total Investment graph)
router.get("/investment-history", getInvestmentHistory);

module.exports = router;
