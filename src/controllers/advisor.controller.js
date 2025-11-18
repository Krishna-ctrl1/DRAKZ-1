const Person = require('../models/people.model.js');

exports.getClients = async (req, res) => {
  try {
    // Find all people with role 'user'. 
    // specific fields like password are excluded (-password)
    const clients = await Person.find({ role: 'user' }).select('-password');
    
    res.json(clients);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ msg: 'Server error fetching clients' });
  }
};