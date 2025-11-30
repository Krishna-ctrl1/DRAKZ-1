const Person = require('../models/people.model.js');

exports.getClients = async (req, res) => {
  try {
    // Fetch users and include the new financial fields
    const clients = await Person.find({ role: 'user' })
      .select('-password') // Don't send passwords
      .sort({ created_at: -1 }); // Newest first
    
    res.json(clients);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ msg: 'Server error fetching clients' });
  }
};