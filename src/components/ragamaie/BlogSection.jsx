import React, { useState, useEffect } from "react";
import BlogControls from "./BlogControls";
import BlogList from "./BlogList";

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [filters, setFilters] = useState({
    authorType: "all",
    sortBy: "latest",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/blogs", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Failed to fetch blogs", res.status);
        return;
      }

      const data = await res.json();

      const mapped = data.map((b) => ({
        ...b,
        description: b.content,
      }));

      setBlogs(mapped);
      setFilteredBlogs(mapped);
    } catch (e) {
      console.error("Fetch failed:", e);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Create Blog
  const createBlog = async (blogData) => {
    try {
      const res = await fetch("http://localhost:3001/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(blogData),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        console.error("Create failed", res.status, error);
        alert("Failed to create blog ❌");
        return;
      }

      await fetchBlogs();
      alert("Blog created successfully 🎉");
    } catch (err) {
      console.error("Create blog error:", err);
      alert("Something went wrong ❌");
    }
  };

  // Apply filters
  const applyFilters = (query, filters) => {
    let result = [...blogs];

    // Search
    if (query)
      result = result.filter((b) =>
        b.title.toLowerCase().includes(query.toLowerCase())
      );

    // Author filter
    if (filters.authorType !== "all")
      result = result.filter((b) => b.author_type === filters.authorType);

    // Sorting
    if (filters.sortBy === "top") {
      result.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    } else {
      result.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    setFilteredBlogs(result);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(query, filters);
  };

  const handleFiltersChange = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    applyFilters(searchQuery, updated);
  };

  return (
    <>
      <BlogControls
        onSearch={handleSearch}
        onFiltersChange={handleFiltersChange}
        onBlogCreated={createBlog}
      />
      <BlogList blogs={filteredBlogs} />
    </>
  );
};

export default BlogSection;
