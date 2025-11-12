import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/ragamaie/Loans.css";

export default function Loans() {
  const [expanded, setExpanded] = useState(null);

  const loans = [
    {
      id: 1,
      type: "Home Loan",
      principal: 2000000,
      balance: 1450000,
      dateTaken: "March 15, 2022",
      status: "Active",
      interestRate: 7.5,
      term: 10,
      emi: 24500,
      nextDue: "November 28, 2025",
      totalPaid: 550000,
    },
    {
      id: 2,
      type: "Car Loan",
      principal: 1000000,
      balance: 300000,
      dateTaken: "January 10, 2021",
      status: "Paid",
      interestRate: 9.2,
      term: 5,
      emi: 21000,
      totalPaid: 1000000,
    },
    {
      id: 3,
      type: "Education Loan",
      principal: 800000,
      balance: 250000,
      dateTaken: "July 5, 2020",
      status: "Overdue",
      interestRate: 6.8,
      term: 8,
      emi: 15500,
      nextDue: "November 5, 2025",
      totalPaid: 550000,
    },
  ];

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="loans-dark-container">
      <h2 className="loans-title">Your Loans</h2>
      <div className="loan-list">
        {loans.map((loan) => (
          <motion.div
            key={loan.id}
            layout
            className={`loan-card-dark ${loan.status.toLowerCase()}`}
            onClick={() => toggleExpand(loan.id)}
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
              <span className={`status-badge ${loan.status.toLowerCase()}`}>
                {loan.status}
              </span>
            </div>

            <AnimatePresence>
              {expanded === loan.id && (
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
                  {loan.status !== "Paid" && (
                    <p>Next Payment Due: {loan.nextDue}</p>
                  )}
                  <p>Total Paid: {formatCurrency(loan.totalPaid)}</p>
                  {loan.status === "Overdue" && (
                    <p className="overdue-text">⚠ Late Payment Fee Applied</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
