import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../global/Header";
import Sidebar from "../global/Sidebar";
import CreditScore from "./CreditScore";
import "../../styles/deepthi/dashboard.css";
import Spendings from "./Spendings";
import "../../styles/deepthi/spendings.css";
import ExpenseDistributionPie from "./ExpenseDistributionPie";
import "../../styles/deepthi/expenseDistributionPie.css";
import CardsCarousel from "./CardsCarousel";
import "../../styles/deepthi/cardsCarousel.css";
import AccountSummary from "./AccountSummary";

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
    balance: "₹5,247.89",
    availableCredit: "₹4,752.11",
    creditLimit: "₹10,000.00",
  };

  const transactions = [
    {
      id: 1,
      merchant: "Amazon",
      amount: "-₹129.99",
      date: "2024-08-14",
      category: "Shopping",
    },
    {
      id: 2,
      merchant: "Starbucks",
      amount: "-₹4.50",
      date: "2024-08-13",
      category: "Food",
    },
    {
      id: 3,
      merchant: "Gas Station",
      amount: "-₹45.00",
      date: "2024-08-12",
      category: "Transport",
    },
    {
      id: 4,
      merchant: "Netflix",
      amount: "-₹15.99",
      date: "2024-08-11",
      category: "Entertainment",
    },
    {
      id: 5,
      merchant: "Payment Received",
      amount: "+₹500.00",
      date: "2024-08-10",
      category: "Payment",
    },
  ];

  return (
    <div className="dashboard-page deepthi-dashboard">
      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          width: 100%;
        }
        @media (min-width: 900px) {
          .dashboard-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="app deepthi-app">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={collapsed ? "main-content-collapsed" : "main-content"}>
          <div className="dashboard-content">
            {/* Dashboard Grid Layout */}
            <div className="dashboard-grid">
              <div className="dashboard-item">
                <AccountSummary />
              </div>
              <div className="dashboard-item">
                <CreditScore />
              </div>
              <div className="dashboard-item">
                <Spendings weeks={5} />
              </div>
              <div className="dashboard-item">
                <ExpenseDistributionPie days={30} />
              </div>
              <div className="dashboard-item">
                <CardsCarousel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
