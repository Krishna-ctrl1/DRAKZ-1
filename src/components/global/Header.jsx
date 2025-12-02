import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../../utils/auth.util";
import "../../styles/global/Header.css";
import { logout } from "../../auth/auth";
import { useUI } from "../../context/UIContext";

const Header = ({ collapsed }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState({
    day: "",
    date: "",
    time: "",
  });
  const [userName, setUserName] = useState("");
  const { collapsed: uiCollapsed } = useUI();

  useEffect(() => {
    // Get user name from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || "User");
      } catch (e) {
        setUserName("User");
      }
    }

    // Update date and time
    const updateDateTime = () => {
      const now = new Date();
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      setCurrentDate({
        day: days[now.getDay()],
        date: `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`,
        time: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const isCollapsed = typeof collapsed === "boolean" ? collapsed : uiCollapsed;

  return (
    <div className={`dashboard-header ${!isCollapsed ? "expanded" : ""}`}>
      <div className="header-content">
        <div className="logo-section">
          <h1 className="dashboard-logo">DRAKZ</h1>
          <div className="date-display">
            <span className="current-day">{currentDate.day}</span>
            <span className="current-date">{currentDate.date}</span>
          </div>
        </div>
        <div className="header-actions">
          <span className="welcome-text">Welcome back, {userName}! 👋</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
