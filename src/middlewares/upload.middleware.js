const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/properties'); // Save to uploads/properties folder
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp_originalname
    const uniqueName = `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Configure storage for profile pictures
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📂 Multer: Saving profile picture to uploads/profile');
    cb(null, 'uploads/profile'); // Save to uploads/profile folder
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp.ext
    const uniqueName = `profile_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
    console.log('📝 Multer: Generated filename:', uniqueName);
    cb(null, uniqueName);
  }
});

// Multer configuration for profile pictures
const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for profile pictures
  },
  fileFilter: fileFilter
});

// Configure storage for advisor documents (Public upload during registration)
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure this directory exists or create it
    const fs = require('fs');
    const dir = 'uploads/documents';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    console.log('📂 Multer: Saving document to uploads/documents');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: doc_timestamp_originalname
    const uniqueName = `doc_${Date.now()}_${path.basename(file.originalname)}`;
    console.log('📝 Multer: Generated document filename:', uniqueName);
    cb(null, uniqueName);
  }
});

// File filter for documents (Images + PDF)
const documentFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'));
  }
};

const advisorDocumentUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: documentFileFilter
});

module.exports = { upload, profileUpload, advisorDocumentUpload };
