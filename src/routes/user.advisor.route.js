const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware.js');
const {
    getAvailableAdvisors,
    requestAdvisor,
    getMyAdvisorStatus,
    cancelRequest
} = require('../controllers/user.advisor.controller.js');

/**
 * @swagger
 * tags:
 *   name: User Advisor
 *   description: User advisor selection endpoints
 */

/**
 * @swagger
 * /user/advisors:
 *   get:
 *     summary: Get list of available advisors
 *     tags: [User Advisor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available advisors
 */
router.get('/advisors', auth, getAvailableAdvisors);

/**
 * @swagger
 * /user/advisor/request:
 *   post:
 *     summary: Request an advisor
 *     tags: [User Advisor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               advisorId:
 *                 type: string
 *                 required: true
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Request sent successfully
 */
router.post('/advisor/request', auth, requestAdvisor);

/**
 * @swagger
 * /user/advisor/status:
 *   get:
 *     summary: Get user's current advisor and request status
 *     tags: [User Advisor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current advisor status
 */
router.get('/advisor/status', auth, getMyAdvisorStatus);

/**
 * @swagger
 * /user/advisor/request/{requestId}:
 *   delete:
 *     summary: Cancel a pending advisor request
 *     tags: [User Advisor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request cancelled successfully
 */
router.delete('/advisor/request/:requestId', auth, cancelRequest);

module.exports = router;
