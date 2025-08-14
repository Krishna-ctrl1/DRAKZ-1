// ============================================================================
// SERVER 3 - Orders Management
// Team Member: Deepthi M
// Routes: /api/v3/orders/*
// ============================================================================

const express = require('express');
const { Order, Item, User } = require('../utils/models');
const { authenticateToken } = require('../utils/middleware');

const router = express.Router();

// ============================================================================
// ORDERS ROUTES
// ============================================================================

// Get All Orders (user gets their own, admin gets all)
router.get('/orders', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const user = await User.findById(req.userId);
        
        let query = {};
        if (user.role !== 'admin') {
            query.user = req.userId;
        }

        const orders = await Order.find(query)
            .populate('user', 'username email firstName lastName')
            .populate('items.item', 'title price')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(query);

        res.json({
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Create Order
router.post('/orders', authenticateToken, async (req, res) => {
    try {
        const { items, shippingAddress } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Items are required' });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const orderItem of items) {
            const item = await Item.findById(orderItem.itemId);
            if (!item) {
                return res.status(404).json({ message: `Item ${orderItem.itemId} not found` });
            }

            const itemTotal = item.price * orderItem.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                item: item._id,
                quantity: orderItem.quantity,
                price: item.price
            });
        }

        const order = new Order({
            user: req.userId,
            items: orderItems,
            totalAmount,
            shippingAddress
        });

        await order.save();
        await order.populate('user', 'username email firstName lastName');
        await order.populate('items.item', 'title price');

        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error creating order' });
    }
});

// Update Order Status (admin only)
router.put('/orders/:id/status', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'username email').populate('items.item', 'title');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status' });
    }
});

// Health check for this server
router.get('/health', (req, res) => {
    res.json({ 
        server: 'Server 3 - Orders Management',
        status: 'OK',
        timestamp: new Date().toISOString() 
    });
});

module.exports = router;
