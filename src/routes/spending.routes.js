// src/routes/spending.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/spendingController");
const { auth } = require("../middlewares/auth.middleware.js"); // adjust if path differs

// create a spending record
router.post("/", auth, controller.createSpending);

// weekly summary
router.get("/weekly", auth, controller.getWeeklySummary);

// recent list
router.get("/list", auth, controller.getRecentSpendings);

module.exports = router;
