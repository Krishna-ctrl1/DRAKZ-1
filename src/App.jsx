import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/ziko/Home';
import LoginPage from './components/ziko/LoginPage';
import Dashboard from './components/deepthi/Dashboard';
import FinBot from "./components/gupta/Finbot";
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/finbot" element={<FinBot />} />
          {/* <Route path="/investments" element={<Investments />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/finbot" element={<FinBot />} />
            <Route path="/privileges" element={<Privileges />} />
            <Route path="/settings" element={<Settings />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
