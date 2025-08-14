// ============================================================================
// SERVER 1 - Authentication & User Management
// Team Member: Krishna Gupta
// Routes: /api/v1/auth/* and /api/v1/users/*
// ============================================================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../utils/models');
const { authenticateToken, requireAdmin } = require('../utils/middleware');

const router = express.Router();

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Register User
router.post('/auth/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        // Validation
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
            });
        }

        // Create user
        const user = new User({ username, email, password, firstName, lastName });
        await user.save();

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login User
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get Current User Profile
router.get('/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// Update Profile
router.put('/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, username } = req.body;
        const updates = {};

        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (username) updates.username = username;

        const user = await User.findByIdAndUpdate(
            req.userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username already taken' });
        }
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Change Password
router.put('/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }

        const user = await User.findById(req.userId);
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error changing password' });
    }
});

// ============================================================================
// USER MANAGEMENT ROUTES
// ============================================================================

// Get All Users (Admin Only)
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { page = 1, limit = 10 } = req.query;
        
        const users = await User.find({})
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments();

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Toggle User Status (Admin Only)
router.put('/users/:id/toggle-status', authenticateToken, async (req, res) => {
    try {
        const adminUser = await User.findById(req.userId);
        if (adminUser.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({ 
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            user: { id: user._id, username: user.username, isActive: user.isActive }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user status' });
    }
});

// ============================================================================
// ADD YOUR CUSTOM ROUTES BELOW THIS LINE
// ============================================================================

// Example: Get user statistics
router.get('/users/stats', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });
        const admins = await User.countDocuments({ role: 'admin' });
        
        res.json({
            totalUsers,
            activeUsers,
            inactiveUsers,
            admins,
            regularUsers: totalUsers - admins
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user statistics' });
    }
});

// Health check for this server
router.get('/health', (req, res) => {
    res.json({ 
        server: 'Server 1 - Authentication & User Management',
        status: 'OK',
        timestamp: new Date().toISOString() 
    });
});

module.exports = router;
