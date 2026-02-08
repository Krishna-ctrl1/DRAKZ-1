const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Person = require("../models/people.model.js");
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("🔑 Login attempt for email:", email); // Incoming request

  try {
    const person = await Person.findOne({ email });
    console.log(
      "👤 User lookup:",
      person ? `Found: ${person.email} (role: ${person.role})` : "NOT FOUND",
    ); // User exists?

    if (!person)
      return res.status(400).json({ msg: "Invalid credentials oneeee" });

    const isMatch = await bcrypt.compare(password, person.password);
    console.log("🔒 Password check:", isMatch ? "MATCH" : "MISMATCH"); // Password OK?

    if (!isMatch)
      return res.status(400).json({ msg: "Invalid credentials twooo" });

    // Token generation...
    const token = jwt.sign({ id: person._id, role: person.role }, JWT_SECRET, {
      expiresIn: "8h",
    });
    console.log("✅ Login SUCCESS for:", email);

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
