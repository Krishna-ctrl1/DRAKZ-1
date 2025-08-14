import React from 'react';

const StickyScrollSections = () => {
  return (
    <div className="sticky-scroll-container">
      {/* Scrolling text sections */}
      <div className="scroll-sections-wrapper">
        {/* First section content */}
        <section className="scroll-section" id="section-1">
          <div className="scroll-content">
            <div className="text-column">
              <h2>
                <span className="line-1">Free-Tier</span>
                <span className="line-2">Customers</span>
              </h2>
              <p>
                Perfect for individuals seeking to manage their personal finances and improve financial literacy.
              </p>
              <ul className="feature-points">
                <li>Financial dashboards displaying assets, liabilities, credit score, and investments</li>
                <li>Access to basic financial education</li>
                <li>AI chatbot for financial queries</li>
                <li>Alerts for EMIs, bills, and investment renewals</li>
                <li>Community blogs to share and learn financial tips</li>
              </ul>
              <div className="accent-bar"></div>
            </div>
          </div>
        </section>

        {/* Second section content */}
        <section className="scroll-section" id="section-2">
          <div className="scroll-content">
            <div className="text-column">
              <h2>
                <span className="line-1">Premium</span>
                <span className="line-2">Customers</span>
              </h2>
              <p>
                For individuals who want advanced tools for managing their finances.
              </p>
              <ul className="feature-points">
                <li>All features of free-tier</li>
                <li>Access to premium video courses</li>
                <li>Live sessions with financial advisors</li>
                <li>Ad-free experience</li>
                <li>Downloadable resources such as financial templates and reports</li>
                <li>Advanced dashboards with real-time market data</li>
              </ul>
              <div className="accent-bar"></div>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky image container */}
      <div className="sticky-image-container">
        <div className="image-column">
          <div className="image-stack">
            <div className="phone-image">
              <img 
                src="/phone.png" 
                alt="Mobile phone interface" 
                className="phone-img"
              />
            </div>
            <div className="credit-card-overlay">
              <img 
                src="/card.png" 
                alt="The Only Card Credit Card" 
                className="card-overlay-img"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyScrollSections;
