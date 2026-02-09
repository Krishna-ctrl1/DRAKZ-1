import { useEffect, useState } from "react";
import api from "../../api/axios.api";
import "../../styles/ragamaie/StockChart.css";
import { toCSV, downloadCSV } from "../../utils/csv.util";

export default function StockChart() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        // Let the axios interceptor attach the token automatically
        const res = await api.get("/api/investments/user-investments");
        setStocks(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Could not load stock table.");
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

  const getStatusClass = (change) => {
    if (!change) return "";
    return String(change).includes("-") ? "red" : "green";
  };

  return (
    <div className="stockchart-container">
      <div className="stockchart-header">
        <h2>Stock Chart</h2>
        <button
          className="link-btn"
          onClick={() => {
            if (!Array.isArray(stocks) || stocks.length === 0) return;
            const rows = stocks.map((s, index) => ({
              index: index + 1,
              symbol: s.symbol,
              current_price: s.current_price,
              change_pct: s.change_pct,
            }));
            const csv = toCSV(rows, [
              "index",
              "symbol",
              "current_price",
              "change_pct",
            ]);
            downloadCSV("stock-table.csv", csv);
          }}
        >
          Export CSV
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
          Loading stock table...
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
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{s.symbol}</td>
                <td>{formatPrice(s.current_price)}</td>
                <td className={getStatusClass(s.change_pct)}>{s.change_pct}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
