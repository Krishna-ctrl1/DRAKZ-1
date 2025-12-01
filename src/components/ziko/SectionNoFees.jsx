import React, { useEffect, useState } from 'react';

const SectionNoFees = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const features = [
    {
      title: "Financial Dashboard",
      subtitle: "Track Your Finances",
      description: "While many financial tools require separate apps to monitor assets, liabilities, loans, investments, and expenses, ours provides all in one place with clear, interactive visual dashboards."
    },
    {
      title: "Instant",
      subtitle: "Financial Advice",
      description: "While many online chatbots give generic responses without personalization, ours delivers instant, accurate, and tailored financial guidance to help you make smarter money decisions quickly and confidently."
    },
    {
      title: "Reminders & Alerts",
      subtitle: "Never Miss Deadlines",
      description: "While many people forget EMIs, bills, and investment renewals, our alert system ensures timely notifications so you never miss a payment or critical financial due date."
    },
    {
      title: "Financial Education",
      subtitle: "Learn About Finance",
      description: "While many individuals lack access to quality financial resources, we provide educational videos, expert articles, and guides to improve your money skills and long-term financial literacy."
    },
    {
      title: "Achieve",
      subtitle: "Financial Goals",
      description: "While many struggle to set and follow realistic plans, our goal planner offers actionable strategies to achieve both short-term and long-term objectives effectively and without stress."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade out
      setIsVisible(false);
      
      // After fade out completes, change content and fade in
      setTimeout(() => {
        setCurrentSection((prev) => (prev + 1) % features.length);
        setIsVisible(true);
      }, 500); // 500ms for fade out transition
    }, 2500); // Change every 2.5 seconds

    return () => clearInterval(interval);
  }, [features.length]);

  const currentFeature = features[currentSection];

  return (
    <section className="section-no-fees">
      <div className="no-fees-container">
        <div className={`text-column ${isVisible ? 'fade-in' : 'fade-out'}`}>
          <h2>
            <span className="line-1">{currentFeature.title}</span>
            <span className="line-2">{currentFeature.subtitle}</span>
          </h2>
          <p>{currentFeature.description}</p>
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
