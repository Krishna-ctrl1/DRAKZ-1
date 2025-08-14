import React from 'react';
import FastText from './FastText';
import CreditCard from './CreditCard';

const FastTransaction = () => {
  return (
    <section className="fast-transaction-section">
      <div className="video-background">
        <video className="background-video" autoPlay muted loop>
          <source src="/background_2.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-vignette"></div>
      </div>
      
      <div className="fast-transaction-content">
        <div className="card-container">
          <CreditCard />
        </div>
        <div className="text-container">
          <FastText />
        </div>
      </div>
    </section>
  );
};

export default FastTransaction;
