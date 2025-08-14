import React from 'react';

const SecureProtectionSection = () => {
  return (
    <section className="instant-gratification-section">
      <div className="instant-gratification-container">
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
        <div className="image-column">
          <div className="image-stack">
            <div className="phone-image">
              <img 
                src="/phone.png" 
                alt="Mobile phone showing security interface" 
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

export default SecureProtectionSection;
