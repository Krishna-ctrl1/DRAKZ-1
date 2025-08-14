import React from 'react';
import { useNavigate } from 'react-router-dom';

const FinalSection = () => {
  const navigate = useNavigate();

  const handleGetCard = () => {
    navigate('/login');
  };

  return (
    <div className="final-section">
      <div className="final-container">
        <div className="final-text-block">
          <h1 className="final-heading">Get your card in just 5min.</h1>
          <p className="final-subheading">
            Simple 3 step verification with online KYC verification and instant digital card unlocked.
          </p>
          <button className="final-cta-button" onClick={handleGetCard}>Get A Card</button>
        </div>
        <div className="final-card-image">
          <img src="/card.png" alt="Credit Card" className="final-card-img" />
        </div>
      </div>
    </div>
  );
};

export default FinalSection;
