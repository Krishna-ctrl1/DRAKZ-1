const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware.js');
const {
    getClients,
    getAdvisors,
    getAdvisorRequests,
    respondToRequest,
    getAdvisorStats
} = require('../controllers/advisor.controller.js');

/**
 * @swagger
 * tags:
 *   name: Advisor
 *   description: Advisor endpoints
 */

/**
 * @swagger
 * /advisor/clients:
 *   get:
 *     summary: Get clients assigned to advisor
 *     tags: [Advisor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of clients with financial data
 */
router.get('/clients', auth, getClients);

/**
 * @swagger
 * /advisor/list:
 *   get:
 *     summary: Get list of all available advisors
 *     tags: [Advisor]
 *     responses:
 *       200:
 *         description: List of advisors
 */
router.get('/list', getAdvisors);

/**
 * @swagger
 * /advisor/requests:
 *   get:
 *     summary: Get pending client requests
 *     tags: [Advisor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending requests
 */
router.get('/requests', auth, getAdvisorRequests);

/**
 * @swagger
 * /advisor/requests/{requestId}/respond:
 *   post:
 *     summary: Approve or decline a client request
 *     tags: [Advisor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, decline]
 *     responses:
 *       200:
 *         description: Request processed successfully
 */
router.post('/requests/:requestId/respond', auth, respondToRequest);

/**
 * @swagger
 * /advisor/stats:
 *   get:
 *     summary: Get advisor statistics
 *     tags: [Advisor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Advisor stats
 */
router.get('/stats', auth, getAdvisorStats);

module.exports = router;