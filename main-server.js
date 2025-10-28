// main-server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import utilities
const { connectDB } = require('./utils/database');
const { corsOptions, limiter, errorHandler, notFoundHandler } = require('./utils/middleware');

// Import individual server modules
const server1 = require('./servers/server1'); // Authentication & User Management
const server2 = require('./servers/server2'); // Products/Items Management
const server3 = require('./servers/server3'); // Orders Management
const server4 = require('./servers/server4'); // Reviews and Ratings
const server5 = require('./servers/server5'); // Analytics and Reports
const server6 = require('./servers/server6'); // <-- ADD THIS (Privileges)

const app = express();

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================================================
// ROUTE MOUNTING
// ============================================================================
app.use('/api/v1', server1);
app.use('/api/v2', server2);
app.use('/api/v3', server3);
app.use('/api/v4', server4);
app.use('/api/v5', server5);
app.use('/api/privilege', server6); // <-- ADD THIS

// ============================================================================
// GLOBAL ROUTES
// ============================================================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Main server is running',
        timestamp: new Date().toISOString(),
        servers: {
            server1: 'Authentication & User Management',
            server2: 'Products/Items Management', 
            server3: 'Orders Management',
            server4: 'Reviews and Ratings',
            server5: 'Analytics and Reports',
            server6: 'Privileges & Holdings' // <-- ADD THIS
        },
        endpoints: {
            v1: '/api/v1 - Authentication & Users',
            v2: '/api/v2 - Products & Categories',
            v3: '/api/v3 - Orders',
            v4: '/api/v4 - Reviews',
            v5: '/api/v5 - Analytics & Reports',
            privilege: '/api/privilege - Privileges' // <-- ADD THIS
        }
    });
});
// ... (rest of the file: /api/docs, /api/test-all, error handling, server startup)
// ... (The rest of your main-server.js file is correct)
// ============================================================================
// GLOBAL ROUTES (Available to all)
// ============================================================================

// Main health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Main server is running',
        timestamp: new Date().toISOString(),
        servers: {
            server1: 'Authentication & User Management',
            server2: 'Products/Items Management', 
            server3: 'Orders Management',
            server4: 'Reviews and Ratings',
            server5: 'Analytics and Reports',
            server6: 'Privileges & Holdings' // <-- ADDED
        },
        endpoints: {
            v1: '/api/v1 - Authentication & Users',
            v2: '/api/v2 - Products & Categories',
            v3: '/api/v3 - Orders',
            v4: '/api/v4 - Reviews',
            v5: '/api/v5 - Analytics & Reports',
            privilege: '/api/privilege - Privileges' // <-- ADDED
        }
    });
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        title: 'Drakz Team API Documentation',
        version: '1.0.0',
        description: 'Modular API with 5 separate server modules',
        servers: [
            {
                name: 'Server 1 - Authentication & User Management',
                baseUrl: '/api/v1',
                endpoints: [
                    'POST /api/v1/auth/register - Register user',
                    'POST /api/v1/auth/login - Login user',
                    'GET /api/v1/auth/profile - Get user profile',
                    'PUT /api/v1/auth/profile - Update profile',
                    'PUT /api/v1/auth/change-password - Change password',
                    'GET /api/v1/users - Get all users (admin)',
                    'PUT /api/v1/users/:id/toggle-status - Toggle user status (admin)',
                    'GET /api/v1/users/stats - Get user statistics (admin)'
                ]
            },
            {
                name: 'Server 2 - Products/Items Management',
                baseUrl: '/api/v2',
                endpoints: [
                    'GET /api/v2/items - Get all items',
                    'GET /api/v2/items/:id - Get single item',
                    'POST /api/v2/items - Create item (auth required)',
                    'PUT /api/v2/items/:id - Update item (owner/admin)',
                    'DELETE /api/v2/items/:id - Delete item (owner/admin)',
                    'GET /api/v2/items/user/my-items - Get user\'s items',
                    'GET /api/v2/categories - Get categories',
                    'POST /api/v2/categories - Create category (admin)',
                    'POST /api/v2/items/advanced-search - Advanced search'
                ]
            },
            {
                name: 'Server 3 - Orders Management',
                baseUrl: '/api/v3',
                endpoints: [
                    'GET /api/v3/orders - Get orders',
                    'POST /api/v3/orders - Create order',
                    'PUT /api/v3/orders/:id/status - Update order status (admin)'
                ]
            },
            {
                name: 'Server 4 - Reviews and Ratings',
                baseUrl: '/api/v4',
                endpoints: [
                    'GET /api/v4/reviews/item/:itemId - Get item reviews',
                    'POST /api/v4/reviews - Create review',
                    'PUT /api/v4/reviews/:id - Update review',
                    'DELETE /api/v4/reviews/:id - Delete review',
                    'GET /api/v4/reviews/user/my-reviews - Get user reviews',
                    'GET /api/v4/reviews/item/:itemId/summary - Get rating summary'
                ]
            },
            {
                name: 'Server 5 - Analytics and Reports',
                baseUrl: '/api/v5',
                endpoints: [
                    'GET /api/v5/analytics/dashboard - Dashboard overview (admin)',
                    'GET /api/v5/analytics/sales - Sales analytics (admin)',
                    'GET /api/v5/analytics/users - User analytics (admin)',
                    'GET /api/v5/analytics/products - Product analytics (admin)',
                    'GET /api/v5/reports/users - Generate user report (admin)',
                    'GET /api/v5/reports/sales - Generate sales report (admin)',
                    'GET /api/v5/reports/system-health - System health report (admin)'
                ]
            },
            { // <-- ADD THIS
                name: 'Server 6 - Privileges & Holdings',
                baseUrl: '/api/privilege',
                endpoints: [
                    'GET /api/privilege/seed - Adds sample data to the database',
                    'GET /api/privilege/insurances - Get all insurances',
                    'GET /api/privilege/properties - Get all properties',
                    'POST /api/privilege/properties - Add a new property',
                    'DELETE /api/privilege/properties/:id - Remove a property',
                    'GET /api/privilege/precious_holdings - Get all holdings',
                    'POST /api/privilege/precious_holdings - Add a new holding',
                    'GET /api/privilege/transactions - Get recent transactions'
                ]
            }
        ]
    });
});

// Test all servers health
app.get('/api/test-all', async (req, res) => {
    try {
        const healthChecks = {
            server1: { status: 'OK', message: 'Authentication & User Management' },
            server2: { status: 'OK', message: 'Products/Items Management' },
            server3: { status: 'OK', message: 'Orders Management' },
            server4: { status: 'OK', message: 'Reviews and Ratings' },
            server5: { status: 'OK', message: 'Analytics and Reports' },
            server6: { status: 'OK', message: 'Privileges & Holdings' } // <-- ADDED
        };

        res.json({
            message: 'All servers are integrated and running',
            timestamp: new Date().toISOString(),
            healthChecks
        });
    } catch (error) {
        res.status(500).json({ message: 'Error testing servers', error: error.message });
    }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Global error handler
app.use(errorHandler);

// 404 handler (must be last)
app.use('*', notFoundHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        
        // Start the server
        app.listen(PORT, () => {
            console.log('🚀 ============================================');
            console.log(`🌟 DRAKZ TEAM SERVER STARTED SUCCESSFULLY!`);
            console.log('🚀 ============================================');
            console.log(`📡 Server running on port: ${PORT}`);
            console.log(`🔗 Main API: http://localhost:${PORT}/api`);
            console.log(`📋 Documentation: http://localhost:${PORT}/api/docs`);
            console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
            console.log('');
            console.log('📦 AVAILABLE SERVERS:');
            console.log(`   🔐 Server 1 (Auth): http://localhost:${PORT}/api/v1`);
            console.log(`   🛍️  Server 2 (Products): http://localhost:${PORT}/api/v2`);
            console.log(`   📦 Server 3 (Orders): http://localhost:${PORT}/api/v3`);
            console.log(`   ⭐ Server 4 (Reviews): http://localhost:${PORT}/api/v4`);
            console.log(`   📊 Server 5 (Analytics): http://localhost:${PORT}/api/v5`);
            console.log(`   💎 Server 6 (Privilege): http://localhost:${PORT}/api/privilege`); // <-- ADDED
            console.log('🚀 ============================================');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// ... (rest of the file: uncaughtException, unhandledRejection, SIGTERM, startServer)
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;