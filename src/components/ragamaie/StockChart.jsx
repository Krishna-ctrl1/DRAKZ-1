import "../../styles/ragamaie/StockChart.css";

export default function StockChart() {
  const stocks = [
    { id: 1, name: "NFLX", price: "$416.03", status: "+3.37%" },
    { id: 2, name: "AMZN", price: "$316.02", status: "+2.09%" },
    { id: 3, name: "AAPL", price: "$178.61", status: "+1.36%" },
    { id: 4, name: "NFLX", price: "$416.03", status: "+0.23%" },
    { id: 5, name: "META", price: "$285.50", status: "-0.44%" },
  ];

  return (
    <div className="stockchart-container">
      <div className="stockchart-header">
        <h2>Stock Chart</h2>
      </div>
      <table className="stock-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.name}</td>
              <td>{s.price}</td>
              <td className={s.status.includes("-") ? "red" : "green"}>
                {s.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
