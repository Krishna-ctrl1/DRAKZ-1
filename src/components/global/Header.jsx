import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/global/Header.css";

const Header = ({ collapsed }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className={`dashboard-header ${!collapsed ? 'expanded' : ''}`}>
      <div className="header-content">
        <div className="logo-section">
          <h1 className="dashboard-logo">DRAKZ</h1>
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
