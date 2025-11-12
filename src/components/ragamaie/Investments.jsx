import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../../styles/ragamaie/Investments.css";

export default function Investments() {
  const [range, setRange] = useState("6M");

  // 1M (daily, with realistic ups/downs)
  const oneMonthData = [
    { name: "Nov 01", value: 4680 },
    { name: "Nov 05", value: 4720 },
    { name: "Nov 10", value: 4785 },
    { name: "Nov 15", value: 4750 },
    { name: "Nov 20", value: 4825 },
    { name: "Nov 25", value: 4895 },
    { name: "Nov 30", value: 4925 },
  ];

  // 6M (monthly, smooth long-term growth)
  const sixMonthData = [
    { name: "Jun", value: 4200 },
    { name: "Jul", value: 4350 },
    { name: "Aug", value: 4430 },
    { name: "Sep", value: 4550 },
    { name: "Oct", value: 4730 },
    { name: "Nov", value: 4925 },
  ];

  // 1Y (full-year realistic fluctuations)
  const oneYearData = [
    { name: "Jan", value: 3980 },
    { name: "Feb", value: 4120 },
    { name: "Mar", value: 4300 },
    { name: "Apr", value: 4225 },
    { name: "May", value: 4400 },
    { name: "Jun", value: 4200 },
    { name: "Jul", value: 4350 },
    { name: "Aug", value: 4430 },
    { name: "Sep", value: 4550 },
    { name: "Oct", value: 4730 },
    { name: "Nov", value: 4925 },
    { name: "Dec", value: 5050 },
  ];

  const getData = () => {
    switch (range) {
      case "1M":
        return oneMonthData;
      case "6M":
        return sixMonthData;
      case "1Y":
        return oneYearData;
      default:
        return sixMonthData;
    }
  };

  const data = getData();

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

      {data.length > 0 ? (
        <>
          <p className="investment-value">
            ₹{data[data.length - 1].value.toLocaleString()}{" "}
            <span className="growth-text">(+{range === "1M" ? "1.8" : range === "6M" ? "6.9" : "12.5"}%)</span>
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
