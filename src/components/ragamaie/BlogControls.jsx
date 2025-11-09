import React, { useState, useEffect, useRef } from "react";
import "../../styles/ragamaie/BlogControls.css";

function BlogControls({ onFiltersChange, onBlogCreated, onSearch }) {
  const [activeTab, setActiveTab] = useState("Latest");
  const [showForm, setShowForm] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // ✅ Modern unified filter state
  const [activeFilters, setActiveFilters] = useState({
    authorType: "all",
    sortBy: "latest",
    search: "",
  });

  const dropdownRef = useRef(null);

  // ✅ Blog creation form
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

  // -------------------------------
  // ✅ Close dropdown on outside click
  // -------------------------------
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -------------------------------
  // ✅ Notify parent on filter change
  // -------------------------------
  useEffect(() => {
    onFiltersChange?.(activeFilters);
  }, [activeFilters, onFiltersChange]);

  // -------------------------------
  // ✅ Search handling
  // -------------------------------
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setActiveFilters((prev) => ({ ...prev, search: value }));
    onSearch?.(value);
  };

  // -------------------------------
  // ✅ Filter change
  // -------------------------------
  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setShowFilterDropdown(false);
  };

  // -------------------------------
  // ✅ Tab change
  // -------------------------------
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveFilters((prev) => ({
      ...prev,
      sortBy: tab === "Latest" ? "latest" : "top",
    }));
  };

  // -------------------------------
  // ✅ Clear filters
  // -------------------------------
  const clearFilters = () => {
    setActiveFilters((prev) => ({
      ...prev,
      authorType: "all",
    }));
  };

  // Label for Filter Button
  const getFilterLabel = () =>
    activeFilters.authorType === "user"
      ? "Users"
      : activeFilters.authorType === "advisor"
      ? "Advisors"
      : "Filter";

  // -------------------------------
  // ✅ Form input handling
  // -------------------------------
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // -------------------------------
  // ✅ Validation
  // -------------------------------
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required.";
    else if (formData.title.trim().length < 3)
      newErrors.title = "Title must be at least 3 characters.";

    if (!formData.content.trim()) newErrors.content = "Content is required.";
    else if (formData.content.trim().length < 20)
      newErrors.content = "Content must be at least 20 characters.";

    if (!formData.author_id.trim())
      newErrors.author_id = "Author ID is required.";

    if (formData.image.trim()) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      if (!urlRegex.test(formData.image.trim()))
        newErrors.image = "Image must be a valid URL.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------------------
  // ✅ Submit Blog
  // -------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // ✅ Blog creation always starts as pending
    const blogToCreate = {
      ...formData,
      status: "pending",
      verified_by: null,
      published_at: null,
    };

    onBlogCreated?.(blogToCreate);

    alert("Blog submitted ✅ (awaiting admin approval)");

    // Reset
    setShowForm(false);
    setFormData({
      title: "",
      content: "",
      image: "",
      author_type: "user",
      author_id: "",
      status: "pending",
      verified_by: null,
      published_at: null,
    });
    setErrors({});
  };

  // -------------------------------
  // ✅ UI Rendering
  // -------------------------------
  return (
    <>
      <div className="blog-controls">
        <div className="left">
          {/* ✅ Search */}
          <input
            type="text"
            placeholder="🔍 Search blogs..."
            value={activeFilters.search}
            onChange={handleSearchChange}
            className="search-input"
          />

          {/* ✅ Filter Dropdown */}
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
                      {type === "all"
                        ? "All Authors"
                        : type === "user"
                        ? "Users"
                        : "Advisors"}
                    </label>
                  ))}
                </div>

                <button className="clear-filters" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* ✅ Tabs */}
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

      {/* ✅ Active Filter Tags */}
      {activeFilters.authorType !== "all" && (
        <div className="active-filters">
          <span>Active filter:</span>
          <span className="filter-tag">
            {activeFilters.authorType === "user" ? "Users" : "Advisors"}
            <span onClick={() => handleFilterChange("authorType", "all")}>×</span>
          </span>
          <button className="clear-all" onClick={clearFilters}>
            Clear all
          </button>
        </div>
      )}

      {/* ✅ Modal Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Blog</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && <p className="error">{errors.title}</p>}

              <textarea
                name="content"
                placeholder="Content"
                rows="5"
                value={formData.content}
                onChange={handleChange}
              />
              {errors.content && <p className="error">{errors.content}</p>}

              <input
                type="text"
                name="image"
                placeholder="Image URL (optional)"
                value={formData.image}
                onChange={handleChange}
              />
              {errors.image && <p className="error">{errors.image}</p>}

              <select
                name="author_type"
                value={formData.author_type}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="advisor">Advisor</option>
              </select>

              <input
                type="text"
                name="author_id"
                placeholder="Author ID"
                value={formData.author_id}
                onChange={handleChange}
              />
              {errors.author_id && <p className="error">{errors.author_id}</p>}

              <div className="button-row">
                <button type="submit">Submit</button>
                <button
                  type="button"
                  className="cancel"
                  onClick={() => setShowForm(false)}
                >
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
