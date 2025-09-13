import React, { useState } from "react";

import "../../styles/global/Sidebar.css";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("dashboard");

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

      {/* Bottom users */}
      <div className="sidebar-users">
        <img src="https://via.placeholder.com/32" alt="user1" />
        <img src="https://via.placeholder.com/32" alt="user2" />
        <button className="add-btn">+</button>
      </div>
    </aside>
  );
}
