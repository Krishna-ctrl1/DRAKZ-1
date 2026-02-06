// ... imports ... (same as before)
import React, { useState, useEffect, useMemo, useRef } from "react";
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

const FALLBACK_METAL_PRICES = {
  Gold: 15442,
  Silver: 400,
  Platinum: 5961,
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
  const [liveMetalPrices, setLiveMetalPrices] = useState({ ...FALLBACK_METAL_PRICES });
  const [previousPrices, setPreviousPrices] = useState({ ...FALLBACK_METAL_PRICES });
  const [priceChanges, setPriceChanges] = useState({ Gold: 0, Silver: 0, Platinum: 0 });
  const [pricesLoading, setPricesLoading] = useState(true);
  const [metalPriceSource, setMetalPriceSource] = useState(null);
  const [metalPriceUpdatedAt, setMetalPriceUpdatedAt] = useState(null);
  const [metalPriceError, setMetalPriceError] = useState(null);
  const lastKnownPricesRef = useRef({ ...FALLBACK_METAL_PRICES });
  const [minWeightFilter, setMinWeightFilter] = useState(0);

  // Currency conversion rate (1 USD = 83 INR approximately)
  const USD_TO_INR = 83;

  const formatCurrency = (amount) => {
    const inr = amount * USD_TO_INR;
    return `₹${inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const sanitizePrice = (value, fallbackValue, metalKey) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Number(parsed.toFixed(2));
    }
    const fallbackParsed = Number(fallbackValue);
    if (Number.isFinite(fallbackParsed) && fallbackParsed > 0) {
      return Number(fallbackParsed.toFixed(2));
    }
    return FALLBACK_METAL_PRICES[metalKey];
  };

  const parseWeightToGrams = (weightValue = "") => {
    const match = weightValue?.match(/([0-9.]+)/);
    const numeric = match ? parseFloat(match[1]) : 0;
    if (!Number.isFinite(numeric)) return 0;
    const isGramUnit = weightValue?.toLowerCase().includes("g");
    if (isGramUnit) return numeric;
    const isOunceUnit = weightValue?.toLowerCase().includes("oz");
    if (isOunceUnit) return numeric * 31.1035;
    return numeric; // default assume grams
  };

  const maxWeightValue = useMemo(() => {
    if (!holdings?.length) return 0;
    return holdings.reduce((max, holding) => {
      const grams = parseWeightToGrams(holding.weight);
      return grams > max ? grams : max;
    }, 0);
  }, [holdings]);

  const filteredHoldings = useMemo(() => {
    if (!holdings?.length) return [];
    return holdings.filter((holding) => parseWeightToGrams(holding.weight) >= minWeightFilter);
  }, [holdings, minWeightFilter]);

  useEffect(() => {
    if (minWeightFilter > maxWeightValue) {
      setMinWeightFilter(Math.floor(maxWeightValue));
    }
  }, [maxWeightValue, minWeightFilter]);

  const applyLivePriceSnapshot = (prices = {}, sourceLabel, updatedAtLabel) => {
    const previous = lastKnownPricesRef.current;
    const normalized = {
      Gold: sanitizePrice(prices.Gold ?? prices.gold, previous.Gold, 'Gold'),
      Silver: sanitizePrice(prices.Silver ?? prices.silver, previous.Silver, 'Silver'),
      Platinum: sanitizePrice(prices.Platinum ?? prices.platinum, previous.Platinum, 'Platinum'),
    };
    
    // Calculate price changes for trend indicators
    const changes = {
      Gold: normalized.Gold - previous.Gold,
      Silver: normalized.Silver - previous.Silver,
      Platinum: normalized.Platinum - previous.Platinum,
    };
    
    setPreviousPrices({ ...previous });
    setPriceChanges(changes);
    lastKnownPricesRef.current = normalized;
    setLiveMetalPrices(normalized);
    setMetalPriceSource(sourceLabel || 'Live market feed');
    setMetalPriceUpdatedAt(updatedAtLabel || new Date().toISOString());
  };

  const fetchLiveMetalPrices = async () => {
    try {
      // Clear existing prices to force fresh update
      setLiveMetalPrices({ Gold: 0, Silver: 0, Platinum: 0 });
      setPricesLoading(true);
      console.log('[MetalPrices] Fetching live metal prices...');
      
      // Add cache busting with timestamp to force fresh data
      const cacheBuster = `?_t=${Date.now()}`;
      const response = await api.get(`/api/privilege/live-metal-prices${cacheBuster}`);
      console.log('[MetalPrices] Response received:', response.data);
      
      if (response.data?.prices) {
        applyLivePriceSnapshot(
          response.data.prices,
          response.data.source || 'Live market feed',
          response.data.updatedAt
        );
        setMetalPriceError(null);
        console.log('[MetalPrices] Prices updated successfully:', response.data.prices);
      } else {
        console.warn('[MetalPrices] No prices in response, using fallback');
        applyLivePriceSnapshot(
          lastKnownPricesRef.current,
          'Fallback values',
          new Date().toISOString()
        );
      }
    } catch (err) {
      console.error('[MetalPrices] Failed to fetch live metal prices:', err);
      console.error('[MetalPrices] Error details:', err.response?.data || err.message);
      
      // Apply last known values with error message
      applyLivePriceSnapshot(
        lastKnownPricesRef.current,
        metalPriceSource || 'Fallback snapshot',
        metalPriceUpdatedAt || new Date().toISOString()
      );
      setMetalPriceError('Unable to refresh live market rates right now. Showing last known values.');
    } finally {
      setPricesLoading(false);
      console.log('[MetalPrices] Loading complete, pricesLoading set to false');
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
    
    // Update prices every 30 seconds for real-time India market rates
    const priceInterval = setInterval(fetchLiveMetalPrices, 30000);
    
    // Simulate micro price fluctuations every 5 seconds for realistic market feel
    const microFluctuationInterval = setInterval(() => {
      setLiveMetalPrices(prev => {
        const fluctuate = (price) => {
          // Random fluctuation between -0.2% to +0.2%
          const changePercent = (Math.random() - 0.5) * 0.4;
          const newPrice = price * (1 + changePercent / 100);
          return Math.round(newPrice * 100) / 100;
        };
        
        const newPrices = {
          Gold: fluctuate(prev.Gold),
          Silver: fluctuate(prev.Silver),
          Platinum: fluctuate(prev.Platinum),
        };
        
        // Calculate changes
        setPriceChanges({
          Gold: newPrices.Gold - prev.Gold,
          Silver: newPrices.Silver - prev.Silver,
          Platinum: newPrices.Platinum - prev.Platinum,
        });
        
        return newPrices;
      });
    }, 5000);
    
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
      clearInterval(microFluctuationInterval);
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4><i className="fa-solid fa-chart-line"></i> Live Metal Prices (India) - Per 10g</h4>
                      <button 
                        onClick={fetchLiveMetalPrices} 
                        disabled={pricesLoading}
                        style={{ 
                          padding: '6px 12px', 
                          border: '1px solid #4CAF50', 
                          background: 'transparent', 
                          color: '#4CAF50',
                          borderRadius: '4px',
                          cursor: pricesLoading ? 'not-allowed' : 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <i className="fa-solid fa-refresh"></i> {pricesLoading ? 'Updating...' : 'Refresh'}
                      </button>
                    </div>
                    <div className="metal-price-meta">
                      <span className="price-source-tag">
                        Source: {metalPriceSource || 'Fetching...' }
                      </span>
                      {metalPriceUpdatedAt && (
                        <span className="price-updated-tag">
                          Updated {new Date(metalPriceUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {metalPriceError && (
                      <p className="price-error-text">{metalPriceError}</p>
                    )}
                    <div className="metal-prices-grid">
                      <div className="metal-price-item gold">
                        <div className="metal-icon">
                          <i className="fa-solid fa-coins"></i>
                        </div>
                        <div className="metal-info">
                          <span className="metal-name">Gold (24K)</span>
                          <div className="price-display">
                            {pricesLoading ? (
                              <span className="price-loading">Loading...</span>
                            ) : (
                              <>
                                <span className="price-label">10 Grams</span>
                                <div className="price-with-trend">
                                  <span className="price-value">₹{(liveMetalPrices.Gold * 10).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                  {priceChanges.Gold !== 0 && (
                                    <span className={`price-trend ${priceChanges.Gold > 0 ? 'trend-up' : 'trend-down'}`}>
                                      <i className={`fa-solid fa-arrow-${priceChanges.Gold > 0 ? 'up' : 'down'}`}></i>
                                      {Math.abs(priceChanges.Gold * 10).toFixed(2)}
                                    </span>
                                  )}
                                </div>
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
                                <span className="price-label">10 Grams</span>
                                <div className="price-with-trend">
                                  <span className="price-value">₹{(liveMetalPrices.Silver * 10).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                  {priceChanges.Silver !== 0 && (
                                    <span className={`price-trend ${priceChanges.Silver > 0 ? 'trend-up' : 'trend-down'}`}>
                                      <i className={`fa-solid fa-arrow-${priceChanges.Silver > 0 ? 'up' : 'down'}`}></i>
                                      {Math.abs(priceChanges.Silver * 10).toFixed(2)}
                                    </span>
                                  )}
                                </div>
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
                                <span className="price-label">10 Grams</span>
                                <div className="price-with-trend">
                                  <span className="price-value">₹{(liveMetalPrices.Platinum*10).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                  {priceChanges.Platinum !== 0 && (
                                    <span className={`price-trend ${priceChanges.Platinum > 0 ? 'trend-up' : 'trend-down'}`}>
                                      <i className={`fa-solid fa-arrow-${priceChanges.Platinum > 0 ? 'up' : 'down'}`}></i>
                                      {Math.abs(priceChanges.Platinum * 10).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {holdings.length > 0 ? (
                    <div className="table-wrapper">
                      {maxWeightValue > 0 && (
                        <div className="holdings-filter">
                          <div className="filter-label">
                            <span>Minimum weight filter</span>
                            <strong>{Math.round(minWeightFilter)}g</strong>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={Math.max(1, Math.ceil(maxWeightValue))}
                            value={minWeightFilter}
                            step={1}
                            onChange={(event) => setMinWeightFilter(Number(event.target.value))}
                          />
                          <div className="filter-hint">Drag to show holdings above the selected weight.</div>
                        </div>
                      )}
                      <table className="holdings-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Type</th>
                            <th>Weight</th>
                            <th>Bought At</th>
                            <th>Live Price/oz</th>
                            <th>Current Value</th>
                            <th>Gain/Loss</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                      <tbody>
                        {filteredHoldings.map((h) => {
                          const weightInGrams = parseWeightToGrams(h.weight);
                          const liveApiPricePerGram = liveMetalPrices[h.type] || 0;
                          const liveCurrentValue = Math.round(weightInGrams * liveApiPricePerGram);
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
                              <td>{h.weight || `${Math.round(weightInGrams)}g`}</td>
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
                    {filteredHoldings.length === 0 && (
                      <div className="table-empty-state">
                        No holdings meet the selected weight filter.
                      </div>
                    )}
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