import React, { useState, useEffect, useRef } from "react";
import "../../styles/ragamaie/BlogControls.css";

function BlogControls({ onFiltersChange, onBlogCreated, onSearch }) {
  const [activeTab, setActiveTab] = useState("Latest");
  const [showForm, setShowForm] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const dropdownRef = useRef(null);

  const [activeFilters, setActiveFilters] = useState({
    authorType: "all",
    sortBy: "latest",
    search: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
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

  // Search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setActiveFilters((prev) => ({ ...prev, search: value }));
    onSearch?.(value);
  };

  // Filter changes
  const handleFilterChange = (key, value) => {
    const updated = { ...activeFilters, [key]: value };
    setActiveFilters(updated);
    onFiltersChange?.(updated);
    setShowFilterDropdown(false);
  };

  // Tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const updated = {
      ...activeFilters,
      sortBy: tab === "Latest" ? "latest" : "top",
    };
    setActiveFilters(updated);
    onFiltersChange?.(updated);
  };

  const clearFilters = () => {
    const updated = { ...activeFilters, authorType: "all" };
    setActiveFilters(updated);
    onFiltersChange?.(updated);
  };

  const getFilterLabel = () =>
    activeFilters.authorType === "user"
      ? "Users"
      : activeFilters.authorType === "advisor"
      ? "Advisors"
      : "Filter";

  // Form input
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Validate
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required.";
    else if (formData.title.trim().length < 3)
      newErrors.title = "Title must be at least 3 characters.";

    if (!formData.content.trim()) newErrors.content = "Content is required.";
    else if (formData.content.trim().length < 20)
      newErrors.content = "Content must be at least 20 characters.";

    if (formData.image.trim()) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      if (!urlRegex.test(formData.image.trim()))
        newErrors.image = "Image must be a valid URL.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const blogToCreate = {
      title: formData.title,
      content: formData.content,
      image: formData.image,
    };

    onBlogCreated?.(blogToCreate);
    alert("Blog submitted ✅");

    setShowForm(false);
    setFormData({
      title: "",
      content: "",
      image: "",
    });
    setErrors({});
  };

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
                rows="5"
                placeholder="Content"
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

              <div className="button-row">
                <button type="submit">Submit</button>
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
