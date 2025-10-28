// src/components/abhinay/AddPropertyForm.jsx
import React, { useState } from 'react';

const AddPropertyForm = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      name, 
      value: Number(value), 
      location, 
      imageUrl: imageUrl || '/1.jpg' // Default image
    });
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit}>
      <h2>Add New Property</h2>
      <div className="form-group">
        <label htmlFor="name">Property Name</label>
        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="value">Property Value ($)</label>
        <input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="imageUrl">Image URL (optional)</label>
        <input id="imageUrl" type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="e.g., /2.jpg" />
      </div>
      <div className="modal-actions">
        <button type="button" className="modal-btn cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="modal-btn confirm">Save Property</button>
      </div>
    </form>
  );
};

export default AddPropertyForm;