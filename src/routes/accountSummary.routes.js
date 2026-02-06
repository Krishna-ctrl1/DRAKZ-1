const express = require("express");
const router = express.Router();
const accountSummaryController = require("../controllers/accountSummary.controller");
const { auth } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: AccountSummary
 *   description: Account summary
 */

/**
 * @swagger
 * /account-summary:
 *   get:
 *     summary: Get account summary
 *     tags: [AccountSummary]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account summary data
 */
router.get("/", auth, accountSummaryController.getAccountSummary);

module.exports = router;
