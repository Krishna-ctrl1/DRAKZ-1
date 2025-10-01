import "../../styles/ragamaie/Stocks.css";

export default function Stocks() {
  const stocks = [
    { name: "Apple", symbol: "AAPL", price: 178.61, change: "+1.5%" },
    { name: "Netflix", symbol: "NFLX", price: 416.03, change: "+3.37%" },
    { name: "Meta", symbol: "META", price: 285.50, change: "-0.44%" },
    { name: "OpenAI", symbol: "OpenAI", price: 195.50, change: "-0.46%" },
  ];

  return (
    <div className="stocks-container">
      <div className="stocks-header">
        <h2>Your Stocks</h2>
        <button className="link-btn">View All</button>
      </div>
      <div className="stocks-grid">
        {stocks.map((stock, i) => (
          <div className="stock-card" key={i}>
            <div className="stock-top">
              <span>{stock.name}</span>
              <span>{stock.symbol}</span>
            </div>
            <p className="stock-price">${stock.price}</p>
            <span className={`stock-change ${stock.change.includes("-") ? "red" : "green"}`}>
              {stock.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
