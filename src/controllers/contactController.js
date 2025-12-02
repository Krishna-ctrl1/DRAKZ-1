const Contact = require('../models/ContactModel');
const nodemailer = require('nodemailer');

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

// 2. Get All Messages (New)
exports.getMessages = async (req, res) => {
  try {
    // Get all messages, newest first
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

// 3. Reply via Email (New)
exports.replyToMessage = async (req, res) => {
  const { toEmail, subject, replyMessage } = req.body;

  try {
    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use App Password if using Gmail
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `Re: ${subject}`,
      text: replyMessage
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Reply sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
};