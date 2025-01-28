import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../api/axios.api";
import { getToken } from "../../auth/auth.js";
import "../../styles/ragamaie/investments.css";

export default function Investments() {
  const [range, setRange] = useState("6M");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check token availability when component mounts
    const token = getToken();
    console.log("[INVESTMENTS] Component mounted, token status:", token ? "✓ Present" : "✗ Missing");
    
    const fetchHistory = async () => {
      setLoading(true);
      setError("");

      try {
        console.log("[INVESTMENTS] Making API request for investment-history...");
        const res = await api.get(`/api/investment-history?range=${range}`);

        // expecting [{ name: "Nov", value: 4925 }, ...] OR [{ name: "3", value: 4200 }, ...]
        if (Array.isArray(res.data)) {
          setData(res.data);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("[INVESTMENTS] API error:", err);
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
  const firstValue =
    data && data.length > 0 ? data[0].value : 0;

  const growthPercent =
    firstValue > 0
      ? (((lastValue - firstValue) / firstValue) * 100).toFixed(1)
      : "0.0";

  // For 1M range, only show ticks like 1, 5, 10, 15, 20, 25, 30
  const getXAxisTicks = () => {
    if (range !== "1M" || data.length === 0) return undefined;

    const days = data
      .map((d) => Number(d.name))
      .filter((n) => !Number.isNaN(n));

    if (days.length === 0) return undefined;

    const min = Math.min(...days);
    const max = Math.max(...days);

    const candidates = [1, 5, 10, 15, 20, 25, 30, 31];

    return candidates
      .filter((d) => d >= min && d <= max)
      .map((d) => String(d));
  };

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
            <span className="growth-text">
              (+{growthPercent}%)
            </span>
          </p>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                ticks={getXAxisTicks()}
              />
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
