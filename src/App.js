import React from 'react';

// Individual Section Components
const HeroSection = () => (
  <div className="hero-section">
    <div className="video-background">
      <video className="background-video" autoPlay muted loop>
        <source src="/path-to-your-video.mp4" type="video/mp4" />
        <source src="/path-to-your-video.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
    <div className="hero-content">
      <div className="hero-text">
        <h1 className="hero-title">DRAKZ</h1>
        <p className="hero-subtitle">
          Experience the future of digital payments with our innovative credit card solution
        </p>
      </div>
      <div className="credit-card-container">
        <div className="credit-card">
          <img src="/card-image.png" alt="Drakz Credit Card" className="card-image" />
        </div>
      </div>
      <div className="cta-container">
        <button className="cta-button">Get Started</button>
      </div>
    </div>
  </div>
);

const NoFeesSection = () => (
  <div className="section-no-fees">
    <div className="no-fees-container">
      <div className="text-column">
        <h2>No Fees</h2>
        <p>
          Enjoy zero transaction fees, no hidden charges, and complete transparency 
          in all your financial operations. Our commitment to your financial freedom.
        </p>
      </div>
      <div className="image-column">
        <div className="credit-card-tilted">
          <img src="/card-image.png" alt="Credit Card" className="card-image-tilted" />
        </div>
      </div>
    </div>
  </div>
);

const StickyScrollSection = () => (
  <div className="sticky-scroll-container">
    <div className="scroll-sections-wrapper">
      {/* Instant Gratification Section */}
      <div className="scroll-section">
        <div className="scroll-content">
          <div className="text-column">
            <h2>
              <span className="line-1">Free-Tier</span>
              <span className="line-2">User</span>
            </h2>
            <p>
              Get immediate access to your funds and enjoy instant transactions 
              that keep up with your fast-paced lifestyle.
            </p>
            <div className="accent-bar"></div>
          </div>
        </div>
      </div>
      
      {/* Protected with in app Secure Section */}
      <div className="scroll-section">
        <div className="scroll-content">
          <div className="text-column">
            <h2>
              <span className="line-1">Protected with</span>
              <span className="line-2">in app Secure</span>
            </h2>
            <p>
              Advanced security features and encryption protect your financial data 
              with military-grade security protocols.
            </p>
            <div className="accent-bar"></div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Sticky Images */}
    <div className="sticky-image-container">
      <div className="image-column">
        <div className="image-stack">
          <div className="phone-image">
            <img src="/phone-mockup.png" alt="Phone Mockup" className="phone-img" />
          </div>
          <div className="credit-card-overlay">
            <img src="/card-image.png" alt="Credit Card Overlay" className="card-overlay-img" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SymbolOfPurchasePowerSection = () => (
  <div className="symbol-section">
    <div className="symbol-container">
      {/* Red boxes positioned absolutely to overflow */}
      <div className="visuals-section">
        <div className="images-arrangement">
          <div className="left-column">
            <div className="image-placeholder top-rectangle"></div>
            <div className="image-placeholder bottom-square"></div>
          </div>
          <div className="right-column">
            <div className="image-placeholder right-tall"></div>
          </div>
        </div>
      </div>
      
      {/* Divider Line */}
      <div className="divider-line"></div>
      
      {/* Right Side - Text */}
      <div className="text-section">
        <div className="text-content">
          <div className="tagline">PREMIUM EXPERIENCE</div>
          <h2 className="headline">
            <span className="line-1">Symbol of</span>
            <span className="line-2">Purchase Power</span>
          </h2>
        </div>
      </div>
    </div>
  </div>
);

const VideoCardSection = () => (
  <div className="video-card-section" style={{backgroundColor: '#ff00ff', border: '5px solid red'}}>
    <div className="video-background-2">
      <video className="background-video-2" autoPlay muted loop>
        <source src="/background_2.mp4" type="video/mp4" />
        <source src="/background_2.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
    <div className="card-overlay-content">
      <div className="card-display">
        <h1 style={{color: 'white', fontSize: '3rem', textAlign: 'center'}}>VIDEO SECTION TEST</h1>
        <img src="/card-image.png" alt="Credit Card" className="card-overlay-image" />
      </div>
    </div>
  </div>
);

const FinalSection = () => (
  <div className="final-section">
    <div className="final-container">
      <div className="final-text-block">
        <h1 className="final-heading">Plan you finances in just 5min.</h1>
        <p className="final-subheading">
          Simple 3 step verification with online KYC verification and instant digital card unlocked.
        </p>
        <button className="final-cta-button">Get A Card</button>
      </div>
      <div className="final-card-image">
        <img src="/card.png" alt="Credit Card" className="final-card-img" />
      </div>
    </div>
  </div>
);

function App() {
  return (
    <div className="App">
      <HeroSection />
      <NoFeesSection />
      <StickyScrollSection />
      <SymbolOfPurchasePowerSection />
      <VideoCardSection />
      <FinalSection />
    </div>
  );
}

export default App;
