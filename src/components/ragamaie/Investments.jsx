import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../../styles/ragamaie/investments.css";

const API_BASE = "http://localhost:3001";

export default function Investments() {
  const [range, setRange] = useState("6M");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `${API_BASE}/api/investment-history?range=${range}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch investment history");
        }

        const apiData = await res.json();

        // expecting [{ name: "Nov", value: 4925 }, ...]
        if (Array.isArray(apiData)) {
          setData(apiData);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error(err);
        setError("Could not load investment data.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [range]);

  const lastValue =
    data && data.length > 0 ? data[data.length - 1].value : 0;

  // you can later also calculate this from backend; for now keep fixed
  const growthPercent =
    range === "1M" ? "1.8" : range === "6M" ? "6.9" : "12.5";

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h2>Total Investment</h2>
        <div className="range-buttons">
          {["1M", "6M", "1Y"].map((r) => (
            <button
              key={r}
              className={`range-btn ${range === r ? "active" : ""}`}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "#9ca3af",
            fontSize: "0.95rem",
          }}
        >
          Loading investment data...
        </div>
      ) : error ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "#f87171",
            fontSize: "0.95rem",
          }}
        >
          {error}
        </div>
      ) : data.length > 0 ? (
        <>
          <p className="investment-value">
            ₹{lastValue.toLocaleString()}{" "}
            <span className="growth-text">(+{growthPercent}%)</span>
          </p>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data}>
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1f29",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "#9ca3af",
            fontSize: "0.95rem",
          }}
        >
          No investment data available
        </div>
      )}
    </div>
  );
}
