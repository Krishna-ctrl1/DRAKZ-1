// ============================================================================
// SERVER 2 - Products/Items Management
// Team Member: Zulqarnain Ahmed
// Routes: /api/v2/items/* and /api/v2/categories/*
// ============================================================================

const express = require('express');
const { Item, Category, User } = require('../utils/models');
const { authenticateToken } = require('../utils/middleware');

const router = express.Router();

// ============================================================================
// ITEMS/PRODUCTS ROUTES
// ============================================================================

// Get All Items
router.get('/items', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const query = {};

        if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const items = await Item.find(query)
            .populate('createdBy', 'username firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sort);

        const total = await Item.countDocuments(query);

        res.json({
            items,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items' });
    }
});

// Get Single Item
router.get('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('createdBy', 'username firstName lastName');
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching item' });
    }
});

// Create Item (requires authentication)
router.post('/items', authenticateToken, async (req, res) => {
    try {
        const { title, description, price, category, imageUrl } = req.body;

        if (!title || !description || !price || !category) {
            return res.status(400).json({ message: 'Title, description, price, and category are required' });
        }

        const item = new Item({
            title,
            description,
            price,
            category,
            imageUrl,
            createdBy: req.userId
        });

        await item.save();
        await item.populate('createdBy', 'username firstName lastName');

        res.status(201).json({ message: 'Item created successfully', item });
    } catch (error) {
        res.status(500).json({ message: 'Error creating item' });
    }
});

// Update Item (only creator or admin)
router.put('/items/:id', authenticateToken, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const user = await User.findById(req.userId);

        // Check if user is owner or admin
        if (item.createdBy.toString() !== req.userId.toString() && user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this item' });
        }

        const updates = req.body;
        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('createdBy', 'username firstName lastName');

        res.json({ message: 'Item updated successfully', item: updatedItem });
    } catch (error) {
        res.status(500).json({ message: 'Error updating item' });
    }
});

// Delete Item (only creator or admin)
router.delete('/items/:id', authenticateToken, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const user = await User.findById(req.userId);

        // Check if user is owner or admin
        if (item.createdBy.toString() !== req.userId.toString() && user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this item' });
        }

        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item' });
    }
});

// Get User's Items
router.get('/items/user/my-items', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const items = await Item.find({ createdBy: req.userId })
            .populate('createdBy', 'username firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Item.countDocuments({ createdBy: req.userId });

        res.json({
            items,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your items' });
    }
});

// ============================================================================
// CATEGORIES ROUTES
// ============================================================================

// Get All Categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

// Create Category (admin only)
router.post('/categories', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const category = new Category({ name, description });
        await category.save();

        res.status(201).json({ message: 'Category created successfully', category });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category name already exists' });
        }
        res.status(500).json({ message: 'Error creating category' });
    }
});

// Update Category (admin only)
router.put('/categories/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category updated successfully', category });
    } catch (error) {
        res.status(500).json({ message: 'Error updating category' });
    }
});

// Toggle Category Status (admin only)
router.put('/categories/:id/toggle-status', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.isActive = !category.isActive;
        await category.save();

        res.json({ 
            message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
            category 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating category status' });
    }
});

// ============================================================================
// ADD YOUR CUSTOM ROUTES BELOW THIS LINE
// ============================================================================

// Get Items Statistics
router.get('/items/stats', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const totalItems = await Item.countDocuments();
        const inStockItems = await Item.countDocuments({ inStock: true });
        const outOfStockItems = await Item.countDocuments({ inStock: false });
        
        // Category distribution
        const categoryStats = await Item.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Price statistics
        const priceStats = await Item.aggregate([
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ]);

        res.json({
            totalItems,
            inStockItems,
            outOfStockItems,
            categoryStats,
            priceStats: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching item statistics' });
    }
});

// Search Items with Advanced Filters
router.post('/items/advanced-search', async (req, res) => {
    try {
        const { 
            search, 
            categories, 
            minPrice, 
            maxPrice, 
            inStock, 
            page = 1, 
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.body;

        const query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (categories && categories.length > 0) {
            query.category = { $in: categories };
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            query.price = {};
            if (minPrice !== undefined) query.price.$gte = minPrice;
            if (maxPrice !== undefined) query.price.$lte = maxPrice;
        }

        if (inStock !== undefined) {
            query.inStock = inStock;
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const items = await Item.find(query)
            .populate('createdBy', 'username firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sort);

        const total = await Item.countDocuments(query);

        res.json({
            items,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            filters: { search, categories, minPrice, maxPrice, inStock }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error performing advanced search' });
    }
});

// Health check for this server
router.get('/health', (req, res) => {
    res.json({ 
        server: 'Server 2 - Products/Items Management',
        status: 'OK',
        timestamp: new Date().toISOString() 
    });
});

module.exports = router;
