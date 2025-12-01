// src/controllers/user.controller.js
const Person = require('../models/people.model.js');
const bcrypt = require('bcryptjs');

// 1. GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Person.find().select('-password'); // Don't send passwords to frontend
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// 2. ADD NEW USER
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  
  try {
    // Basic Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Check for existing user
    const existingUser = await Person.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPerson = new Person({
      name,
      email,
      password: hashedPassword,
      role
    });

    const savedPerson = await newPerson.save();
    
    // Remove password before sending back
    const userResponse = savedPerson.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// 3. EDIT USER
exports.updateUser = async (req, res) => {
  const { name, email, role, password } = req.body;
  
  try {
    // Build update object dynamically
    const updateFields = { name, email, role };

    // Only hash and update password if a new one is provided
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const updatedPerson = await Person.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true } // Return the updated doc
    ).select('-password');

    res.json(updatedPerson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// 4. DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    await Person.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
};