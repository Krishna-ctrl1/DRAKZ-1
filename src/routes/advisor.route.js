const express = require('express');
const router = express.Router();
const { getClients } = require('../controllers/advisor.controller.js');
// In a real app, you would add middleware here to check if the requester is actually an advisor
// const { verifyToken, isAdvisor } = require('../middlewares/auth.middleware');

router.get('/clients', getClients);

module.exports = router;