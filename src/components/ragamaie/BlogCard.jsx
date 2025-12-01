import React, { useState, useEffect } from "react";
import "../../styles/ragamaie/BlogCard.css"; 

const BlogCard = ({ _id, title, content, image, author_id, createdAt, likes = [], dislikes = [], onDelete }) => {
  // State for counts (initialized from props)
  const [likeCount, setLikeCount] = useState(likes.length);
  const [dislikeCount, setDislikeCount] = useState(dislikes.length);
  
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [userStatus, setUserStatus] = useState({ hasLiked: false, hasDisliked: false });
  const [loadingComments, setLoadingComments] = useState(false);

  const getToken = () => localStorage.getItem("token");
  const getCurrentUserId = () => localStorage.getItem("userId");
  const currentUserId = getCurrentUserId();

  // 1. Fetch User's Interaction Status
  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await fetch(`http://localhost:3001/api/blogs/${_id}/interactions`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserStatus({ hasLiked: data.hasLiked, hasDisliked: data.hasDisliked });
        }
      } catch (err) {
        console.error("Error fetching interactions", err);
      }
    };
    fetchInteractions();
  }, [_id]);

  // 2. Handle Like / Dislike with Count Updates
  const handleInteraction = async (type) => { 
    try {
      const token = getToken();
      if (!token) return alert("Please login to interact.");

      const res = await fetch(`http://localhost:3001/api/blogs/${_id}/${type}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        // Optimistic UI Update
        if (type === 'like') {
          if (userStatus.hasLiked) {
            // Unliking
            setLikeCount(prev => Math.max(0, prev - 1));
            setUserStatus(prev => ({ ...prev, hasLiked: false }));
          } else {
            // Liking
            setLikeCount(prev => prev + 1);
            if (userStatus.hasDisliked) setDislikeCount(prev => Math.max(0, prev - 1)); // Remove dislike if exists
            setUserStatus({ hasLiked: true, hasDisliked: false });
          }
        } else { // type === 'dislike'
          if (userStatus.hasDisliked) {
            // Undisliking
            setDislikeCount(prev => Math.max(0, prev - 1));
            setUserStatus(prev => ({ ...prev, hasDisliked: false }));
          } else {
            // Disliking
            setDislikeCount(prev => prev + 1);
            if (userStatus.hasLiked) setLikeCount(prev => Math.max(0, prev - 1)); // Remove like if exists
            setUserStatus({ hasLiked: false, hasDisliked: true });
          }
        }
      }
    } catch (err) {
      console.error(`Failed to ${type}`, err);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const res = await fetch(`http://localhost:3001/api/blogs/${_id}/comments`);
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        setComments([]);
      }
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const token = getToken();
      if (!token) return alert("Login to comment");

      const res = await fetch(`http://localhost:3001/api/blogs/${_id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ text: newComment })
      });

      if (res.ok) {
        const savedComment = await res.json();
        setComments([...comments, savedComment]);
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:3001/api/blogs/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="blog-card">
      <div className="text">
        <h2>{title}</h2>
        <p style={{ fontSize: "0.85rem", color: "#aaa", marginBottom: "10px" }}>
          By {author_id?.name || author_id?.email || "User"} • {new Date(createdAt).toLocaleDateString()}
        </p>
        <p className="content-preview">{content}</p>

        <div className="blog-actions">
          <button type="button" className={`action-btn ${userStatus.hasLiked ? "active" : ""}`} onClick={() => handleInteraction('like')}>
            👍 Like ({likeCount})
          </button>
          
          <button type="button" className={`action-btn ${userStatus.hasDisliked ? "active" : ""}`} onClick={() => handleInteraction('dislike')}>
            👎 Dislike ({dislikeCount})
          </button>
          
          {/* <button type="button" className="action-btn" onClick={toggleComments}>
            💬 Comments
          </button> */}

          {currentUserId === author_id?._id && (
             <button type="button" className="delete-btn" onClick={() => onDelete(_id)}>🗑 Delete</button>
          )}
        </div>

        {showComments && (
          <div className="comments-section">
            <div className="add-comment">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." />
              <button type="button" onClick={handleAddComment}>Post</button>
            </div>
            {loadingComments ? <p>Loading...</p> : (
              <div className="comments-list">
                {comments.length > 0 ? (
                  comments.map(c => (
                    <div key={c._id} className="comment-item">
                      <p><strong>{c.user_id?.name || c.user_id?.email || "User"}:</strong> {c.text}</p>
                      {currentUserId === c.user_id?._id && (
                        <button className="delete-comment-btn" onClick={() => handleDeleteComment(c._id)}>×</button>
                      )}
                    </div>
                  ))
                ) : <p style={{color: "#888"}}>No comments yet.</p>}
              </div>
            )}
          </div>
        )}
      </div>
      {image && <img src={image} alt={title} className="blog-image" />}
    </div>
  );
};

export default BlogCard;