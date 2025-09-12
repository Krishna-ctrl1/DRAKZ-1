import React from "react";
import "../../styles/global/Sidebar.css";

import { Home, BarChart2, FileText, Settings } from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <nav className="menu">
        <a href="../deepthi/Dashboard"><Home /></a>
        <a href="../ragamaie/Investments"><BarChart2 /></a>
        <a href="#"><FileText /></a>
        <a href="#"><Settings /></a>
      </nav>
      <div className="bottom-users">
        <img className="avatar" src="" alt="user1" />
        <img className="avatar" src="" alt="user2" />
        <button className="add">+</button>
      </div>
    </aside>
  );
};

export default Sidebar;
