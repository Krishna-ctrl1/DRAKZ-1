import React, { useEffect, useState } from "react";
import { getMyCreditScore } from "./api/getCreditScore";
import "../../styles/deepthi/creditScore.css";

const SEGMENTS = 22; // number of radial segments
const MAX_SCORE = 850;

function scoreToActiveCount(score) {
  const clamped = Math.max(0, Math.min(MAX_SCORE, score));
  return Math.round((clamped / MAX_SCORE) * SEGMENTS);
}

function colorForSegment(t) {
  const hue = Math.round(0 + t * 160);
  return `hsl(${hue} 85% 50%)`;
}

const CreditScore = () => {
  const [credit, setCredit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const fetchScore = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    getMyCreditScore(token)
      .then((data) => setCredit(data?.credit ?? null))
      .catch((e) => setError(e.message || "Failed to fetch credit score"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchScore();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 120);
    return () => clearTimeout(t);
  }, []);

  if (loading)
    return (
      <div className="creditscore-card creditscore-loading">
        Loading credit score...
      </div>
    );
  if (error)
    return (
      <div className="creditscore-card creditscore-error">
        <p>Error: {error}</p>
        <button
          onClick={fetchScore}
          style={{
            marginTop: "10px",
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
    );
  if (!credit)
    return (
      <div className="creditscore-card creditscore-empty">
        No credit score found.
      </div>
    );

  const { score } = credit;
  const activeCount = scoreToActiveCount(score);

  // semicircle angles (left to right before rotation)
  // original design used a top-facing arc; we rotate the whole gauge via CSS to make it horizontal.
  const startAngle = -170;
  const endAngle = -10;
  const radius = 112; // radius of arc (px) - adjust to change spread

  // compute container sizes that match the CSS defaults; CSS rotation will handle orientation
  const gaugeWidth = radius * 2 + 50;
  const gaugeHeight = radius + 30;

  return (
    <div className="creditscore-card creditscore-square" style={{ zIndex: 10 }}>
      <div className="cs-header">
        <h4>Credit Score</h4>
      </div>

      <div className="cs-body">
        <div className="cs-gauge-wrap">
          <div
            className="cs-gauge"
            style={{ width: gaugeWidth, height: gaugeHeight }}
            aria-hidden
          >
            {Array.from({ length: SEGMENTS }).map((_, i) => {
              const t = i / (SEGMENTS - 1);
              const angle = startAngle + t * (endAngle - startAngle);
              const isActive = i < activeCount;
              const color = colorForSegment(t);
              const delayMs = i * 28; // sweep delay

              // place segment at center then rotate then push outward along Y axis (works with wrapper rotation)
              const transform = `translate(-50%,-50%) rotate(${angle}deg) translateY(-${radius}px)`;
              const style = {
                transform,
                transitionDelay: `${delayMs}ms`,
                background: isActive ? color : "rgba(120,120,120,0.35)",
                boxShadow: isActive
                  ? `0 6px 18px ${color.replace("hsl(", "hsla(").replace(")", ",0.15)")}`
                  : "none",
                opacity: revealed ? (isActive ? 1 : 0.85) : 0,
              };

              return (
                <div
                  key={i}
                  className={`cs-segment ${isActive ? "active" : ""}`}
                  style={style}
                />
              );
            })}

            <div className="cs-center">
              <div className="cs-center-ring" />
              <div className="cs-score">{score}</div>
            </div>
          </div>
        </div>

        <div className="cs-info">
          <div className="cs-current">
            <div className="cs-current-label">Current Score</div>
            <div className="cs-current-value">{score}</div>
          </div>

          <div className="cs-legend">
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: "hsl(0 85% 50%)" }}
              />
              <span>Poor</span>
            </div>
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: "hsl(45 85% 55%)" }}
              />
              <span>Average</span>
            </div>
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: "hsl(110 75% 45%)" }}
              />
              <span>Good</span>
            </div>
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: "hsl(150 75% 45%)" }}
              />
              <span>Excellent</span>
            </div>
          </div>

          <div className="cs-updated">
            Last updated: {new Date(credit.lastUpdated).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditScore;
