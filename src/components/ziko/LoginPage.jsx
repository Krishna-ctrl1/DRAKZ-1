import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import axios from 'axios';
import API from '../../config/api.config.js';

const LoginPage = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'user',
    specializedIn: '', experience: '', bio: '', phone: ''
  });
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e) => {
    setDocuments(e.target.files);
  };

  const handleBackToHome = () => navigate('/');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const payload = { email: form.email, password: form.password };
        const { data } = await axios.post(API.login, payload, {
          headers: { 'Content-Type': 'application/json' },
        });

        // Use context login
        login(data.user, data.token);

        const map = {
          admin: '/admin/dashboard',
          advisor: '/advisor/dashboard',
          user: '/user/dashboard',
        };
        navigate(map[data.user.role] || '/', { replace: true });

      } else {
        // --- SIGNUP LOGIC ---
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('password', form.password);
        formData.append('role', form.role);
        formData.append('phone', form.phone);

        if (form.role === 'advisor') {
          formData.append('specializedIn', form.specializedIn);
          formData.append('experience', form.experience);
          formData.append('bio', form.bio);
          // Append documents
          for (let i = 0; i < documents.length; i++) {
            formData.append('documents', documents[i]);
          }
        }

        const { data } = await axios.post(API.register, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (form.role === 'advisor') {
          setSuccessMsg("Registration successful! Your account is pending admin approval.");
          setIsLogin(true); // Switch back to login
          setForm({ name: '', email: '', password: '', role: 'user', specializedIn: '', experience: '', bio: '', phone: '' });
          setDocuments([]);
        } else {
          // Auto-login logic
          // Use the login helper from context to update state and storage
          login(data.user, data.token);

          // Redirect
          const map = {
            admin: '/admin/dashboard',
            advisor: '/advisor/dashboard',
            user: '/user/dashboard',
          };
          navigate(map[data.user.role] || '/user/dashboard', { replace: true });
        }
      }

    } catch (err) {
      console.error('Auth error:', err.response?.data);
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
              <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
              <p>{isLogin ? "Sign in to your account" : "Join us today"}</p>
            </div>

            {error && <p className="error-msg" style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '14px' }}>{error}</p>}
            {successMsg && <p className="success-msg" style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '14px' }}>{successMsg}</p>}

            <form onSubmit={handleSubmit} className="login-form">

              {!isLogin && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" required />
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" required />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />
              </div>

              {!isLogin && (
                <>
                  <div className="form-group">
                    <label>I want to join as a:</label>
                    <select name="role" value={form.role} onChange={handleChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}>
                      <option value="user">User</option>
                      <option value="advisor">Financial Advisor</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Contact number" />
                  </div>

                  {form.role === 'advisor' && (
                    <>
                      <div className="form-group">
                        <label>Specialization</label>
                        <input type="text" name="specializedIn" value={form.specializedIn} onChange={handleChange} placeholder="e.g. Retirement, Crypto" required />
                      </div>
                      <div className="form-group">
                        <label>Experience (Years)</label>
                        <input type="number" name="experience" value={form.experience} onChange={handleChange} placeholder="Years of experience" required />
                      </div>
                      <div className="form-group">
                        <label>Upload Certification/Documents</label>
                        <input type="file" multiple onChange={handleFileChange} style={{ color: 'white' }} required />
                        <small style={{ color: '#aaa', display: 'block', marginTop: '5px' }}>Upload ID proof and Certifications (PDF/Image)</small>
                      </div>
                      <div className="form-group">
                        <label>Short Bio</label>
                        <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Tell us about yourself" rows="3" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}></textarea>
                      </div>
                    </>
                  )}
                </>
              )}

              <button type="submit" className="login-submit-btn">
                {isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="form-footer">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}
                  style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>

          <div className="login-visual">
            <img src="/card.png" alt="Card" className="login-card-img" />
            <div className="features-list">
              <div className="feature-item"><span>Check</span> No Hidden Fees</div>
              <div className="feature-item"><span>Check</span> Instant {isLogin ? "Access" : "Approval"}</div>
              <div className="feature-item"><span>Check</span> Secure Transactions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;