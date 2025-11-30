import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API from '../../config/api.config.js';
import '../../styles/gupta/AdvisorDashboard.css';

const AdvisorDashboard = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(API.advisorClients);
        setClients(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header>
        <div className="logo-area">
          <h2>DRAKZ <span style={{color:'var(--accent-blue)'}}>Advisor</span></h2>
        </div>
        <nav>
          <Link to="/advisor/dashboard" className="active">Overview</Link>
          <Link to="/advisor/video">Live Session</Link>
        </nav>
        <div className="user-icon">A</div>
      </header>

      <main className="dashboard-main">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Clients ({clients.length})</h2>
            <button className="add-btn" title="Add Client">+</button>
          </div>
          
          <div id="clientList">
            {loading ? (
              <p style={{color: '#aaa', textAlign:'center', marginTop:'20px'}}>Loading...</p>
            ) : clients.length === 0 ? (
              <div className="empty-state">No clients found.</div>
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

        {/* MAIN CONTENT */}
        <section className="content">
          {!selectedClient ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>Welcome, Advisor</h3>
              <p>Select a client from the left to view their portfolio.</p>
            </div>
          ) : (
            <div className="client-details">
              {/* Profile Header */}
              <div className="client-header">
                <div className="client-profile">
                  <div className="profile-pic-large">
                    {selectedClient.name ? selectedClient.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="profile-info">
                    <h1>{selectedClient.name}</h1>
                    <span className="role-badge">{selectedClient.role?.toUpperCase()}</span>
                  </div>
                </div>
                <div>
                   <Link to="/advisor/video" className="btn-primary">
                     Start Video Call
                   </Link>
                </div>
              </div>

              {/* Financial Stats (Real DB Data) */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Portfolio</div>
                  <div className="stat-value" style={{color: '#10b981'}}>
                    {formatCurrency(selectedClient.portfolioValue)}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Risk Profile</div>
                  <div className="stat-value" style={{color: '#f59e0b'}}>
                    {selectedClient.riskProfile || 'N/A'}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Active Goals</div>
                  <div className="stat-value">
                    {selectedClient.activeGoals || 0}
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <h4 className="section-title">Client Details</h4>
              <div className="info-grid">
                <div className="info-row">
                  <label>Email Address</label>
                  <p>{selectedClient.email}</p>
                </div>
                <div className="info-row">
                  <label>Client ID</label>
                  <p style={{fontSize: '0.9rem', fontFamily: 'monospace', color:'var(--text-muted)'}}>
                    {selectedClient._id}
                  </p>
                </div>
                <div className="info-row">
                  <label>Joined Date</label>
                  <p>{selectedClient.created_at ? new Date(selectedClient.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="info-row">
                  <label>Status</label>
                  <p style={{color: '#10b981'}}>Active</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdvisorDashboard;