import React from 'react';
import { useNavigate } from 'react-router-dom';

const CTAButton = () => {
  const navigate = useNavigate();

  return (
    <div className="cta-container">
      <button className="cta-button" onClick={() => navigate('/login')}>
        Get Started
      </button>
    </div>
  );
};

export default CTAButton;