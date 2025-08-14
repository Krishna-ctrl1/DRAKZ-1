import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <h3 className="footer-logo">DRAKZ</h3>
            <p className="footer-tagline">
              Digital Revenue and Assets Keeper Zone
            </p>
            <p className="footer-description">
              Empowering your financial journey with intelligent tools, 
              personalized advice, and comprehensive money management solutions.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <span>📘</span>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <span>🐦</span>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <span>💼</span>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <span>📸</span>
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="footer-column">
            <h4 className="footer-heading">Services</h4>
            <ul className="footer-links">
              <li><a href="#">Financial Dashboard</a></li>
              <li><a href="#">Investment Tracking</a></li>
              <li><a href="#">Budget Planning</a></li>
              <li><a href="#">Credit Monitoring</a></li>
              <li><a href="#">Financial Education</a></li>
              <li><a href="#">Goal Setting</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-column">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Our Team</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-column">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Security</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
              <li><a href="#">Status</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-column">
            <h4 className="footer-heading">Stay Updated</h4>
            <p className="newsletter-text">
              Get the latest financial tips and product updates delivered to your inbox.
            </p>
            <form className="newsletter-form">
              <div className="newsletter-input-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-btn">
                  Subscribe
                </button>
              </div>
            </form>
            <p className="newsletter-privacy">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              <p>© 2024 DRAKZ. All rights reserved.</p>
            </div>
            
            <div className="footer-badges">
              <div className="security-badge">
                <span className="badge-icon">🔒</span>
                <span className="badge-text">Bank-Level Security</span>
              </div>
              <div className="security-badge">
                <span className="badge-icon">✓</span>
                <span className="badge-text">SSL Encrypted</span>
              </div>
              <div className="security-badge">
                <span className="badge-icon">🛡️</span>
                <span className="badge-text">FDIC Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
