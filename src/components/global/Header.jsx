import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global/Header.css";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="dashboard-header">
      <div className="header-content">
        <div className="logo-section">
          <h1 className="dashboard-logo">DRAKZ</h1>
          <span className="dashboard-subtitle">Dashboard</span>
        </div>
        <div className="header-actions">
          <span className="welcome-text">Welcome back, K.Raju!</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
