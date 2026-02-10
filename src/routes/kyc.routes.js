const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kyc.controller');
const { auth } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware'); // Assuming you have mult (or similar) here

// User Routes
router.post('/submit', 
    auth, 
    upload.single('document'), 
    kycController.submitKyc
);

router.get('/me', auth, kycController.getMyKyc);

// Admin Routes (Add admin check middleware in real app)
router.get('/pending', auth, kycController.getPendingRequests);
router.patch('/:id/status', auth, kycController.updateKycStatus);

module.exports = router;
