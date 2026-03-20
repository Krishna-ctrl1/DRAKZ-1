const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware.js');
const {
    getClients,
    getAdvisors,
    getAdvisorRequests,
    respondToRequest,
    getAdvisorStats,
    getAdvisorProfile,
    updateAdvisorProfile,
    getClientReport,
    removeClient,
    getAdvisorAnalytics
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

/**
 * @swagger
 * /advisor/profile:
 *   get:
 *     summary: Get advisor profile
 *     tags: [Advisor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Advisor profile retrieved successfully
 *   patch:
 *     summary: Update advisor profile
 *     tags: [Advisor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *               experience:
 *                 type: number
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Advisor profile updated
 */
router.get('/profile', auth, getAdvisorProfile);
router.patch('/profile', auth, updateAdvisorProfile);

/**
 * @swagger
 * /advisor/client/{userId}/report:
 *   get:
 *     summary: Get financial report for a specific client
 *     tags: [Advisor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client report data
 */
router.get('/client/:userId/report', auth, getClientReport);

/**
 * @swagger
 * /advisor/client/{userId}:
 *   delete:
 *     summary: Remove a client from advisor's list
 *     tags: [Advisor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client removed successfully
 */
router.delete('/client/:userId', auth, removeClient);

/**
 * @swagger
 * /advisor/analytics:
 *   get:
 *     summary: Get detailed advisor analytics
 *     tags: [Advisor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data for advisor performance
 */
router.get('/analytics', auth, getAdvisorAnalytics);

module.exports = router;