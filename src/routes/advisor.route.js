const express = require('express');
const router = express.Router();
const { getClients } = require('../controllers/advisor.controller.js');

router.get('/clients', getClients);

module.exports = router;