import React, { useState } from "react";
import "../../styles/global/Sidebar.css";

// MODIFIED: Accepts state and setter as props
export default function Sidebar({ collapsed, setCollapsed }) {
  const [active, setActive] = useState("dashboard"); // Kept local active state

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "fas fa-home", path: "#" },
    { id: "investments", label: "Investments", icon: "fa-solid fa-chart-column", path: "/investments" },
    { id: "blog", label: "Blog", icon: "fa-solid fa-blog", path: "/blog" },
    { id: "finbot", label: "Fin Bot", icon: "fas fa-robot", path: "/finbot" },
    { id: "privileges", label: "My Privileges", icon: "fas fa-gift", path: "/privileges" },
    { id: "settings", label: "Settings", icon: "fas fa-cog", path: "/settings" },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      
      {/* Menu items */}
      <ul className="sidebar-list">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={active === item.id ? "active" : ""}
            onClick={() => setActive(item.id)}
          >
            <i className={item.icon}></i>
            {!collapsed && <span>{item.label}</span>}
          </li>
        ))}
      </ul>

      {/* Collapse/Expand button - Moved to the bottom-most part of the component */}
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

      {/* Bottom users section REMOVED */}
    </aside>
  );
}