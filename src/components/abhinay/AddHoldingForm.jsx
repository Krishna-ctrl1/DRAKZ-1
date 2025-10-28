// src/components/abhinay/AddHoldingForm.jsx
import React, { useState } from 'react';

const AddHoldingForm = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [purchasedValue, setPurchasedValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      weight,
      purchasedValue: Number(purchasedValue),
      currentValue: Number(currentValue || purchasedValue),
      date: purchaseDate,
    });
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit}>
      <h2>Add Precious Holding</h2>
      <div className="form-group">
        <label htmlFor="name">Item Name</label>
        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Gold Bangle (22K)" />
      </div>
       <div className="form-group">
        <label htmlFor="weight">Amount / Weight</label>
        <input id="weight" type="text" value={weight} onChange={(e) => setWeight(e.target.value)} required placeholder="e.g., 50 g" />
      </div>
      <div className="form-group">
        <label htmlFor="purchasedValue">Purchased Value (₹)</label>
        <input id="purchasedValue" type="number" value={purchasedValue} onChange={(e) => setPurchasedValue(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="currentValue">Current Value (₹) (optional)</label>
        <input id="currentValue" type="number" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="Defaults to purchased value" />
      </div>
      <div className="form-group">
        <label htmlFor="purchaseDate">Date of Purchase</label>
        <input id="purchaseDate" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
      </div>
      <div className="modal-actions">
        <button type="button" className="modal-btn cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="modal-btn confirm">Save Holding</button>
      </div>
    </form>
  );
};

export default AddHoldingForm;