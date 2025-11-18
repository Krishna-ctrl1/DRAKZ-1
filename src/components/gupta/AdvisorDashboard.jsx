import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API from '../../config/api.config.js';
import '../../styles/gupta/AdvisorDashboard.css';

const AdvisorDashboard = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch real clients from DB on load
  useEffect(() => {
    const fetchClients = async () => {
      try {
        // You might need to send the token if your route is protected
        // const token = localStorage.getItem('token');
        // const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const response = await axios.get(API.advisorClients); 
        setClients(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setError("Failed to load client data.");
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (loading) return <div className="loading-container">Loading Database Records...</div>;
  if (error) return <div className="loading-container" style={{color:'red'}}>{error}</div>;

  return (
    <div className="dashboard-container">
      {/* --- HEADER --- */}
      <header>
        <div className="logo-area">
          <h2 style={{color:'white', margin:0}}>DRAKZ <span style={{color:'#3b82f6'}}>Advisor</span></h2>
        </div>
        <nav>
          <Link to="/advisor/dashboard" className="active">Overview</Link>
          <Link to="/advisor/video">Live Session</Link>
        </nav>
        <div className="user-icon">A</div>
      </header>

      <main className="dashboard-main">
        {/* --- SIDEBAR: REAL DB CLIENTS --- */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Client List</h2>
            <button className="add-btn" title="Add Client">+</button>
          </div>
          <div id="clientList">
            {clients.length === 0 ? (
              <div className="empty-state" style={{height:'100px'}}>No clients found.</div>
            ) : (
              clients.map(client => (
                <div 
                  key={client._id} 
                  className={`client-item ${selectedClient?._id === client._id ? 'active' : ''}`}
                  onClick={() => setSelectedClient(client)}
                >
                  <div className="client-avatar">
                    {client.name ? client.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="client-info-list">
                    <span className="client-name">{client.name || 'Unnamed User'}</span>
                    <span className="client-email">{client.email}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <section className="content">
          {!selectedClient ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>Select a client to analyze portfolio</h3>
              <p>Select a user from the list to view database records.</p>
            </div>
          ) : (
            <div className="client-details">
              {/* Header with Name and ID */}
              <div className="client-header">
                <div className="client-profile">
                  <div className="profile-pic-large">
                    {selectedClient.name ? selectedClient.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="profile-info">
                    <h1>{selectedClient.name || 'Unnamed User'}</h1>
                    <span className="role-badge">Role: {selectedClient.role}</span>
                    <p style={{color:'#888', marginTop:'5px', fontSize:'0.9rem'}}>
                      ID: {selectedClient._id}
                    </p>
                  </div>
                </div>
                <div>
                   <button className="btn-primary">
                     Start Video Call
                   </button>
                </div>
              </div>

              {/* Dummy Stats for Visuals (Real DB might not have this yet) */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Portfolio</div>
                  <div className="stat-value">$0.00</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Risk Profile</div>
                  <div className="stat-value" style={{color:'#f59e0b'}}>Moderate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Active Goals</div>
                  <div className="stat-value">2</div>
                </div>
              </div>

              {/* Detailed Info */}
              <h4 className="section-title">Account Details</h4>
              <div className="info-grid">
                <div className="info-row">
                  <label>Email Address</label>
                  <p>{selectedClient.email}</p>
                </div>
                <div className="info-row">
                  <label>Joined Date</label>
                  <p>{new Date(selectedClient.created_at).toLocaleDateString()}</p>
                </div>
                {/* You can add more fields here if your DB has them */}
              </div>

            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdvisorDashboard;