import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../../config/api.config.js';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleBackToHome = () => navigate('/');

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  const payload = { email: form.email, password: form.password };

  try {
    const { data } = await axios.post(API.login, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('Login response:', data);

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.user.role);

    const map = {
      admin: '/admin/dashboard',
      advisor: '/advisor/dashboard',
      user: '/user/dashboard',
    };

    navigate(map[data.user.role] || '/');

  } catch (err) {
    console.error('Login error:', err.response?.data);
    setError(err.response?.data?.msg || 'Request failed');
  }
};


  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <button className="back-button" onClick={handleBackToHome}>
            Back to Home
          </button>
          <h1 className="login-logo">DRAKZ</h1>
          <p className="login-subtitle">Your Digital Credit Card Solution</p>
        </div>

        <div className="login-form-container">
          <div className="login-card">
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your account</p>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button type="submit" className="login-submit-btn">
                Sign In
              </button>
            </form>

            <div className="form-footer">
              <p>
                Don't have an account? Contact support.
              </p>
            </div>
          </div>

          <div className="login-visual">
            <img src="/card.png" alt="Card" className="login-card-img" />
            <div className="features-list">
              <div className="feature-item"><span>Check</span> No Hidden Fees</div>
              <div className="feature-item"><span>Check</span> Instant Approval</div>
              <div className="feature-item"><span>Check</span> Secure Transactions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;