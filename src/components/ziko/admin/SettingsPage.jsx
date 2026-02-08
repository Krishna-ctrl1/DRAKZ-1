import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BACKEND_URL } from '../../../config/backend';
import { Title } from '../../../styles/ziko/admin/SharedStyles';
import { Section, FullWidthBox } from '../../../styles/ziko/admin/AdminLayout.styles';

const FormGroup = styled.div`
  margin-bottom: 20px;
  label {
    display: block;
    margin-bottom: 8px;
    color: #a0a0b0;
    font-size: 0.9rem;
  }
  input[type="text"], input[type="number"], input[type="email"] {
    width: 100%;
    padding: 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: white;
    font-size: 1rem;
    &:focus { outline: none; border-color: #3b82f6; }
  }
  input[type="checkbox"] {
    transform: scale(1.5);
    margin-right: 12px;
    cursor: pointer;
  }
  .checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 1rem;
    color: #e2e8f0;
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
  &:active { transform: translateY(0); }
`;

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    commissionRate: 5,
    supportEmail: ''
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/privilege/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSettings(await res.json());
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/privilege/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setMsg({ text: 'Settings updated successfully!', type: 'success' });
        setTimeout(() => setMsg({ text: '', type: '' }), 3000);
      } else {
        setMsg({ text: 'Failed to update settings.', type: 'error' });
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      setMsg({ text: 'Error updating settings.', type: 'error' });
    }
  };

  if (loading) return <div style={{ padding: "20px", color: "#fff" }}>Loading...</div>;

  return (
    <>
      <Title>System Configuration</Title>

      <Section>
        <FullWidthBox style={{ maxWidth: '600px', margin: '0 0' }}>
          {msg.text && (
            <div style={{
              background: msg.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
              color: msg.type === 'success' ? '#4ade80' : '#f87171',
              padding: '12px', borderRadius: '8px', marginBottom: '20px',
              border: `1px solid ${msg.type === 'success' ? '#4ade80' : '#f87171'}`
            }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                />
                Maintenance Mode (Only Admins can login)
              </label>
              <small style={{ color: '#64748b', marginLeft: '34px', display: 'block' }}>Enable to prevent regular users from accessing the platform.</small>
            </FormGroup>

            <FormGroup>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="allowRegistrations"
                  checked={settings.allowRegistrations}
                  onChange={handleChange}
                />
                Allow New User Registrations
              </label>
            </FormGroup>

            <FormGroup>
              <label>Platform Commission Rate (%)</label>
              <input
                type="number"
                name="commissionRate"
                value={settings.commissionRate}
                onChange={handleChange}
                min="0" max="100"
                step="0.1"
              />
            </FormGroup>

            <FormGroup>
              <label>Support Contact Email</label>
              <input
                type="email"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleChange}
                placeholder="support@drakz.com"
              />
            </FormGroup>

            <SaveButton type="submit">Save Changes</SaveButton>
          </form>
        </FullWidthBox>
      </Section>
    </>
  );
};

export default SettingsPage;