// ============================================================================
// SERVER 4 - Reviews and Ratings
// Team Member: Ragamaie
// Routes: /api/v4/reviews/*
// ============================================================================

const express = require('express');
const { Review, Item, User } = require('../utils/models');
const { authenticateToken } = require('../utils/middleware');

const router = express.Router();

// ============================================================================
// REVIEWS ROUTES
// ============================================================================

// Get Reviews for an Item
router.get('/reviews/item/:itemId', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const reviews = await Review.find({ item: req.params.itemId })
            .populate('user', 'username firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Review.countDocuments({ item: req.params.itemId });

        res.json({
            reviews,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

// Create Review
router.post('/reviews', authenticateToken, async (req, res) => {
    try {
        const { itemId, rating, comment } = req.body;

        if (!itemId || !rating || !comment) {
            return res.status(400).json({ message: 'Item ID, rating, and comment are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if item exists
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if user already reviewed this item
        const existingReview = await Review.findOne({ user: req.userId, item: itemId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this item' });
        }

        const review = new Review({
            user: req.userId,
            item: itemId,
            rating,
            comment
        });

        await review.save();
        await review.populate('user', 'username firstName lastName');

        res.status(201).json({ message: 'Review created successfully', review });
    } catch (error) {
        res.status(500).json({ message: 'Error creating review' });
    }
});

// Update Review
router.put('/reviews/:id', authenticateToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review
        if (review.user.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        const { rating, comment } = req.body;
        const updates = {};

        if (rating) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }
            updates.rating = rating;
        }

        if (comment) updates.comment = comment;

        const updatedReview = await Review.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).populate('user', 'username firstName lastName');

        res.json({ message: 'Review updated successfully', review: updatedReview });
    } catch (error) {
        res.status(500).json({ message: 'Error updating review' });
    }
});

// Delete Review
router.delete('/reviews/:id', authenticateToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const user = await User.findById(req.userId);

        // Check if user owns the review or is admin
        if (review.user.toString() !== req.userId.toString() && user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review' });
    }
});

// Get User's Reviews
router.get('/reviews/user/my-reviews', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const reviews = await Review.find({ user: req.userId })
            .populate('item', 'title price')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Review.countDocuments({ user: req.userId });

        res.json({
            reviews,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your reviews' });
    }
});

// Get Item Rating Summary
router.get('/reviews/item/:itemId/summary', async (req, res) => {
    try {
        const reviews = await Review.find({ item: req.params.itemId });
        
        if (reviews.length === 0) {
            return res.json({
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            });
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
            ratingDistribution[review.rating]++;
        });

        res.json({
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews: reviews.length,
            ratingDistribution
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rating summary' });
    }
});

// Health check for this server
router.get('/health', (req, res) => {
    res.json({ 
        server: 'Server 4 - Reviews and Ratings',
        status: 'OK',
        timestamp: new Date().toISOString() 
    });
});

module.exports = router;
