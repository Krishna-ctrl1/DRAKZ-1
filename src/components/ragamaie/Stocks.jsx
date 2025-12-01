import { useEffect, useState } from "react";
import "../../styles/ragamaie/Stocks.css";

const API_BASE = "http://localhost:3001";

// Symbols you want live data for
const SYMBOLS = [
  { name: "Apple", symbol: "AAPL" },
  { name: "Netflix", symbol: "NFLX" },
  { name: "Meta", symbol: "META" },
  { name: "Amazon", symbol: "AMZN" },
];

export default function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRealtimeStocks = async () => {
      try {
        setLoading(true);
        setError("");

        // 1) Get API key from your backend
        const keyRes = await fetch(`${API_BASE}/api/getStockApiKey`);
        if (!keyRes.ok) throw new Error("Failed to fetch API key");
        const { apiKey } = await keyRes.json();

        // 2) Fetch each symbol from Alpha Vantage
        const promises = SYMBOLS.map(async ({ name, symbol }) => {
          const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
          const res = await fetch(url);
          const json = await res.json();

          const quote = json["Global Quote"] || {};
          const price = parseFloat(quote["05. price"]) || null;
          const changePct = quote["10. change percent"] || null;

          return {
            name,
            symbol,
            price,
            change: changePct, // e.g. "1.23%"
          };
        });

        const results = await Promise.all(promises);
        setStocks(results);
      } catch (err) {
        console.error(err);
        setError("Could not load real-time stocks.");
        setStocks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRealtimeStocks();
  }, []);

  const formatPrice = (value) => {
    if (!value && value !== 0) return "-";
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="stocks-container">
      <div className="stocks-header">
        <h2>Your Stocks</h2>
        <button className="link-btn">View All</button>
      </div>

      {loading ? (
        <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
          Loading real-time stocks...
        </p>
      ) : error ? (
        <p style={{ color: "#f87171", fontSize: "0.9rem" }}>{error}</p>
      ) : stocks.length === 0 ? (
        <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
          No stock data available.
        </p>
      ) : (
        <div className="stocks-grid">
          {stocks.map((stock, i) => (
            <div className="stock-card" key={i}>
              <div className="stock-top">
                <span>{stock.name}</span>
                <span>{stock.symbol}</span>
              </div>
              <p className="stock-price">{formatPrice(stock.price)}</p>
              <span
                className={`stock-change ${
                  stock.change && stock.change.includes("-") ? "red" : "green"
                }`}
              >
                {stock.change || ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
