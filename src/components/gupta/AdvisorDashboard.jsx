import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClients, selectClient } from '../../redux/slices/advisorSlice';
import '../../styles/gupta/AdvisorDashboard.css';

const AdvisorDashboard = () => {
  const dispatch = useDispatch();
  const { clients, loading, selectedClient } = useSelector((state) => state.advisor);
  
  useEffect(() => {
    if (clients.length === 0) dispatch(fetchClients());
  }, [dispatch, clients.length]);

  const handleClientClick = (client) => {
    dispatch(selectClient(client));
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="advisor-wrapper">
      
      {/* Header */}
      <header className="advisor-header">
        <div className="advisor-brand">
          <h2>DRAKZ <span className="advisor-highlight">Advisor</span></h2>
        </div>
        <nav className="advisor-nav">
          <Link to="/advisor/dashboard" className="advisor-link active">Overview</Link>
          <Link to="/advisor/video" className="advisor-link">Live Session</Link>
        </nav>
        <div className="user-badge">A</div>
      </header>

      <div className="advisor-layout">
        {/* Sidebar */}
        <aside className="advisor-sidebar">
          <div className="sidebar-top">
            <h3>Clients ({clients.length})</h3>
            <button className="sidebar-add-btn" title="Add Client">+</button>
          </div>
          <div className="client-list">
            {loading ? (
              <p style={{textAlign:'center', color:'#666', padding:'20px'}}>Loading...</p>
            ) : clients.length === 0 ? (
              <p style={{textAlign:'center', color:'#666', padding:'20px'}}>No clients found.</p>
            ) : (
              clients.map(client => (
                <div 
                  key={client._id} 
                  className={`client-card ${selectedClient?._id === client._id ? 'active' : ''}`}
                  onClick={() => handleClientClick(client)}
                >
                  <div className="client-avatar">
                    {client.name ? client.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="client-info">
                    <p className="client-name">{client.name}</p>
                    <p className="client-email">{client.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="advisor-content">
          {!selectedClient ? (
            <div className="empty-state">
              <p>Select a client from the sidebar to view details.</p>
            </div>
          ) : (
            <div className="client-detail-view">
              {/* Header Card */}
              <div className="detail-header">
                <div className="profile-large">
                  <div className="avatar-large">
                    {selectedClient.name ? selectedClient.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="profile-text">
                    <h1>{selectedClient.name}</h1>
                    <span className="role-tag">{selectedClient.role?.toUpperCase()}</span>
                    <span style={{marginLeft:'10px', fontSize:'0.9rem', color:'#aaa'}}>Last Active: {new Date(selectedClient.lastActive).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link to="/advisor/video" className="start-session-btn">
                  Start Session
                </Link>
              </div>

              {/* Key Stats Row */}
              <div className="stats-row">
                <div className="stat-box">
                  <span>Total Portfolio</span>
                  <strong style={{color: '#10b981'}}>{formatCurrency(selectedClient.portfolioValue)}</strong>
                </div>
                <div className="stat-box">
                  <span>Monthly Income</span>
                  <strong style={{color: '#3b82f6'}}>{formatCurrency(selectedClient.monthlyIncome)}</strong>
                </div>
                <div className="stat-box">
                  <span>Total Debt</span>
                  <strong style={{color: '#ef4444'}}>{formatCurrency(selectedClient.totalDebt)}</strong>
                </div>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                
                {/* Financial Health Panel */}
                <div className="info-panel">
                  <h4>Financial Health</h4>
                  <div className="data-row">
                    <span className="label">Credit Score</span>
                    <span className="value" style={{fontWeight:'bold', color: selectedClient.creditScore > 700 ? '#10b981' : '#f59e0b'}}>
                      {selectedClient.creditScore || 'N/A'}
                    </span>
                  </div>
                  <div className="data-row">
                    <span className="label">Risk Profile</span>
                    <span className="value" style={{color: '#f59e0b'}}>{selectedClient.riskProfile || 'Moderate'}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Active Goals</span>
                    <span className="value">{selectedClient.activeGoals || 0}</span>
                  </div>
                </div>

                {/* Personal Details Panel */}
                <div className="info-panel">
                  <h4>Personal Details</h4>
                  <div className="data-row">
                    <span className="label">Occupation</span>
                    <span className="value">{selectedClient.occupation || 'Unspecified'}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Email</span>
                    <span className="value">{selectedClient.email}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Phone</span>
                    <span className="value">{selectedClient.phone || 'N/A'}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Client ID</span>
                    <span className="value" style={{fontSize:'0.8rem', color:'#666'}}>{selectedClient._id}</span>
                  </div>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdvisorDashboard;