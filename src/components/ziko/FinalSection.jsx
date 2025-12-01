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
          <h1 className="final-heading">Plan your Finances in just 5min</h1>
          <p className="final-subheading">
            A single platform to track all financial activities, boost financial literacy, and enable personalized planning for short and long-term goals, empowering informed money management to reduce debt traps and build lasting financial security.
          </p>
          <button className="final-cta-button" onClick={handleGetCard}>Get Started</button>
        </div>
        <div className="final-card-image">
          <img src="/card.png" alt="Credit Card" className="final-card-img" />
        </div>
      </div>
    </div>
  );
};

export default FinalSection;
