// Application-level middleware scoped to /api/settings
// Adds request context metadata to aid logging/diagnostics
module.exports = (req, res, next) => {
  req.context = req.context || {};
  req.context.page = "settings";
  next();
};
