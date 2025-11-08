// src/config/jwt.js
module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-prod',
  jwtExpiry: '8h',
};