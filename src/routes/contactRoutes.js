const express = require('express');
const router = express.Router();
const { submitContactForm } = require('../controllers/contactController');

// Resulting URL: /api/contact/submit
router.post('/submit', submitContactForm); 

module.exports = router;