const express = require('express');
const router = express.Router();
const { login, me } = require('../controllers/auth.controller.js');
const { auth } = require('../middlewares/auth.middleware.js');

router.post('/login', login);
router.get('/me', auth, me);
// router.post('/register', register);

module.exports = router;