import React, { useEffect, useState } from "react";
import BlogComments from "./BlogComments";
import "../../styles/ragamaie/BlogCard.css";

const BlogCard = ({ _id, title, description, image, likes = [], dislikes = [] }) => {
  const [likeCount, setLikeCount] = useState(likes.length || 0);
  const [dislikeCount, setDislikeCount] = useState(dislikes.length || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Fetch user interaction status
  useEffect(() => {
    const fetchInteraction = async () => {
      try {
        const res = await fetch(`/api/blogs/${_id}/interactions`, {
          credentials: "include",
        });
        if (!res.ok) return;

        const data = await res.json();
        setHasLiked(data.hasLiked);
        setHasDisliked(data.hasDisliked);
      } catch (err) {
        console.log("Interaction fetch error:", err);
      }
    };

    fetchInteraction();
  }, [_id]);

  // LIKE handler
  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/blogs/${_id}/like`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        console.warn("Like failed:", res.status);
        return;
      }

      const data = await res.json();

      setLikeCount(data.likes);
      setDislikeCount(data.dislikes);

      setHasLiked((prev) => !prev);
      setHasDisliked(false);
    } catch (err) {
      console.log("Like error:", err);
    }
  };

  // DISLIKE handler
  const handleDislike = async (e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/blogs/${_id}/dislike`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        console.warn("Dislike failed:", res.status);
        return;
      }

      const data = await res.json();

      setLikeCount(data.likes);
      setDislikeCount(data.dislikes);

      setHasDisliked((prev) => !prev);
      setHasLiked(false);
    } catch (err) {
      console.log("Dislike error:", err);
    }
  };

  return (
    <div className="blog-card">
      <div
        className="text"
        onClick={(e) => {
          if (!e.target.closest(".interaction-row")) {
            window.location.href = `/blogs/${_id}`;
          }
        }}
        style={{ cursor: "pointer" }}
      >
        <h2>{title}</h2>
        <p>{description}</p>

        {/* Interaction Buttons */}
        <div className="interaction-row">
          <button
            className={`like-btn ${hasLiked ? "active" : ""}`}
            onClick={handleLike}
          >
            👍 {likeCount}
          </button>

          <button
            className={`dislike-btn ${hasDisliked ? "active" : ""}`}
            onClick={handleDislike}
          >
            👎 {dislikeCount}
          </button>

          <button
            className="comment-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowComments(true);
            }}
          >
            💬 Comments
          </button>
        </div>
      </div>

      {image && <img src={image} alt={title} />}

      {/* Comments Modal */}
      {showComments && (
        <BlogComments blogId={_id} onClose={() => setShowComments(false)} />
      )}
    </div>
  );
};

export default BlogCard;
