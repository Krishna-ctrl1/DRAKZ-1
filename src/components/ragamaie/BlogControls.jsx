import React, { useState, useEffect, useRef } from "react";
import "../../styles/ragamaie/BlogControls.css";

function BlogControls({ onFiltersChange, onBlogCreated, onSearch }) {
  const [activeTab, setActiveTab] = useState("Latest");
  const [showForm, setShowForm] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unified filter state
  const [activeFilters, setActiveFilters] = useState({
    authorType: "all",
    sortBy: "latest",
    search: "",
  });

  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    author_type: "user",
    author_id: "",
    status: "pending",
    verified_by: null,
    published_at: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setActiveFilters((prev) => ({ ...prev, search: value }));
    onSearch?.(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
    setShowFilterDropdown(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const sortBy = tab === "Latest" ? "latest" : "top";
    const newFilters = { ...activeFilters, sortBy };
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const newFilters = { ...activeFilters, authorType: "all" };
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  // ---------------------------------------------------------
  // 🛡️ IMPROVED VALIDATION LOGIC
  // ---------------------------------------------------------
  const validate = () => {
    const newErrors = {};
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

    // Remove all non-alphanumeric characters (keeps only letters and numbers)
    // "....." becomes "" (length 0)
    // "Hi...." becomes "Hi" (length 2)
    const cleanTitle = formData.title.replace(/[^a-zA-Z0-9]/g, "");
    const cleanContent = formData.content.replace(/[^a-zA-Z0-9]/g, "");

    // 1. Title Validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required.";
    } else if (cleanTitle.length < 3) { 
      // Ensures at least 3 REAL letters/numbers exist
      newErrors.title = "Title must contain at least 3 alphanumeric characters (no filler symbols).";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title cannot exceed 100 characters.";
    }

    // 2. Content Validation
    if (!formData.content.trim()) {
      newErrors.content = "Content is required.";
    } else if (cleanContent.length < 10) { 
      // Ensures at least 10 REAL letters/numbers exist
      newErrors.content = "Content is too short or contains only symbols (min 10 alphanumeric characters).";
    }

    // 3. Image URL Validation
    if (formData.image.trim() && !urlPattern.test(formData.image)) {
      newErrors.image = "Please enter a valid Image URL (http:// or https://).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to post.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("http://localhost:3001/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          image: formData.image
        })
      });

      if (response.ok) {
        alert("Blog submitted successfully! ⏳ It is now pending Admin approval.");
        setShowForm(false);
        setFormData({ ...formData, title: "", content: "", image: "" });
        onBlogCreated?.(); 
      } else {
        const errorData = await response.json();
        alert(`Failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Could not connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilterLabel = () =>
    activeFilters.authorType === "user"
      ? "Users"
      : activeFilters.authorType === "advisor"
      ? "Advisors"
      : "Filter";

  return (
    <>
      <div className="blog-controls">
        <div className="left">
          <input
            type="text"
            placeholder="🔍 Search blogs..."
            value={activeFilters.search}
            onChange={handleSearchChange}
            className="search-input"
          />

          <div className="filter-dropdown" ref={dropdownRef}>
            <button
              className="filter-btn"
              onClick={() => setShowFilterDropdown((p) => !p)}
            >
              {getFilterLabel()} ▼
            </button>

            {showFilterDropdown && (
              <div className="dropdown-content">
                <div className="filter-section">
                  <strong>Author Type</strong>
                  {["all", "user", "advisor"].map((type) => (
                    <label key={type}>
                      <input
                        type="radio"
                        name="author_type"
                        checked={activeFilters.authorType === type}
                        onChange={() => handleFilterChange("authorType", type)}
                      />
                      {type === "all" ? "All Authors" : type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
                <button className="clear-filters" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {["Latest", "Top"].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="right">
          <button className="create-btn" onClick={() => setShowForm(true)}>
            Create your Blog
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Blog</h2>
            <form onSubmit={handleSubmit}>
              
              <div className="form-group">
                <input 
                  type="text" 
                  name="title" 
                  placeholder="Title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  className={errors.title ? "input-error" : ""}
                />
                {errors.title && <p className="error-text">{errors.title}</p>}
              </div>

              <div className="form-group">
                <textarea 
                  name="content" 
                  placeholder="Content (min 10 real characters)" 
                  rows="5" 
                  value={formData.content} 
                  onChange={handleChange}
                  className={errors.content ? "input-error" : ""}
                />
                {errors.content && <p className="error-text">{errors.content}</p>}
              </div>

              {/* <div className="form-group">
                <input 
                  type="text" 
                  name="image" 
                  placeholder="Image URL (optional)" 
                  value={formData.image} 
                  onChange={handleChange} 
                  className={errors.image ? "input-error" : ""}
                />
                {errors.image && <p className="error-text">{errors.image}</p>}
              </div> */}

              <div className="button-row">
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
                <button type="button" className="cancel" onClick={() => setShowForm(false)}>
                  Cancel
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