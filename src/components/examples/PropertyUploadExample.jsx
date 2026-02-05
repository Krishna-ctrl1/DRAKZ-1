// Example React Component for Property Upload with Multer

import React, { useState } from 'react';
import api from '../../api/axios.api';

const PropertyUploadExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    location: '',
    imageFile: null
  });
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Handle text input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit form with file upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Create FormData object
      const data = new FormData();
      data.append('name', formData.name);
      data.append('value', formData.value);
      data.append('location', formData.location);
      
      // Append file if selected
      if (formData.imageFile) {
        data.append('image', formData.imageFile);
      }

      // Send request with multipart/form-data
      const response = await api.post('/api/privilege/properties', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Property created:', response.data);
      alert('Property added successfully!');
      
      // Reset form
      setFormData({ name: '', value: '', location: '', imageFile: null });
      setPreview(null);
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert('Failed to add property: ' + error.response?.data?.error || error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="property-upload-form">
      <h2>Add New Property</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Property Name */}
        <div className="form-group">
          <label>Property Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Beach House"
            required
          />
        </div>

        {/* Property Value */}
        <div className="form-group">
          <label>Value ($):</label>
          <input
            type="number"
            name="value"
            value={formData.value}
            onChange={handleChange}
            placeholder="e.g., 500000"
            required
          />
        </div>

        {/* Location */}
        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Miami, FL"
            required
          />
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>Property Image:</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
          />
          
          {/* Image Preview */}
          {preview && (
            <div className="image-preview">
              <img 
                src={preview} 
                alt="Preview" 
                style={{ 
                  width: '200px', 
                  height: '200px', 
                  objectFit: 'cover',
                  marginTop: '10px',
                  border: '2px solid #ccc'
                }} 
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={uploading}
          style={{
            padding: '10px 20px',
            backgroundColor: uploading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? 'Uploading...' : 'Add Property'}
        </button>
      </form>
    </div>
  );
};

export default PropertyUploadExample;

/*
 * ==============================
 * HOW TO USE THIS COMPONENT:
 * ==============================
 * 
 * 1. Import axios api instance (with JWT auth)
 * 2. User selects image file
 * 3. FormData is created with all fields
 * 4. File is appended as 'image' (matching multer config)
 * 5. Request sent with Content-Type: multipart/form-data
 * 6. Multer processes upload on backend
 * 7. Image saved to uploads/properties/
 * 8. Property saved to database with imageUrl path
 * 
 * ==============================
 * BACKEND API ENDPOINT:
 * ==============================
 * 
 * POST /api/privilege/properties
 * 
 * Headers:
 *   - Authorization: Bearer <token>
 *   - Content-Type: multipart/form-data (auto-set by axios)
 * 
 * Body (FormData):
 *   - name: string
 *   - value: number
 *   - location: string
 *   - image: File (optional)
 * 
 * Response:
 *   {
 *     _id: "...",
 *     userId: "...",
 *     name: "Beach House",
 *     value: 500000,
 *     location: "Miami, FL",
 *     imageUrl: "/uploads/properties/userId_timestamp.jpg"
 *   }
 * 
 * ==============================
 * DISPLAY UPLOADED IMAGES:
 * ==============================
 * 
 * {properties.map(property => (
 *   <img 
 *     src={`http://localhost:3001${property.imageUrl}`}
 *     alt={property.name}
 *   />
 * ))}
 * 
 */
