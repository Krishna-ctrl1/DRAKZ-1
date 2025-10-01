import React from "react";
import Loans from "./Loans.jsx";
import Investment from "./Investments.jsx";
import Stocks from "./Stocks.jsx";
import LoanCalculator from "./LoanCalculator.jsx";
import StockChart from "./StockChart.jsx";
import Sidebar from "../global/Sidebar.jsx";
import Header from "../global/Header.jsx"

import "../styles/App.css";

function InvestmentsPage() {
  return (
    <div className="app-container">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main dashboard area */}
      <div className="main-content">
        {/* Header on top */}
        <Header />

        {/* Content grid below header */}
        <div className="dashboard-grid">
          {/* Left column */}
          <div className="left-column">
            <Loans />
            <Investment />
            <Stocks />
          </div>

          {/* Right column */}
          <div className="right-column">
            <LoanCalculator />
            <StockChart />
          </div>
        </div>
      </div>
    </div>
  );
}
export default InvestmentsPage;
