import React, { useState, useRef, useEffect } from "react";
import "../../styles/global/Sidebar.css";
import { Link, useLocation } from "react-router-dom";

// MODIFIED: Accepts state and setter as props
// Using the same props as your original file
export default function Sidebar({ collapsed = true, setCollapsed }) {
  // const [active, setActive] = useState("dashboard"); // Kept local active state
  const location = useLocation();
  const hoverTimerRef = useRef(null);
  const wasCollapsedRef = useRef(collapsed);
  
  // Get the current path from the location object
  const currentPath = location.pathname;
  
  useEffect(() => {
    wasCollapsedRef.current = collapsed;
  }, [collapsed]);
  
  const handleMouseEnter = () => {
    if (collapsed) {
      hoverTimerRef.current = setTimeout(() => {
        setCollapsed(false);
      }, 0);
    }
  };
  
  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    // Always collapse when mouse leaves
    setCollapsed(true);
  };
  
  const isAdvisor = currentPath.includes("advisor");
  const sessionLink = isAdvisor ? "/advisor/video" : "/user/video";
  const sessionLabel = isAdvisor ? "Broadcast Updates" : "Advisor Updates"; // New Label

  // Build menu items based on role
  const topMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-border-all", path: isAdvisor ? "/advisor/dashboard" : "/user/dashboard" },
    // Only show investments, privileges, blog, finbot for regular users
    ...(!isAdvisor ? [
      { id: "investments", label: "Investments", icon: "fa-solid fa-chart-column", path: "/user/investments" },
      { id: "privileges", label: "Privileges", icon: "fa-solid fa-star", path: "/user/privileges" },
      { id: "blog", label: "Blog", icon: "fa-solid fa-pen-to-square", path: "/user/blog" },
      { id: "finbot", label: "FinBot", icon: "fa-solid fa-robot", path: "/user/finbot" },
    ] : []),
    { id: "video", label: sessionLabel, icon: "fa-solid fa-tower-broadcast", path: sessionLink },
  ];

  const settingsItem = { id: "settings", label: "Settings", icon: "fa-solid fa-gear", path: isAdvisor ? "/advisor/settings" : "/user/settings" };

  return (
    <div 
      className={collapsed ? "sidebar collapsed" : "sidebar"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Collapse/Expand button at top right */}
      <button
        className="collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle Sidebar"
      >
        <img
          src={collapsed ? "/sidebaropen.png" : "/sidebarclose.png"}
          alt="toggle sidebar"
          className="toggle-icon"
        />
      </button>

      {/* This div wraps the top logo and main menu */}
      <div className="sidebar-top">
        <ul className="sidebar-list">
          {topMenuItems.map((item) => (
            // --- FIX IS HERE ---
            // LI is the direct child of UL
            <li
              key={item.id}
              className={currentPath === item.path ? "active" : ""}
              aria-label={item.label}
              data-tooltip={item.label}
            >
              {/* LINK is inside the LI */}
              <Link to={item.path} className="sidebar-link">
                <i className={item.icon}></i>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
            // --- END OF FIX ---
          ))}
          
          {/* Settings item at the end of the main list */}
          <li className={currentPath === settingsItem.path ? "active" : ""}>
            <Link to={settingsItem.path} className="sidebar-link" title={settingsItem.label}>
              <i className={settingsItem.icon}></i>
              {!collapsed && <span>{settingsItem.label}</span>}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}