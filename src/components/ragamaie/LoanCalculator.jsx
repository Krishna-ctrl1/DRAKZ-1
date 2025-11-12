import { useState, useEffect } from "react";
import "../../styles/ragamaie/LoanCalculator.css";

export default function LoanCalculator() {
  const [amount, setAmount] = useState(2000000);
  const [rate, setRate] = useState(7.5);
  const [tenure, setTenure] = useState(10);
  const [emi, setEmi] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [interestPercent, setInterestPercent] = useState(0);

  useEffect(() => {
    calculateLoanDetails();
  }, [amount, rate, tenure]);

  const calculateLoanDetails = () => {
    const principal = Number(amount);
    const monthlyRate = rate / 100 / 12;
    const months = tenure * 12;

    if (principal <= 0 || rate <= 0 || tenure <= 0) {
      setEmi(0);
      setTotalPayment(0);
      setTotalInterest(0);
      return;
    }

    const emiCalc =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const totalPaymentCalc = emiCalc * months;
    const totalInterestCalc = totalPaymentCalc - principal;
    const interestPercentCalc = (totalInterestCalc / principal) * 100;

    setEmi(emiCalc.toFixed(2));
    setTotalPayment(totalPaymentCalc.toFixed(2));
    setTotalInterest(totalInterestCalc.toFixed(2));
    setInterestPercent(interestPercentCalc.toFixed(1));
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="loan-calculator-dark">
      <h2>Home Loan Calculator</h2>

      <div className="input-group">
        <label>Loan Amount (₹)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Enter loan amount"
        />
      </div>

      <div className="input-group">
        <label>Interest Rate (%)</label>
        <input
          type="number"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          placeholder="Enter interest rate"
        />
      </div>

      <div className="input-group">
        <label>Loan Tenure (Years)</label>
        <input
          type="number"
          value={tenure}
          onChange={(e) => setTenure(Number(e.target.value))}
          placeholder="Enter loan tenure"
        />
      </div>

      <div className="emi-display">
        <h3>Loan Summary</h3>
        <div className="loan-results">
          <p>
            <span>Estimated EMI:</span>
            <strong>{formatCurrency(emi)}</strong>
          </p>
          <p>
            <span>Total Payment:</span>
            <strong>{formatCurrency(totalPayment)}</strong>
          </p>
          <p>
            <span>Total Interest:</span>
            <strong>{formatCurrency(totalInterest)}</strong>
          </p>
          <p>
            <span>Interest % of Principal:</span>
            <strong>{interestPercent}%</strong>
          </p>
          {/* <p>
            <span>Principal Amount:</span>
            <strong>{formatCurrency(amount)}</strong>
          </p> */}
        </div>
      </div>
    </div>
  );
}
