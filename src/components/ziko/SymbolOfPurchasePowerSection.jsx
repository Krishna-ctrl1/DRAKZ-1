import React from 'react';

const SymbolOfPurchasePowerSection = () => {
  return (
    <section className="symbol-section">
      <div className="symbol-container">
        {/* Left Side - Visuals */}
        <div className="visuals-section">
          <div className="images-arrangement">
            {/* Left column with stacked images */}
            <div className="left-column">
              {/* Top rectangle placeholder */}
              <div className="image-placeholder top-rectangle"></div>
              {/* Bottom square placeholder */}
              <div className="image-placeholder bottom-square"></div>
            </div>
            
            {/* Right tall placeholder */}
            <div className="right-column">
              <div className="image-placeholder right-tall"></div>
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="divider-line"></div>

        {/* Right Side - Text */}
        <div className="text-section">
          <div className="text-content">
            <p className="tagline">Premium product</p>
            <h2 className="headline">
              <span className="line-1">Symbol of</span>
              <span className="line-2">purchase power</span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SymbolOfPurchasePowerSection;
