import React from "react";
import BlogCard from "./BlogCard"; 
import "../../styles/ragamaie/BlogList";
import stocksImg from "../assets/stocksImg.png";
import cryptoImg from "../assets/crypto.png";
import budgetImg from "../assets/budget.png"; 

const blogs = [
  {
    title: "The Ultimate Guide to Investing in Stocks",
    description:
      "Learn the basics of stock market investing, including how to choose stocks, manage risk, and build a diversified portfolio.",
    image : stocksImg,
  },
  {
    title: "Understanding Cryptocurrency: A Beginner’s Guide",
    description:
      "Explore the world of cryptocurrencies, including Bitcoin, Ethereum, and other digital currencies. Learn about blockchain technology, wallets, and trading.",
    image: cryptoImg,
  },
  {
    title: "Budgeting 101: How to Create a Budget That Works",
    description:
      "Explore the world of cryptocurrencies, including Bitcoin, Ethereum, and other digital currencies. Learn about blockchain technology, wallets, and trading.",
    image: budgetImg,
  },
];

const BlogList = () => {
  return (
    <section className="blog-list">
      {blogs.map((blog, index) => (
        <BlogCard key={index} {...blog} />
      ))}
    </section>
  );
};

export default BlogList;
