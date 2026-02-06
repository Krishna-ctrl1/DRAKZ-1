const express = require('express');
const router = express.Router();
const { getClients } = require('../controllers/advisor.controller.js');

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
 *     summary: Get clients
 *     tags: [Advisor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of clients
 */
router.get('/clients', getClients);

module.exports = router;