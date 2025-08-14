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
                <span className="line-1">Instant</span>
                <span className="line-2">Gratification</span>
              </h2>
              <p>
                Link your virtual card to your Apple or Google Pay wallet to start paying immediately.
              </p>
              <div className="accent-bar"></div>
            </div>
          </div>
        </section>

        {/* Second section content */}
        <section className="scroll-section" id="section-2">
          <div className="scroll-content">
            <div className="text-column">
              <h2>
                <span className="line-1">Protected with</span>
                <span className="line-2">in app Secure</span>
              </h2>
              <p>
                Manage your card security, transaction from the app and keep things in your control
              </p>
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
