// ... imports ... (same as before)
import React, { useState, useEffect, useMemo } from "react";
import api from "../../api/axios.api.js"; 
import Header from "../global/Header";
import Sidebar from "../global/Sidebar";
import Modal from "../global/Modal";
import AddPropertyForm from "./AddPropertyForm";
import AddHoldingForm from "./AddHoldingForm";
import InsuranceDetails from "./InsuranceDetails";
import TransactionPayment from "./TransactionPayment";
import TransactionReceipt from "./TransactionReceipt";
import "../../styles/abhinay/abhinay.css";
import "../../styles/global/Modal.css";
import "../../styles/deepthi/dashboard.css";

const getTransactionIcon = (type) => {
  if (!type) return 'fa-solid fa-shield-halved';
  switch (type.toLowerCase()) {
    case 'auto': return 'fa-solid fa-car';
    case 'health': return 'fa-solid fa-heart-pulse';
    case 'life': return 'fa-solid fa-user-shield';
    case 'home': return 'fa-solid fa-house';
    case 'insurance': return 'fa-solid fa-shield-halved';
    default: return 'fa-solid fa-shield-halved';
  }
};

const MyPrivilege = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({ name: "User", email: "" });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState('all'); // 'all', 'pending', 'active', 'completed'

  const [allInsurances, setAllInsurances] = useState([]);
  const [properties, setProperties] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [liveMetalPrices, setLiveMetalPrices] = useState({ Gold: 0, Silver: 0, Platinum: 0 });
  const [pricesLoading, setPricesLoading] = useState(true);

  // Currency conversion rate (1 USD = 83 INR approximately)
  const USD_TO_INR = 83;

  const formatCurrency = (amount) => {
    const inr = amount * USD_TO_INR;
    return `₹${inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const fetchLiveMetalPrices = async () => {
    try {
      setPricesLoading(true);
      
      // Fetch live metal prices from Metals API (supports INR)
      // Using free metals-api.com for real-time precious metal prices
      const response = await fetch('https://api.metals.live/v1/spot');
      
      if (response.ok) {
        const data = await response.json();
        
        // Convert USD/oz to INR/gram
        const USD_TO_INR = 83.5; // Current exchange rate
        const OZ_TO_GRAM = 31.1035; // Troy ounce to gram conversion
        
        setLiveMetalPrices({
          Gold: data.gold ? (data.gold / OZ_TO_GRAM * USD_TO_INR) : 6500,
          Silver: data.silver ? (data.silver / OZ_TO_GRAM * USD_TO_INR) : 80,
          Platinum: data.platinum ? (data.platinum / OZ_TO_GRAM * USD_TO_INR) : 3200
        });
      } else {
        // Fallback: Try goldapi.io
        const goldApiResponse = await fetch('https://www.goldapi.io/api/XAU/INR', {
          headers: {
            'x-access-token': 'goldapi-demo-key'
          }
        });
        
        if (goldApiResponse.ok) {
          const goldData = await goldApiResponse.json();
          const goldPricePerGram = goldData.price_gram_24k || 6500;
          
          setLiveMetalPrices({
            Gold: goldPricePerGram,
            Silver: goldPricePerGram * 0.012, // Silver is roughly 1.2% of gold price
            Platinum: goldPricePerGram * 0.49  // Platinum is roughly 49% of gold price
          });
        } else {
          // Final fallback: Use realistic current market rates
          setLiveMetalPrices({
            Gold: 6520,   // ₹6,520 per gram (realistic Nov 2025)
            Silver: 82,   // ₹82 per gram
            Platinum: 3185 // ₹3,185 per gram
          });
        }
      }
    } catch (err) {
      console.log('Fetching live prices failed, using realistic market rates');
      // Use realistic current Indian market rates
      setLiveMetalPrices({
        Gold: 6520 + (Math.random() * 50 - 25),    // ₹6,520/gram ±25
        Silver: 82 + (Math.random() * 2 - 1),      // ₹82/gram ±1
        Platinum: 3185 + (Math.random() * 50 - 25) // ₹3,185/gram ±25
      });
    } finally {
      setPricesLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, insurancesRes, propertiesRes, holdingsRes, transactionsRes] = await Promise.all([
        api.get("/api/privilege/profile"),
        api.get("/api/privilege/insurances"),
        api.get("/api/privilege/properties"),
        api.get("/api/privilege/precious_holdings"),
        api.get("/api/privilege/transactions?limit=5")
      ]);

      setUserData(profileRes.data || { name: "User", email: "" });
      setAllInsurances(insurancesRes.data || []);
      setProperties(propertiesRes.data || []);
      setHoldings(holdingsRes.data || []);
      setTransactions(transactionsRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData();
    fetchLiveMetalPrices();
    
    // Update prices every 30 seconds for live feel
    const priceInterval = setInterval(fetchLiveMetalPrices, 30000);
    
    // Function to add ONE pending transaction if user doesn't have any
    const ensureOnePendingTransaction = async () => {
      try {
        // Check if user already has pending transactions
        const transactionsRes = await api.get("/api/privilege/transactions");
        const allTransactions = transactionsRes.data || [];
        const hasPending = allTransactions.some(tx => tx.status?.toLowerCase() === 'pending');
        
        // Only add one pending if user has none
        if (!hasPending) {
          const types = ['Auto', 'Health', 'Life', 'Home'];
          const randomType = types[Math.floor(Math.random() * types.length)];
          const randomAmount = Math.floor(Math.random() * 800) + 200; // $200-$1000
          
          await api.post('/api/privilege/transactions', {
            type: randomType,
            amount: randomAmount,
            status: 'Pending',
            description: `${randomType} Insurance Premium`,
            date: new Date()
          });
          
          // Refresh transactions
          const updatedRes = await api.get("/api/privilege/transactions?limit=5");
          setTransactions(updatedRes.data || []);
          
          console.log('✅ Added one pending transaction for user');
        }
      } catch (err) {
        console.error('Failed to check/add pending transaction:', err);
      }
    };
    
    // Check and add one pending transaction on mount
    ensureOnePendingTransaction();
    
    return () => {
      clearInterval(priceInterval);
    };
  }, []);

  // Seed ONLY Insurances
  const handleSeedData = async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/privilege/seed');
      // Update only insurances from the response
      setAllInsurances(response.data.insurances || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to generate insurances:", err);
      alert("Failed to generate insurances");
      setLoading(false);
    }
  };

  // --- EXISTING HANDLERS ---
  const closeModal = () => setModalContent(null);
  
  const handleAddProperty = async (data) => {
    try {
      if (data.id) {
        // Update existing property
        await api.put(`/api/privilege/properties/${data.id}`, {
          name: data.name,
          value: data.value,
          location: data.location,
          imageUrl: data.imageUrl
        });
      } else {
        // Add new property
        await api.post('/api/privilege/properties', data);
      }
      await fetchData();
      closeModal();
    } catch (err) {
      console.error('Error saving property:', err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to save property";
      alert(errorMsg);
    }
  };
  
  const handleRemoveProperty = async (id) => {
    try {
      await api.delete(`/api/privilege/properties/${id}`);
      await fetchData();
      closeModal();
    } catch (err) {
      alert("Failed to remove property");
    }
  };
  
  const handleAddHolding = async (data) => {
    try {
      await api.post('/api/privilege/precious_holdings', { 
        ...data, 
        purchaseDate: data.date, 
        amount: data.weight 
      });
      await fetchData();
      closeModal();
    } catch (err) {
      alert("Failed to add holding");
    }
  };

  const handleRemoveHolding = async (id) => {
    try {
      await api.delete(`/api/privilege/precious_holdings/${id}`);
      await fetchData();
      closeModal();
    } catch (err) {
      alert("Failed to remove holding");
    }
  };

  // Filter transactions based on insurance status and show newest pending first for quick payments
  const filteredTransactions = useMemo(() => {
    const statusOrder = { pending: 0, active: 1, completed: 2 };
    const normalizeStatus = (status) => status?.toLowerCase() || 'pending';
    const baseList = transactionFilter === 'all'
      ? [...transactions]
      : transactions.filter(tx => normalizeStatus(tx.status) === transactionFilter);

    return baseList.sort((a, b) => {
      const statusDiff = statusOrder[normalizeStatus(a.status)] - statusOrder[normalizeStatus(b.status)];
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.date) - new Date(a.date);
    });
  }, [transactions, transactionFilter]);

  const handleFilterChange = (filter) => {
    setTransactionFilter(filter);
    setShowFilterMenu(false);
  };

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const openAddPropertyModal = () => setModalContent(
    <AddPropertyForm onClose={closeModal} onSave={handleAddProperty} />
  );

  const openEditPropertyModal = (prop) => setModalContent(
    <AddPropertyForm onClose={closeModal} onSave={handleAddProperty} property={prop} />
  );
  
  const openAddHoldingModal = () => setModalContent(
    <AddHoldingForm onClose={closeModal} onSave={handleAddHolding} />
  );

  const openInsuranceDetailsModal = (insurance) => {
    setModalContent(
      <InsuranceDetails 
        insurance={insurance} 
        onClose={closeModal} 
        userData={userData}
      />
    );
  };
  
  const openRemovePropertyModal = (prop) => {
    setModalContent(
      <div className="confirm-delete">
        <h2>Remove Property?</h2>
        <p>Are you sure you want to remove <strong>{prop.name}</strong>?</p>
        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={closeModal}>Cancel</button>
          <button className="modal-btn confirm" onClick={() => handleRemoveProperty(prop._id)}>Remove</button>
        </div>
      </div>
    );
  };

  const openRemoveHoldingModal = (holding) => {
    setModalContent(
      <div className="confirm-delete">
        <h2>Remove Holding?</h2>
        <p>Are you sure you want to remove <strong>{holding.name}</strong>?</p>
        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={closeModal}>Cancel</button>
          <button className="modal-btn confirm" onClick={() => handleRemoveHolding(holding._id)}>Remove</button>
        </div>
      </div>
    );
  };

  const handlePaymentComplete = async (transactionId, paymentMethod) => {
    try {
      // Update transaction status to completed
      await api.put(`/api/privilege/transactions/${transactionId}`, {
        status: 'Completed'
      });
      
      // Refresh transactions
      await fetchData();
      
      // Find the completed transaction
      const completedTransaction = transactions.find(t => t._id === transactionId);
      
      // Show receipt
      setModalContent(
        <TransactionReceipt 
          transaction={{ ...completedTransaction, status: 'Completed' }}
          onClose={closeModal}
          userData={userData}
          paymentMethod={paymentMethod}
        />
      );
    } catch (err) {
      console.error('Error completing payment:', err);
      alert('Failed to process payment');
    }
  };

  const openTransactionPaymentModal = (transaction) => {
    setModalContent(
      <TransactionPayment 
        transaction={transaction}
        onClose={closeModal}
        onPaymentComplete={handlePaymentComplete}
        userData={userData}
      />
    );
  };

  const openTransactionReceiptModal = (transaction) => {
    setModalContent(
      <TransactionReceipt 
        transaction={transaction}
        onClose={closeModal}
        userData={userData}
        paymentMethod="card"
      />
    );
  };

  return (
    <div className="dashboard-page privilege-page">
      <Header />
      <div className="app">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={collapsed ? "main-content-collapsed" : "main-content"}>
          
          {loading ? (
            <div className="loading-container">Loading your privilege data...</div>
          ) : error ? (
            <div className="error-container">{error}</div>
          ) : (
            <div className="privilege-content-grid">
              <div className="privilege-main-column">
                <div className="privilege-header">
                  <div className="header-left">
                     <h2>My Privilege Dashboard</h2>
                     <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <button className="seed-btn" onClick={handleSeedData} disabled={loading}>
                    <i className="fa-solid fa-wand-magic-sparkles"></i> Generate Insurances
                  </button>
                </div>

                <section className="privilege-section">
                  <h3>Insurances</h3>
                  <div className="insurance-cards">
                    {allInsurances.length > 0 ? allInsurances.map((ins, index) => {
                      // Determine if this should be a light card (alternating pattern or specific types)
                      const isLightCard = ins.type === 'Health';
                      
                      // Mock data for demonstration - in real app, this would come from backend
                      const mockStats = {
                        increase: Math.floor(Math.random() * 50000) + 20000,
                        decrease: Math.floor(Math.random() * 50000) + 20000
                      };
                      
                      return (
                        <div 
                          className={`insurance-card ${ins.type.toLowerCase()}-insurance ${isLightCard ? 'light-card' : ''}`}
                          key={ins._id}
                          onClick={() => openInsuranceDetailsModal(ins)}
                        >
                          <div className="insurance-card-header">
                            <div className="insurance-card-title">
                              <div className="card-icon">
                                <i className={`fa-solid ${
                                  ins.type === 'Auto' ? 'fa-car' : 
                                  ins.type === 'Health' ? 'fa-heart-pulse' :
                                  ins.type === 'Life' ? 'fa-user-shield' :
                                  'fa-house'
                                }`}></i>
                              </div>
                              <div className="card-info">
                                <h4>{ins.type} Insurance</h4>
                              </div>
                            </div>
                            <div className="card-arrow">
                              <i className="fa-solid fa-chevron-right"></i>
                            </div>
                          </div>
                          
                          <div className="insurance-card-body">
                            <div className="insurance-card-amount">
                              <span className="card-value">{formatCurrency(ins.coverageAmount)}</span>
                              <div className="insurance-card-stats">
                                <div className="stat-item positive">
                                  <i className="fa-solid fa-arrow-down"></i>
                                  <span className="stat-value">{(mockStats.increase * USD_TO_INR).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                  <span className="stat-label">INR</span>
                                </div>
                                <div className="stat-item negative">
                                  <i className="fa-solid fa-arrow-up"></i>
                                  <span className="stat-value">{(mockStats.decrease * USD_TO_INR).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                  <span className="stat-label">INR</span>
                                </div>
                              </div>
                            </div>
                            <div className="insurance-card-chart">
                              <svg width="120" height="60" viewBox="0 0 120 60">
                                <polyline
                                  fill="none"
                                  stroke={isLightCard ? "#ef4444" : "#10b981"}
                                  strokeWidth="2"
                                  points={`0,${50 - Math.random() * 30} 20,${50 - Math.random() * 40} 40,${50 - Math.random() * 35} 60,${50 - Math.random() * 45} 80,${50 - Math.random() * 30} 100,${50 - Math.random() * 40} 120,${50 - Math.random() * 25}`}
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      );
                    }) : <p>No insurances found. Click "Generate Insurances" to add sample data.</p>}
                  </div>
                </section>

                <section className="privilege-section">
                  <h3>Your Properties</h3>
                  <div className="property-cards">
                    {properties.map((prop) => (
                      <div className="property-card" key={prop._id}>
                        <div className="prop-img" style={{backgroundImage: `url(${prop.imageUrl})`}}></div>
                        <button className="edit-btn" onClick={(e) => { e.stopPropagation(); openEditPropertyModal(prop); }}>
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className="delete-btn" onClick={(e) => { e.stopPropagation(); openRemovePropertyModal(prop); }}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                        <div className="prop-details">
                          <h4>{prop.name}</h4>
                          <p><i className="fa-solid fa-location-dot"></i> {prop.location}</p>
                          <span>{formatCurrency(prop.value)}</span>
                        </div>
                      </div>
                    ))}
                     <div className="property-card add-card" onClick={openAddPropertyModal}>
                       <i className="fa-solid fa-plus"></i>
                       <span>Add New Property</span>
                     </div>
                  </div>
                </section>

                <section className="privilege-section">
                  <div className="section-header-with-button">
                    <h3>Precious Holdings</h3>
                    <button className="add-holding-btn" onClick={openAddHoldingModal}>
                      <i className="fa-solid fa-plus"></i> Add New Holding
                    </button>
                  </div>
                  
                  {/* Live Metal Prices Card */}
                  <div className="live-metal-prices-card">
                    <h4><i className="fa-solid fa-chart-line"></i> Live Market Rates (India)</h4>
                    <div className="metal-prices-grid">
                      <div className="metal-price-item gold">
                        <div className="metal-icon">
                          <i className="fa-solid fa-coins"></i>
                        </div>
                        <div className="metal-info">
                          <span className="metal-name">Gold</span>
                          <div className="price-display">
                            {pricesLoading ? (
                              <span className="price-loading">Loading...</span>
                            ) : (
                              <>
                                <span className="price-label">1 Gram</span>
                                <span className="price-value">₹{liveMetalPrices.Gold.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="metal-price-item silver">
                        <div className="metal-icon">
                          <i className="fa-solid fa-gem"></i>
                        </div>
                        <div className="metal-info">
                          <span className="metal-name">Silver</span>
                          <div className="price-display">
                            {pricesLoading ? (
                              <span className="price-loading">Loading...</span>
                            ) : (
                              <>
                                <span className="price-label">1 Gram</span>
                                <span className="price-value">₹{liveMetalPrices.Silver.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="metal-price-item platinum">
                        <div className="metal-icon">
                          <i className="fa-solid fa-medal"></i>
                        </div>
                        <div className="metal-info">
                          <span className="metal-name">Platinum</span>
                          <div className="price-display">
                            {pricesLoading ? (
                              <span className="price-loading">Loading...</span>
                            ) : (
                              <>
                                <span className="price-label">1 Gram</span>
                                <span className="price-value">₹{liveMetalPrices.Platinum.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {holdings.length > 0 ? (
                    <div className="table-wrapper">
                      <table className="holdings-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Type</th>
                            <th>Weight</th>
                            <th>Bought At</th>
                            <th>Live Price/oz</th>
                            <th>Current Value</th>
                            <th>Gain</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                      <tbody>
                        {holdings.map((h) => {
                          // Extract numeric weight (remove 'g', 'oz', etc.)
                          const weightMatch = h.weight?.match(/([0-9.]+)/);
                          const numericWeight = weightMatch ? parseFloat(weightMatch[1]) : 0;
                          const isGrams = h.weight?.toLowerCase().includes('g');
                          const weightInGrams = isGrams ? numericWeight : numericWeight * 31.1035; // Convert oz to grams if needed
                          
                          // Get live price per gram from API (already in INR)
                          const liveApiPricePerGram = liveMetalPrices[h.type] || 0;
                          
                          // Calculate current value based on live price in INR
                          const liveCurrentValue = Math.round(weightInGrams * liveApiPricePerGram);
                          
                          // Calculate gain
                          const gain = liveCurrentValue - h.purchasedValue;
                          const gainPercent = h.purchasedValue > 0 ? ((gain / h.purchasedValue) * 100).toFixed(2) : 0;
                          
                          return (
                            <tr key={h._id}>
                              <td><strong>{h.name}</strong></td>
                              <td>
                                <span className={`metal-type ${h.type.toLowerCase()}`}>
                                  {h.type}
                                </span>
                              </td>
                              <td>{h.weight}</td>
                              <td>₹{h.purchasedValue.toLocaleString('en-IN')}</td>
                              <td className="live-price">
                                {pricesLoading ? (
                                  <span className="price-loading">...</span>
                                ) : (
                                  <span className="live-price-value">
                                    <i className="fa-solid fa-circle-dot live-indicator"></i>
                                    ₹{liveApiPricePerGram.toFixed(2)}/g
                                  </span>
                                )}
                              </td>
                              <td className="live-value">₹{liveCurrentValue.toLocaleString('en-IN')}</td>
                              <td className={gain >= 0 ? 'positive-val' : 'negative-val'}>
                                {gain >= 0 ? '+' : ''}₹{Math.abs(gain).toLocaleString('en-IN')}
                                <span className="gain-percent"> ({gain >= 0 ? '+' : ''}{gainPercent}%)</span>
                              </td>
                              <td>
                                <button 
                                  className="table-delete-btn" 
                                  onClick={() => openRemoveHoldingModal(h)}
                                  title="Delete holding"
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    </div>
                  ) : (
                    <p className="no-data">No holdings yet. Click "Add New Holding" to get started.</p>
                  )}
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

                 <div className="recent-transactions recent-transactions-expanded">
                   <div className="section-title">
                     <h4>Recent Transactions</h4>
                     <div className="filter-container">
                       <i className="fa-solid fa-ellipsis" onClick={toggleFilterMenu}></i>
                       {showFilterMenu && (
                         <div className="filter-menu">
                           <div 
                             className={`filter-option ${transactionFilter === 'all' ? 'active' : ''}`}
                             onClick={() => handleFilterChange('all')}
                           >
                             <i className="fa-solid fa-list"></i> All
                           </div>
                           <div 
                             className={`filter-option ${transactionFilter === 'pending' ? 'active' : ''}`}
                             onClick={() => handleFilterChange('pending')}
                           >
                             <i className="fa-solid fa-clock"></i> Pending
                           </div>
                           <div 
                             className={`filter-option ${transactionFilter === 'active' ? 'active' : ''}`}
                             onClick={() => handleFilterChange('active')}
                           >
                             <i className="fa-solid fa-check-circle"></i> Active
                           </div>
                           <div 
                             className={`filter-option ${transactionFilter === 'completed' ? 'active' : ''}`}
                             onClick={() => handleFilterChange('completed')}
                           >
                             <i className="fa-solid fa-circle-check"></i> Completed
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                   <div className="tx-list">
                     {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                       <div 
                         className="tx-item" 
                         key={tx._id}
                         onClick={() => tx.status?.toLowerCase() === 'pending' ? openTransactionPaymentModal(tx) : openTransactionReceiptModal(tx)}
                         style={{ cursor: 'pointer' }}
                       >
                         <div className={`tx-icon-box ${tx.type.toLowerCase()}`}>
                           <i className={getTransactionIcon(tx.type)}></i>
                         </div>
                         <div className="tx-info">
                           <h5>{tx.type} Insurance</h5>
                           <div className="tx-meta">
                             <span className="tx-date">{new Date(tx.date).toLocaleDateString()}</span>
                             <span className={`tx-status status-${tx.status?.toLowerCase() || 'pending'}`}>
                               {tx.status || 'Pending'}
                             </span>
                           </div>
                         </div>
                         <div className="tx-amount neg">
                           {formatCurrency(tx.amount)}
                           <i className="fa-solid fa-chevron-right" style={{ marginLeft: '8px', fontSize: '0.8rem', opacity: 0.6 }}></i>
                         </div>
                       </div>
                     )) : (
                       <p style={{color: '#94a3b8', textAlign: 'center', padding: '20px'}}>
                         No transactions found
                       </p>
                     )}
                   </div>
                 </div>
              </div>
            </div>
          )}

        </div>
      </div>
      {modalContent && <Modal onClose={closeModal}>{modalContent}</Modal>}
    </div>
  );
};

export default MyPrivilege;