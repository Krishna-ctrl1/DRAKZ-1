import React, { useState } from "react";
import "../../styles/global/Sidebar.css";
import { Link, useLocation } from "react-router-dom";

// MODIFIED: Accepts state and setter as props
// Using the same props as your original file
export default function Sidebar({ collapsed, setCollapsed }) {
  // const [active, setActive] = useState("dashboard"); // Kept local active state
  const location = useLocation();
  // Get the current path from the location object
  const currentPath = location.pathname;
  // Top menu items as requested
  const topMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "fa-solid fa-border-all",
      path: "/dashboard",
    },
    {
      id: "investments",
      label: "Investments",
      icon: "fa-solid fa-chart-column",
      path: "/investments",
    },

    {
      id: "privileges",
      label: "Privileges",
      icon: "fa-solid fa-star",
      path: "/privileges",
    },
    {
      id: "blog",
      label: "Blog",
      icon: "fa-solid fa-pen-to-square",
      path: "/blog",
    },
    {
      id: "finbot",
      label: "FinBot",
      icon: "fa-solid fa-robot",
      path: "/finbot",
    },
  ];

  // Bottom menu item
  const settingsItem = {
    id: "settings",
    label: "Settings",
    icon: "fa-solid fa-gear",
    path: "/settings",
  };

  return (
    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>
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
        </ul>
      </div>

      {/* Bottom settings and collapse button */}
      <div className="sidebar-bottom">
        <ul className="sidebar-list">
          {/* --- FIX IS HERE --- */}
          <li
            key={settingsItem.id}
            className={currentPath === settingsItem.path ? "active" : ""}
            aria-label={settingsItem.label}
            data-tooltip={settingsItem.label}
          >
            {/* LINK is inside the LI */}
            <Link to={settingsItem.path} className="sidebar-link">
              <i className={settingsItem.icon}></i>
              {!collapsed && <span>{settingsItem.label}</span>}
            </Link>
          </li>
          {/* --- END OF FIX --- */}
        </ul>

        {/* Collapse/Expand button */}
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
      </div>
    </div>
  );
}
