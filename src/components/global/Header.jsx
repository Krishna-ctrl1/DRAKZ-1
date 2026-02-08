import React, { useState, useEffect, useRef } from "react";
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
  const [profilePicture, setProfilePicture] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { collapsed: uiCollapsed } = useUI();

  // Function to update profile picture from anywhere
  const updateProfilePicture = (newProfilePicture) => {
    console.log('📸 Header: updateProfilePicture called with:', newProfilePicture);
    setProfilePicture(newProfilePicture);
  };

  // Expose function globally for Settings component
  useEffect(() => {
    window.updateHeaderProfilePicture = updateProfilePicture;
    return () => {
      delete window.updateHeaderProfilePicture;
    };
  }, []);

  useEffect(() => {
    // Get user name and profile picture from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || "User");
        setProfilePicture(user.profilePicture || "");
        console.log('📸 Header: Loaded profilePicture from localStorage:', user.profilePicture);
      } catch (e) {
        setUserName("User");
      }
    }

    // Listen for profile picture updates
    const handleProfilePictureUpdate = (event) => {
      console.log('📸 Header: Received profilePictureUpdated event:', event.detail.profilePicture);
      setProfilePicture(event.detail.profilePicture);
    };

    window.addEventListener("profilePictureUpdated", handleProfilePictureUpdate);

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

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("profilePictureUpdated", handleProfilePictureUpdate);
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    setShowDropdown(false);
    navigate("/login", { replace: true });
  };

  const handleEditProfile = () => {
    setShowDropdown(false);
    navigate("/user/settings");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
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
          <div className="welcome-section">
            <span className="welcome-text">Welcome back, {userName}!</span>
          </div>
          <div className="profile-section" ref={dropdownRef}>
            <div className="profile-avatar-wrapper" onClick={toggleDropdown}>
              <div className="profile-avatar">
                {profilePicture && profilePicture.trim() !== "" ? (
                  <img 
                    src={`http://localhost:3001${profilePicture}`} 
                    alt="Profile" 
                    onError={(e) => {
                      console.error('📸 Header: Image failed to load:', profilePicture);
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<i class="fa-solid fa-user"></i>';
                    }}
                  />
                ) : (
                  <i className="fa-solid fa-user"></i>
                )}
              </div>
            </div>
            {showDropdown && (
              <div className="profile-dropdown">
                <button className="dropdown-item" onClick={handleEditProfile}>
                  <i className="fa-solid fa-user-pen"></i>
                  <span>Edit Profile</span>
                </button>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <i className="fa-solid fa-right-from-bracket"></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
