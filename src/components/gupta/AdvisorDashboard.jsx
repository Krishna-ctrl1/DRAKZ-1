import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClients, selectClient, fetchAdvisorStats, fetchAdvisorRequests } from '../../redux/slices/advisorSlice';
import Header from '../global/Header';
import Sidebar from '../global/Sidebar';
import AdvisorRequests from './AdvisorRequests';
import '../../styles/gupta/AdvisorDashboard.css';

const AdvisorDashboard = () => {
  const dispatch = useDispatch();
  const { clients, loading, selectedClient, stats, pendingRequests } = useSelector((state) => state.advisor);
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('clients'); // 'clients' or 'requests'

  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchAdvisorStats());
    dispatch(fetchAdvisorRequests());
  }, [dispatch]);

  const handleClientClick = (client) => {
    dispatch(selectClient(client));
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="advisor-page">
      <Header />
      <div className="app advisor-app">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={collapsed ? "main-content-collapsed" : "main-content"}>
          <div className="advisor-dashboard-content">

            {/* Dashboard Header */}
            <div className="dashboard-header">
              <div className="header-left">
                <h1>Advisor Dashboard</h1>
                <p>Manage your clients and requests</p>
              </div>
              <div className="header-right">
                <Link to="/advisor/video" className="live-session-btn">
                  <i className="fa-solid fa-tower-broadcast"></i>
                  Live Session
                </Link>
              </div>
            </div>

            {/* Stats Row */}
            <div className="advisor-stats-row">
              <div className="advisor-stat-card">
                <div className="stat-icon clients">
                  <i className="fa-solid fa-users"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.totalClients || clients.length}</span>
                  <span className="stat-label">Total Clients</span>
                </div>
              </div>
              <div className="advisor-stat-card">
                <div className="stat-icon pending">
                  <i className="fa-solid fa-user-plus"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.pendingRequests || pendingRequests.length}</span>
                  <span className="stat-label">Pending Requests</span>
                </div>
              </div>
              <div className="advisor-stat-card">
                <div className="stat-icon income">
                  <i className="fa-solid fa-indian-rupee-sign"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{formatCurrency(stats.totalClientIncome || 0)}</span>
                  <span className="stat-label">Total Client Income</span>
                </div>
              </div>
              <div className="advisor-stat-card">
                <div className="stat-icon sessions">
                  <i className="fa-solid fa-video"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.sessionsThisMonth || 0}</span>
                  <span className="stat-label">Sessions This Month</span>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="advisor-main-grid">

              {/* Left Panel - Clients/Requests */}
              <div className="clients-panel">
                <div className="panel-tabs">
                  <button
                    className={activeView === 'clients' ? 'active' : ''}
                    onClick={() => setActiveView('clients')}
                  >
                    <i className="fa-solid fa-users"></i>
                    Clients ({clients.length})
                  </button>
                  <button
                    className={activeView === 'requests' ? 'active' : ''}
                    onClick={() => setActiveView('requests')}
                  >
                    <i className="fa-solid fa-user-plus"></i>
                    Requests
                    {pendingRequests.length > 0 && <span className="badge">{pendingRequests.length}</span>}
                  </button>
                </div>

                {activeView === 'clients' ? (
                  <div className="clients-list">
                    {loading ? (
                      <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading clients...</p>
                      </div>
                    ) : clients.length === 0 ? (
                      <div className="empty-state">
                        <i className="fa-solid fa-users-slash"></i>
                        <p>No clients yet</p>
                        <span>Approve pending requests to add clients</span>
                      </div>
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
                          <div className="client-quick-stats">
                            <span className="income">{formatCurrency(client.monthlyIncome)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <AdvisorRequests />
                )}
              </div>

              {/* Right Panel - Selected Client Details */}
              <div className="client-detail-panel">
                {!selectedClient ? (
                  <div className="empty-state large">
                    <i className="fa-solid fa-hand-pointer"></i>
                    <h3>Select a Client</h3>
                    <p>Choose a client from the list to view their financial details</p>
                  </div>
                ) : (
                  <div className="client-detail-view">
                    {/* Header Card */}
                    <div className="detail-header">
                      <div className="profile-section">
                        <div className="avatar-large">
                          {selectedClient.name ? selectedClient.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="profile-text">
                          <h2>{selectedClient.name}</h2>
                          <span className="role-tag">{selectedClient.role?.toUpperCase()}</span>
                        </div>
                      </div>
                      <Link to="/advisor/video" className="start-session-btn">
                        <i className="fa-solid fa-video"></i>
                        Start Session
                      </Link>
                    </div>

                    {/* Key Stats Row - REAL DATA */}
                    <div className="stats-grid">
                      <div className="stat-box income">
                        <i className="fa-solid fa-arrow-up"></i>
                        <span className="label">Monthly Income</span>
                        <strong>{formatCurrency(selectedClient.monthlyIncome)}</strong>
                      </div>
                      <div className="stat-box expense">
                        <i className="fa-solid fa-arrow-down"></i>
                        <span className="label">Total Expenses</span>
                        <strong>{formatCurrency(selectedClient.totalExpense)}</strong>
                      </div>
                      <div className="stat-box balance">
                        <i className="fa-solid fa-wallet"></i>
                        <span className="label">Net Balance</span>
                        <strong style={{ color: selectedClient.balance >= 0 ? '#10b981' : '#ef4444' }}>
                          {formatCurrency(selectedClient.balance)}
                        </strong>
                      </div>
                    </div>

                    {/* Info Panels */}
                    <div className="info-grid">
                      {/* Financial Health */}
                      <div className="info-panel">
                        <h4><i className="fa-solid fa-heart-pulse"></i> Financial Health</h4>
                        <div className="data-row">
                          <span className="label">Credit Score</span>
                          <span className="value" style={{ color: selectedClient.creditScore > 700 ? '#10b981' : '#f59e0b' }}>
                            {selectedClient.creditScore || 'N/A'}
                          </span>
                        </div>
                        <div className="data-row">
                          <span className="label">Risk Profile</span>
                          <span className="value risk">{selectedClient.riskProfile || 'Moderate'}</span>
                        </div>
                        <div className="data-row">
                          <span className="label">Active Goals</span>
                          <span className="value">{selectedClient.activeGoals || 0}</span>
                        </div>
                        <div className="data-row">
                          <span className="label">Total Debt</span>
                          <span className="value debt">{formatCurrency(selectedClient.totalDebt)}</span>
                        </div>
                      </div>

                      {/* Personal Details */}
                      <div className="info-panel">
                        <h4><i className="fa-solid fa-user"></i> Personal Details</h4>
                        <div className="data-row">
                          <span className="label">Occupation</span>
                          <span className="value">{selectedClient.occupation || 'Unspecified'}</span>
                        </div>
                        <div className="data-row">
                          <span className="label">Email</span>
                          <span className="value email">{selectedClient.email}</span>
                        </div>
                        <div className="data-row">
                          <span className="label">Phone</span>
                          <span className="value">{selectedClient.phone || 'N/A'}</span>
                        </div>
                        <div className="data-row">
                          <span className="label">Client Since</span>
                          <span className="value">{new Date(selectedClient.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorDashboard;