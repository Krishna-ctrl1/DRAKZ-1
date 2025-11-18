// ... imports ... (same as before)
import React, { useState, useEffect, useMemo } from "react";
import api from "../../api/axios.api.js"; 
import Header from "../global/Header";
import Sidebar from "../global/Sidebar";
import Modal from "../global/Modal";
import AddPropertyForm from "./AddPropertyForm";
import AddHoldingForm from "./AddHoldingForm";
import "../../styles/abhinay/abhinay.css";
import "../../styles/global/Modal.css";
import "../../styles/deepthi/dashboard.css";

const getTransactionIcon = (type) => {
  if (!type) return 'fa-solid fa-dollar-sign';
  switch (type.toLowerCase()) {
    case 'expense': return 'fa-solid fa-fire';
    case 'investment': return 'fa-solid fa-seedling';
    case 'loan': return 'fa-solid fa-landmark';
    case 'insurance': return 'fa-solid fa-shield-halved';
    case 'income': return 'fa-solid fa-wallet';
    default: return 'fa-solid fa-dollar-sign';
  }
};

const MyPrivilege = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({ name: "John Drakz" });

  const [allInsurances, setAllInsurances] = useState([]);
  const [properties, setProperties] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [insurancesRes, propertiesRes, holdingsRes, transactionsRes] = await Promise.all([
        api.get("/api/privilege/insurances"),
        api.get("/api/privilege/properties"),
        api.get("/api/privilege/precious_holdings"),
        api.get("/api/privilege/transactions?limit=5")
      ]);

      setAllInsurances(insurancesRes.data || []);
      setProperties(propertiesRes.data || []);
      setHoldings(holdingsRes.data || []);
      setTransactions(transactionsRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- MODIFIED: Seed ONLY Insurances ---
  const handleSeedData = async () => {
    try {
      setLoading(true);
      await api.post('/api/privilege/seed'); // Calls the new controller function
      await fetchData();
    } catch (err) {
      alert("Failed to generate data");
    } finally {
      setLoading(false);
    }
  };

  // --- EXISTING HANDLERS (Same as before) ---
  const closeModal = () => setModalContent(null);
  const handleAddProperty = async (data) => {
    await api.post('/api/privilege/properties', data);
    fetchData(); closeModal();
  };
  const handleRemoveProperty = async (id) => {
    await api.delete(`/api/privilege/properties/${id}`);
    fetchData(); closeModal();
  };
  const handleAddHolding = async (data) => {
    await api.post('/api/privilege/precious_holdings', { ...data, purchaseDate: data.date, amount: data.weight });
    fetchData(); closeModal();
  };

  const openAddPropertyModal = () => setModalContent(<AddPropertyForm onClose={closeModal} onSave={handleAddProperty} />);
  const openAddHoldingModal = () => setModalContent(<AddHoldingForm onClose={closeModal} onSave={handleAddHolding} />);
  const openRemovePropertyModal = (prop) => {
    setModalContent(
      <div className="confirm-delete">
        <h2>Remove Property?</h2>
        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={closeModal}>Cancel</button>
          <button className="modal-btn confirm" onClick={() => handleRemoveProperty(prop._id)}>Remove</button>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-page privilege-page">
      <Header />
      <div className="app">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={collapsed ? "main-content-collapsed" : "main-content"}>
          
          <div className="privilege-content-grid">
            <div className="privilege-main-column">
              <div className="privilege-header">
                <div className="header-left">
                   <h2>My Privilege Dashboard</h2>
                   <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                {/* Updated Button Label */}
                <button className="seed-btn" onClick={handleSeedData}>
                  <i className="fa-solid fa-wand-magic-sparkles"></i> Generate Insurances
                </button>
              </div>

              <section className="privilege-section">
                <h3>Insurances</h3>
                <div className="insurance-cards">
                  {allInsurances.length > 0 ? allInsurances.map(ins => (
                    <div className={`insurance-card ${ins.type.toLowerCase()}-insurance`} key={ins._id}>
                      <div className="card-icon"><i className={`fa-solid ${ins.type === 'Auto' ? 'fa-car' : 'fa-heart-pulse'}`}></i></div>
                      <div className="card-info">
                        <h4>{ins.type} Insurance</h4>
                        <p>{ins.provider}</p>
                        <span className="card-value">${ins.coverageAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  )) : <p>No insurances found.</p>}
                </div>
              </section>

              <section className="privilege-section">
                <h3>Your Properties</h3>
                <div className="property-cards">
                  {properties.map((prop) => (
                    <div className="property-card" key={prop._id}>
                      <div className="prop-img" style={{backgroundImage: `url(${prop.imageUrl})`}}></div>
                      <div className="prop-details">
                        <h4>{prop.name}</h4>
                        <p>{prop.location}</p>
                        <span>${prop.value.toLocaleString()}</span>
                        <button className="delete-btn" onClick={() => openRemovePropertyModal(prop)}><i className="fa-solid fa-trash"></i></button>
                      </div>
                    </div>
                  ))}
                   <div className="property-card add-card" onClick={openAddPropertyModal}>
                     <i className="fa-solid fa-plus"></i>
                     <span>Add New</span>
                   </div>
                </div>
              </section>

              <section className="privilege-section">
                <h3>Precious Holdings</h3>
                <table className="holdings-table">
                  <thead>
                    <tr><th>Item</th><th>Weight</th><th>Bought At</th><th>Current Value</th></tr>
                  </thead>
                  <tbody>
                    {holdings.map((h) => (
                      <tr key={h._id}>
                        <td>{h.name}</td>
                        <td>{h.weight}</td>
                        <td>${h.purchasedValue.toLocaleString()}</td>
                        <td className="positive-val">${h.currentValue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {holdings.length === 0 && <p className="no-data">No holdings yet.</p>}
              </section>
            </div>

            <div className="privilege-sidebar-column">
               <div className="user-welcome">
                 <img src="/1.jpg" alt="User" />
                 <div>
                   <h4>Welcome, {userData.name}</h4>
                   <p>Premium Member</p>
                 </div>
               </div>

               <div className="recent-transactions">
                 <div className="section-title">
                   <h4>Recent Transactions</h4>
                   <i className="fa-solid fa-ellipsis"></i>
                 </div>
                 <div className="tx-list">
                   {transactions.map(tx => (
                     <div className="tx-item" key={tx._id}>
                       <div className={`tx-icon-box ${tx.type.toLowerCase()}`}>
                         <i className={getTransactionIcon(tx.type)}></i>
                       </div>
                       <div className="tx-info">
                         <h5>{tx.description || tx.type}</h5>
                         <span>{new Date(tx.date).toLocaleDateString()}</span>
                       </div>
                       <div className={`tx-amount ${tx.type === 'Income' ? 'pos' : 'neg'}`}>
                         {tx.type === 'Income' ? '+' : '-'}${tx.amount.toLocaleString()}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="quick-add" onClick={openAddHoldingModal}>
                 <i className="fa-solid fa-plus-circle"></i>
                 <span>Add New Holding</span>
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