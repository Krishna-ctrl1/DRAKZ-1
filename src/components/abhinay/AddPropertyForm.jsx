import React, { useState, useEffect } from 'react';

const AddPropertyForm = ({ onClose, onSave, property }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (property) {
      setName(property.name || '');
      setValue(property.value || '');
      setLocation(property.location || '');
      setImageUrl(property.imageUrl || '');
      setImagePreview(property.imageUrl || '');
    }
  }, [property]);

  const validateName = (text) => {
    // Allow letters, numbers, spaces, and common characters
    return text && text.trim().length > 0;
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      setImagePreview(url);
      setImageFile(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError('Image file is too large. Please select an image smaller than 5MB.');
        e.target.value = null;
        return;
      }

      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        e.target.value = null;
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setImageUrl(''); // Clear URL input if file is selected
      setError(''); // Clear any previous errors
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!validateName(name)) {
      setError("Property Name is required.");
      return;
    }
    if (!validateName(location)) {
      setError("Location is required.");
      return;
    }
    if (!value || Number(value) <= 0) {
      setError("Please enter a valid property value.");
      return;
    }

    let finalImageUrl = imageUrl || '/1.jpg';
    
    // If a file was selected, use the data URL
    if (imageFile && imagePreview) {
      finalImageUrl = imagePreview;
    }

    const propertyData = { 
      name, 
      value: Number(value), 
      location, 
      imageUrl: finalImageUrl
    };

    if (property && property._id) {
      propertyData.id = property._id;
    }

    onSave(propertyData);
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit}>
      <h2>{property ? 'Edit Property' : 'Add New Property'}</h2>
      {error && <p style={{color: 'red', marginBottom: '10px'}}>{error}</p>}
      
      {imagePreview && (
        <div className="form-group">
          <label>Image Preview</label>
          <div style={{
            width: '100%',
            height: '200px',
            backgroundImage: `url(${imagePreview})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '10px',
            marginBottom: '10px'
          }}></div>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="name">Property Name</label>
        <input 
          id="name" type="text" value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="e.g. Sunset Villa" required 
        />
      </div>
      <div className="form-group">
        <label htmlFor="value">Property Value ($)</label>
        <input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input 
          id="location" type="text" value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          placeholder="e.g. California" required 
        />
      </div>
      <div className="form-group">
        <label htmlFor="imageUrl">Image URL</label>
        <input 
          id="imageUrl" 
          type="text" 
          value={imageUrl} 
          onChange={handleImageUrlChange} 
          placeholder="e.g., https://example.com/image.jpg or /2.jpg" 
        />
      </div>
      <div className="form-group">
        <label htmlFor="imageFile">Or Upload Image File (max 5MB)</label>
        <input 
          id="imageFile" 
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
        />
        <small style={{color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>
          Supported formats: JPG, PNG, GIF, WebP
        </small>
      </div>
      <div className="modal-actions">
        <button type="button" className="modal-btn cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="modal-btn confirm">{property ? 'Update' : 'Save'} Property</button>
      </div>
    </form>
  );
};

export default AddPropertyForm;