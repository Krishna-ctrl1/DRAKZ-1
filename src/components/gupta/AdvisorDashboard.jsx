import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClients, selectClient } from '../../redux/slices/advisorSlice';
import '../../styles/gupta/AdvisorDashboard.css';

const AdvisorDashboard = () => {
  const dispatch = useDispatch();
  
  // Get data from Redux Store
  const { clients, loading, error, selectedClient } = useSelector((state) => state.advisor);
  
  const [showModal, setShowModal] = useState(false);
  // Add Client local state (for form only)
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  // Fetch real data on mount
  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const handleClientClick = (client) => {
    dispatch(selectClient(client));
  };

  // Note: This needs a backend endpoint to persist. 
  // For now, we just log it as we are removing mock data logic.
  const handleAddClient = (e) => {
    e.preventDefault();
    alert("Backend endpoint for 'Add Client' is needed to save: " + formData.email);
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const PLACEHOLDER_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 120 120" fill="%23cccccc"><rect width="100%" height="100%" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20">User</text></svg>';

  if (loading && clients.length === 0) return <div style={{padding:'20px', color:'white'}}>Loading Clients from Database...</div>;
  if (error) return <div style={{padding:'20px', color:'red'}}>Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <header>
        <nav>
          <Link to="/advisor/dashboard" className="active">Your Clients</Link>
          <Link to="/advisor/video">Session Room</Link>
        </nav>
        <div className="header-right">
          <div className="user-icon">A</div>
        </div>
      </header>

      <div className="dashboard-main">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Clients ({clients.length})</h2>
            <button className="add-btn" onClick={() => setShowModal(true)}>+</button>
          </div>
          <div id="clientList">
            {clients.length === 0 ? (
              <div style={{color:'#888', padding:'10px'}}>No clients found in DB.</div>
            ) : (
              clients.map(client => (
                <div 
                  key={client._id} 
                  className={`client-item ${selectedClient?._id === client._id ? 'active' : ''}`}
                  onClick={() => handleClientClick(client)}
                >
                  <div className="client-avatar">
                    {client.name ? client.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="client-info-list">
                    <span className="client-name">{client.name || 'Unknown User'}</span>
                    <span style={{fontSize:'0.8rem', color:'#aaa'}}>{client.email}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="content">
          {!selectedClient ? (
            <div className="empty-state">
              <h3>Select a client to view details</h3>
            </div>
          ) : (
            <div className="client-details">
              <div className="client-header">
                <div className="client-profile">
                  <div className="profile-pic-large">
                     {selectedClient.name ? selectedClient.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="profile-info">
                    <h1>{selectedClient.name}</h1>
                    <span className="role-badge">{selectedClient.role}</span>
                    <p style={{color:'#888', fontSize:'0.9rem'}}>ID: {selectedClient._id}</p>
                  </div>
                </div>
                {/* Send User to Video Page with this client selected */}
                <Link to="/advisor/video" className="btn-primary" style={{textDecoration:'none'}}>
                  Start Session
                </Link>
              </div>

              <div className="info-grid">
                <div className="info-row">
                  <label>Email</label>
                  <p>{selectedClient.email}</p>
                </div>
                <div className="info-row">
                  <label>Joined</label>
                  <p>{new Date(selectedClient.created_at).toLocaleDateString()}</p>
                </div>
                {/* Add more real DB fields here */}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-btn" onClick={() => setShowModal(false)}>&times;</span>
            <h3>Add New Client</h3>
            <form onSubmit={handleAddClient}>
              <div className="form-group">
                <label>First Name</label>
                <input id="firstName" onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input id="email" type="email" onChange={handleInputChange} required />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="add-client-btn">Add (Mock)</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisorDashboard;