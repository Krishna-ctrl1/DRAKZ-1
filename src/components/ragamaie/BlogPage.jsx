import React, { useState } from "react";
import Sidebar from "../global/Sidebar";
import BlogSection from "./BlogSection";
import "../../styles/ragamaie/BlogPage.css";
import Header from "../global/Header";

function BlogPage() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-page">
      <Header />

      <div className="app">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className={collapsed ? "main-content-collapsed" : "main-content"}>
          {/* BlogSection manages controls, filtering and the BlogList (with data) */}
          <BlogSection />
        </div>
      </div>
    </div>
  );
}

export default BlogPage;
