module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-prod',
  jwtExpiry: '7d', // Extended for development convenience
};