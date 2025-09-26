import React from "react";
import "../../styles/ragamaie/BlogCard";

const BlogCard = ({ title, description, image }) => {
  return (
    <div className="blog-card">
      <div className="text">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <img src={image} alt={title} />
    </div>
  );
};

export default BlogCard;
