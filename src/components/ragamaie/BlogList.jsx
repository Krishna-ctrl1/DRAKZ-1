import React from "react";
import BlogCard from "./BlogCard";
import "../../styles/ragamaie/BlogList.css";

const BlogList = ({ blogs = [] }) => {
  return (
    <section className="blog-list">
      {blogs && blogs.length > 0 ? (
        blogs.map((blog) => (
          <BlogCard key={blog._id} {...blog} />
        ))
      ) : (
        <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
          No blogs found.
        </p>
      )}
    </section>
  );
};

export default BlogList;