const jwt = require('jsonwebtoken');
// --- THIS IS THE FIX ---
// Changed '../config/jwt.js' to '../config/jwt.config.js'
const { jwtSecret } = require('../config/jwt.config.js'); 
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

module.exports = { auth, requireRole, requireAdmin };