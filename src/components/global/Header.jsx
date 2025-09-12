import React from "react";
import "../../styles/global/Header.css";


const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">D</div>
        <p className="date">Date : Monday, August 11, 2025</p>
      </div>

      <div className="header-right">
        <div className="actions">
          <span className="notification">🔔</span>
          <span className="welcome">Welcome back, K.Raju!</span>
          <img
            className="profile"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf5WOzvXp8VmmLciCxW96u9j_FyNaXulh_ig&s"
            alt="profile"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
