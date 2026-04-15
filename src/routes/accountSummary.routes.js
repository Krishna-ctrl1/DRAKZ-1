const express = require("express");
const router = express.Router();
const accountSummaryController = require("../controllers/accountSummary.controller");
const { auth } = require("../middlewares/auth.middleware");
const { redisCache } = require("../middlewares/redisCache.middleware");

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
router.get("/", auth, redisCache(180), accountSummaryController.getAccountSummary);

module.exports = router;
