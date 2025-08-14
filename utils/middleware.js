const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'], 
    credentials: true
};

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
    }
});

// JWT Authentication middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        // Note: You'll need to import User model in each server file that uses this
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// Admin middleware (use after authenticateToken)
const requireAdmin = async (req, res, next) => {
    try {
        // Note: You'll need to import User model and check user role in each server file
        req.isAdmin = true; // This should be properly implemented in each server
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Admin access required' });
    }
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
};

// 404 handler
const notFoundHandler = (req, res) => {
    res.status(404).json({ 
        message: `API endpoint ${req.method} ${req.path} not found` 
    });
};

module.exports = {
    corsOptions,
    limiter,
    authenticateToken,
    requireAdmin,
    errorHandler,
    notFoundHandler
};
