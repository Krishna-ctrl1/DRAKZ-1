import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../../config/backend';

const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "avif", "svg"];

const isValidImageUrl = (value = "") => {
  if (!value?.trim()) return false;
  
  if (value.trim().startsWith('/')) {
    const ext = value.trim().split(".").pop()?.toLowerCase();
    return !!ext && ALLOWED_IMAGE_EXTENSIONS.includes(ext);
  }

  try {
    const parsed = new URL(value.trim());
    const protocolAllowed = ["http:", "https:"].includes(parsed.protocol);
    if (!protocolAllowed) return false;
    const ext = parsed.pathname.split(".").pop()?.toLowerCase();
    return !!ext && ALLOWED_IMAGE_EXTENSIONS.includes(ext);
  } catch (err) {
    return false;
  }
};

const AddPropertyForm = ({ onClose, onSave, property }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');

  const [isDragOver, setIsDragOver] = useState(false);

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
    // Only allow letters, numbers, and spaces - no special characters except spaces
    const regex = /^[A-Za-z0-9\s]+$/;
    if (!text || text.trim().length === 0) {
      return false;
    }
    if (!regex.test(text)) {
      return false;
    }
    // Minimum 3 characters for meaningful names
    if (text.trim().length < 3) {
      return false;
    }
    return true;
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    if (!url) {
      setImagePreview('');
      setError('');
      return;
    }

    if (!isValidImageUrl(url)) {
      setError('Please enter a valid image URL (e.g. /image.jpg or https://example.com/image.jpg).');
      setImagePreview('');
      return;
    }

    setImagePreview(url);
    setImageFile(null);
    setImageLoading(false);
    setError('');
  };

  const processFile = (file) => {
    if (file) {
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError('Image file is too large. Please select an image smaller than 5MB.');
        return;
      }

      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }

      setImageFile(file);
      setImageLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageLoading(false);
      };
      reader.onerror = () => {
        setError('Failed to read the selected image. Please try again.');
        setImagePreview('');
        setImageLoading(false);
      };
      reader.readAsDataURL(file);
      setImageUrl(''); // Clear URL input if file is selected
      setError(''); // Clear any previous errors
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
    e.target.value = null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!validateName(name)) {
      setError("Property Name must be at least 3 characters and contain only letters, numbers, and spaces (no special characters).");
      return;
    }
    if (!validateName(location)) {
      setError("Location must be at least 3 characters and contain only letters, numbers, and spaces (no special characters).");
      return;
    }
    if (!value || Number(value) <= 0) {
      setError("Please enter a valid property value.");
      return;
    }

    const shouldValidateUrl = !!imageUrl && !imageFile;
    if (shouldValidateUrl && !isValidImageUrl(imageUrl)) {
      setError('Please enter a valid image URL (e.g. /image.jpg or https://example.com/image.jpg).');
      return;
    }

    if (imageFile && !imagePreview) {
      setError('Image is still loading. Please wait a moment and try again.');
      return;
    }

    let finalImageUrl = imageUrl;

    // Keep data URL for preview, but upload file when available
    if (imageFile && imagePreview) {
      finalImageUrl = imagePreview;
    }

    if (!finalImageUrl) {
      finalImageUrl = '/1.jpg';
    }

    const propertyData = { 
      name, 
      value: Number(value), 
      location, 
      imageUrl: finalImageUrl,
      imageFile: imageFile || null
    };

    if (property && (property._id || property.id)) {
      propertyData.id = property._id || property.id;
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
            backgroundImage: `url(${imagePreview.startsWith('/') ? BACKEND_URL + imagePreview : imagePreview})`,
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
          minLength="3"
        />
        <small style={{color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>
          At least 3 characters, letters and numbers only
        </small>
      </div>
      <div className="form-group">
        <label htmlFor="value">Property Value (INR)</label>
        <input 
          id="value" 
          type="number" 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          required 
        />
        <small style={{color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>
          Enter any amount
        </small>
      </div>
      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input 
          id="location" type="text" value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          placeholder="e.g. California" required 
          minLength="3"
        />
        <small style={{color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>
          At least 3 characters, letters and numbers only
        </small>
      </div>
      <div className="form-group">
        <label htmlFor="imageUrl">Image URL</label>
        <input 
          id="imageUrl" 
          type="text" 
          inputMode="url"
          value={imageUrl} 
          onChange={handleImageUrlChange} 
          placeholder="https://example.com/image.jpg or /image.jpg" 
          pattern="(?:^/.*)|(?:^https?://.*)"
        />
        <small style={{color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>
          Only valid URLs ending with image extensions (jpg, png, gif, webp, avif, svg)
        </small>
      </div>
      <div className="form-group">
        <label>Or Upload Image File (max 5MB)</label>
        <div 
          className="file-drop-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('imageFile').click()}
          style={{
            border: `2px dashed ${isDragOver ? '#4f46e5' : '#475569'}`,
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragOver ? '#312e81' : 'transparent',
            transition: 'all 0.3s ease',
            marginTop: '8px'
          }}
        >
          <input 
            id="imageFile" 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <svg style={{width: '32px', height: '32px', color: '#94a3b8', margin: '0 auto 8px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          <p style={{ margin: 0, color: '#e2e8f0', fontWeight: '500' }}>
            Click to choose a file or drag and drop it here
          </p>
          <small style={{color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>
            Supported formats: JPG, PNG, GIF, WebP
          </small>
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="modal-btn cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="modal-btn confirm">{property ? 'Update' : 'Save'} Property</button>
      </div>
    </form>
  );
};

export default AddPropertyForm;