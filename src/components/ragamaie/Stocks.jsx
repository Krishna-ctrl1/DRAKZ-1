import { useEffect, useState } from "react";
import "../../styles/ragamaie/Stocks.css";

const API_BASE = "http://localhost:3001";

export default function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/user-investments`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch stocks");
        }

        const data = await res.json();
        setStocks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Could not load stocks.");
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  const formatPrice = (value) => {
    if (value == null) return "-";
    return `₹${Number(value).toFixed(2)}`;
  };

  const getChangeClass = (change) => {
    if (!change) return "";
    return String(change).includes("-") ? "red" : "green";
  };

  return (
    <div className="stocks-container">
      <div className="stocks-header">
        <h2>Your Stocks</h2>
        <button className="link-btn">View All</button>
      </div>

      {loading ? (
        <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
          Loading stocks...
        </p>
      ) : error ? (
        <p style={{ color: "#f87171", fontSize: "0.9rem" }}>{error}</p>
      ) : stocks.length === 0 ? (
        <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
          You don't have any stocks linked yet.
        </p>
      ) : (
        <div className="stocks-grid">
          {stocks.map((stock, i) => (
            <div className="stock-card" key={i}>
              <div className="stock-top">
                <span>{stock.name}</span>
                <span>{stock.symbol}</span>
              </div>
              <p className="stock-price">
                {formatPrice(stock.current_price)}
              </p>
              <span
                className={`stock-change ${getChangeClass(
                  stock.change_pct
                )}`}
              >
                {stock.change_pct}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}