import { useEffect, useState } from "react";
import "../../styles/ragamaie/StockChart.css";

const API_BASE = "http://localhost:3001";

// Symbols to show in the Stock Chart
const SYMBOLS = ["NFLX", "AMZN", "AAPL", "META"];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function StockChart() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRealtimeStocks = async () => {
      try {
        setLoading(true);
        setError("");

        // 1) Get API key from backend
        const keyRes = await fetch(`${API_BASE}/api/getStockApiKey`);
        if (!keyRes.ok) throw new Error("Failed to fetch API key");
        const { apiKey } = await keyRes.json();

        const results = [];

        // 2) Call Alpha Vantage for each symbol with a delay to avoid rate limits
        for (const symbol of SYMBOLS) {
          const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
          const res = await fetch(url);
          const json = await res.json();
          const quote = json["Global Quote"] || {};

          const price = parseFloat(quote["05. price"]);
          const changePct = quote["10. change percent"];

          results.push({
            symbol,
            price: isNaN(price) ? null : price,
            change: changePct || "",
          });

          // Alpha Vantage free tier: ~5 calls / min, so wait a bit
          await delay(1200);
        }

        setStocks(results);
      } catch (err) {
        console.error(err);
        setError("Could not load stock data.");
        setStocks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRealtimeStocks();
  }, []);

  const formatPrice = (value) => {
    if (value == null) return "-";
    return `$${value.toFixed(2)}`;
  };

  const getStatusClass = (change) => {
    if (!change) return "";
    return String(change).includes("-") ? "red" : "green";
  };

  return (
    <div className="stockchart-container">
      <div className="stockchart-header">
        <h2>Stock Chart</h2>
      </div>

      {loading ? (
        <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
          Loading real-time stock data...
        </p>
      ) : error ? (
        <p style={{ color: "#f87171", fontSize: "0.9rem" }}>{error}</p>
      ) : stocks.length === 0 ? (
        <p style={{ color: "#9ca3af", fontSize: "0.9rem", padding: "10px" }}>
          No stock data to display.
        </p>
      ) : (
        <table className="stock-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Symbol</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((s, index) => (
              <tr key={s.symbol || index}>
                <td>{index + 1}</td>
                <td>{s.symbol}</td>
                <td>{formatPrice(s.price)}</td>
                <td className={getStatusClass(s.change)}>{s.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
