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
    // Unique Wrapper Class prevents breaking other pages
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
                  </div>
                </div>
                <Link to="/advisor/video" className="start-session-btn">
                  Start Session
                </Link>
              </div>

              {/* Stats Row */}
              <div className="stats-row">
                <div className="stat-box">
                  <span>Total Portfolio</span>
                  <strong style={{color: '#10b981'}}>{formatCurrency(selectedClient.portfolioValue)}</strong>
                </div>
                <div className="stat-box">
                  <span>Risk Profile</span>
                  <strong style={{color: '#f59e0b'}}>{selectedClient.riskProfile || 'Moderate'}</strong>
                </div>
                <div className="stat-box">
                  <span>Active Goals</span>
                  <strong>{selectedClient.activeGoals || 0}</strong>
                </div>
              </div>

              {/* Info Panel */}
              <div className="info-panel">
                <h4>Account Information</h4>
                <div className="data-row">
                  <span className="label">Email</span>
                  <span className="value">{selectedClient.email}</span>
                </div>
                <div className="data-row">
                  <span className="label">Joined</span>
                  <span className="value">{new Date(selectedClient.created_at).toLocaleDateString()}</span>
                </div>
                <div className="data-row">
                  <span className="label">Client ID</span>
                  <span className="value" style={{color: '#666'}}>{selectedClient._id}</span>
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