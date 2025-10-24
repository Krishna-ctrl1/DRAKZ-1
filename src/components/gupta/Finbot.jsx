import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto"; 
import "../../styles/gupta/Finbot.css"; 

// Main FinBot Component
const FinBot = () => {
  // State for active tab
  const [activeSection, setActiveSection] = useState("welcome");

  // State for Financial Planning inputs
  const [planInputs, setPlanInputs] = useState({
    monthlyIncome: 0,
    outingExpenses: 0,
    transportationCosts: 0,
    fixedCosts: 0,
    foodCosts: 0,
    availableSavings: 0,
  });
  const [hasVariableCosts, setHasVariableCosts] = useState(false);
  const [variableCosts, setVariableCosts] = useState({
    january: 0, february: 0, march: 0, april: 0,
    may: 0, june: 0, july: 0, august: 0,
    september: 0, october: 0, november: 0, december: 0,
  });
  const [summary, setSummary] = useState(null); // To store calculation results

  // State for Stock Analysis
  const [stockSymbol, setStockSymbol] = useState("");
  const [stockResults, setStockResults] = useState(null);
  const [stockError, setStockError] = useState(null);
  const [isStockLoading, setIsStockLoading] = useState(false);
  const stockChartRef = useRef(null); // Ref for the stock chart canvas

  // State for Financial Advisor Chat
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Welcome to your Financial Advisor! How can I help you today?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null); // To auto-scroll chat

  // --- Utility Functions ---

  // Scrolls chat to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Formats currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // --- Financial Planning Functions ---

  const handlePlanInputChange = (e) => {
    const { id, value } = e.target;
    setPlanInputs((prev) => ({ ...prev, [id]: parseFloat(value) || 0 }));
  };

  const handleVariableCostChange = (e) => {
    const { id, value } = e.target;
    const month = id.replace("-costs", "");
    setVariableCosts((prev) => ({ ...prev, [month]: parseFloat(value) || 0 }));
  };

  const handleCalculateSummary = () => {
    const yearlyIncome = planInputs.monthlyIncome * 12;
    const yearlyFixedCosts =
      (planInputs.transportationCosts +
        planInputs.foodCosts +
        planInputs.outingExpenses +
        planInputs.fixedCosts) *
      12;
    const yearlyVariableCosts = hasVariableCosts
      ? Object.values(variableCosts).reduce((sum, val) => sum + val, 0)
      : 0;
    
    const totalYearlyExpenses = yearlyFixedCosts + yearlyVariableCosts;
    const yearlyInvestment = yearlyIncome - totalYearlyExpenses;
    const monthlyInvestment = yearlyInvestment / 12;

    setSummary({
      yearlyIncome,
      totalYearlyExpenses,
      yearlyInvestment,
      monthlyInvestment,
    });
  };

  // --- Stock Analysis Functions ---

  // This effect updates the chart when stockResults state changes
  useEffect(() => {
    if (!stockResults || !stockResults.timeSeries) {
      return;
    }
    
    const canvas = stockChartRef.current;
    if (!canvas) return;

    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    const timeSeriesData = stockResults.timeSeries["Time Series (Daily)"];
    if (!timeSeriesData) {
        setStockError("No time series data found for this symbol.");
        return;
    }

    const chartData = Object.entries(timeSeriesData)
      .map(([date, values]) => ({
        date: date,
        price: parseFloat(values["4. close"]),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); // Last 30 days

    new Chart(canvas, {
      type: "line",
      data: {
        labels: chartData.map((d) => d.date),
        datasets: [
          {
            label: `${stockResults.symbol} Closing Price`,
            data: chartData.map((d) => d.price),
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.1)",
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: 'white' }, // Dark theme chart ticks
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          y: {
            ticks: { color: 'white' }, // Dark theme chart ticks
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        },
        plugins: {
          legend: {
            labels: { color: 'white' } // Dark theme legend
          }
        }
      },
    });
  }, [stockResults]);

  // Fetches stock data from Alpha Vantage
  const handleGetStockDetails = async () => {
    if (!stockSymbol) {
      setStockError("Please enter a stock symbol.");
      return;
    }
    
    setStockError(null);
    setStockResults(null);
    setIsStockLoading(true);
    
    // [!code warning] 
    // vvv IMPORTANT! Get your own free key from https://www.alphavantage.co/support/#api-key vvv
    const apiKey = "YOUR_NEW_API_KEY_HERE"; 
    // ^^^ IMPORTANT! Replace "YOUR_NEW_API_KEY_HERE" with your actual key ^^^

    if (apiKey === "YOUR_NEW_API_KEY_HERE") {
        setStockError("Please add your free Alpha Vantage API key to FinBot.jsx");
        setIsStockLoading(false);
        return;
    }

    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockSymbol}&apikey=${apiKey}`;
    const priceUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${apiKey}`;
    const timeseriesUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${apiKey}`;

    try {
      const [overviewRes, priceRes, tsRes] = await Promise.all([
        fetch(overviewUrl),
        fetch(priceUrl),
        fetch(timeseriesUrl),
      ]);

      const overviewData = await overviewRes.json();
      const priceData = await priceRes.json();
      const tsData = await tsRes.json();

      if (overviewData.Note || priceData.Note || tsData.Note) {
        throw new Error("API limit reached. Please try again later. (Or the 'demo' key is being used)");
      }
      if (!overviewData.Symbol || !priceData["Global Quote"] || Object.keys(priceData["Global Quote"]).length === 0) {
        throw new Error(`Could not find data for symbol: ${stockSymbol}`);
      }

      setStockResults({
        symbol: overviewData.Symbol,
        overview: overviewData,
        price: priceData["Global Quote"],
        timeSeries: tsData,
      });

    } catch (error) {
      console.error("Error fetching stock data:", error);
      setStockError(error.message);
    } finally {
      setIsStockLoading(false);
    }
  };

  // --- Financial Advisor Functions ---

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMessage = chatInput.trim();
    if (!userMessage) return;

    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage },
    ]);
    setChatInput("");
    setIsBotTyping(true);

    try {
      // This URL points to your Python server
      const response = await fetch("http://127.0.0.1:5000/api/financial-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMessage,
          userData: {
            monthly_income: planInputs.monthlyIncome,
            savings: planInputs.availableSavings,
            currency: "INR",
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to get response from advisor.");
      }

      const data = await response.json();
      
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.response },
      ]);

    } catch (error) {
      console.error("Error sending message:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Sorry, I encountered an error: ${error.message}. (Is your Python server running?)`,
        },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  // --- Helper to render all 12 month inputs ---
  const renderVariableCostInputs = () => {
    const months = [
      ["january", "february", "march"],
      ["april", "may", "june"],
      ["july", "august", "september"],
      ["october", "november", "december"],
    ];
    return months.map((row, rowIndex) => (
      <div className="input-row" key={rowIndex}>
        {row.map((month) => (
          <div className="input-group" key={month}>
            <label htmlFor={`${month}-costs`}>
              {month.charAt(0).toUpperCase() + month.slice(1)} (INR)
            </label>
            <input
              type="number"
              id={`${month}-costs`}
              className="number-input"
              value={variableCosts[month]}
              onChange={handleVariableCostChange}
              min="0"
              step="0.01"
            />
          </div>
        ))}
      </div>
    ));
  };


  // --- JSX (HTML) Content ---
  return (
    <div className="chatbot-container">
      <div className="chat-section">
        <div className="tab-navigation">
          <div
            className={`tab-item ${
              activeSection === "welcome" ? "active" : ""
            }`}
            onClick={() => setActiveSection("welcome")}
          >
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
            </svg>
            <span>Home</span>
          </div>
          <div
            className={`tab-item ${
              activeSection === "financial-planning" ? "active" : ""
            }`}
            onClick={() => setActiveSection("financial-planning")}
          >
             <svg className="icon" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"></path>
                <path d="M7 12h2v5H7zm4-7h2v12h-2zm4 4h2v8h-2z"></path>
              </svg>
            <span>Financial Planning</span>
          </div>
          <div
            className={`tab-item ${
              activeSection === "stock-analysis" ? "active" : ""
            }`}
            onClick={() => setActiveSection("stock-analysis")}
          >
             <svg className="icon" viewBox="0 0 24 24">
                <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"></path>
              </svg>
            <span>Stock Analysis</span>
          </div>
          <div
            className={`tab-item ${
              activeSection === "investment" ? "active" : ""
            }`}
            onClick={() => setActiveSection("investment")}
          >
             <svg className="icon" viewBox="0 0 24 24">
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path>
              </svg>
            <span>Investment Recommendations</span>
          </div>
          <div
            className={`tab-item ${
              activeSection === "advisor" ? "active" : ""
            }`}
            onClick={() => setActiveSection("advisor")}
          >
             <svg className="icon" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
              </svg>
            <span>Financial Advisor</span>
          </div>
        </div>

        {/* Welcome Section */}
        {activeSection === "welcome" && (
          <div className="section-content active" id="welcome-content">
            <div className="welcome-message">
              <h1>Welcome to DRAKZ Financial Assistant</h1>
              <p>
                Our AI-powered chatbot is here to help you with all your
                financial needs. Choose from one of our specialized services to
                get started.
              </p>
              <div className="section-cards">
                <div
                  className="section-card financial-planning"
                  onClick={() => setActiveSection("financial-planning")}
                >
                  <div className="icon-container">{/* Add your SVG/icon here */}</div>
                  <h3>Financial Planning</h3>
                  <p>Budget, savings, and retirement planning</p>
                </div>
                <div
                  className="section-card stock-analysis"
                  onClick={() => setActiveSection("stock-analysis")}
                >
                  <div className="icon-container">{/* Add your SVG/icon here */}</div>
                  <h3>Stock Analysis</h3>
                  <p>Market trends and stock performance</p>
                </div>
                <div
                  className="section-card investment"
                  onClick={() => setActiveSection("investment")}
                >
                  <div className="icon-container">{/* Add your SVG/icon here */}</div>
                  <h3>Recommendations</h3>
                  <p>Personalized investment opportunities</p>
                </div>
                <div
                  className="section-card advisor"
                  onClick={() => setActiveSection("advisor")}
                >
                  <div className="icon-container">{/* Add your SVG/icon here */}</div>
                  <h3>Financial Advisor</h3>
                  <p>Expert advice for your financial questions</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Planning Section */}
        {activeSection === "financial-planning" && (
          <div
            className="section-content active"
            id="financial-planning-content"
          >
            <h2>Financial Planning</h2>
            <div className="financial-planning-inputs">
            <h2>Monthly Income & Expenses</h2>
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="monthly-income">1. Monthly Net Income (INR)</label>
                  <input
                    type="number" id="monthly-income" className="number-input"
                    value={planInputs.monthlyIncome} onChange={handlePlanInputChange}
                    min="0" step="0.01"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="outing-expenses">2. Outing Expenses (INR)</label>
                  <input
                    type="number" id="outing-expenses" className="number-input"
                    value={planInputs.outingExpenses} onChange={handlePlanInputChange}
                    min="0" step="0.01"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="transportation-costs">3. Transportation Costs (INR)</label>
                  <input
                    type="number" id="transportation-costs" className="number-input"
                    value={planInputs.transportationCosts} onChange={handlePlanInputChange}
                    min="0" step="0.01"
                  />
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="fixed-costs">4. Other Fixed Costs (INR)</label>
                  <input
                    type="number" id="fixed-costs" className="number-input"
                    value={planInputs.fixedCosts} onChange={handlePlanInputChange}
                    min="0" step="0.01"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="food-costs">5. Food Costs (INR)</label>
                  <input
                    type="number" id="food-costs" className="number-input"
                    value={planInputs.foodCosts} onChange={handlePlanInputChange}
                    min="0" step="0.01"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="available-savings">6. Available Savings (INR)</label>
                  <input
                    type="number" id="available-savings" className="number-input"
                    value={planInputs.availableSavings} onChange={handlePlanInputChange}
                    min="0" step="0.01"
                  />
                </div>
              </div>

              <div className="toggle-container">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    id="variable-costs-toggle"
                    checked={hasVariableCosts}
                    onChange={(e) => setHasVariableCosts(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">
                    I have variable monthly costs
                  </span>
                </label>
              </div>

              {hasVariableCosts && (
                <div id="variable-costs-container">
                  <h3>Monthly Variable Expenses</h3>
                  {renderVariableCostInputs()}
                </div>
              )}

              <button
                id="calculate-summary"
                className="calculate-btn"
                onClick={handleCalculateSummary}
              >
                Calculate Financial Summary
              </button>

              {/* Results Display */}
              {summary && (
                <div id="financial-summary" className="financial-summary">
                  <h2>Financial Summary</h2>
                  <div className="metrics-container">
                    <div className="metrics-row">
                      <div className="metric">
                        <div className="metric-label">Yearly Income</div>
                        <div className="metric-value">
                          {formatCurrency(summary.yearlyIncome)}
                        </div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Yearly Expenses</div>
                        <div className="metric-value">
                          {formatCurrency(summary.totalYearlyExpenses)}
                        </div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">
                          Yearly Investment Capacity
                        </div>
                        <div className="metric-value">
                          {formatCurrency(summary.yearlyInvestment)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stock Analysis Section */}
        {activeSection === "stock-analysis" && (
          <div className="section-content active" id="stock-analysis-content">
            <h2>Stock Analysis</h2>
            <div className="stock-input-container">
              <input
                type="text"
                className="stock-input"
                id="stock-symbol"
                placeholder="Enter stock symbol (e.g., AAPL)"
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
              />
              <button
                className="stock-button"
                id="get-stock-details"
                onClick={handleGetStockDetails}
                disabled={isStockLoading}
              >
                {isStockLoading ? "Loading..." : "Get Details"}
              </button>
            </div>

            {stockError && <div className="error">{stockError}</div>}
            
            {isStockLoading && <div className="loading">Fetching stock data...</div>}

            {stockResults && (
              <div className="stock-analysis-results" id="stock-results">
                <div className="stock-graph">
                  <canvas id="stockChart" ref={stockChartRef}></canvas>
                </div>
                <h3>Key Financial Metrics</h3>
                <div className="key-metrics">
                  <div className="metric-card">
                    <div className="metric-label">Current Price</div>
                    <div className="metric-value">
                      {stockResults.price["05. price"]}
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Price Change (%)</div>
                    <div className={`metric-value ${parseFloat(stockResults.price["10. change percent"]) >= 0 ? 'positive' : 'negative'}`}>
                      {stockResults.price["10. change percent"]}
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Revenue (TTM)</div>
                    <div className="metric-value">
                      {formatCurrency(stockResults.overview.RevenueTTM)}
                    </div>
                  </div>
                   <div className="metric-card">
                    <div className="metric-label">Net Income</div>
                    <div className="metric-value">
                      {formatCurrency(stockResults.overview.NetIncome)}
                    </div>
                  </div>
                   <div className="metric-card">
                    <div className="metric-label">Net Margin</div>
                    <div className="metric-value">
                      {(parseFloat(stockResults.overview.ProfitMargin) * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="company-info">
                  <h3>Company Information</h3>
                  <p><strong>Name:</strong> {stockResults.overview.Name}</p>
                  <p><strong>Industry:</strong> {stockResults.overview.Industry}</p>
                  <p><strong>Description:</strong> {stockResults.overview.Description}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Investment Section */}
        {activeSection === "investment" && (
          <div className="section-content active" id="investment-content">
            <h2>Investment Recommendations</h2>
            <p>
              This section is ready to be built. You can add the logic from your
              `drakz_chatbot.js` file (lines 716-950) here, converting it to React
              state and functions just like the Stock Analysis section.
            </p>
          </div>
        )}

        {/* Financial Advisor Section */}
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
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form className="input-area" onSubmit={handleSendMessage}>
              <textarea
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button type="submit" className="send-btn" disabled={isBotTyping}>➤</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinBot;