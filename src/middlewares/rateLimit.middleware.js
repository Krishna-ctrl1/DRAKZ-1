const rateLimit = require("express-rate-limit");

// Rate limiter for dashboard stats to prevent abuse
// Allows up to 30 requests per minute per IP
const dashboardStatsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    msg: "Too many requests to dashboard stats. Please try again later.",
  },
});

module.exports = {
  dashboardStatsLimiter,
};
