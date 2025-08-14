import React from 'react';

const FastText = () => {
  return (
    <div className="hero-text">
      <h1 className="hero-title">Blazing Fast Transaction</h1>
      <div className="feature-list">
        <div className="feature-item">
          <div className="feature-icon clock-icon">⏱</div>
          <span className="feature-text">Settle in 10 seconds</span>
        </div>
        <div className="feature-item">
          <div className="feature-icon loop-icon">🔁</div>
          <span className="feature-text">99% success rate</span>
        </div>
        <div className="feature-item">
          <div className="feature-icon checkmark-icon">✓</div>
          <span className="feature-text">auto refund</span>
        </div>
      </div>
    </div>
  );
};

export default FastText;
