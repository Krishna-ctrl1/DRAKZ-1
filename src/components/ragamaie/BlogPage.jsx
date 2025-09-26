import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BlogControls from "./BlogControls";   
import BlogList from "./BlogList";
import "../../styles/ragamaie/BlogPage";

function BlogPage() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Header />
        <BlogControls />   
        <BlogList />
      </main>
    </div>
  );
}

export default BlogPage;
