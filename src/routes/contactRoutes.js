const express = require('express');
const router = express.Router();
const { submitContactForm, getMessages, replyToMessage } = require('../controllers/contactController');

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Contact form and messaging
 */

/**
 * @swagger
 * /contact/submit:
 *   post:
 *     summary: Submit a contact form
 *     tags: [Contact]
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
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact form submitted successfully
 *       500:
 *         description: Server error
 */
router.post('/submit', submitContactForm);

/**
 * @swagger
 * /contact/all:
 *   get:
 *     summary: Get all contact messages
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of contact messages
 *       500:
 *         description: Server error
 */
router.get('/all', getMessages);

/**
 * @swagger
 * /contact/reply:
 *   post:
 *     summary: Reply to a contact message
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageId:
 *                 type: string
 *               reply:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply sent successfully
 *       500:
 *         description: Server error
 */
router.post('/reply', replyToMessage);

/**
 * @swagger
 * /contact/hi:
 *   get:
 *     summary: Health check for contact routes
 *     tags: [Contact]
 *     responses:
 *       200:
 *         description: Contact routes working
 */
router.get('/hi', (req,res)=>{res.send("Contact Routes Working")});

module.exports = router;