import React, { useEffect, useState } from "react";
import getAccountSummary from "./api/getAccountSummary";
import "../../styles/deepthi/accountSummary.css";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

const AccountSummary = () => {
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        console.log("Fetching account summary...");
        const data = await getAccountSummary();
        console.log("Account summary data:", data);
        if (data?.debug) {
          console.log(
            `[Debug] UserID: ${data.debug.userId}, Records Found: ${data.debug.count}`,
          );
        }
        // Only set API values; no demo fallback here
        setSummary({
          income: Number(data?.income) || 0,
          expense: Number(data?.expense) || 0,
          balance: Number(data?.balance) || 0,
          debug: data?.debug,
        });
      } catch (error) {
        console.error("Failed to load account summary");
        // Keep zeros on failure; expose no fake values
        setSummary({ income: 0, expense: 0, balance: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const formatCurrency = (amount) => {
    const value = Number(amount) || 0;
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}k`;
    }
    return `₹${value}`;
  };

  return (
    <div className="account-summary-container">
      <h3 className="account-summary-title">Account Summary</h3>

      {/* Debug Info - Remove later */}
      {summary.debug && (
        <div style={{ fontSize: "10px", color: "#aaa", marginBottom: "10px" }}>
          {/* Debug: User {summary.debug.userId?.slice(-4)} | Records:{" "}
          {summary.debug.count} */}
        </div>
      )}

      <div className="summary-cards">
        {/* Incoming */}
        <div className="summary-card">
          <div
            className="progress-circle"
            style={{ "--color": "#2563eb", "--percent": "75%" }}
          >
            <div className="icon-container">
              <FaArrowDown style={{ transform: "rotate(45deg)" }} />
            </div>
          </div>
          <div className="summary-details">
            <span className="summary-amount">
              {formatCurrency(summary.income)}
            </span>
            <span className="summary-label">Incoming</span>
          </div>
        </div>

        {/* Outgoing */}
        <div className="summary-card">
          <div
            className="progress-circle"
            style={{ "--color": "#c026d3", "--percent": "45%" }}
          >
            <div className="icon-container">
              <FaArrowUp style={{ transform: "rotate(45deg)" }} />
            </div>
          </div>
          <div className="summary-details">
            <span className="summary-amount">
              {formatCurrency(summary.expense)}
            </span>
            <span className="summary-label">Outgoing</span>
          </div>
        </div>

        {/* Balance */}
        <div className="summary-card">
          <div
            className="progress-circle"
            style={{ "--color": "#eab308", "--percent": "60%" }}
          >
            <div className="icon-container">
              <FaArrowUp style={{ transform: "rotate(45deg)" }} />
            </div>
          </div>
          <div className="summary-details">
            <span className="summary-amount">
              {formatCurrency(summary.balance)}
            </span>
            <span className="summary-label">Balance</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;
