import React, { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import Header from "../global/Header";
import Sidebar from "../global/Sidebar";
import "../../styles/gupta/Finbot.css";

// Register Chart.js components
Chart.register(...registerables);

const FinBot = () => {
  // --- State Management ---
  const [activeSection, setActiveSection] = useState("welcome");
  const [collapsed, setCollapsed] = useState(false);
  
  // Financial Planning State
  const [planInputs, setPlanInputs] = useState({
    monthlyIncome: "",
    outingExpenses: "",
    transportationCosts: "",
    fixedCosts: "",
    foodCosts: "",
    availableSavings: "",
  });
  
  const [hasVariableCosts, setHasVariableCosts] = useState(false);
  const [variableCosts, setVariableCosts] = useState({
    january: "", february: "", march: "", april: "", may: "", june: "",
    july: "", august: "", september: "", october: "", november: "", december: "",
  });
  
  const [summary, setSummary] = useState(null);

  // Stock Analysis State
  const [stockSymbol, setStockSymbol] = useState("");
  const [stockResults, setStockResults] = useState(null);
  const [stockError, setStockError] = useState(null);
  const [isStockLoading, setIsStockLoading] = useState(false);

  // Chat/Advisor State
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Welcome! I am your AI Financial Advisor. Calculate your plan first, then ask me anything!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  // --- Refs ---
  const stockChartRef = useRef(null);
  const financialChartRef = useRef(null);
  const incomeExpenseBarChartRef = useRef(null);
  const variableCostsBarChartRef = useRef(null);
  const recommendationChartRef = useRef(null);
  const messagesEndRef = useRef(null);

  // --- Effects ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // --- Helpers ---
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  const formatLargeNumber = (num) => {
    if (!num) return "N/A";
    if (num >= 1.0e12) return (num / 1.0e12).toFixed(2) + "T";
    if (num >= 1.0e9) return (num / 1.0e9).toFixed(2) + "B";
    if (num >= 1.0e6) return (num / 1.0e6).toFixed(2) + "M";
    return num;
  };

  // --- Handlers ---
  const handlePlanInputChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    if (value === "") setPlanInputs((prev) => ({ ...prev, [key]: "" }));
    else {
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue) && parsedValue >= 0) setPlanInputs((prev) => ({ ...prev, [key]: parsedValue }));
    }
  };

  const handleVariableCostChange = (e) => {
    const { id, value } = e.target;
    const month = id.replace("-costs", "");
    if (value === "") setVariableCosts((prev) => ({ ...prev, [month]: "" }));
    else {
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue) && parsedValue >= 0) setVariableCosts((prev) => ({ ...prev, [month]: parsedValue }));
    }
  };

  const handleCalculateSummary = () => {
    const monthlyIncome = planInputs.monthlyIncome || 0;
    const outing = planInputs.outingExpenses || 0;
    const transport = planInputs.transportationCosts || 0;
    const fixed = planInputs.fixedCosts || 0;
    const food = planInputs.foodCosts || 0;

    const yearlyIncome = monthlyIncome * 12;
    const monthlyFixedExpenses = outing + transport + fixed + food;
    const yearlyFixedCosts = monthlyFixedExpenses * 12;

    const totalYearlyVariable = hasVariableCosts
      ? Object.values(variableCosts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
      : 0;
    const avgMonthlyVariable = totalYearlyVariable / 12;

    const totalMonthlyExpenses = monthlyFixedExpenses + avgMonthlyVariable;
    const totalYearlyExpenses = yearlyFixedCosts + totalYearlyVariable;
    
    const monthlySavings = monthlyIncome - totalMonthlyExpenses;
    const yearlyInvestment = yearlyIncome - totalYearlyExpenses;

    setSummary({
      yearlyIncome,
      totalYearlyExpenses,
      yearlyInvestment,
      monthlyIncome,
      totalMonthlyExpenses,
      monthlySavings,
      avgMonthlyVariable,
      outing,
      transport,
      fixed,
      food,
    });
  };

  // --- FINNHUB API LOGIC ---
  const handleGetStockDetails = async () => {
    if (!stockSymbol) {
      setStockError("Please enter a stock symbol.");
      return;
    }
    setStockError(null);
    setStockResults(null);
    setIsStockLoading(true);

    // Using the Finnhub key you provided
    const apiKey = "d4mts41r01qsn6g8d4p0d4mts41r01qsn6g8d4pg"; 

    try {
      console.log("Fetching Finnhub data for:", stockSymbol);

      // 1. Fetch Basic Data
      const [quoteRes, profileRes, peersRes] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${apiKey}`),
        fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${stockSymbol}&token=${apiKey}`),
        fetch(`https://finnhub.io/api/v1/stock/peers?symbol=${stockSymbol}&token=${apiKey}`)
      ]);

      const quote = await quoteRes.json();
      const profile = await profileRes.json();
      const peers = await peersRes.json();

      // 2. Fetch Historical Candles (Past 1 Year)
      const toDate = Math.floor(Date.now() / 1000);
      const fromDate = toDate - (365 * 24 * 60 * 60); // 365 Days of past data
      
      const candleRes = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${stockSymbol}&resolution=D&from=${fromDate}&to=${toDate}&token=${apiKey}`);
      const candles = await candleRes.json();

      console.log("Candle Data:", candles); 

      // Check if critical data is missing
      if (!quote.c && quote.c !== 0) {
        throw new Error("Symbol not found or API limit reached.");
      }

      setStockResults({
        symbol: profile.ticker || stockSymbol.toUpperCase(),
        overview: {
          companyName: profile.name || stockSymbol.toUpperCase(),
          description: `Leading company in the ${profile.finnhubIndustry || 'market'} sector.`,
          exchange: profile.exchange,
          currency: profile.currency,
          sector: profile.finnhubIndustry,
          industry: profile.finnhubIndustry,
          ceo: "N/A (Premium)", 
          fullTimeEmployees: "N/A",
          image: profile.logo,
          mktCap: (profile.marketCapitalization || 0) * 1000000 
        },
        price: {
          price: quote.c,
          changesPercentage: quote.dp,
          pe: "N/A"
        },
        timeSeries: {
          // Robust mapping: Check if status is 'ok' AND 't' (time) array exists
          historical: (candles.s === "ok" && candles.t) 
            ? candles.t.map((ts, i) => ({
                date: new Date(ts * 1000).toISOString().split('T')[0],
                close: candles.c[i]
              })) 
            : [] 
        },
        peers: peers || []
      });

    } catch (error) {
      console.error("Finnhub Error:", error);
      setStockError("Failed to fetch data. Please check the Symbol or wait a moment.");
    } finally {
      setIsStockLoading(false);
    }
  };

  // --- Chat Logic ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMessage = chatInput.trim();
    if (!userMessage) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setChatInput("");
    setIsBotTyping(true);

    const contextData = {
      monthly_income: summary ? summary.monthlyIncome : (planInputs.monthlyIncome || "Not provided"),
      total_expenses: summary ? summary.totalMonthlyExpenses : "Not calculated",
      savings: summary ? summary.monthlySavings : (planInputs.availableSavings || "Not calculated"),
      currency: "INR",
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/api/financial-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMessage,
          userData: contextData, 
        }),
      });

      if (!response.ok) throw new Error("Advisor offline");
      const data = await response.json();
      setChatMessages((prev) => [...prev, { sender: "bot", text: data.response }]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: "I'm having trouble connecting to the brain. Please ensure the Python server is running." },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  // --- CHART EFFECTS ---

  // 1. Stock Chart (Historical)
  useEffect(() => {
    // Only proceed if we have results and the ref exists
    if (!stockResults || !stockChartRef.current) return;

    const canvas = stockChartRef.current;
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    const history = stockResults.timeSeries?.historical || [];

    // If no history data, we stop here (the UI handles the "No Data" message)
    if (history.length === 0) return;

    new Chart(canvas, {
      type: "line",
      data: {
        labels: history.map((d) => d.date),
        datasets: [{
          label: `${stockResults.symbol} Price History (1 Year)`,
          data: history.map((d) => d.close),
          borderColor: "#5d5fef",
          backgroundColor: "rgba(93, 95, 239, 0.1)",
          fill: true,
          tension: 0.2, // Slightly smoother lines
          pointRadius: 0, // Hide points for cleaner look on long history
          pointHoverRadius: 5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: { 
          legend: { labels: { color: "#e0e0e0" } },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          x: { 
            ticks: { color: "#8a8a9e", maxTicksLimit: 12 }, // Limit x-axis labels
            grid: { color: "rgba(255,255,255,0.05)" } 
          },
          y: { 
            ticks: { color: "#8a8a9e" }, 
            grid: { color: "rgba(255,255,255,0.05)" } 
          },
        },
      },
    });
  }, [stockResults]);

  // 2. Financial Breakdown (Doughnut)
  useEffect(() => {
    if (!summary || !financialChartRef.current) return;
    const canvas = financialChartRef.current;
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ["Outing", "Transport", "Fixed", "Food", "Variable", "Savings"],
        datasets: [{
          data: [
            summary.outing, summary.transport, summary.fixed, summary.food,
            summary.avgMonthlyVariable, Math.max(0, summary.monthlySavings),
          ],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#2ECC71"],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "right", labels: { color: "#e0e0e0" } } },
      },
    });
  }, [summary]);

  // 3. Income vs Expense (Bar)
  useEffect(() => {
    if (!summary || !incomeExpenseBarChartRef.current) return;
    const canvas = incomeExpenseBarChartRef.current;
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    new Chart(canvas, {
      type: "bar",
      data: {
        labels: ["Income", "Expenses", "Savings"],
        datasets: [{
          label: "Monthly Flow",
          data: [summary.monthlyIncome, summary.totalMonthlyExpenses, Math.max(0, summary.monthlySavings)],
          backgroundColor: ["#2ecc71", "#e74c3c", "#3498db"],
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#8a8a9e" }, grid: { display: false } },
          y: { ticks: { color: "#8a8a9e" }, grid: { color: "rgba(255,255,255,0.1)" } },
        },
      },
    });
  }, [summary]);

  // 4. Variable Costs (Bar)
  useEffect(() => {
    if (!summary || !hasVariableCosts || !variableCostsBarChartRef.current) return;
    const canvas = variableCostsBarChartRef.current;
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    new Chart(canvas, {
      type: "bar",
      data: {
        labels: Object.keys(variableCosts).map(m => m.charAt(0).toUpperCase() + m.slice(1,3)),
        datasets: [{
          label: "Variable Costs",
          data: Object.values(variableCosts).map(v => parseFloat(v) || 0),
          backgroundColor: "#9b59b6",
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: "#8a8a9e" } },
          y: { ticks: { color: "#8a8a9e" }, grid: { color: "rgba(255,255,255,0.1)" } },
        },
      },
    });
  }, [summary, variableCosts, hasVariableCosts]);

  // 5. Recommendations Chart
  useEffect(() => {
    if (activeSection !== "investment" || !summary || !recommendationChartRef.current) return;
    const canvas = recommendationChartRef.current;
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    const savings = Math.max(0, summary.monthlySavings);
    const equity = savings * 0.50;
    const debt = savings * 0.30;
    const liquid = savings * 0.20;

    new Chart(canvas, {
      type: "pie",
      data: {
        labels: ["Equity (Stocks/MF)", "Debt (Bonds/FD)", "Liquid (Cash/Gold)"],
        datasets: [{
          data: [equity, debt, liquid],
          backgroundColor: ["#3498db", "#f1c40f", "#2ecc71"],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: "#e0e0e0" } },
          title: { display: true, text: "Suggested Portfolio Allocation", color: "#e0e0e0" }
        },
      },
    });
  }, [activeSection, summary]);

  // --- Render Helpers ---
  const renderVariableInputs = () => {
    const months = Object.keys(variableCosts);
    const rows = [];
    for (let i = 0; i < months.length; i += 3) rows.push(months.slice(i, i + 3));
    return rows.map((row, i) => (
      <div className="input-row" key={i}>
        {row.map((m) => (
          <div className="input-group" key={m}>
            <label>{m.charAt(0).toUpperCase() + m.slice(1)}</label>
            <input
              type="number"
              className="number-input"
              value={variableCosts[m]}
              onChange={(e) => handleVariableCostChange({ target: { id: `${m}-costs`, value: e.target.value } })}
            />
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div className="dashboard-page">
      <Header />
      <div className="app">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={collapsed ? "main-content-collapsed" : "main-content"}>
          <div className="chatbot-container">
            <div className="chat-section">
              
              {/* Navigation Tabs */}
              <div className="tab-navigation">
                {[
                  { id: "welcome", label: "Home", icon: "fa-home" },
                  { id: "financial-planning", label: "Planning", icon: "fa-calculator" },
                  { id: "stock-analysis", label: "Stocks", icon: "fa-chart-line" },
                  { id: "investment", label: "Recommendations", icon: "fa-seedling" },
                  { id: "advisor", label: "AI Advisor", icon: "fa-user-tie" },
                ].map((tab) => (
                  <div key={tab.id} className={`tab-item ${activeSection === tab.id ? "active" : ""}`} onClick={() => setActiveSection(tab.id)}>
                    <i className={`fas ${tab.icon} icon`}></i>
                    <span>{tab.label}</span>
                  </div>
                ))}
              </div>

              {/* WELCOME SECTION */}
              {activeSection === "welcome" && (
                <div className="section-content active">
                  <div className="welcome-message">
                    <h1>Financial Companion</h1>
                    <p>Track expenses, analyze stocks, and get AI-powered advice.</p>
                    <div className="section-cards">
                      <div className="section-card" onClick={() => setActiveSection("financial-planning")}>
                        <div className="icon-container"><i className="fas fa-calculator"></i></div>
                        <h3>Plan Budget</h3>
                      </div>
                      <div className="section-card" onClick={() => setActiveSection("stock-analysis")}>
                        <div className="icon-container"><i className="fas fa-chart-line"></i></div>
                        <h3>Analyze Stocks</h3>
                      </div>
                      <div className="section-card" onClick={() => setActiveSection("investment")}>
                        <div className="icon-container"><i className="fas fa-seedling"></i></div>
                        <h3>Recommendations</h3>
                      </div>
                      <div className="section-card" onClick={() => setActiveSection("advisor")}>
                        <div className="icon-container"><i className="fas fa-robot"></i></div>
                        <h3>Ask AI</h3>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FINANCIAL PLANNING SECTION */}
              {activeSection === "financial-planning" && (
                <div className="section-content active">
                  <div className="financial-planning-inputs">
                    <h2>Budget Planner</h2>
                    <div className="input-row">
                      <div className="input-group">
                        <label>Net Monthly Income (INR)</label>
                        <input id="monthly-income" type="number" className="number-input" value={planInputs.monthlyIncome} onChange={handlePlanInputChange} />
                      </div>
                    </div>
                    <div className="input-row">
                      <div className="input-group">
                        <label>Outing / Leisure</label>
                        <input id="outing-expenses" type="number" className="number-input" value={planInputs.outingExpenses} onChange={handlePlanInputChange} />
                      </div>
                      <div className="input-group">
                        <label>Transport</label>
                        <input id="transportation-costs" type="number" className="number-input" value={planInputs.transportationCosts} onChange={handlePlanInputChange} />
                      </div>
                      <div className="input-group">
                        <label>Other Fixed Costs</label>
                        <input id="fixed-costs" type="number" className="number-input" value={planInputs.fixedCosts} onChange={handlePlanInputChange} />
                      </div>
                    </div>
                    <div className="input-row">
                      <div className="input-group">
                        <label>Food / Groceries</label>
                        <input id="food-costs" type="number" className="number-input" value={planInputs.foodCosts} onChange={handlePlanInputChange} />
                      </div>
                      <div className="input-group">
                        <label>Existing Savings (Optional)</label>
                        <input id="available-savings" type="number" className="number-input" value={planInputs.availableSavings} onChange={handlePlanInputChange} />
                      </div>
                    </div>

                    <div className="toggle-container">
                      <label className="toggle-switch">
                        <input type="checkbox" checked={hasVariableCosts} onChange={(e) => setHasVariableCosts(e.target.checked)} />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">Include Variable Monthly Costs?</span>
                      </label>
                    </div>

                    {hasVariableCosts && (
                      <div id="variable-costs-container">
                        <h3>Variable Expenses (Month-wise)</h3>
                        {renderVariableInputs()}
                      </div>
                    )}

                    <button className="calculate-btn" onClick={handleCalculateSummary}>Calculate Plan</button>

                    {summary && (
                      <div className="financial-summary">
                        <h3>Analysis</h3>
                        <div className="metrics-container">
                          <div className="metrics-row">
                            <div className="metric">
                              <div className="metric-label">Monthly Savings</div>
                              <div className="metric-value" style={{color: summary.monthlySavings > 0 ? '#2ecc71' : '#e74c3c'}}>
                                {formatCurrency(summary.monthlySavings)}
                              </div>
                            </div>
                            <div className="metric">
                              <div className="metric-label">Annual Projection</div>
                              <div className="metric-value">{formatCurrency(summary.yearlyInvestment)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="charts-grid">
                          <div className="chart-container"><canvas ref={financialChartRef}></canvas></div>
                          <div className="chart-container"><canvas ref={incomeExpenseBarChartRef}></canvas></div>
                          {hasVariableCosts && (
                            <div className="chart-container-full"><canvas ref={variableCostsBarChartRef}></canvas></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STOCK ANALYSIS SECTION */}
              {activeSection === "stock-analysis" && (
                <div className="section-content active">
                  <h2>Market Analysis</h2>
                  <div className="stock-input-container">
                    <input type="text" className="stock-input" placeholder="Symbol (e.g. AAPL, TSLA)" value={stockSymbol} onChange={(e) => setStockSymbol(e.target.value.toUpperCase())} />
                    <button className="stock-button" onClick={handleGetStockDetails} disabled={isStockLoading}>
                      {isStockLoading ? "Loading..." : "Analyze"}
                    </button>
                  </div>
                  
                  {stockError && <div className="error">{stockError}</div>}
                  
                  {stockResults && (
                    <div className="stock-analysis-results">
                      {/* Top Info Card */}
                      <div className="company-info" style={{marginBottom: '20px', padding: '20px', border: '1px solid var(--finbot-border)', borderRadius: '12px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px'}}>
                           {stockResults.overview.image && (
                             <img src={stockResults.overview.image} alt="logo" style={{width: '50px', borderRadius: '50%'}} />
                           )}
                           <div>
                             <h3 style={{margin: 0}}>{stockResults.overview.companyName} ({stockResults.symbol})</h3>
                             <p style={{margin: '5px 0 0 0', color: '#8a8a9e'}}>{stockResults.overview.exchange} | {stockResults.overview.currency}</p>
                           </div>
                        </div>
                        <p>{stockResults.overview.description}</p>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px'}}>
                           <div><strong>Sector:</strong> {stockResults.overview.sector}</div>
                           <div><strong>Industry:</strong> {stockResults.overview.industry}</div>
                           <div><strong>Market Cap:</strong> {formatLargeNumber(stockResults.overview.mktCap)}</div>
                        </div>
                      </div>

                      {/* Chart Area with Empty Data Check */}
                      <div className="stock-graph" style={{ position: 'relative', width: '100%', height: '350px' }}>
                        {(!stockResults.timeSeries?.historical || stockResults.timeSeries.historical.length === 0) ? (
                           <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8a8a9e', flexDirection: 'column'}}>
                             <p>No historical data available for this symbol.</p>
                             <small style={{opacity: 0.7}}>(API might be limited or market closed)</small>
                           </div>
                        ) : (
                          <canvas ref={stockChartRef}></canvas>
                        )}
                      </div>

                      {/* Key Metrics */}
                      <div className="key-metrics">
                        <div className="metric-card">
                          <div className="metric-label">Price</div>
                          <div className="metric-value">${stockResults.price.price}</div>
                        </div>
                        <div className="metric-card">
                          <div className="metric-label">Change</div>
                          <div className={`metric-value ${stockResults.price.changesPercentage >= 0 ? "positive" : "negative"}`}>
                            {stockResults.price.changesPercentage.toFixed(2)}%
                          </div>
                        </div>
                        <div className="metric-card">
                          <div className="metric-label">Market Cap</div>
                          <div className="metric-value">
                            {formatLargeNumber(stockResults.overview.mktCap)}
                          </div>
                        </div>
                      </div>

                      {/* Peers */}
                      {stockResults.peers && stockResults.peers.length > 0 && (
                         <div className="peers-section" style={{marginTop: '20px'}}>
                           <h4>Similar Companies (Peers)</h4>
                           <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px'}}>
                              {stockResults.peers.map((peer, idx) => (
                                <span key={idx} style={{
                                  background: 'rgba(255,255,255,0.05)', 
                                  padding: '8px 12px', 
                                  borderRadius: '20px',
                                  fontSize: '0.9rem',
                                  cursor: 'pointer',
                                  border: '1px solid var(--finbot-border)'
                                }} onClick={() => setStockSymbol(peer)}>
                                  {peer}
                                </span>
                              ))}
                           </div>
                         </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* RECOMMENDATIONS SECTION */}
              {activeSection === "investment" && (
                <div className="section-content active">
                  <h2>Investment Strategy</h2>
                  {!summary ? (
                    <div className="insights-section">
                      <p className="insight-warning">
                        <i className="fas fa-exclamation-circle"></i> Please calculate your budget in the <strong>Planning</strong> tab first.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="insights-section">
                        <h4>Allocation Strategy for {formatCurrency(summary.monthlySavings)} / month</h4>
                        <p>Based on your calculated savings, here is a balanced portfolio recommendation:</p>
                        <ul style={{marginTop: '10px', lineHeight: '1.6'}}>
                          <li><strong>🔵 50% Equity ({formatCurrency(summary.monthlySavings * 0.5)})</strong>: High-growth potential (Stocks, Index Funds).</li>
                          <li><strong>🟡 30% Debt ({formatCurrency(summary.monthlySavings * 0.3)})</strong>: Stability & fixed returns (Bonds, FDs).</li>
                          <li><strong>🟢 20% Liquid ({formatCurrency(summary.monthlySavings * 0.2)})</strong>: Emergency fund & quick access (Liquid Funds).</li>
                        </ul>
                      </div>
                      <div className="financial-graph-container" style={{ height: "350px", marginTop: "30px" }}>
                        <canvas ref={recommendationChartRef}></canvas>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ADVISOR SECTION */}
              {activeSection === "advisor" && (
                <div className="section-content active" id="advisor-content">
                  <div className="messages-container">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className={`message ${msg.sender}`}>
                        {msg.text}
                      </div>
                    ))}
                    {isBotTyping && (
                      <div className="message bot bot-thinking">
                        <div className="typing-indicator">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <form className="input-area" onSubmit={handleSendMessage}>
                    <textarea
                      placeholder="Ask about your budget or stocks..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
                      }}
                    />
                    <button type="submit" className="send-btn" disabled={isBotTyping}>➤</button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinBot;