import React from 'react';
import { useNavigate } from 'react-router-dom';

const CTAButton = () => {
  const navigate = useNavigate();
  
  const handleGetCard = () => {
    navigate('/login');
  };

  return (
    <div className="cta-container">
      <button className="cta-button" onClick={handleGetCard}>
        Get Started
      </button>
    </div>
  );
};

export default CTAButton;
