const mongoose = require('mongoose');

const AdvisorRequestSchema = new mongoose.Schema({
    // User making the request
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
        required: true
    },
    // Target advisor
    advisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
        required: true
    },
    // Request status
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'pending'
    },
    // Optional message from user
    message: {
        type: String,
        default: ''
    },
    // Timestamps
    requestedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date, default: null }
}, { timestamps: true });

// Ensure a user can only have one pending request per advisor
AdvisorRequestSchema.index({ user: 1, advisor: 1, status: 1 });

module.exports = mongoose.model('AdvisorRequest', AdvisorRequestSchema);
