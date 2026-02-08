import React, { useState, useEffect, useRef } from "react";
import { BACKEND_URL } from "../../config/backend";
import "../../styles/ragamaie/BlogControls.css";

// --- DARK MODAL STYLES ---
const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Dark dim
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
    backdropFilter: 'blur(5px)'
  },
  content: {
    backgroundColor: '#1e1e2f', // Dark Navy
    padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '600px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.6)', border: '1px solid #2b2b40', color: '#fff'
  },
  input: {
    width: '100%', padding: '12px', marginBottom: '15px', backgroundColor: '#11111d',
    border: '1px solid #2b2b40', color: '#fff', borderRadius: '8px', fontSize: '1rem'
  },
  textarea: {
    width: '100%', padding: '12px', marginBottom: '15px', backgroundColor: '#11111d',
    border: '1px solid #2b2b40', color: '#fff', borderRadius: '8px', fontSize: '1rem', minHeight: '150px'
  },
  btnPrimary: {
    padding: '10px 20px', backgroundColor: '#6C63FF', color: '#fff', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem'
  },
  btnSecondary: {
    padding: '10px 20px', backgroundColor: 'transparent', color: '#aaa', border: '1px solid #444',
    borderRadius: '8px', cursor: 'pointer', marginLeft: '10px'
  }
};

function BlogControls({ onFiltersChange, onBlogCreated, onSearch, editingBlog, onCancelEdit }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", image: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // existing states...
  const [activeFilters, setActiveFilters] = useState({ authorType: "all", sortBy: "latest", search: "" });
  const dropdownRef = useRef(null);

  // WATCH FOR EDIT PROP
  useEffect(() => {
    if (editingBlog) {
      setFormData({
        title: editingBlog.title,
        content: editingBlog.content,
        image: editingBlog.image || ""
      });
      setShowForm(true);
    }
  }, [editingBlog]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) { setIsSubmitting(false); return alert("Please login."); }

    const url = editingBlog
      ? `${BACKEND_URL}/api/blogs/update/${editingBlog._id}` // PUT
      : `${BACKEND_URL}/api/blogs`;                          // POST

    const method = editingBlog ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingBlog ? "Blog updated! It is pending approval." : "Blog submitted!");
        setShowForm(false);
        setFormData({ title: "", content: "", image: "" });
        onBlogCreated?.();
      } else {
        alert("Failed to save.");
      }
    } catch (error) { console.error("Error:", error); }
    setIsSubmitting(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData({ title: "", content: "", image: "" });
    if (editingBlog) onCancelEdit?.();
  };

  return (
    <>
      <div className="blog-controls">
        <div className="left">
          {/* Ensure your CSS file handles this search input styling to match the screenshot */}
          <input
            type="text"
            placeholder="🔍 Search..."
            onChange={(e) => onSearch?.(e.target.value)}
            className="search-input"
            style={{
              background: '#11111d', border: '1px solid #2b2b40', color: '#fff',
              padding: '10px 15px', borderRadius: '20px', width: '300px'
            }}
          />
        </div>

        <div className="right">
          <button
            className="create-btn"
            onClick={() => setShowForm(true)}
            style={{
              background: 'linear-gradient(45deg, #6C63FF, #4840d6)',
              color: '#fff', border: 'none', padding: '10px 20px',
              borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            {editingBlog ? "Editing Blog..." : "Create your Blog"}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>{editingBlog ? "Edit & Resubmit" : "Create Blog"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa', fontSize: '0.9rem' }}>Title</label>
                <input style={modalStyles.input} type="text" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa', fontSize: '0.9rem' }}>Content</label>
                <textarea style={modalStyles.textarea} name="content" rows="5" value={formData.content} onChange={handleChange} required />
              </div>
              {/* <div className="form-group">
                <label style={{display:'block', marginBottom:'5px', color:'#aaa', fontSize:'0.9rem'}}>Image URL (Optional)</label>
                <input style={modalStyles.input} type="text" name="image" value={formData.image} onChange={handleChange} />
              </div> */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" style={modalStyles.btnSecondary} onClick={closeForm}>Cancel</button>
                <button type="submit" style={modalStyles.btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : (editingBlog ? "Save & Resubmit" : "Submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default BlogControls;