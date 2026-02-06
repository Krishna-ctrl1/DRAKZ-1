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
    
    // Simulate micro price fluctuations every 15 seconds for smooth market feel
    const microFluctuationInterval = setInterval(() => {
      setLiveMetalPrices(prev => {
        const fluctuate = (price) => {
          // Random fluctuation between -0.15% to +0.15%
          const changePercent = (Math.random() - 0.5) * 0.3;
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
    }, 15000);
    
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

// ==================== UTILITY FUNCTIONS & HELPERS ====================

// Advanced price calculation utilities
const calculateCompoundInterest = (principal, rate, time, frequency = 12) => {
  return principal * Math.pow((1 + rate / frequency), frequency * time);
};

const calculateSimpleInterest = (principal, rate, time) => {
  return principal * rate * time;
};

const calculateEMI = (principal, rate, tenure) => {
  const monthlyRate = rate / 12 / 100;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
         (Math.pow(1 + monthlyRate, tenure) - 1);
};

const calculatePresentValue = (futureValue, rate, periods) => {
  return futureValue / Math.pow(1 + rate, periods);
};

const calculateFutureValue = (presentValue, rate, periods) => {
  return presentValue * Math.pow(1 + rate, periods);
};

const calculateCAGR = (initialValue, finalValue, years) => {
  return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
};

const calculateROI = (gain, cost) => {
  return ((gain - cost) / cost) * 100;
};

const calculateNetWorth = (assets, liabilities) => {
  return assets - liabilities;
};

const calculateDebtToIncomeRatio = (monthlyDebt, monthlyIncome) => {
  return (monthlyDebt / monthlyIncome) * 100;
};

const calculateSavingsRate = (monthlySavings, monthlyIncome) => {
  return (monthlySavings / monthlyIncome) * 100;
};

// Date and time utilities
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getMonthsDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth();
};

const getYearsDifference = (date1, date2) => {
  return (new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24 * 365.25);
};

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const addYears = (date, years) => {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
};

// Portfolio analysis functions
const calculatePortfolioValue = (holdings) => {
  return holdings.reduce((total, holding) => {
    return total + (holding.quantity * holding.currentPrice || 0);
  }, 0);
};

const calculatePortfolioDiversity = (holdings) => {
  const categories = {};
  holdings.forEach(holding => {
    const category = holding.category || 'Other';
    categories[category] = (categories[category] || 0) + holding.value;
  });
  return categories;
};

const calculateAssetAllocation = (portfolio) => {
  const total = portfolio.reduce((sum, asset) => sum + asset.value, 0);
  return portfolio.map(asset => ({
    ...asset,
    percentage: (asset.value / total) * 100
  }));
};

const rebalancePortfolio = (currentAllocation, targetAllocation) => {
  const recommendations = [];
  Object.keys(targetAllocation).forEach(asset => {
    const current = currentAllocation[asset] || 0;
    const target = targetAllocation[asset];
    const difference = target - current;
    if (Math.abs(difference) > 0.5) {
      recommendations.push({
        asset,
        action: difference > 0 ? 'BUY' : 'SELL',
        percentage: Math.abs(difference)
      });
    }
  });
  return recommendations;
};

// Risk assessment functions
const calculateVolatility = (prices) => {
  if (prices.length < 2) return 0;
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i-1]) / prices[i-1]);
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  return Math.sqrt(variance) * 100;
};

const calculateSharpeRatio = (returns, riskFreeRate, volatility) => {
  return (returns - riskFreeRate) / volatility;
};

const calculateBeta = (assetReturns, marketReturns) => {
  const n = Math.min(assetReturns.length, marketReturns.length);
  const assetMean = assetReturns.reduce((a, b) => a + b, 0) / n;
  const marketMean = marketReturns.reduce((a, b) => a + b, 0) / n;
  
  let covariance = 0;
  let marketVariance = 0;
  
  for (let i = 0; i < n; i++) {
    covariance += (assetReturns[i] - assetMean) * (marketReturns[i] - marketMean);
    marketVariance += Math.pow(marketReturns[i] - marketMean, 2);
  }
  
  return covariance / marketVariance;
};

const assessRiskProfile = (age, income, savings, riskTolerance) => {
  const scores = {
    age: age < 30 ? 5 : age < 40 ? 4 : age < 50 ? 3 : age < 60 ? 2 : 1,
    income: income > 100000 ? 5 : income > 75000 ? 4 : income > 50000 ? 3 : income > 25000 ? 2 : 1,
    savings: savings > 500000 ? 5 : savings > 250000 ? 4 : savings > 100000 ? 3 : savings > 50000 ? 2 : 1,
    tolerance: riskTolerance === 'aggressive' ? 5 : riskTolerance === 'moderate' ? 3 : 1
  };
  
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const avgScore = totalScore / Object.keys(scores).length;
  
  if (avgScore >= 4) return 'Aggressive';
  if (avgScore >= 3) return 'Moderate';
  return 'Conservative';
};

// Tax calculation utilities
const calculateIncomeTax = (income) => {
  let tax = 0;
  if (income <= 250000) {
    tax = 0;
  } else if (income <= 500000) {
    tax = (income - 250000) * 0.05;
  } else if (income <= 1000000) {
    tax = 12500 + (income - 500000) * 0.20;
  } else {
    tax = 112500 + (income - 1000000) * 0.30;
  }
  return tax;
};

const calculateCapitalGainsTax = (gain, holdingPeriod, assetType) => {
  if (assetType === 'equity') {
    return holdingPeriod > 365 ? gain * 0.10 : gain * 0.15;
  } else if (assetType === 'property') {
    return holdingPeriod > 730 ? gain * 0.20 : gain * 0.30;
  }
  return gain * 0.20;
};

const calculate80CDeduction = (investments) => {
  return Math.min(investments, 150000);
};

const calculateHRAExemption = (hra, basicSalary, rentPaid, isMetroCity) => {
  const exemption1 = hra;
  const exemption2 = isMetroCity ? basicSalary * 0.50 : basicSalary * 0.40;
  const exemption3 = rentPaid - (basicSalary * 0.10);
  return Math.max(0, Math.min(exemption1, exemption2, exemption3));
};

// Insurance calculation utilities
const calculateLifeInsuranceCoverage = (annualIncome, age, dependents) => {
  const yearsToRetirement = 60 - age;
  const baseCoverage = annualIncome * yearsToRetirement;
  const dependentFactor = 1 + (dependents * 0.2);
  return baseCoverage * dependentFactor;
};

const calculateHealthInsurancePremium = (age, coverageAmount, preExisting) => {
  let basePremium = coverageAmount * 0.02;
  const ageFactor = age < 30 ? 1 : age < 40 ? 1.2 : age < 50 ? 1.5 : 2;
  const healthFactor = preExisting ? 1.3 : 1;
  return basePremium * ageFactor * healthFactor;
};

const calculateTermLifePremium = (coverageAmount, age, gender, smoker) => {
  let base = coverageAmount * 0.001;
  const ageFactor = age < 30 ? 1 : age < 40 ? 1.5 : age < 50 ? 2.5 : 4;
  const genderFactor = gender === 'male' ? 1.2 : 1;
  const smokerFactor = smoker ? 2 : 1;
  return base * ageFactor * genderFactor * smokerFactor;
};

// Loan calculation utilities
const calculateLoanEligibility = (monthlyIncome, existingEMI, creditScore) => {
  const maxEMI = monthlyIncome * 0.50;
  const availableEMI = maxEMI - existingEMI;
  const creditFactor = creditScore > 750 ? 1 : creditScore > 650 ? 0.8 : 0.6;
  return availableEMI * creditFactor;
};

const calculateHomeLoanEligibility = (income, age, tenure) => {
  const maxTenure = 65 - age;
  const actualTenure = Math.min(tenure, maxTenure);
  const emi = income * 0.40;
  const rate = 0.085 / 12;
  const months = actualTenure * 12;
  return (emi * (Math.pow(1 + rate, months) - 1)) / (rate * Math.pow(1 + rate, months));
};

const calculateOutstandingLoan = (principal, emiPaid, totalEMI, monthlyEMI) => {
  const principalPaid = (emiPaid * monthlyEMI) * 0.6; // Approximate
  return principal - principalPaid;
};

const calculatePrepaymentSavings = (outstanding, prepayment, rate, remainingTenure) => {
  const oldEMI = calculateEMI(outstanding, rate, remainingTenure);
  const newOutstanding = outstanding - prepayment;
  const newEMI = calculateEMI(newOutstanding, rate, remainingTenure);
  const totalOldPayment = oldEMI * remainingTenure;
  const totalNewPayment = newEMI * remainingTenure;
  return totalOldPayment - totalNewPayment;
};

// Investment strategy functions
const calculateSIPReturns = (monthlyInvestment, annualReturn, years) => {
  const months = years * 12;
  const monthlyRate = annualReturn / 12 / 100;
  const futureValue = monthlyInvestment * 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
    (1 + monthlyRate);
  const totalInvested = monthlyInvestment * months;
  return {
    futureValue,
    totalInvested,
    returns: futureValue - totalInvested
  };
};

const calculateLumpsumReturns = (investment, annualReturn, years) => {
  const futureValue = investment * Math.pow(1 + annualReturn / 100, years);
  return {
    futureValue,
    totalInvested: investment,
    returns: futureValue - investment
  };
};

const calculateRetirementCorpus = (currentAge, retirementAge, monthlyExpense, inflation) => {
  const yearsToRetirement = retirementAge - currentAge;
  const lifeExpectancy = 85;
  const yearsInRetirement = lifeExpectancy - retirementAge;
  
  const futureMonthlyExpense = monthlyExpense * Math.pow(1 + inflation / 100, yearsToRetirement);
  const annualExpense = futureMonthlyExpense * 12;
  
  const corpusNeeded = annualExpense * yearsInRetirement;
  return corpusNeeded;
};

const calculateGoalAmount = (currentCost, years, inflation) => {
  return currentCost * Math.pow(1 + inflation / 100, years);
};

const calculateMonthlyInvestment = (targetAmount, years, expectedReturn) => {
  const months = years * 12;
  const monthlyRate = expectedReturn / 12 / 100;
  return targetAmount / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
};

// Emergency fund calculations
const calculateEmergencyFund = (monthlyExpense) => {
  return monthlyExpense * 6; // 6 months of expenses
};

const assessEmergencyFundAdequacy = (currentFund, monthlyExpense) => {
  const required = monthlyExpense * 6;
  const percentage = (currentFund / required) * 100;
  if (percentage >= 100) return 'Adequate';
  if (percentage >= 50) return 'Partially Adequate';
  return 'Inadequate';
};

// Budgeting utilities
const categorizeExpenses = (transactions) => {
  const categories = {
    housing: 0,
    food: 0,
    transportation: 0,
    utilities: 0,
    healthcare: 0,
    entertainment: 0,
    education: 0,
    insurance: 0,
    savings: 0,
    other: 0
  };
  
  transactions.forEach(tx => {
    const category = tx.category?.toLowerCase() || 'other';
    if (categories[category] !== undefined) {
      categories[category] += tx.amount;
    } else {
      categories.other += tx.amount;
    }
  });
  
  return categories;
};

const apply50_30_20Rule = (income) => {
  return {
    needs: income * 0.50,
    wants: income * 0.30,
    savings: income * 0.20
  };
};

const analyzeSpendingPattern = (expenses, income) => {
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const savingsRate = ((income - totalExpense) / income) * 100;
  const pattern = savingsRate > 20 ? 'Excellent' : savingsRate > 10 ? 'Good' : savingsRate > 0 ? 'Average' : 'Poor';
  return { savingsRate, pattern };
};

// Credit score utilities
const estimateCreditScore = (paymentHistory, creditUtilization, creditAge, hardInquiries) => {
  let score = 300;
  
  // Payment history (35%)
  score += paymentHistory * 3.5;
  
  // Credit utilization (30%)
  score += (100 - creditUtilization) * 3;
  
  // Credit age (15%)
  score += Math.min(creditAge * 10, 150);
  
  // Hard inquiries (10%)
  score -= hardInquiries * 10;
  
  return Math.min(900, Math.max(300, Math.round(score)));
};

const getCreditScoreCategory = (score) => {
  if (score >= 750) return 'Excellent';
  if (score >= 700) return 'Good';
  if (score >= 650) return 'Fair';
  if (score >= 600) return 'Poor';
  return 'Very Poor';
};

const suggestCreditImprovement = (score, utilization, paymentHistory) => {
  const suggestions = [];
  
  if (score < 750) {
    if (utilization > 30) {
      suggestions.push('Reduce credit utilization below 30%');
    }
    if (paymentHistory < 100) {
      suggestions.push('Make all payments on time');
    }
    suggestions.push('Avoid hard inquiries');
    suggestions.push('Maintain old credit accounts');
  }
  
  return suggestions;
};

// Wealth accumulation tracking
const calculateWealthGrowth = (initialWealth, monthlyContribution, years, averageReturn) => {
  const months = years * 12;
  const monthlyRate = averageReturn / 12 / 100;
  
  let wealth = initialWealth;
  const timeline = [];
  
  for (let month = 0; month <= months; month++) {
    if (month > 0) {
      wealth = (wealth + monthlyContribution) * (1 + monthlyRate);
    }
    if (month % 12 === 0) {
      timeline.push({
        year: month / 12,
        wealth: Math.round(wealth)
      });
    }
  }
  
  return timeline;
};

const calculateFinancialIndependenceNumber = (annualExpense, withdrawalRate = 4) => {
  return (annualExpense * 100) / withdrawalRate;
};

const calculateYearsToFI = (currentWealth, targetWealth, monthlyContribution, averageReturn) => {
  if (monthlyContribution <= 0) return Infinity;
  
  const monthlyRate = averageReturn / 12 / 100;
  let wealth = currentWealth;
  let months = 0;
  
  while (wealth < targetWealth && months < 1200) { // Max 100 years
    wealth = (wealth + monthlyContribution) * (1 + monthlyRate);
    months++;
  }
  
  return months / 12;
};

// Gold and precious metal utilities
const convertGoldUnits = (value, fromUnit, toUnit) => {
  const gramValue = fromUnit === 'kg' ? value * 1000 :
                   fromUnit === 'tola' ? value * 11.66 :
                   fromUnit === 'oz' ? value * 31.10 : value;
  
  return toUnit === 'kg' ? gramValue / 1000 :
         toUnit === 'tola' ? gramValue / 11.66 :
         toUnit === 'oz' ? gramValue / 31.10 : gramValue;
};

const calculateGoldInvestmentReturn = (quantity, buyPrice, currentPrice) => {
  const investment = quantity * buyPrice;
  const currentValue = quantity * currentPrice;
  const gain = currentValue - investment;
  const returnPercentage = (gain / investment) * 100;
  
  return { investment, currentValue, gain, returnPercentage };
};

const assessGoldAllocation = (goldValue, totalPortfolio) => {
  const allocation = (goldValue / totalPortfolio) * 100;
  if (allocation > 15) return 'Over-allocated';
  if (allocation >= 5) return 'Optimal';
  return 'Under-allocated';
};

// Property and real estate utilities
const calculatePropertyValue = (purchasePrice, appreciationRate, years) => {
  return purchasePrice * Math.pow(1 + appreciationRate / 100, years);
};

const calculateRentalYield = (annualRent, propertyValue) => {
  return (annualRent / propertyValue) * 100;
};

const calculatePropertyROI = (purchasePrice, currentValue, totalRentCollected, expenses) => {
  const totalGain = (currentValue - purchasePrice) + totalRentCollected - expenses;
  return (totalGain / purchasePrice) * 100;
};

const assessPropertyAffordability = (propertyPrice, annualIncome) => {
  const ratio = propertyPrice / annualIncome;
  if (ratio <= 3) return 'Highly Affordable';
  if (ratio <= 5) return 'Affordable';
  if (ratio <= 7) return 'Moderately Affordable';
  return 'Not Affordable';
};

// Market analysis utilities
const calculateMovingAverage = (prices, period) => {
  if (prices.length < period) return prices[prices.length - 1];
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
};

const calculateRSI = (prices, period = 14) => {
  if (prices.length < period + 1) return 50;
  
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  const recentChanges = changes.slice(-period);
  const gains = recentChanges.filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
  const losses = Math.abs(recentChanges.filter(c => c < 0).reduce((a, b) => a + b, 0)) / period;
  
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - (100 / (1 + rs));
};

const detectTrend = (prices) => {
  if (prices.length < 3) return 'Neutral';
  
  const recent = prices.slice(-5);
  const older = prices.slice(-10, -5);
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (change > 5) return 'Uptrend';
  if (change < -5) return 'Downtrend';
  return 'Neutral';
};

// Data validation utilities
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePhone = (phone) => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone);
};

const validatePAN = (pan) => {
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return regex.test(pan);
};

const validateAadhar = (aadhar) => {
  const regex = /^\d{12}$/;
  return regex.test(aadhar);
};

const validateIFSC = (ifsc) => {
  const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return regex.test(ifsc);
};

// Data formatting utilities
const formatPercentage = (value, decimals = 2) => {
  return `${value.toFixed(decimals)}%`;
};

const formatLargeNumber = (num) => {
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)} K`;
  return num.toFixed(2);
};

const formatDuration = (months) => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} months`;
  if (remainingMonths === 0) return `${years} years`;
  return `${years} years ${remainingMonths} months`;
};

// Notification and alert utilities
const generateFinancialAlerts = (userData) => {
  const alerts = [];
  
  if (userData.creditScore < 650) {
    alerts.push({ type: 'warning', message: 'Credit score needs improvement' });
  }
  
  if (userData.emergencyFund < userData.monthlyExpense * 3) {
    alerts.push({ type: 'critical', message: 'Emergency fund is insufficient' });
  }
  
  if (userData.debtToIncome > 40) {
    alerts.push({ type: 'warning', message: 'Debt-to-income ratio is high' });
  }
  
  return alerts;
};

const checkUpcomingPayments = (transactions, daysAhead = 7) => {
  const today = new Date();
  const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  
  return transactions.filter(tx => {
    const txDate = new Date(tx.dueDate);
    return txDate >= today && txDate <= futureDate && tx.status === 'pending';
  });
};

// Performance optimization utilities
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const throttle = (fn, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ==================== END UTILITIES ====================

export default MyPrivilege;