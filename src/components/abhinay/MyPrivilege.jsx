// src/components/abhinay/MyPrivilege.jsx
import React, { useState, useEffect, useMemo } from "react";
import api from "../../api/axios.api.js"; 
import Header from "../global/Header";
import Sidebar from "../global/Sidebar";
import Modal from "../global/Modal";
import AddPropertyForm from "./AddPropertyForm";
import AddHoldingForm from "./AddHoldingForm";

// Import all the CSS files needed for this page
import "../../styles/abhinay/abhinay.css";
import "../../styles/global/Modal.css";
import "../../styles/deepthi/dashboard.css"; // For the main layout

const getTransactionIcon = (type) => {
  switch (type.toLowerCase()) {
    case 'expense': return 'fa-solid fa-fire';
    case 'investment': return 'fa-solid fa-seedling';
    case 'loan': return 'fa-solid fa-landmark';
    case 'insurance': return 'fa-solid fa-shield-halved';
    default: return 'fa-solid fa-dollar-sign';
  }
};

const MyPrivilege = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userData, setUserData] = useState({ name: "K.Raju" });
  const [allInsurances, setAllInsurances] = useState([]);
  const [properties, setProperties] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all data from the new /privilege routes
      const [insurancesRes, propertiesRes, holdingsRes, transactionsRes] = await Promise.all([
        api.get("/api/privilege/insurances"),
        api.get("/api/privilege/properties"),
        api.get("/api/privilege/precious_holdings"),
        api.get("/api/privilege/transactions?limit=4&sort=date_desc")
      ]);

      setAllInsurances(insurancesRes.data || []);
      setProperties(propertiesRes.data || []);
      setHoldings(holdingsRes.data || []);
      setTransactions(transactionsRes.data || []);
    } catch (err) {
      console.error("Error fetching privilege data:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- DATA PROCESSING ---
  const insuranceSummary = useMemo(() => {
    const summary = {
      auto: { count: 0, value: 0, trendUp: true, change: 5789 },
      health: { count: 0, value: 0, trendUp: false, change: -45209 },
    };

    allInsurances.forEach(policy => {
      if (policy.type === 'Auto') {
        summary.auto.count++;
        summary.auto.value += policy.coverageAmount || 0;
      } else if (policy.type === 'Health') {
        summary.health.count++;
        summary.health.value += policy.coverageAmount || 0;
      }
    });
    return summary;
  }, [allInsurances]);

  // --- API HANDLERS (INTERACTIVITY) ---
  const closeModal = () => setModalContent(null);

  const handleAddProperty = async (propertyData) => {
    try {
      const response = await api.post('/api/privilege/properties', propertyData);
      setProperties([...properties, response.data]);
      closeModal();
    } catch (err) {
      console.error("Error adding property:", err);
      alert("Failed to add property.");
    }
  };

  const handleRemoveProperty = async (propertyId) => {
    try {
      await api.delete(`/api/privilege/properties/${propertyId}`);
      setProperties(properties.filter(p => p._id !== propertyId));
      closeModal();
    } catch (err) {
      console.error("Error removing property:", err);
      alert("Failed to remove property.");
    }
  };

  const handleAddHolding = async (holdingData) => {
    try {
      // Frontend form sends 'date', map to 'purchaseDate'
      const dataToSend = {
        ...holdingData,
        purchaseDate: holdingData.date,
        amount: holdingData.weight, // Map weight to amount if needed by form
      };
      const response = await api.post('/api/privilege/precious_holdings', dataToSend);
      setHoldings([...holdings, response.data]);
      closeModal();
    } catch (err) {
      console.error("Error adding holding:", err);
      alert("Failed to add holding.");
    }
  };

  // --- MODAL OPENERS ---
  const openAddPropertyModal = () => {
    setModalContent(<AddPropertyForm onClose={closeModal} onSave={handleAddProperty} />);
  };

  const openAddHoldingModal = () => {
    // Note: Your AddHoldingForm might need to be updated to ask for 'weight' and 'currentValue'
    setModalContent(<AddHoldingForm onClose={closeModal} onSave={handleAddHolding} />);
  };

  const openRemovePropertyModal = (property) => {
    setModalContent(
      <div className="confirm-delete">
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to remove <strong>"{property.name}"</strong>?</p>
        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={closeModal}>Cancel</button>
          <button className="modal-btn confirm" onClick={() => handleRemoveProperty(property._id)}>
            Remove
          </button>
        </div>
      </div>
    );
  };

  // --- RENDER LOGIC ---
  const renderLoadingError = () => (
    <div className="dashboard-page privilege-page">
      <Header />
      <div className="app">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={collapsed ? "main-content-collapsed" : "main-content"}>
          {loading && <div className="loading-container">Loading your data...</div>}
          {error && <div className="error-container">{error}</div>}
        </div>
      </div>
    </div>
  );

  if (loading || error) {
    return renderLoadingError();
  }

  return (
    <div className="dashboard-page privilege-page">
      <Header />
      <div className="app">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={collapsed ? "main-content-collapsed" : "main-content"}>

          <div className="privilege-content-grid">
            <div className="privilege-main-column">
              <div className="privilege-header">
                <p>Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <div className="notification-icon">
                  <i className="fa-solid fa-bell"></i>
                  <span className="notification-dot"></span>
                </div>
              </div>

              <section className="privilege-section insurance-section">
                <h2>Available Insurances</h2>
                <div className="insurance-cards">
                  {allInsurances.length > 0 ? allInsurances.map(ins => (
                    <div className={`insurance-card ${ins.type.toLowerCase()}-insurance`} key={ins._id}>
                      <div className="card-header">
                        <i className={`fa-solid ${ins.type === 'Auto' ? 'fa-car' : 'fa-heart-pulse'}`}></i>
                        <div>
                          <h3>{ins.type} Insurances</h3>
                          <span>{ins.provider}</span>
                        </div>
                        <i className="fa-solid fa-chevron-right arrow-icon"></i>
                      </div>
                      <p className="insurance-value">${ins.coverageAmount.toLocaleString()}</p>
                      {/* Placeholder for chart */}
                      <div className="mini-chart placeholder-chart"></div> 
                      <p className="insurance-change positive">
                        <i className="fa-solid fa-arrow-trend-up"></i>
                        Premium: ${ins.premium.toLocaleString()} USD
                      </p>
                    </div>
                  )) : <p>No insurances found.</p>}
                </div>
              </section>

              <section className="privilege-section properties-section">
                <h2>Your Properties</h2>
                <div className="property-cards">
                  {properties.map((prop) => (
                    <div className="property-card" key={prop._id}>
                      <div className="property-image" style={{backgroundImage: `url(${prop.imageUrl || '/1.jpg'})`}}></div>
                      <h4>Name: {prop.name}</h4>
                      <p>Value: ${prop.value.toLocaleString()}</p>
                      <p>Location: {prop.location}</p>
                      <button className="remove-button" onClick={() => openRemovePropertyModal(prop)}>Remove</button>
                    </div>
                  ))}
                   <div className="property-card add-more-card" onClick={openAddPropertyModal}>
                     <i className="fa-solid fa-plus"></i>
                     <span>Add more</span>
                   </div>
                </div>
              </section>

              <section className="privilege-section holdings-section">
                <h2>Precious Holdings</h2>
                <table className="holdings-table">
                  <thead>
                    <tr>
                      <th>Holdings</th>
                      <th>Amount</th>
                      <th>Purchased Value</th>
                      <th>Current Value</th>
                      <th>Date of Purchase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.length > 0 ? holdings.map((item) => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>{item.weight}</td>
                        <td>₹{item.purchasedValue.toLocaleString('en-IN')}</td>
                        <td className="current-value">₹{item.currentValue.toLocaleString('en-IN')}</td>
                        <td>{new Date(item.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5">No holdings added yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </section>
            </div>

            <div className="privilege-sidebar-column">
               <div className="welcome-user">
                <p>"Welcome back, {userData.name}!"</p>
                <img src={userData.profilePic || "/1.jpg"} alt="User Profile" className="profile-pic" />
              </div>

              <div className="sidebar-transactions">
                <div className="transactions-header">
                  <button className="filter-btn small-btn">First</button>
                  <button className="filter-btn small-btn active-filter-btn">Last</button>
                   <button className="options-btn"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                </div>
                <div className="transaction-list-sidebar">
                  <div className="transaction-item-sidebar header-row">
                    <span>Type</span>
                    <span>Amount</span>
                    <span>Status</span>
                  </div>
                   {transactions.length > 0 ? transactions.map(tx => (
                     <div className="transaction-item-sidebar" key={tx._id}>
                       <span className="tx-icon"><i className={getTransactionIcon(tx.type)}></i></span>
                       <span className="tx-amount">${tx.amount.toLocaleString()}</span>
                       <span className={`tx-status ${tx.status.toLowerCase()}`}>{tx.status}</span>
                     </div>
                   )) : <p>No transactions.</p>}
                </div>
              </div>

               <div className="track-holdings">
                 <h4>Track Your Precious Holdings :</h4>
                 <p className="add-holdings-text">Want to add more Holdings</p>
                  <div className="add-more-holdings-box" onClick={openAddHoldingModal}>
                    <i className="fa-solid fa-plus"></i>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {modalContent && <Modal onClose={closeModal}>{modalContent}</Modal>}
    </div>
  );
};

export default MyPrivilege;