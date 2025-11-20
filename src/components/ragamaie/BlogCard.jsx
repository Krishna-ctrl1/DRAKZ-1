import React from "react";
import "../../styles/ragamaie/BlogCard.css";

const BlogCard = ({ title, description, content, image }) => {
  return (
    <div className="blog-card">
      <div className="text">
        <h2>{title}</h2>
        <p>{description || content}</p>
      </div>
      <img src={image} alt={title} />
    </div>
  );
};


export default BlogCard;
