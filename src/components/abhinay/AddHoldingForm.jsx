import React, { useState } from 'react';

const AddHoldingForm = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Gold'); 
  const [weight, setWeight] = useState('');
  const [purchaseValue, setPurchaseValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const validateName = (text) => {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(text);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!validateName(name)) {
      setError("Item Name must contain only letters (A-Z) and spaces.");
      return;
    }

    onSave({ 
      name, type, weight, 
      purchasedValue: Number(purchaseValue), 
      currentValue: Number(currentValue),
      date: date || new Date().toISOString()
    });
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit}>
      <h2>Add Precious Holding</h2>
      {error && <p style={{color: 'red', marginBottom: '10px'}}>{error}</p>}

      <div className="form-group">
        <label htmlFor="name">Item Name</label>
        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gold Coin" required />
      </div>
      <div className="form-group">
        <label htmlFor="type">Type</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Gold">Gold</option>
          <option value="Silver">Silver</option>
          <option value="Platinum">Platinum</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="weight">Weight (e.g. 10g)</label>
        <input id="weight" type="text" value={weight} onChange={(e) => setWeight(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="purchaseValue">Purchased Value ($)</label>
        <input id="purchaseValue" type="number" value={purchaseValue} onChange={(e) => setPurchaseValue(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="currentValue">Current Value ($)</label>
        <input id="currentValue" type="number" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="date">Purchase Date</label>
        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="modal-actions">
        <button type="button" className="modal-btn cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="modal-btn confirm">Save</button>
      </div>
    </form>
  );
};

export default AddHoldingForm;