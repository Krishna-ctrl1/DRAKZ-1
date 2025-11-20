const express = require("express");
const router = express.Router();
const accountSummaryController = require("../controllers/accountSummary.controller");
const { auth } = require("../middlewares/auth.middleware");

router.get("/", auth, accountSummaryController.getAccountSummary);

module.exports = router;
