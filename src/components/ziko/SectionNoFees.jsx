import React, { useEffect, useRef } from 'react';

const SectionNoFees = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const scrolled = window.pageYOffset;
        // Move up 10px when scrolled 1000px (adjust rate as needed)
        const rate = scrolled * -0.01;
        sectionRef.current.style.transform = `translateY(${rate}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="section-no-fees" ref={sectionRef}>
      <div className="no-fees-container">
        <div className="text-column">
          <h2>No Joining Fees. No Annual Fees.</h2>
          <p>
            While many luxury credit cards come with an annual fee, there is a 
            wide range of cards that provide a vast array of benefits without 
            charging any fee.
          </p>
        </div>
        <div className="image-column">
          <div className="credit-card-tilted">
            <img 
              src="/card.png" 
              alt="The Only Card Credit Card" 
              className="card-image-tilted"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionNoFees;
