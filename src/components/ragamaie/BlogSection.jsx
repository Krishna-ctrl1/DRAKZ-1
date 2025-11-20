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
      const res = await fetch("/api/blogs");
      const data = await res.json();

      // convert backend content → frontend description
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

  // Apply filters
  const applyFilters = (query, filters) => {
    let result = [...blogs];

    if (query)
      result = result.filter((b) =>
        b.title.toLowerCase().includes(query.toLowerCase())
      );

    if (filters.authorType !== "all")
      result = result.filter((b) => b.author_type === filters.authorType);

    if (filters.sortBy === "top")
      result.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    else
      result.sort(
        (a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
      );

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
      />
      <BlogList blogs={filteredBlogs} />
    </>
  );
};

export default BlogSection;
