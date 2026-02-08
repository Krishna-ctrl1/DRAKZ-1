import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios.api";
import "../../styles/ragamaie/Loans.css";

export default function Loans() {
  const [expanded, setExpanded] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        // Let the axios interceptor attach the token automatically
        const res = await api.get("/api/user-loans");
        setLoans(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Could not load loans.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  return (
    <div className="loans-dark-container">
      <h2 className="loans-title">Your Loans</h2>

      {loading ? (
        <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Loading loans...</p>
      ) : error ? (
        <p style={{ color: "#f87171", fontSize: "0.9rem" }}>{error}</p>
      ) : loans.length === 0 ? (
        <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
          No loans linked to your account yet.
        </p>
      ) : (
        <div className="loan-list">
          {loans.map((loan) => (
            <motion.div
              key={loan._id}
              layout
              className={`loan-card-dark ${(loan.status || "").toLowerCase()
                }`}
              onClick={() => toggleExpand(loan._id)}
              transition={{ layout: { duration: 0.3, type: "spring" } }}
            >
              <div className="loan-summary">
                <div>
                  <h3>{loan.type}</h3>
                  <p>
                    Principal: {formatCurrency(loan.principal)} | Balance:{" "}
                    {formatCurrency(loan.balance)}
                  </p>
                  <p>Loan Taken On: {loan.dateTaken}</p>
                </div>
                <span
                  className={`status-badge ${(loan.status || "").toLowerCase()
                    }`}
                >
                  {loan.status}
                </span>
              </div>

              <AnimatePresence>
                {expanded === loan._id && (
                  <motion.div
                    className="loan-details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p>Interest Rate: {loan.interestRate}%</p>
                    <p>Loan Term: {loan.term} years</p>
                    <p>EMI: {formatCurrency(loan.emi)}/month</p>
                    {loan.status !== "Paid" && loan.nextDue && (
                      <p>Next Payment Due: {loan.nextDue}</p>
                    )}
                    {loan.totalPaid != null && (
                      <p>Total Paid: {formatCurrency(loan.totalPaid)}</p>
                    )}
                    {loan.status === "Overdue" && (
                      <p className="overdue-text">
                        ⚠ Late Payment Fee Applied
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
