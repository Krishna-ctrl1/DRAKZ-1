const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person', 
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    default: '/1.jpg',
  },
}, {
  timestamps: true
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;