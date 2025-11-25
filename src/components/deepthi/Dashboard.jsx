import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../global/Header";
import Sidebar from "../global/Sidebar";
import CreditScore from "./CreditScore";
import "../../styles/deepthi/dashboard.css";
const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [collapsed, setCollapsed] = useState(false); // ADDED: State for sidebar collapse

  const handleLogout = () => {
    navigate("/");
  };

  const cardData = {
    cardNumber: "**** **** **** 1234",
    cardHolder: "JOHN DRAKZ",
    expiryDate: "12/28",
    balance: "$5,247.89",
    availableCredit: "$4,752.11",
    creditLimit: "$10,000.00",
  };

  const transactions = [
    {
      id: 1,
      merchant: "Amazon",
      amount: "-$129.99",
      date: "2024-08-14",
      category: "Shopping",
    },
    {
      id: 2,
      merchant: "Starbucks",
      amount: "-$4.50",
      date: "2024-08-13",
      category: "Food",
    },
    {
      id: 3,
      merchant: "Gas Station",
      amount: "-$45.00",
      date: "2024-08-12",
      category: "Transport",
    },
    {
      id: 4,
      merchant: "Netflix",
      amount: "-$15.99",
      date: "2024-08-11",
      category: "Entertainment",
    },
    {
      id: 5,
      merchant: "Payment Received",
      amount: "+$500.00",
      date: "2024-08-10",
      category: "Payment",
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="app">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={collapsed ? "main-content-collapsed" : "main-content"}>
          <div className="dashboard-content">
            <div
              className="dashboard-container"
              style={{ display: "flex", gap: 20 }}
            >
              <CreditScore />
              {/* Card Section */}
              <div className="card-section">
                <div className="virtual-card">
                  <div className="card-background">
                    <img
                      src="/card.png"
                      alt="DRAKZ Card"
                      className="card-bg-img"
                    />
                    <div className="card-overlay">
                      <div className="card-info">
                        <div className="card-number">{cardData.cardNumber}</div>
                        <div className="card-details">
                          <div className="card-holder">
                            {cardData.cardHolder}
                          </div>
                          <div className="card-expiry">
                            {cardData.expiryDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="balance-info">
                  <div className="balance-item">
                    <h3>Current Balance</h3>
                    <p className="balance-amount">{cardData.balance}</p>
                  </div>
                  <div className="balance-item">
                    <h3>Available Credit</h3>
                    <p className="credit-amount">{cardData.availableCredit}</p>
                  </div>
                  <div className="balance-item">
                    <h3>Credit Limit</h3>
                    <p className="limit-amount">{cardData.creditLimit}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="dashboard-tabs">
                <button
                  className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  className={`tab-btn ${activeTab === "transactions" ? "active" : ""}`}
                  onClick={() => setActiveTab("transactions")}
                >
                  Transactions
                </button>
                <button
                  className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  Settings
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === "overview" && (
                  <div
                    className="overview-content"
                    style={{ display: "flex", gap: 20 }}
                  >
                    {/* Left column: Credit Score + Quick actions */}
                    <div style={{ flex: 1 }}>
                      <div className="quick-actions" style={{ marginTop: 20 }}>
                        <h3>Quick Actions</h3>
                        <div className="action-buttons">
                          <button className="action-btn">Transfer Money</button>
                          <button className="action-btn">Pay Bills</button>
                          <button className="action-btn">
                            View Statements
                          </button>
                          <button className="action-btn">Freeze Card</button>
                        </div>
                      </div>
                    </div>

                    {/* Right column: Transactions preview */}
                    <div style={{ flex: 1 }}>
                      <div className="recent-activity">
                        <h3>Recent Transactions</h3>
                        <div className="transaction-list">
                          {transactions.slice(0, 3).map((transaction) => (
                            <div
                              key={transaction.id}
                              className="transaction-item"
                            >
                              <div className="transaction-info">
                                <span className="merchant">
                                  {transaction.merchant}
                                </span>
                                <span className="category">
                                  {transaction.category}
                                </span>
                              </div>
                              <div className="transaction-details">
                                <span
                                  className={`amount ${transaction.amount.startsWith("+") ? "positive" : "negative"}`}
                                >
                                  {transaction.amount}
                                </span>
                                <span className="date">{transaction.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "transactions" && (
                  <div className="transactions-content">
                    <div className="transactions-header">
                      <h3>All Transactions</h3>
                      <button className="filter-btn">Filter</button>
                    </div>
                    <div className="transaction-list">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="transaction-item">
                          <div className="transaction-info">
                            <span className="merchant">
                              {transaction.merchant}
                            </span>
                            <span className="category">
                              {transaction.category}
                            </span>
                          </div>
                          <div className="transaction-details">
                            <span
                              className={`amount ${transaction.amount.startsWith("+") ? "positive" : "negative"}`}
                            >
                              {transaction.amount}
                            </span>
                            <span className="date">{transaction.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="settings-content">
                    <div className="settings-section">
                      <h3>Account Settings</h3>
                      <div className="settings-items">
                        <div className="setting-item">
                          <span>Change Password</span>
                          <button className="setting-btn">Update</button>
                        </div>
                        <div className="setting-item">
                          <span>Notification Preferences</span>
                          <button className="setting-btn">Manage</button>
                        </div>
                        <div className="setting-item">
                          <span>Security Settings</span>
                          <button className="setting-btn">Configure</button>
                        </div>
                      </div>
                    </div>

                    <div className="settings-section">
                      <h3>Card Settings</h3>
                      <div className="settings-items">
                        <div className="setting-item">
                          <span>PIN Management</span>
                          <button className="setting-btn">Change PIN</button>
                        </div>
                        <div className="setting-item">
                          <span>Transaction Limits</span>
                          <button className="setting-btn">Set Limits</button>
                        </div>
                        <div className="setting-item">
                          <span>Card Controls</span>
                          <button className="setting-btn">Manage</button>
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

export default Dashboard;
