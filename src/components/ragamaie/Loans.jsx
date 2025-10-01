import "../../styles/ragamaie/Loans.css";

export default function Loans() {
  const loans = [
    { type: "Home Loan", principal: "$200,000", progress: 50, emiDate: "2024-03-15" },
    { type: "Car Loan", principal: "$10,000", progress: 25, emiDate: "2024-03-10" }
  ];

  return (
    <div className="loans-container">
      <div className="loans-header">
        <h2>Loans</h2>
        <button className="btn-primary">Add New Loan</button>
      </div>
      {loans.map((loan, i) => (
        <div className="loan-card" key={i}>
          <div className="loan-top">
            <span>{loan.type}</span>
            <span>{loan.principal}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${loan.progress}%` }}></div>
          </div>
          <p className="emi-date">Next EMI Date: {loan.emiDate}</p>
        </div>
      ))}
    </div>
  );
}
