const Contact = require('../models/ContactModel');

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Create new contact entry
    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });

    // Save to MongoDB
    await newContact.save();

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully!' 
    });
  } catch (error) {
    console.error("Contact Error:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error. Please try again later.' 
    });
  }
};