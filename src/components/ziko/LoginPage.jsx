import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just navigate to dashboard without authentication
    navigate('/dashboard');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Reset form when switching between login/signup
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <button className="back-button" onClick={handleBackToHome}>
            ← Back to Home
          </button>
          <h1 className="login-logo">DRAKZ</h1>
          <p className="login-subtitle">Your Digital Credit Card Solution</p>
        </div>

        <div className="login-form-container">
          <div className="login-card">
            <div className="form-header">
              <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p>{isLogin ? 'Sign in to your account' : 'Join DRAKZ today'}</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              )}

              <button type="submit" className="login-submit-btn">
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="form-footer">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button" 
                  className="toggle-mode-btn"
                  onClick={toggleMode}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          <div className="login-visual">
            <div className="card-display">
              <img 
                src="/card.png" 
                alt="DRAKZ Credit Card" 
                className="login-card-img" 
              />
            </div>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>No Hidden Fees</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Instant Approval</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Secure Transactions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
