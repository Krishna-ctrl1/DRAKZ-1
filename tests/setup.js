/**
 * Test helper: creates a minimal Express app with all routes mounted.
 * Uses the real server.js route structure but avoids starting the HTTP server.
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("../src/config/db.config.js");

// Routes
const authRoutes = require("../src/routes/auth.route.js");
const blogRoutes = require("../src/routes/blog.route.js");
const privilegeRoutes = require("../src/routes/privilege.route.js");
const spendingsRoutes = require("../src/routes/spending.routes");
const advisorRoutes = require("../src/routes/advisor.route.js");
const userRoutes = require("../src/routes/user.routes");
const userAdvisorRoutes = require("../src/routes/user.advisor.route.js");
const investmentsRoutes = require("../src/routes/investments.routes.js");
const accountSummaryRoutes = require("../src/routes/accountSummary.routes.js");
const settingsRoutes = require("../src/routes/settings.routes.js");
const contactRoutes = require("../src/routes/contactRoutes.js");
const logsRoutes = require("../src/routes/logs.routes.js");
const kycRoutes = require("../src/routes/kyc.routes.js");
const creditScoreRoutes = require("../src/routes/creditScore.routes");
const cardRoutes = require("../src/routes/card.routes");

let dbConnected = false;

async function createApp() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }

  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // API Routes (mirrors server.js)
  app.use("/api/auth", authRoutes);
  app.use("/api", userRoutes);
  app.use("/api/user", userAdvisorRoutes);
  app.use("/api/privilege", privilegeRoutes);
  app.use("/api/blogs", blogRoutes);
  app.use("/api/credit-score", creditScoreRoutes);
  app.use("/api/spendings", spendingsRoutes);
  app.use("/api/cards", cardRoutes);
  app.use("/api/advisor", advisorRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/investments", investmentsRoutes);
  app.use("/api/account-summary", accountSummaryRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/logs", logsRoutes);
  app.use("/api/kyc", kycRoutes);

  return app;
}

module.exports = { createApp };
