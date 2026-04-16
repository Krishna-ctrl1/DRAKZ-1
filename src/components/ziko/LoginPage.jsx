import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import axios from 'axios';
import API from '../../config/api.config.js';

const LoginPage = () => {
  const { login, showLoginTransition } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'user',
    specializedIn: '', experience: '', bio: '', phone: '',
    monthlyIncome: '', occupation: '', dob: '', ssn: ''
  });
  
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const calculateStrength = (val) => {
    let strength = 0;
    if (val.length > 5) strength += 1;
    if (val.length > 7) strength += 1;
    if (/[A-Z]/.test(val)) strength += 1;
    if (/[0-9]/.test(val)) strength += 1;
    if (/[^A-Za-z0-9]/.test(val)) strength += 1;
    setPasswordStrength(Math.min(4, strength));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'password') calculateStrength(value);
    setError('');
  };

  const handleFileChange = (e) => {
    setDocuments(e.target.files);
  };

  const handleBackToHome = () => navigate('/');

  const nextStep = () => {
    if (step === 1 && (!form.email || !form.name || !form.password)) {
      setError("Please fill out required fields.");
      return;
    }
    setError('');
    setStep(2);
  };

  const prevStep = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && step === 1) {
      nextStep();
      return;
    }

    setError('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const payload = { email: form.email, password: form.password };
        const { data } = await axios.post(API.login, payload, {
          headers: { 'Content-Type': 'application/json' },
        });

        login(data.user, data.token);

        const map = {
          admin: '/admin/dashboard',
          advisor: '/advisor/dashboard',
          user: '/user/dashboard',
        };
        const dest = map[data.user.role] || '/';

        showLoginTransition(data.user.role, data.user.name, dest);
        setTimeout(() => navigate(dest, { replace: true }), 50);

      } else {
        // --- SIGNUP LOGIC ---
        let responseData;
        if (form.role === 'advisor') {
          const formData = new FormData();
          formData.append('name', form.name);
          formData.append('email', form.email);
          formData.append('password', form.password);
          formData.append('role', form.role);
          formData.append('phone', form.phone);
          formData.append('specializedIn', form.specializedIn);
          formData.append('experience', form.experience);
          formData.append('bio', form.bio);
          
          for (let i = 0; i < documents.length; i++) {
            formData.append('documents', documents[i]);
          }

          const res = await axios.post(API.registerAdvisor, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          responseData = res.data;
        } else {
          // Standard users bypass Form Data entirely.
          // Note: We deliberately exclude UI-only dummy fields (ssn, dob, monthlyIncome) 
          // to adhere to your strict "don't change anything in DB" request.
          const payload = {
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
            phone: form.phone,
          };
          
          const res = await axios.post(API.register, payload, {
            headers: { 'Content-Type': 'application/json' },
          });
          responseData = res.data;
        }

        const data = responseData;

        if (form.role === 'advisor') {
          setSuccessMsg("Registration successful! Your account is pending admin approval.");
          setIsLogin(true);
          setStep(1);
          setForm({ 
            name: '', email: '', password: '', role: 'user', 
            specializedIn: '', experience: '', bio: '', phone: '',
            monthlyIncome: '', occupation: '', dob: '', ssn: ''
          });
          setDocuments([]);
        } else {
          login(data.user, data.token);

          const map = {
            admin: '/admin/dashboard',
            advisor: '/advisor/dashboard',
            user: '/user/dashboard',
          };
          const dest = map[data.user.role] || '/user/dashboard';
          showLoginTransition(data.user.role, data.user.name, dest);
          setTimeout(() => navigate(dest, { replace: true }), 50);
        }
      }

    } catch (err) {
      console.error('Auth error:', err.response?.data);
      setError(err.response?.data?.msg || 'Request failed');
    }
  };

  const getStrengthColor = () => {
    switch(passwordStrength) {
      case 1: return '#ef4444'; // red
      case 2: return '#f59e0b'; // orange
      case 3: return '#eab308'; // yellow
      case 4: return '#22c55e'; // green
      default: return '#374151'; // gray
    }
  };

  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <button className="back-button" onClick={handleBackToHome} type="button">
            Back to Home
          </button>
          <h1 className="login-logo">DRAKZ</h1>
          <p className="login-subtitle">Your Digital Credit Card Solution</p>
        </div>

        <div className="login-form-container">
          <div className="login-card">
            <div className="form-header">
              <h2>{isLogin ? "Welcome Back" : (step === 1 ? "Create Account" : "Financial Profile")}</h2>
              <p>{isLogin ? "Sign in to your account" : (step === 1 ? "Step 1 of 2: Basic Info" : "Step 2 of 2: Secure Identity")}</p>
            </div>

            {error && <p className="error-msg" style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '14px' }}>{error}</p>}
            {successMsg && <p className="success-msg" style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '14px' }}>{successMsg}</p>}

            <form onSubmit={handleSubmit} className="login-form">

              {isLogin && (
                <>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />
                  </div>
                </>
              )}

              {!isLogin && step === 1 && (
                <>
                  <div className="form-group">
                    <label>I want to join as a:</label>
                    <select name="role" value={form.role} onChange={handleChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}>
                      <option value="user">User / Cardholder</option>
                      <option value="advisor">Financial Advisor</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Create a strong password" required />
                    
                    {form.password && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '4px' }}>
                          {[1, 2, 3, 4].map(num => (
                            <div key={num} style={{
                              flex: 1, 
                              backgroundColor: passwordStrength >= num ? getStrengthColor() : 'rgba(255,255,255,0.1)',
                              borderRadius: '2px',
                              transition: 'background-color 0.3s'
                            }}/>
                          ))}
                        </div>
                        <small style={{ color: getStrengthColor() }}>
                          {strengthLabels[passwordStrength]}
                        </small>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!isLogin && step === 2 && form.role === 'user' && (
                <>
                  <div className="form-group" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    <label>Mobile Number</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" required />
                  </div>
                  <div className="form-group" style={{ animation: 'fadeIn 0.4s ease-in-out' }}>
                    <label>Date of Birth</label>
                    <input type="date" name="dob" value={form.dob} onChange={handleChange} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', colorScheme: 'dark' }} required />
                  </div>
                  <div className="form-group" style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                    <label>Estimated Monthly Income (USD)</label>
                    <input type="number" name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange} placeholder="e.g. 5000" required />
                  </div>
                  <div className="form-group" style={{ animation: 'fadeIn 0.6s ease-in-out' }}>
                    <label>Social Security Number (Last 4)</label>
                    <input type="password" name="ssn" maxLength="4" value={form.ssn} onChange={handleChange} placeholder="*** ** ****" style={{ letterSpacing: '2px' }} required />
                    <small style={{ color: '#aaa', display: 'block', marginTop: '5px' }}>Required for identity verification and soft credit check.</small>
                  </div>
                </>
              )}

              {!isLogin && step === 2 && form.role === 'advisor' && (
                <>
                  <div className="form-group" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Contact number" required />
                  </div>
                  <div className="form-group" style={{ animation: 'fadeIn 0.4s ease-in-out' }}>
                    <label>Specialization</label>
                    <input type="text" name="specializedIn" value={form.specializedIn} onChange={handleChange} placeholder="e.g. Retirement, Crypto" required />
                  </div>
                  <div className="form-group" style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                    <label>Experience (Years)</label>
                    <input type="number" name="experience" value={form.experience} onChange={handleChange} placeholder="Years of experience" required />
                  </div>
                  <div className="form-group" style={{ animation: 'fadeIn 0.6s ease-in-out' }}>
                    <label>Upload Certification/Documents</label>
                    <input type="file" multiple onChange={handleFileChange} style={{ color: 'white' }} required />
                    <small style={{ color: '#aaa', display: 'block', marginTop: '5px' }}>Upload ID proof and Certifications (PDF/Image)</small>
                  </div>
                  <div className="form-group" style={{ animation: 'fadeIn 0.7s ease-in-out' }}>
                    <label>Short Bio</label>
                    <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Tell us about yourself" rows="3" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}></textarea>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                {!isLogin && step === 2 && (
                  <button type="button" onClick={prevStep} className="login-submit-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
                    Back
                  </button>
                )}
                <button type="submit" className="login-submit-btn" style={{ flex: 1 }}>
                  {isLogin ? "Sign In" : (step === 1 ? "Next step ->" : "Complete Sign Up")}
                </button>
              </div>

            </form>

            <div className="form-footer">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); setStep(1); }}
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
              <div className="feature-item"><span>{step === 1 ? "🔒" : "🏦"}</span> {!isLogin && step === 2 ? "Bank-Level Security" : "No Hidden Fees"}</div>
              <div className="feature-item"><span>⚡</span> Instant {isLogin ? "Access" : "Approval"}</div>
              <div className="feature-item"><span>🛡️</span> Secure Transactions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;