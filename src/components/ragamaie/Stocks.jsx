import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../../styles/ragamaie/Stocks.css";
import { toCSV, downloadCSV } from "../../utils/csv.util";
import { fetchStocks } from "../../redux/slices/stocksSlice";

export default function Stocks() {
  const dispatch = useDispatch();

  const { list: stocks, loading, error } = useSelector(
    (state) => state.stocks
  );

  useEffect(() => {
    dispatch(fetchStocks());
  }, [dispatch]);

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
        <button
          className="link-btn"
          onClick={() => {
            if (!stocks.length) return;
            const rows = stocks.map((s) => ({
              name: s.name,
              symbol: s.symbol,
              current_price: s.current_price,
              change_pct: s.change_pct,
            }));
            const csv = toCSV(rows, [
              "name",
              "symbol",
              "current_price",
              "change_pct",
            ]);
            downloadCSV("stocks.csv", csv);
          }}
        >
          Export CSV
        </button>
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
                className={`stock-change ${getChangeClass(stock.change_pct)}`}
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
