const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kyc.controller');
const { auth } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

/**
 * @swagger
 * tags:
 *   name: KYC
 *   description: Know Your Customer verification
 */

/**
 * @swagger
 * /kyc/submit:
 *   post:
 *     summary: Submit KYC documents
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               documentType:
 *                 type: string
 *     responses:
 *       201:
 *         description: KYC submitted successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/submit', 
    auth, 
    upload.single('document'), 
    kycController.submitKyc
);

/**
 * @swagger
 * /kyc/me:
 *   get:
 *     summary: Get my KYC status
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC status retrieved
 *       404:
 *         description: No KYC found
 */
router.get('/me', auth, kycController.getMyKyc);

/**
 * @swagger
 * /kyc/pending:
 *   get:
 *     summary: Get pending KYC requests (Admin)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending KYC requests
 */
router.get('/pending', auth, kycController.getPendingRequests);

/**
 * @swagger
 * /kyc/{id}/status:
 *   patch:
 *     summary: Update KYC status (Admin)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC status updated
 */
router.patch('/:id/status', auth, kycController.updateKycStatus);

module.exports = router;
