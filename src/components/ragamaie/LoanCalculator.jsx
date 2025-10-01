import { useState } from "react";
import "../../styles/ragamaie/LoanCalculator.css";

export default function LoanCalculator() {
  const [amount, setAmount] = useState(2600000);
  const [rate, setRate] = useState(7.5);
  const [tenure, setTenure] = useState(10);

  const calculateEMI = () => {
    const monthlyRate = rate / 100 / 12;
    const months = tenure * 12;
    return (
      (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    ).toFixed(2);
  };

  return (
    <div className="loan-calculator">
      <h2>Loan Calculator</h2>
      <label>Home Loan Amount</label>
      <input type="range" min="0" max="20000000" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <p>₹ {amount}</p>

      <label>Interest Rate</label>
      <input type="range" min="5" max="15" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
      <p>{rate}%</p>

      <label>Loan Tenure (Years)</label>
      <input type="range" min="1" max="20" value={tenure} onChange={(e) => setTenure(e.target.value)} />
      <p>{tenure} years</p>

      <button className="btn-primary">Calculate EMI</button>
      <p className="emi-result">EMI: ₹ {calculateEMI()}</p>
    </div>
  );
}
