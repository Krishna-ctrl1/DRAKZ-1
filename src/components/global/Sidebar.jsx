import React, { useState } from "react";
import "../../styles/global/Sidebar.css";

// MODIFIED: Accepts state and setter as props
// Using the same props as your original file
export default function Sidebar({ collapsed, setCollapsed }) {
  const [active, setActive] = useState("dashboard"); // Kept local active state

  // Top menu items as requested
  const topMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "fa-solid fa-border-all",
      path: "#",
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
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* This div wraps the top logo and main menu */}
      <div className="sidebar-top">
        <ul className="sidebar-list">
          {topMenuItems.map((item) => (
            <li
              key={item.id}
              className={active === item.id ? "active" : ""}
              onClick={() => setActive(item.id)}
              aria-label={item.label}
              data-tooltip={item.label} // For tooltip on hover when collapsed
            >
              <i className={item.icon}></i>
              {!collapsed && <span>{item.label}</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* This div wraps the bottom settings and collapse button */}
      <div className="sidebar-bottom">
        <ul className="sidebar-list">
          <li
            key={settingsItem.id}
            className={active === settingsItem.id ? "active" : ""}
            onClick={() => setActive(settingsItem.id)}
            aria-label={settingsItem.label}
            data-tooltip={settingsItem.label}
          >
            <i className={settingsItem.icon}></i>
            {!collapsed && <span>{settingsItem.label}</span>}
          </li>
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
    </aside>
  );
}
