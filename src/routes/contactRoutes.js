const express = require('express');
const router = express.Router();
const { submitContactForm, getMessages, replyToMessage } = require('../controllers/contactController');

// Resulting URL: /api/contact/submit
router.post('/submit', submitContactForm); 
router.get('/all', getMessages);
router.post('/reply', replyToMessage);
router.get('/hi', (req,res)=>{res.send("Contact Routes Working")});
module.exports = router;