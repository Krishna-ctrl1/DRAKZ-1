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
            <h2 className="headline">Brains Behind The Build</h2>
            <p className="tagline">
              <span className="line-1"><span className="team-name">Krishna</span> — The Mind Behind the Machine</span>
              <span className="line-1"><span className="team-name">Deepthi</span> — The Artist of Data</span>
              <span className="line-1"><span className="team-name">Ragamaie</span> — The Guardian of Databases</span>
              <span className="line-1"><span className="team-name">Zulqarnain</span> — The Architect of Experience</span>
              <span className="line-1"><span className="team-name">Abhinay</span> — The Creative Visionary</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SymbolOfPurchasePowerSection;
