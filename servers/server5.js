// ============================================================================
// SERVER 5 - Analytics and Reports
// Team Member: Abhinay
// Routes: /api/v5/analytics/* and /api/v5/reports/*
// ============================================================================

const express = require('express');
const { User, Item, Order, Review } = require('../utils/models');
const { authenticateToken } = require('../utils/middleware');

const router = express.Router();

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================

// Dashboard Overview (Admin only)
router.get('/analytics/dashboard', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalItems = await Item.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalReviews = await Review.countDocuments();

        // Recent activity
        const recentUsers = await User.find({}).select('username createdAt').sort({ createdAt: -1 }).limit(5);
        const recentOrders = await Order.find({}).populate('user', 'username').sort({ createdAt: -1 }).limit(5);

        res.json({
            overview: {
                totalUsers,
                activeUsers,
                totalItems,
                totalOrders,
                totalReviews
            },
            recentActivity: {
                recentUsers,
                recentOrders
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard analytics' });
    }
});

// Sales Analytics (Admin only)
router.get('/analytics/sales', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { period = 'month' } = req.query;
        
        let dateFilter = {};
        const now = new Date();

        switch (period) {
            case 'week':
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
                break;
            case 'month':
                dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } };
                break;
            case 'year':
                dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } };
                break;
        }

        // Total revenue
        const revenueData = await Order.aggregate([
            { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } }
        ]);

        // Sales by status
        const statusData = await Order.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            period,
            totalRevenue: revenueData[0]?.totalRevenue || 0,
            totalOrders: revenueData[0]?.orderCount || 0,
            statusBreakdown: statusData
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales analytics' });
    }
});

// User Analytics (Admin only)
router.get('/analytics/users', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        // User registration trends
        const userTrends = await User.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        // Active vs inactive users
        const userStatus = await User.aggregate([
            { $group: { _id: '$isActive', count: { $sum: 1 } } }
        ]);

        // Role distribution
        const roleDistribution = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        res.json({
            registrationTrends: userTrends,
            statusDistribution: userStatus,
            roleDistribution
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user analytics' });
    }
});

// Product Analytics (Admin only)
router.get('/analytics/products', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        // Category distribution
        const categoryStats = await Item.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Price analysis
        const priceStats = await Item.aggregate([
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    totalProducts: { $sum: 1 }
                }
            }
        ]);

        // Stock status
        const stockStats = await Item.aggregate([
            { $group: { _id: '$inStock', count: { $sum: 1 } } }
        ]);

        res.json({
            categoryDistribution: categoryStats,
            priceAnalysis: priceStats[0] || {},
            stockAnalysis: stockStats
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product analytics' });
    }
});

// ============================================================================
// REPORTS ROUTES
// ============================================================================

// Generate User Report (Admin only)
router.get('/reports/users', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { format = 'json', startDate, endDate } = req.query;
        
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        const users = await User.find(dateFilter)
            .select('-password')
            .sort({ createdAt: -1 });

        const report = {
            generatedAt: new Date().toISOString(),
            totalUsers: users.length,
            filters: { startDate, endDate },
            users
        };

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error generating user report' });
    }
});

// Generate Sales Report (Admin only)
router.get('/reports/sales', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { startDate, endDate } = req.query;
        
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        const orders = await Order.find(dateFilter)
            .populate('user', 'username email')
            .populate('items.item', 'title category')
            .sort({ createdAt: -1 });

        const totalRevenue = orders.reduce((sum, order) => {
            return order.status !== 'cancelled' ? sum + order.totalAmount : sum;
        }, 0);

        const report = {
            generatedAt: new Date().toISOString(),
            period: { startDate, endDate },
            summary: {
                totalOrders: orders.length,
                totalRevenue,
                averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
            },
            orders
        };

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error generating sales report' });
    }
});

// System Health Report
router.get('/reports/system-health', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const health = {
            timestamp: new Date().toISOString(),
            database: {
                status: 'connected',
                collections: {
                    users: await User.countDocuments(),
                    items: await Item.countDocuments(),
                    orders: await Order.countDocuments(),
                    reviews: await Review.countDocuments()
                }
            },
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.version
            }
        };

        res.json(health);
    } catch (error) {
        res.status(500).json({ message: 'Error generating system health report' });
    }
});

// Health check for this server
router.get('/health', (req, res) => {
    res.json({ 
        server: 'Server 5 - Analytics and Reports',
        status: 'OK',
        timestamp: new Date().toISOString() 
    });
});

module.exports = router;
