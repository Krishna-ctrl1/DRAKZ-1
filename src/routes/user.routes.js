const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { auth, requireAdmin } = require("../middlewares/auth.middleware.js");
const {
  dashboardStatsLimiter,
} = require("../middlewares/rateLimit.middleware");
const cacheControl = require("../middlewares/cacheControl.middleware");
const validateUserInput = require("../middlewares/validateUserInput.middleware.js");
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (Admin only)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
// Read - Admin only
router.get("/users", auth, requireAdmin, userController.getAllUsers);

/**
 * @swagger
 * /dashboard-stats:
 *   get:
 *     summary: Get dashboard stats
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get(
  "/dashboard-stats",
  auth,
  requireAdmin,
  userController.getDashboardStats,
);

/**
 * @swagger
 * /server-metrics:
 *   get:
 *     summary: Get server metrics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Server metrics
 */
// Apply rate limiter specifically to dashboard stats
router.get(
  "/dashboard-stats",
  dashboardStatsLimiter,
  cacheControl,
  auth,
  requireAdmin,
  userController.getDashboardStats,
);
router.get(
  "/server-metrics",
  auth,
  requireAdmin,
  userController.getServerMetrics,
);

// Create - Admin only
router.post(
  "/users",
  auth,
  requireAdmin,
  validateUserInput,
  userController.createUser,
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
// Update - Admin only (we use PUT and include the ID in the URL)
router.put(
  "/users/:id",
  auth,
  requireAdmin,
  validateUserInput,
  userController.updateUser,
);

// Delete - Admin only (we use DELETE and include the ID in the URL)
router.delete("/users/:id", auth, requireAdmin, userController.deleteUser);

module.exports = router;
