// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/ziko/Home";
import LoginPage from "./components/ziko/LoginPage";
import FinBot from "./components/gupta/Finbot";
import Dashboard from "./components/deepthi/Dashboard";
import InvestmentsPage from "./components/ragamaie/InvestmentsPage";
import BlogPage from "./components/ragamaie/BlogPage";
import MyPrivilege from "./components/abhinay/MyPrivilege"; // <-- IMPORT
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/finbot" element={<FinBot />} />
          <Route path="/investments" element={<InvestmentsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/privileges" element={<MyPrivilege />} /> {/* <-- ADD ROUTE */}

          {/* This catch-all route sends any unknown URL to the dashboard */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;