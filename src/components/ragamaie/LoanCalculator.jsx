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

  const [errors, setErrors] = useState({
    amount: "",
    rate: "",
    tenure: "",
  });

  useEffect(() => {
    // Only calculate if there are no errors and values are present
    // (Checked against empty string to prevent NaN calculations)
    if (
      !errors.amount &&
      !errors.rate &&
      !errors.tenure &&
      amount !== "" &&
      rate !== "" &&
      tenure !== ""
    ) {
      calculateLoanDetails();
    }
  }, [amount, rate, tenure, errors]);

  const validateField = (fieldName, value) => {
    if (value <= 0 && value !== "") {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "Field cannot be zero or negative",
      }));
      return false;
    } else {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
      return true;
    }
  };

  const calculateLoanDetails = () => {
    const principal = Number(amount);
    const monthlyRate = rate / 100 / 12;
    const months = tenure * 12;

    const emiCalc =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const totalPaymentCalc = emiCalc * months;
    const totalInterestCalc = totalPaymentCalc - principal;
    const interestPercentCalc = (totalInterestCalc / principal) * 100;

    // Check against infinity/NaN in case of bad inputs
    if (isFinite(emiCalc)) {
      setEmi(emiCalc.toFixed(2));
      setTotalPayment(totalPaymentCalc.toFixed(2));
      setTotalInterest(totalInterestCalc.toFixed(2));
      setInterestPercent(interestPercentCalc.toFixed(1));
    }
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

      {/* Amount Input */}
      <div className="input-group">
        <label>Loan Amount (₹)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => {
            const val = Number(e.target.value);
            setAmount(val);
            validateField("amount", val);
          }}
          placeholder="Enter loan amount"
        />
        {errors.amount && <p className="error-text">{errors.amount}</p>}
      </div>

      {/* Rate Input - FIXED */}
      <div className="input-group">
        <label>Interest Rate (%)</label>
        <input
          type="number"
          step="0.1"
          value={rate}
          onChange={(e) => {
            const inputValue = e.target.value;

            // Fix 1: Handle empty input to prevent "012" behavior
            if (inputValue === "") {
              setRate("");
              return;
            }

            const val = Number(inputValue);

            // Fix 2: Cap the interest rate at 100
            if (val > 100) return;

            setRate(val);
            validateField("rate", val);
          }}
          placeholder="Enter interest rate"
        />
        {errors.rate && <p className="error-text">{errors.rate}</p>}
      </div>

      {/* Tenure Input */}
      <div className="input-group">
        <label>Loan Tenure (Years)</label>
        <input
          type="number"
          value={tenure}
          onChange={(e) => {
            const val = Number(e.target.value);
            setTenure(val);
            validateField("tenure", val);
          }}
          placeholder="Enter loan tenure"
        />
        {errors.tenure && <p className="error-text">{errors.tenure}</p>}
      </div>

      {/* Summary */}
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
        </div>
      </div>
    </div>
  );
}