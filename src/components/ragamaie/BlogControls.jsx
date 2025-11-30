import React, { useState, useEffect, useRef } from "react";
import "../../styles/ragamaie/BlogControls.css";

function BlogControls({ onFiltersChange, onBlogCreated, onSearch }) {
  const [activeTab, setActiveTab] = useState("Latest");
  const [showForm, setShowForm] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Unified filter state
  const [activeFilters, setActiveFilters] = useState({
    authorType: "all",
    sortBy: "latest",
    search: "",
  });

  const dropdownRef = useRef(null);

  // Blog creation form state
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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ---------------------------------------------------------
  // 🛑 DELETED THE USEEFFECT HERE TO STOP THE INFINITE LOOP
  // ---------------------------------------------------------

  // Search handling
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setActiveFilters((prev) => ({ ...prev, search: value }));
    onSearch?.(value);
  };

  // Filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters); // <--- Trigger update manually here
    setShowFilterDropdown(false);
  };

  // Tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const sortBy = tab === "Latest" ? "latest" : "top";
    const newFilters = { ...activeFilters, sortBy };
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters); // <--- Trigger update manually here
  };

  // Clear filters
  const clearFilters = () => {
    const newFilters = { ...activeFilters, authorType: "all" };
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters); // <--- Trigger update manually here
  };

  // Form input handling
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.content.trim()) newErrors.content = "Content is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Blog
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const blogToCreate = {
      ...formData,
      status: "pending",
      verified_by: null,
      published_at: null,
    };

    onBlogCreated?.(blogToCreate);
    alert("Blog submitted ✅ (awaiting admin approval)");
    setShowForm(false);
    setFormData({ ...formData, title: "", content: "", image: "" });
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
              <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} />
              {errors.title && <p className="error">{errors.title}</p>}
              <textarea name="content" placeholder="Content" rows="5" value={formData.content} onChange={handleChange} />
              <input type="text" name="image" placeholder="Image URL (optional)" value={formData.image} onChange={handleChange} />
              <div className="button-row">
                <button type="submit">Submit</button>
                <button type="button" className="cancel" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default BlogControls;