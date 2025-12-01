import React from "react";
import "../../styles/global/Sidebar.css";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const topMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-border-all", path: "/user/dashboard" },
    { id: "investments", label: "Investments", icon: "fa-solid fa-chart-column", path: "/user/investments" },
    { id: "privileges", label: "Privileges", icon: "fa-solid fa-star", path: "/user/privileges" },
    { id: "blog", label: "Blog", icon: "fa-solid fa-pen-to-square", path: "/user/blog" },
    { id: "finbot", label: "FinBot", icon: "fa-solid fa-robot", path: "/user/finbot" },
    { id: "video", label: "Live Advisor", icon: "fa-solid fa-video", path: "/user/video" },
  ];

  const settingsItem = { id: "settings", label: "Settings", icon: "fa-solid fa-gear", path: "/user/settings" };

  return (
    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>
      <div className="sidebar-top">
        <ul className="sidebar-list">
          {topMenuItems.map((item) => (
            <li key={item.id} className={currentPath === item.path ? "active" : ""}>
              <Link to={item.path} className="sidebar-link" title={item.label}>
                <i className={item.icon}></i>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-bottom">
        <ul className="sidebar-list">
          <li className={currentPath === settingsItem.path ? "active" : ""}>
            <Link to={settingsItem.path} className="sidebar-link" title={settingsItem.label}>
              <i className={settingsItem.icon}></i>
              {!collapsed && <span>{settingsItem.label}</span>}
            </Link>
          </li>
        </ul>

        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          <img src={collapsed ? "/sidebaropen.png" : "/sidebarclose.png"} alt="toggle" className="toggle-icon" />
        </button>
      </div>
    </div>
  );
}