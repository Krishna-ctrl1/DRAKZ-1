import React from "react";
import BlogCard from "./BlogCard";
import "../../styles/ragamaie/BlogList.css";

// Provide a safe default for `blogs` so the component doesn't crash
const BlogList = ({ blogs = [] }) => {
  return (
    <section className="blog-list">
      {blogs && blogs.length > 0 ? (
        blogs.map((blog, index) => <BlogCard key={index} {...blog} />)
      ) : (
        <p>No blogs found.</p>
      )}
    </section>
  );
};

export default BlogList;
