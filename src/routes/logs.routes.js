const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller.js');
const { auth, requireAdmin } = require('../middlewares/auth.middleware.js');

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: System logs access (Admin only)
 */

/**
 * @swagger
 * /logs/access:
 *   get:
 *     summary: Get recent access logs
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of access logs
 */
router.get('/access', auth, requireAdmin, logsController.getAccessLogs);

/**
 * @swagger
 * /logs/error:
 *   get:
 *     summary: Get recent error logs
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of error logs
 */
router.get('/error', auth, requireAdmin, logsController.getErrorLogs);

module.exports = router;
