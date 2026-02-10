const mongoose = require('mongoose');

const KycSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
    required: true
  },
  documentType: {
    type: String,
    enum: ['passport', 'national_id', 'driving_license'],
    required: true
  },
  documentNumber: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String, // URL to the uploaded file
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminComment: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
  }
});

module.exports = mongoose.model('Kyc', KycSchema);
