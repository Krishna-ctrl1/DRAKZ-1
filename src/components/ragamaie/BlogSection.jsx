import React, { useState } from "react";
import BlogControls from "./BlogControls";   
import BlogList from "./BlogList";

import stocksImg from "../assets/stocksImg.png";
import cryptoImg from "../assets/crypto.png";
import budgetImg from "../assets/budget.png";

const BlogSection = () => {
  const [blogs] = useState([
    {
      title: "The Ultimate Guide to Investing in Stocks",
      description:
        "Learn the basics of stock market investing, including how to choose stocks, manage risk, and build a diversified portfolio.",
      image: stocksImg,
      authorType: "user",
    },
    {
      title: "Understanding Cryptocurrency: A Beginner’s Guide",
      description:
        "Explore the world of cryptocurrencies, including Bitcoin, Ethereum, and other digital currencies. Learn about blockchain technology, wallets, and trading.",
      image: cryptoImg,
      authorType: "advisor",
    },
    {
      title: "Budgeting 101: How to Create a Budget That Works",
      description:
        "Master your personal finances with a step-by-step guide to creating and sticking to a budget that actually works.",
      image: budgetImg,
      authorType: "user",
    },
  ]);

  const [filteredBlogs, setFilteredBlogs] = useState(blogs);
  const [filters, setFilters] = useState({ authorType: "all", sortBy: "newest" });
  const [searchQuery, setSearchQuery] = useState("");

  // Apply search + filters together
  const applyFilters = (query, filters) => {
    let result = blogs;

    // search
    if (query) {
      result = result.filter((b) =>
        b.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    // authorType filter
    if (filters.authorType && filters.authorType !== "all") {
      result = result.filter((b) => b.authorType === filters.authorType);
    }

    // sort (example logic)
    if (filters.sortBy === "top") {
      result = [...result].reverse();
    }

    setFilteredBlogs(result);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(query, filters);
  };

  const handleFiltersChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    applyFilters(searchQuery, updatedFilters);
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
