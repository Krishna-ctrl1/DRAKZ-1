// Application-level middleware to control caching of sensitive endpoints
// For dashboard stats, prevent intermediaries and browsers from caching
module.exports = (req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
};
