const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'advisor', 'user'], default: 'user' },
  
  // --- EXPANDED FIELDS FOR ADVISOR DASHBOARD ---
  portfolioValue: { type: Number, default: 0 },
  riskProfile: { type: String, default: 'Moderate' },
  activeGoals: { type: Number, default: 0 },
  
  // New Data Points
  monthlyIncome: { type: Number, default: 0 },
  totalDebt: { type: Number, default: 0 },
  creditScore: { type: Number, default: 750 },
  occupation: { type: String, default: 'Unspecified' },
  phone: { type: String, default: 'N/A' },
  profilePicture: { type: String, default: '' },
  
  lastActive: { type: Date, default: Date.now },
  
  // --- KYC STATUS ---
  kycStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },
  // ----------------------------------------

  // --- ADVISOR-SPECIFIC PROFILE FIELDS ---
  advisorProfile: {
    price: { type: Number, default: 0 },              // Consultation fee
    certificate: { type: String, default: '' },       // Certification details
    specialization: { type: String, default: '' },    // Area of expertise (e.g., "Retirement Planning")
    bio: { type: String, default: '' },               // Short biography
    contactEmail: { type: String, default: '' },      // Contact email for queries
    contactPhone: { type: String, default: '' },      // Contact phone
    experience: { type: Number, default: 0 },         // Years of experience
    isAcceptingClients: { type: Boolean, default: true } // Availability toggle
  },
  // ----------------------------------------

  // --- USER-ADVISOR ASSIGNMENT ---
  assignedAdvisor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Person', 
    default: null 
  },
  // ----------------------------------------

  // --- ADMIN & COMPLIANCE FIELDS ---
  status: { 
    type: String, 
    enum: ['Active', 'Suspended'], 
    default: 'Active' 
  },
  isApproved: { 
    type: Boolean, 
    default: true // Advisors will be set to false upon registration
  },
  isRejected: {
    type: Boolean,
    default: false
  },
  // RBAC for Admins
  permissions: [{
    type: String,
    enum: ['manage_users', 'manage_content', 'manage_support', 'view_analytics', 'manage_admins']
  }],
  documents: [{
    name: { type: String },
    url: { type: String },
    type: { type: String }, // e.g., 'certificate', 'id_proof'
    uploadedAt: { type: Date, default: Date.now }
  }],
  // ----------------------------------------

  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Person', PersonSchema);