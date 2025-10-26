import React, { useState } from "react"; // <-- 1. IMPORT useState
import Loans from "./Loans.jsx";
import Investment from "./Investments.jsx";
import Stocks from "./Stocks.jsx";
import LoanCalculator from "./LoanCalculator.jsx";
import StockChart from "./StockChart.jsx";
import Sidebar from "../global/Sidebar.jsx";
import Header from "../global/Header.jsx";
import "../../styles/ragamaie/InvestmentsPage.css";

function InvestmentsPage() {
  const [collapsed, setCollapsed] = useState(false); // <-- 2. ADD this state

  return (
    // 3. FIX: Change "app-container" to "dashboard-page" to match your other pages
    <div className="dashboard-page">
      {/* Header on top */}
      <Header />

      {/* 4. ADD this "app" wrapper div to hold sidebar + content */}
      <div className="app">
        {/* Sidebar on the left */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* 5. ADD logic to toggle the main content class */}
        <div className={collapsed ? "main-content-collapsed" : "main-content"}>
          {/* Content grid below header */}
          <div className="investments-grid">
            {/* Left column */}
            <div className="investments-left-colum">
              <Loans />
              <Investment />
              <Stocks />
            </div>

            {/* Right column */}
            <div className="investmentsright-column">
              <LoanCalculator />
              <StockChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default InvestmentsPage;
