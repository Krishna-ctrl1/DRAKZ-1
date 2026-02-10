const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Person = require("../models/people.model.js");
const { jwtSecret } = require("../config/jwt.config.js");
const JWT_SECRET = jwtSecret;

exports.register = async (req, res) => {
  const { name, email, password, role, specializedIn, experience, bio, phone } = req.body;
  
  try {
    // Check if user exists
    let user = await Person.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare user data
    const newPersonData = {
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      isApproved: role === 'advisor' ? false : true, // Advisors need approval
      phone: phone || 'N/A'
    };

    // If advisor, add profile details and documents
    if (role === 'advisor') {
      newPersonData.advisorProfile = {
        specialization: specializedIn || '',
        experience: experience || 0,
        bio: bio || '',
        contactPhone: phone || ''
      };

      // Handle uploaded documents
      if (req.files && req.files.length > 0) {
        newPersonData.documents = req.files.map(file => ({
          name: file.originalname,
          url: `/uploads/documents/${file.filename}`,
          type: file.mimetype.includes('pdf') ? 'document' : 'image',
          uploadedAt: new Date()
        }));
      }
    }

    user = new Person(newPersonData);
    await user.save();

    // If advisor, return different message
    if (role === 'advisor') {
      return res.status(201).json({ 
        msg: "Registration successful. Please wait for admin approval.",
        isApproved: false 
      });
    }

    // Unified token generation (matches login)
    const payload = {
      id: user.id,
      role: user.role
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "8h" }, // Consistent with login
      (err, token) => {
        if (err) throw err;
        // Return same structure as login
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            profilePicture: "" 
          } 
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("🔑 Login attempt for email:", email); // Incoming request

  try {
    const person = await Person.findOne({ email }).select('+profilePicture');
    console.log(
      "👤 User lookup:",
      person ? `Found: ${person.email} (role: ${person.role})` : "NOT FOUND",
    ); // User exists?
    
    if (person) {
      console.log("📸 Profile Picture in DB:", person.profilePicture);
    }

    if (!person)
      return res.status(400).json({ msg: "Invalid credentials" });

    // Check for approval (Advisors only)
    if (person.role === 'advisor' && !person.isApproved) {
      // Check if rejected
      if (person.isRejected) {
        return res.status(403).json({ msg: "Your application has been rejected. Please contact support." });
      }
      return res.status(403).json({ msg: "Your account is pending approval. Please wait for admin verification." });
    }

    // Check if suspended (All users)
    if (person.status === 'Suspended') {
      return res.status(403).json({ msg: "Your account has been suspended. Please contact support." });
    }

    const isMatch = await bcrypt.compare(password, person.password);
    console.log("🔒 Password check:", isMatch ? "MATCH" : "MISMATCH"); // Password OK?

    if (!isMatch)
      return res.status(400).json({ msg: "Invalid credentials" });

    // Token generation...
    const token = jwt.sign({ id: person._id, role: person.role }, JWT_SECRET, {
      expiresIn: "8h",
    });
    console.log("✅ Login SUCCESS for:", email);
    console.log("📤 Sending profilePicture:", person.profilePicture || "");

    res.json({
      token,
      user: { 
        id: person._id, 
        email, 
        name: person.name, 
        role: person.role,
        profilePicture: person.profilePicture || ""
      },
    });
  } catch (err) {
    console.error("💥 Login error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// Simple auth check endpoint
exports.me = async (req, res) => {
  try {
    const user = await Person.findById(req.user.id).select(
      "_id email name role profilePicture",
    );
    if (!user) return res.status(404).json({ msg: "User not found" });
    
    console.log("🔍 /me endpoint - User ID:", req.user.id);
    console.log("📸 /me endpoint - ProfilePicture from DB:", user.profilePicture);
    
    return res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      profilePicture: user.profilePicture || "",
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
};
