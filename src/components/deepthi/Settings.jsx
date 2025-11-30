import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../global/Header';
import Sidebar from '../global/Sidebar';
import '../../styles/deepthi/settings.css';
import axios from '../../api/axios.api';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    occupation: '',
    role: ''
  });

  // Financial state
  const [financialData, setFinancialData] = useState({
    currency: 'INR',
    riskProfile: 'Moderate',
    monthlyIncome: 0
  });

  // Security state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/settings/profile');
      const data = response.data;
      
      setProfileData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        occupation: data.occupation || '',
        role: data.role || ''
      });

      setFinancialData({
        currency: data.currency || 'INR',
        riskProfile: data.riskProfile || 'Moderate',
        monthlyIncome: data.monthlyIncome || 0
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      await axios.put('/api/settings/profile', {
        name: profileData.name,
        phone: profileData.phone,
        occupation: profileData.occupation
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleFinancialSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      await axios.put('/api/settings/financial', financialData);

      setMessage({ type: 'success', text: 'Financial preferences updated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to update preferences' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
        return;
      }

      setSaving(true);
      setMessage({ type: '', text: '' });
      
      await axios.put('/api/settings/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <Header />
        <div className="app">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          <div className={collapsed ? "main-content-collapsed" : "main-content"}>
            <div className="settings-loading">Loading settings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <Header />
      <div className="app">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={collapsed ? "main-content-collapsed" : "main-content"}>
          <div className="settings-container">
            <h1 className="settings-title">Settings</h1>

            {/* Message Banner */}
            {message.text && (
              <div className={`settings-message ${message.type}`}>
                {message.text}
              </div>
            )}

            {/* Tabs */}
            <div className="settings-tabs">
              <button
                className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="fa-solid fa-user"></i> Profile
              </button>
              <button
                className={`settings-tab ${activeTab === 'financial' ? 'active' : ''}`}
                onClick={() => setActiveTab('financial')}
              >
                <i className="fa-solid fa-chart-line"></i> Financial
              </button>
              <button
                className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <i className="fa-solid fa-lock"></i> Security
              </button>
            </div>

            {/* Tab Content */}
            <div className="settings-content">
              
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="settings-section">
                  <h2>Profile Information</h2>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="disabled-input"
                      />
                      <small>Email cannot be changed</small>
                    </div>

                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+91 XXXXXXXXXX"
                      />
                    </div>

                    <div className="form-group">
                      <label>Occupation</label>
                      <input
                        type="text"
                        value={profileData.occupation}
                        onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                        placeholder="e.g., Software Engineer"
                      />
                    </div>

                    <div className="form-group">
                      <label>Account Type</label>
                      <input
                        type="text"
                        value={profileData.role}
                        disabled
                        className="disabled-input"
                      />
                      <small>Contact admin to change account type</small>
                    </div>

                    <button 
                      className="settings-save-btn" 
                      onClick={handleProfileSave}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Financial Preferences */}
              {activeTab === 'financial' && (
                <div className="settings-section">
                  <h2>Financial Preferences</h2>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        value={financialData.currency}
                        onChange={(e) => setFinancialData({ ...financialData, currency: e.target.value })}
                      >
                        <option value="INR">₹ Indian Rupee (INR)</option>
                        <option value="USD">$ US Dollar (USD)</option>
                        <option value="EUR">€ Euro (EUR)</option>
                        <option value="GBP">£ British Pound (GBP)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Risk Profile</label>
                      <select
                        value={financialData.riskProfile}
                        onChange={(e) => setFinancialData({ ...financialData, riskProfile: e.target.value })}
                      >
                        <option value="Conservative">Conservative - Low Risk, Stable Returns</option>
                        <option value="Moderate">Moderate - Balanced Risk & Returns</option>
                        <option value="Aggressive">Aggressive - High Risk, High Returns</option>
                      </select>
                      <small>This helps tailor investment recommendations</small>
                    </div>

                    <div className="form-group">
                      <label>Monthly Income (₹)</label>
                      <input
                        type="number"
                        value={financialData.monthlyIncome}
                        onChange={(e) => setFinancialData({ ...financialData, monthlyIncome: Number(e.target.value) })}
                        placeholder="Enter your monthly income"
                        min="0"
                      />
                      <small>Used for budget planning and recommendations</small>
                    </div>

                    <button 
                      className="settings-save-btn" 
                      onClick={handleFinancialSave}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="settings-section">
                  <h2>Change Password</h2>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Re-enter new password"
                      />
                    </div>

                    <button 
                      className="settings-save-btn" 
                      onClick={handlePasswordChange}
                      disabled={saving}
                    >
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
