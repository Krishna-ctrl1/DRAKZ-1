import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto"; 
import "../../styles/gupta/Finbot.css";

// Main FinBot Component
const FinBot = () => {
  const [activeSection, setActiveSection] = useState("welcome");
  const [planInputs, setPlanInputs] = useState({ monthlyIncome: 0, outingExpenses: 0, transportationCosts: 0, fixedCosts: 0, foodCosts: 0, availableSavings: 0 });
  const [hasVariableCosts, setHasVariableCosts] = useState(false);
  const [variableCosts, setVariableCosts] = useState({ january: 0, february: 0, march: 0, april: 0, may: 0, june: 0, july: 0, august: 0, september: 0, october: 0, november: 0, december: 0 });
  const [summary, setSummary] = useState(null);
  const [stockSymbol, setStockSymbol] = useState("");
  const [stockResults, setStockResults] = useState(null);
  const [stockError, setStockError] = useState(null);
  const [isStockLoading, setIsStockLoading] = useState(false);
  const stockChartRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([{ sender: "bot", text: "Welcome to your Financial Advisor! How can I help you today?" }]);
  const [chatInput, setChatInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount);

  const handlePlanInputChange = (e) => {
    const { id, value } = e.target;
    // Handle potential ID differences (e.g., 'monthly-income' vs 'monthlyIncome')
    const key = id.replace(/-([a-z])/g, g => g[1].toUpperCase()); 
    setPlanInputs((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };
  
  const handleVariableCostChange = (e) => {
    const { id, value } = e.target;
    const month = id.replace("-costs", "");
    setVariableCosts((prev) => ({ ...prev, [month]: parseFloat(value) || 0 }));
  };

  const handleCalculateSummary = () => {
    const yearlyIncome = (planInputs.monthlyIncome || 0) * 12;
    const yearlyFixedCosts = ((planInputs.transportationCosts || 0) + (planInputs.foodCosts || 0) + (planInputs.outingExpenses || 0) + (planInputs.fixedCosts || 0)) * 12;
    const yearlyVariableCosts = hasVariableCosts ? Object.values(variableCosts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) : 0;
    const totalYearlyExpenses = yearlyFixedCosts + yearlyVariableCosts;
    const yearlyInvestment = yearlyIncome - totalYearlyExpenses;
    const monthlyInvestment = yearlyInvestment / 12;
    setSummary({ yearlyIncome, totalYearlyExpenses, yearlyInvestment, monthlyInvestment });
  };

  useEffect(() => {
    if (!stockResults || !stockResults.timeSeries || !stockChartRef.current) return;
    const canvas = stockChartRef.current;
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();
    const timeSeriesData = stockResults.timeSeries["Time Series (Daily)"];
    if (!timeSeriesData) { setStockError("No time series data found."); return; }
    const chartData = Object.entries(timeSeriesData)
      .map(([date, values]) => ({ date, price: parseFloat(values["4. close"]) }))
      .sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-30);
    new Chart(canvas, {
      type: "line",
      data: { labels: chartData.map(d => d.date), datasets: [{ label: `${stockResults.symbol} Closing Price`, data: chartData.map(d => d.price), borderColor: "rgb(75, 192, 192)", backgroundColor: "rgba(75, 192, 192, 0.1)", fill: true, tension: 0.1, pointBackgroundColor: 'white', pointBorderColor: 'rgb(75, 192, 192)' }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: 'var(--finbot-text-secondary)' }, grid: { color: 'var(--finbot-border)' } }, y: { ticks: { color: 'var(--finbot-text-secondary)' }, grid: { color: 'var(--finbot-border)' } } }, plugins: { legend: { labels: { color: 'var(--finbot-text-heading)' } } } }
    });
  }, [stockResults]);

  const handleGetStockDetails = async () => {
    if (!stockSymbol) { setStockError("Please enter a stock symbol."); return; }
    setStockError(null); setStockResults(null); setIsStockLoading(true);
    // --- IMPORTANT: REPLACE WITH YOUR KEY ---
    const apiKey = "YOUR_NEW_API_KEY_HERE"; 
    // --- IMPORTANT: REPLACE WITH YOUR KEY ---
    if (apiKey === "YOUR_NEW_API_KEY_HERE" || apiKey === "demo") { setStockError("Please add your Alpha Vantage API key."); setIsStockLoading(false); return; }
    const urls = [`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockSymbol}&apikey=${apiKey}`, `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${apiKey}`, `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${apiKey}`];
    try {
      const [overviewRes, priceRes, tsRes] = await Promise.all(urls.map(url => fetch(url)));
      const [overviewData, priceData, tsData] = await Promise.all([overviewRes.json(), priceRes.json(), tsRes.json()]);
      if (overviewData.Note || priceData.Note || tsData.Note) throw new Error("API limit reached.");
      if (!overviewData.Symbol || !priceData["Global Quote"] || Object.keys(priceData["Global Quote"]).length === 0) throw new Error(`Could not find valid data for symbol: ${stockSymbol}`);
      setStockResults({ symbol: overviewData.Symbol, overview: overviewData, price: priceData["Global Quote"], timeSeries: tsData });
    } catch (error) { console.error("Stock fetch error:", error); setStockError(error.message); } 
    finally { setIsStockLoading(false); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMessage = chatInput.trim();
    if (!userMessage) return;
    setChatMessages(prev => [...prev, { sender: "user", text: userMessage }]);
    setChatInput(""); setIsBotTyping(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/financial-advice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: userMessage, userData: { monthly_income: planInputs.monthlyIncome, savings: planInputs.availableSavings, currency: "INR" } }) });
      if (!response.ok) { let errorMsg = "Failed response from advisor."; try { const errData = await response.json(); errorMsg = errData.error || errorMsg; } catch (pErr) {} throw new Error(errorMsg); }
      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: "bot", text: data.response }]);
    } catch (error) { console.error("Chat error:", error); setChatMessages(prev => [...prev, { sender: "bot", text: `Sorry, error: ${error.message}. (Is backend running?)` }]); } 
    finally { setIsBotTyping(false); }
  };

  const renderVariableCostInputs = () => {
    const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    const rows = [];
    for (let i = 0; i < months.length; i += 3) rows.push(months.slice(i, i + 3));
    return rows.map((row, rowIndex) => (
      <div className="input-row" key={rowIndex}>
        {row.map(month => (
          <div className="input-group" key={month}>
            <label htmlFor={`${month}-costs`}>{month.charAt(0).toUpperCase() + month.slice(1)} (INR)</label>
            <input type="number" id={`${month}-costs`} className="number-input" value={variableCosts[month]} onChange={handleVariableCostChange} min="0" step="0.01"/>
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div className="chatbot-container">
      <div className="chat-section">
        {/* Tabs */}
        <div className="tab-navigation">
          <div className={`tab-item ${activeSection === "welcome" ? "active" : ""}`} onClick={() => setActiveSection("welcome")}><i className="fas fa-home icon"></i><span>Home</span></div>
          <div className={`tab-item ${activeSection === "financial-planning" ? "active" : ""}`} onClick={() => setActiveSection("financial-planning")}><i className="fas fa-calculator icon"></i><span>Financial Planning</span></div>
          <div className={`tab-item ${activeSection === "stock-analysis" ? "active" : ""}`} onClick={() => setActiveSection("stock-analysis")}><i className="fas fa-chart-line icon"></i><span>Stock Analysis</span></div>
          <div className={`tab-item ${activeSection === "investment" ? "active" : ""}`} onClick={() => setActiveSection("investment")}><i className="fas fa-seedling icon"></i><span>Recommendations</span></div>
          <div className={`tab-item ${activeSection === "advisor" ? "active" : ""}`} onClick={() => setActiveSection("advisor")}><i className="fas fa-user-tie icon"></i><span>Financial Advisor</span></div>
        </div>

        {/* Welcome Section */}
        {activeSection === "welcome" && ( <div className="section-content active"><div className="welcome-message"><h1>Welcome</h1><p>Choose a service.</p><div className="section-cards">
              <div className="section-card" onClick={() => setActiveSection("financial-planning")}><div className="icon-container">{/* Icon */}</div><h3>Financial Planning</h3><p>Budgeting & goals</p></div>
              <div className="section-card" onClick={() => setActiveSection("stock-analysis")}><div className="icon-container">{/* Icon */}</div><h3>Stock Analysis</h3><p>Market insights</p></div>
              <div className="section-card" onClick={() => setActiveSection("investment")}><div className="icon-container">{/* Icon */}</div><h3>Recommendations</h3><p>Investment ideas</p></div>
              <div className="section-card" onClick={() => setActiveSection("advisor")}><div className="icon-container">{/* Icon */}</div><h3>Financial Advisor</h3><p>Ask questions</p></div>
        </div></div></div> )}

        {/* Financial Planning */}
        {activeSection === "financial-planning" && ( <div className="section-content active"><div className="financial-planning-inputs"><h2>Financial Planning</h2><h3>Monthly Income & Expenses</h3>
              <div className="input-row"><div className="input-group"><label htmlFor="monthly-income">1. Net Income (INR)</label><input type="number" id="monthly-income" className="number-input" value={planInputs.monthlyIncome} onChange={handlePlanInputChange}/></div>{/* More inputs... */}</div>
              {/* Rest of planning inputs, toggle, variable costs, button, summary display */}
              <div className="input-row">
                 <div className="input-group"><label htmlFor="outing-expenses">2. Outing (INR)</label><input type="number" id="outing-expenses" className="number-input" value={planInputs.outingExpenses} onChange={handlePlanInputChange}/></div>
                 <div className="input-group"><label htmlFor="transportation-costs">3. Transport (INR)</label><input type="number" id="transportation-costs" className="number-input" value={planInputs.transportationCosts} onChange={handlePlanInputChange}/></div>
                 <div className="input-group"><label htmlFor="fixed-costs">4. Other Fixed (INR)</label><input type="number" id="fixed-costs" className="number-input" value={planInputs.fixedCosts} onChange={handlePlanInputChange}/></div>
              </div>
               <div className="input-row">
                 <div className="input-group"><label htmlFor="food-costs">5. Food (INR)</label><input type="number" id="food-costs" className="number-input" value={planInputs.foodCosts} onChange={handlePlanInputChange}/></div>
                 <div className="input-group"><label htmlFor="available-savings">6. Savings (INR)</label><input type="number" id="available-savings" className="number-input" value={planInputs.availableSavings} onChange={handlePlanInputChange}/></div>
               </div>
              <div className="toggle-container"><label className="toggle-switch"><input type="checkbox" checked={hasVariableCosts} onChange={e => setHasVariableCosts(e.target.checked)}/><span className="toggle-slider"></span><span className="toggle-label">Variable Costs?</span></label></div>
              {hasVariableCosts && <div id="variable-costs-container"><h3>Monthly Variable Expenses</h3>{renderVariableCostInputs()}</div>}
              <button className="calculate-btn" onClick={handleCalculateSummary}>Calculate Summary</button>
              {summary && <div className="financial-summary"><h3>Summary</h3><div className="metrics-container"><div className="metrics-row">
                    <div className="metric"><div className="metric-label">Yearly Income</div><div className="metric-value">{formatCurrency(summary.yearlyIncome)}</div></div>
                    <div className="metric"><div className="metric-label">Yearly Expenses</div><div className="metric-value">{formatCurrency(summary.totalYearlyExpenses)}</div></div>
                    <div className="metric"><div className="metric-label">Yearly Investment</div><div className="metric-value">{formatCurrency(summary.yearlyInvestment)}</div></div>
              </div></div></div>}
        </div></div> )}

        {/* Stock Analysis */}
        {activeSection === "stock-analysis" && ( <div className="section-content active"><h2>Stock Analysis</h2><div className="stock-input-container"><input type="text" className="stock-input" placeholder="Enter symbol (e.g., AAPL)" value={stockSymbol} onChange={e => setStockSymbol(e.target.value.toUpperCase())}/><button className="stock-button" onClick={handleGetStockDetails} disabled={isStockLoading}>{isStockLoading ? "Loading..." : "Get Details"}</button></div>
              {stockError && <div className="error">{stockError}</div>}
              {isStockLoading && <div className="loading">Fetching...</div>}
              {stockResults && <div className="stock-analysis-results"><div className="stock-graph"><canvas ref={stockChartRef}></canvas></div><h3>Key Metrics</h3><div className="key-metrics">
                    <div className="metric-card"><div className="metric-label">Price</div><div className="metric-value">{stockResults.price["05. price"]}</div></div>
                    <div className="metric-card"><div className="metric-label">Change (%)</div><div className={`metric-value ${parseFloat(stockResults.price["10. change percent"]) >= 0 ? 'positive' : 'negative'}`}>{stockResults.price["10. change percent"]}</div></div>
                    <div className="metric-card"><div className="metric-label">Revenue (TTM)</div><div className="metric-value">{formatCurrency(stockResults.overview.RevenueTTM)}</div></div>
                    <div className="metric-card"><div className="metric-label">Net Income</div><div className="metric-value">{formatCurrency(stockResults.overview.NetIncome)}</div></div>
                    <div className="metric-card"><div className="metric-label">Margin</div><div className="metric-value">{(parseFloat(stockResults.overview.ProfitMargin) * 100).toFixed(2)}%</div></div>
              </div><div className="company-info"><h3>Company Info</h3><p><strong>Name:</strong> {stockResults.overview.Name}</p><p><strong>Industry:</strong> {stockResults.overview.Industry}</p><p><strong>Desc:</strong> {stockResults.overview.Description}</p></div></div>}
        </div> )}

        {/* Investment Recommendations */}
        {activeSection === "investment" && ( <div className="section-content active"><h2>Recommendations</h2><p>Investment recommendations section.</p></div> )}

        {/* Financial Advisor Chat */}
        {activeSection === "advisor" && (
          <div className="section-content active" id="advisor-content"> {/* Ensure ID if needed, ensure active class for layout */}
            {/* Messages */}
            <div className="messages-container">
              {chatMessages.map((msg, index) => (<div key={index} className={`message ${msg.sender}`}>{msg.text}</div>))}
              {isBotTyping && <div className="message bot bot-thinking"><div className="typing-indicator"><div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div></div></div>}
              <div ref={messagesEndRef} />
            </div>
            {/* Input Form */}
            <form className="input-area" onSubmit={handleSendMessage}>
              <textarea placeholder="Type message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} />
              <button type="submit" className="send-btn" disabled={isBotTyping}>➤</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinBot;