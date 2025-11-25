// src/components/deepthi/Spendings.jsx
import React, { useEffect, useState } from "react";
import { fetchWeeklySpendings, fetchRecentSpendings } from "./api/getSpendings";
import "../../styles/deepthi/spendings.css";

function formatCurrency(n) {
  return (n >= 0 ? "₹" : "-₹") + Math.abs(n).toFixed(2);
}

export default function Spendings({ weeks = 5 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchWeeklySpendings({ weeks })
      .then((res) => {
        if (res?.weeks) {
          setData(res.weeks);
        } else {
          setErr("No data");
        }
      })
      .catch((e) => setErr(e.message || "Failed"))
      .finally(() => setLoading(false));
  }, [weeks]);

  if (loading)
    return <div className="spendings-card">Loading spendings...</div>;
  if (err) return <div className="spendings-card">Error: {err}</div>;
  if (!data || data.length === 0)
    return <div className="spendings-card">No spendings data</div>;

  // compute chart scale: find max of income or expense across weeks
  const maxVal = Math.max(
    ...data.map((w) => Math.max(w.income, w.expense)),
    50,
  );

  // chart dimensions and padding
  const chartHeight = 220;
  const leftPadding = 64; // <-- space for Y labels
  const rightPadding = 24;
  const groupArea = 100; // space allocated per week (keeps layout stable)
  const chartWidth = Math.max(
    420,
    Math.min(1100, leftPadding + rightPadding + data.length * groupArea),
  );

  return (
    <div className="spendings-card">
      <div className="spendings-header">
        <h4>Spendings</h4>
        <div className="spendings-legend">
          <div>
            <span className="swatch income" /> Income
          </div>
          <div>
            <span className="swatch expense" /> Expense
          </div>
        </div>
      </div>

      <div className="spendings-chart-wrap">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="spendings-chart"
          role="img"
          aria-label="Weekly spendings"
        >
          {/* horizontal grid lines and labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((f, idx) => {
            const y = 20 + (chartHeight - 60) * (1 - f);
            const value = Math.round(maxVal * f);
            return (
              <g key={idx}>
                {/* grid line spans from leftPadding to right edge */}
                <line
                  x1={leftPadding}
                  x2={chartWidth - rightPadding}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.04)"
                  strokeDasharray="4 6"
                />
                {/* y-axis label placed to the left of leftPadding */}
                <text
                  x={leftPadding - 12}
                  y={y - 6}
                  fontSize="11"
                  fill="#98a8b8"
                  textAnchor="end"
                >
                  {formatCurrency(value)}
                </text>
              </g>
            );
          })}

          {/* bars */}
          {data.map((wk, i) => {
            const usableWidth = chartWidth - leftPadding - rightPadding;
            const groupWidth = usableWidth / data.length;
            const centerX = leftPadding + groupWidth * i + groupWidth / 2;
            const barWidth = Math.min(26, groupWidth * 0.22);

            const incomeH = (wk.income / maxVal) * (chartHeight - 80);
            const expenseH = (wk.expense / maxVal) * (chartHeight - 80);

            return (
              <g key={i} transform={`translate(${centerX},0)`}>
                {/* income bar (left) */}
                <rect
                  x={-barWidth - 6}
                  y={chartHeight - 40 - incomeH}
                  width={barWidth}
                  height={Math.max(2, incomeH)}
                  rx={6}
                  ry={6}
                  fill="url(#incomeGrad)"
                  onClick={() => setSelectedWeek({ index: i, week: wk })}
                  style={{ cursor: "pointer" }}
                />
                {/* expense bar (right) */}
                <rect
                  x={6}
                  y={chartHeight - 40 - expenseH}
                  width={barWidth}
                  height={Math.max(2, expenseH)}
                  rx={6}
                  ry={6}
                  fill="url(#expenseGrad)"
                  onClick={() => setSelectedWeek({ index: i, week: wk })}
                  style={{ cursor: "pointer" }}
                />
                {/* week label */}
                <text
                  x={0}
                  y={chartHeight - 18}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#bcd6e6"
                >
                  {new Date(wk.weekStart).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </text>
              </g>
            );
          })}

          {/* gradients defs */}
          <defs>
            <linearGradient id="incomeGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#4fd4c6" stopOpacity="1" />
              <stop offset="100%" stopColor="#00a58a" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ffc66b" stopOpacity="1" />
              <stop offset="100%" stopColor="#ff7a3a" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="spendings-footer">
        <div>
          Current margin: <strong>Week view</strong>
        </div>
        <div className="spendings-totals">
          <div className="income-total">
            {formatCurrency(data[data.length - 1].income)} /
          </div>
          <div className="expense-total">
            {formatCurrency(data[data.length - 1].expense)}
          </div>
        </div>
      </div>

      {/* details modal simple */}
      {selectedWeek && (
        <div className="spendings-modal" onClick={() => setSelectedWeek(null)}>
          <div
            className="spendings-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Week details</h4>
            <p>
              <strong>Week:</strong>{" "}
              {new Date(selectedWeek.week.weekStart).toLocaleDateString()} -{" "}
              {new Date(selectedWeek.week.weekEnd).toLocaleDateString()}
            </p>
            <p>
              <strong>Income:</strong>{" "}
              {formatCurrency(selectedWeek.week.income)}
            </p>
            <p>
              <strong>Expense:</strong>{" "}
              {formatCurrency(selectedWeek.week.expense)}
            </p>
            <div className="daily-list">
              {selectedWeek.week.daily.map((d, idx) => (
                <div key={idx} className="daily-item">
                  <div className="day-name">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx]}
                  </div>
                  <div className="day-val">{formatCurrency(d)}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedWeek(null)} className="close-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
