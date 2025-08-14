import React from 'react';

const InstantGratificationSection = () => {
  return (
    <section className="instant-gratification-section">
      <div className="instant-gratification-container">
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
        <div className="image-column">
          <div className="image-stack">
            <div className="phone-image">
              <img 
                src="/phone.png" 
                alt="Mobile phone showing transaction interface" 
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
    </section>
  );
};

export default InstantGratificationSection;
