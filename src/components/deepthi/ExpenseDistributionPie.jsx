// src/components/deepthi/ExpenseDistributionPie.jsx

import { useState, useEffect } from "react";
import { fetchExpenseDistributionPie } from "./api/getExpenseDistributionPie";
import "../../styles/deepthi/expenseDistributionPie.css";

const ExpenseDistributionPie = ({ days = 30 }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchExpenseDistributionPie({ days });
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load expense data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [days]);

  if (loading) {
    return (
      <div className="expense-pie-container">
        <div className="pie-loading">Loading expense distribution...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="expense-pie-container">
        <div
          className="pie-error"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {error}
          <button
            onClick={loadData}
            style={{
              padding: "6px 12px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.categories || data.categories.length === 0) {
    return (
      <div className="expense-pie-container">
        <div className="pie-empty">No expense data available</div>
      </div>
    );
  }

  const { categories, total, summary } = data;
  const radius = 80;
  const centerX = 120;
  const centerY = 120;

  // Calculate pie slices
  let currentAngle = -Math.PI / 2; // Start at top
  const slices = categories.map((cat) => {
    const sliceAngle = (cat.percentage / 100) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    // Label position
    const labelAngle = startAngle + sliceAngle / 2;
    const labelRadius = radius * 0.65;
    const labelX = centerX + labelRadius * Math.cos(labelAngle);
    const labelY = centerY + labelRadius * Math.sin(labelAngle);

    currentAngle = endAngle;

    return {
      ...cat,
      path,
      labelX,
      labelY,
      startAngle,
      endAngle,
    };
  });

  const handleSegmentHover = (e, slice) => {
    setHoveredCategory(slice.category);
  };

  return (
    <div className="expense-pie-container">
      <h3 className="pie-title">Expense Distribution (Last {days} Days)</h3>

      <div className="pie-content">
        <div className="pie-chart-wrapper">
          <svg
            width="240"
            height="240"
            viewBox="0 0 240 240"
            className="pie-chart"
          >
            {slices.map((slice, idx) => (
              <g
                key={idx}
                onMouseMove={(e) => handleSegmentHover(e, slice)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`pie-segment ${hoveredCategory === slice.category ? "hovered" : ""}`}
              >
                <path
                  d={slice.path}
                  fill={slice.color}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="2"
                  style={{
                    cursor: "pointer",
                    opacity:
                      hoveredCategory === null ||
                      hoveredCategory === slice.category
                        ? 1
                        : 0.6,
                    transition: "opacity 0.2s ease",
                  }}
                />
                {slice.percentage > 8 && (
                  <text
                    x={slice.labelX}
                    y={slice.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pie-label"
                  >
                    {slice.percentage.toFixed(1)}%
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* Tooltip */}
          {hoveredCategory && (
            <div className="pie-tooltip">
              {(() => {
                const cat = slices.find((s) => s.category === hoveredCategory);
                return (
                  <>
                    <div className="tooltip-category">{cat.category}</div>
                    <div className="tooltip-amount">
                      ₹{cat.amount?.toLocaleString() || 0}
                    </div>
                    <div className="tooltip-percentage">
                      {cat.percentage.toFixed(1)}%
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="pie-legend">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className={`legend-item ${hoveredCategory === cat.category ? "active" : ""}`}
              onMouseEnter={() => setHoveredCategory(cat.category)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div
                className="legend-color"
                style={{ backgroundColor: cat.color }}
              />
              <div className="legend-label">
                <div className="legend-name">{cat.category}</div>
                <div className="legend-value">
                  ₹{cat.amount?.toLocaleString() || 0} (
                  {cat.percentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="pie-summary">
          <div className="summary-stat">
            <span className="summary-label">Total Spent:</span>
            <span className="summary-value">
              ₹{total?.toLocaleString() || 0}
            </span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Top Category:</span>
            <span className="summary-value">{summary.topCategory}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-label">Avg/Transaction:</span>
            <span className="summary-value">
              ₹{summary.averagePerTransaction?.toFixed(2) || 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseDistributionPie;
