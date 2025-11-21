import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BlogComments from "./BlogComments";
import "../../styles/ragamaie/BlogDetails.css";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);

 const fetchBlog = async () => {
  setLoading(true);
  try {
    const res = await fetch(`/api/blogs`, { credentials: "include" });

    if (!res.ok) {
      console.error("Failed to fetch blogs:", res.status);
      setBlog(null);
      return;
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Blog response is not an array:", data);
      setBlog(null);
      return;
    }

    const found = data.find((b) => String(b._id) === String(id));
    setBlog(found || null);

  } catch (err) {
    console.log("Blog fetch error:", err);
    setBlog(null);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!blog) return <p>Blog not found.</p>;

  return (
    <div className="blog-details">
      <h1>{blog.title}</h1>

      {blog.image && <img className="details-img" src={blog.image} alt={blog.title} />}

      <p className="details-content">{blog.content}</p>

      <div className="details-actions">
        <button onClick={() => setShowComments(true)} className="comment-btn">
          💬 View Comments
        </button>
      </div>

      {showComments && (
        <BlogComments blogId={blog._id} onClose={() => setShowComments(false)} />
      )}
    </div>
  );
};

export default BlogDetails;
