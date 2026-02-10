const Kyc = require('../models/kyc.model');
const Person = require('../models/people.model');

// --- USER ACTIONS ---

// Submit KYC Request
exports.submitKyc = async (req, res) => {
    try {
        const { documentType, documentNumber } = req.body;
        const userId = req.user.id;

        // Check if user already has a pending or verified KYC
        const existingKyc = await Kyc.findOne({ 
            user: userId, 
            status: { $in: ['pending', 'approved'] } 
        });

        if (existingKyc) {
            return res.status(400).json({ msg: "You already have a pending or verified KYC submission." });
        }

        if (!req.file) {
            return res.status(400).json({ msg: "Document image is required." });
        }

        const newKyc = new Kyc({
            user: userId,
            documentType,
            documentNumber,
            documentUrl: `/uploads/documents/${req.file.filename}`
        });

        await newKyc.save();

        // Update User model status
        await Person.findByIdAndUpdate(userId, { kycStatus: 'pending' });

        res.status(201).json({ msg: "KYC Submitted successfully", kyc: newKyc });

    } catch (error) {
        console.error("KYC Submit Error:", error);
        res.status(500).json({ msg: "Server error during KYC submission" });
    }
};

// Get My KYC Status
exports.getMyKyc = async (req, res) => {
    try {
        const kyc = await Kyc.findOne({ user: req.user.id }).sort({ submittedAt: -1 });
        // Also get user status from Person model to be sure
        const user = await Person.findById(req.user.id).select('kycStatus');
        
        res.json({ 
            kycStatus: user.kycStatus, 
            submission: kyc || null 
        });
    } catch (error) {
        res.status(500).json({ msg: "Server error" });
    }
};

// --- ADMIN ACTIONS ---

// GetAll Pending Requests
exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await Kyc.find({ status: 'pending' })
            .populate('user', 'name email profilePicture')
            .sort({ submittedAt: 1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ msg: "Server error fetching requests" });
    }
};

// Approve/Reject KYC
exports.updateKycStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminComment } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: "Invalid status update" });
        }

        const kyc = await Kyc.findById(id);
        if (!kyc) return res.status(404).json({ msg: "KYC request not found" });

        kyc.status = status;
        kyc.adminComment = adminComment || '';
        kyc.reviewedAt = Date.now();
        kyc.reviewedBy = req.user.id;
        await kyc.save();

        // Update User Model
        const newStatus = status === 'approved' ? 'verified' : 'rejected';
        await Person.findByIdAndUpdate(kyc.user, { kycStatus: newStatus });

        res.json({ msg: `KYC request ${status}`, kyc });

    } catch (error) {
        console.error("Update KYC Error:", error);
        res.status(500).json({ msg: "Server error updating status" });
    }
};
