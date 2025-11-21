import React, { useEffect, useState } from "react";
import "../../styles/ragamaie/BlogComments.css";

const BlogComments = ({ blogId, onClose }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch comments
  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments`, {
        credentials: "include",
      });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.log("Fetch comments error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  // Add comment
  const handleAddComment = async () => {
    if (!text.trim()) return;

    try {
      const res = await fetch(`/api/blogs/${blogId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        console.warn("Add comment failed", res.status);
        return;
      }

      const newComment = await res.json();
      setText("");
      // Append newly created comment
      setComments((prev) => [...prev, newComment]);
    } catch (err) {
      console.log("Add comment error:", err);
    }
  };

  // Delete comment
  const deleteComment = async (commentId) => {
    try {
      const res = await fetch(`/api/blogs/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        console.warn("Delete comment failed", res.status);
        return;
      }

      // refresh or remove locally
      setComments((prev) => prev.filter((c) => String(c._id) !== String(commentId)));
    } catch (err) {
      console.log("Delete comment error:", err);
    }
  };

  return (
    <div className="comments-overlay" onClick={onClose}>
      <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Comments</h2>

        <div className="comments-list">
          {loading ? (
            <p>Loading comments...</p>
          ) : comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div className="comment" key={c._id}>
                <strong>{c.user_id?.name || "User"}</strong>
                <p>{c.text}</p>

                {c.isOwner && (
                  <button
                    className="delete-btn"
                    onClick={() => deleteComment(c._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="add-comment">
          <textarea
            rows="3"
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>

          <button onClick={handleAddComment}>Post</button>
        </div>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default BlogComments;
