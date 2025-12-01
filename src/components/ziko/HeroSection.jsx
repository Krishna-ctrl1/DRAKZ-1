import React from 'react';
import HeroText from './HeroText';
import CreditCard from './CreditCard';
import CTAButton from './CTAButton';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="video-background">
        <video className="background-video" autoPlay muted loop>
          <source src="/background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div className="hero-content">
        <HeroText />
        <CreditCard />
        <CTAButton />
      </div>
    </section>
  );
};

export default HeroSection;
