const jwt = require('jsonwebtoken');
// --- THIS IS THE FIX ---
// Changed '../config/jwt.js' to '../config/jwt.config.js'
const { jwtSecret } = require('../config/jwt.config.js'); 
// const AdminLog is required inside logAdminAction to avoid circular dep if needed, or top level:
// const AdminLog = require('../models/adminLog.model'); 
// --- END FIX ---

const auth = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');
  const xAuthToken = req.header('x-auth-token');
  const token = xAuthToken || authHeader?.replace('Bearer ', '');

  console.log(`[AUTH] Request to ${req.path}`);
  console.log(`[AUTH] Authorization header:`, authHeader ? 'Present' : 'Missing');
  console.log(`[AUTH] x-auth-token header:`, xAuthToken ? 'Present' : 'Missing');
  console.log(`[AUTH] Extracted token:`, token ? 'Present' : 'Missing');

  // Check if not token
  if (!token) {
    console.log(`[AUTH] ❌ No token found`);
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    console.log(`[AUTH] ✅ Token valid for user:`, decoded.id, decoded.role);
    next();
  } catch (err) {
    console.log(`[AUTH] ❌ Token verification failed:`, err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'Access denied' });
        }
        next();
    }
}

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Admin access required' });
    }
    next();
};

const requirePermission = (permission) => {
    return (req, res, next) => {
        // 1. Must be at least an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Admin access required' });
        }
        
        // 2. If legacy admin (no permissions array), allow (Backward Compatibility)
        if (!req.user.permissions || req.user.permissions.length === 0) {
            return next();
        }

        // 3. Granular Check
        if (req.user.permissions.includes('all') || req.user.permissions.includes(permission)) {
            return next();
        }

        return res.status(403).json({ msg: `Missing permission: ${permission}` });
    }
}

const { logAdminAction } = require('../utils/logger');

module.exports = { auth, requireRole, requireAdmin, requirePermission, logAdminAction };