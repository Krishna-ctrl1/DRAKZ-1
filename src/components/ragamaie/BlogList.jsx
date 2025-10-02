import React from "react";
import BlogCard from "./BlogCard"; 
import "../styles/BlogList.css";

const BlogList = ({ blogs }) => {
  return (
    <section className="blog-list">
      {blogs.length > 0 ? (
        blogs.map((blog, index) => <BlogCard key={index} {...blog} />)
      ) : (
        <p>No blogs found.</p>
      )}
    </section>
  );
};

export default BlogList;
