const express = require("express");
const router = express.Router();
const creditController = require("../controllers/creditScoreController");
const { auth, requireRole } = require("../middlewares/auth.middleware.js"); // adjust path if your auth is elsewhere

// GET my credit score
router.get("/me", auth, creditController.getMyCreditScore);

// POST set credit score (user can set their own; admins can set for any user)
router.post("/", auth, creditController.setCreditScore);

// Admin only: get by user id
router.get(
  "/:userId",
  auth,
  requireRole(["admin"]),
  creditController.getCreditScoreByUserId,
);

module.exports = router;
