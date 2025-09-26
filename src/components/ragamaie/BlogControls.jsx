import React, { useState } from "react";
import "../../styles/ragamaie/BlogControls";

function BlogControls() {
  const [activeTab, setActiveTab] = useState("Top");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    author_type: "user",
    author_id: "",
    status: "pending",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);

    // 👉 Here you’d call your API to save the blog post
    // await axios.post("/api/blogs", formData)

    setShowForm(false); // Close modal after submit
  };

  return (
    <>
      <div className="blog-controls">
        <div className="left">
          <button className="filter-btn">Filter ▼</button>

          <button
            className={`tab ${activeTab === "Top" ? "active" : ""}`}
            onClick={() => setActiveTab("Top")}
          >
            Top
          </button>

          <button
            className={`tab ${activeTab === "Latest" ? "active" : ""}`}
            onClick={() => setActiveTab("Latest")}
          >
            Latest
          </button>
        </div>

        <div className="right">
          <button className="create-btn" onClick={() => setShowForm(true)}>
            Create your Blog
          </button>
        </div>
      </div>

      {/* Modal Form */}
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
                required
              />
              <textarea
                name="content"
                placeholder="Content"
                rows="5"
                value={formData.content}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="image"
                placeholder="Image URL"
                value={formData.image}
                onChange={handleChange}
              />
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
                required
              />
              <button type="submit">Submit</button>
              <button
                type="button"
                className="cancel"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default BlogControls;
