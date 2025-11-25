require("dotenv").config();
const mongoose = require("mongoose");
const Blog = require("../src/models/blog.model");

mongoose.connect(process.env.MONGO_URI);

async function seedBlogs() {
  try {
    // Remove existing blogs if needed (optional)
    // await Blog.deleteMany({});

    const defaultBlogs = [
      {
        title: "The Ultimate Guide to Investing in Stocks",
        content:
          "Learn the basics of stock market investing, including how to choose stocks, manage risk, and build a diversified portfolio.",
        image: "/stocksImg.png",
        author_type: "user",
        author_id: 1,
        status: "approved",
        created_at: new Date(),
      },
      {
        title: "Understanding Cryptocurrency: A Beginner’s Guide",
        content:
          "Explore the world of cryptocurrencies, including Bitcoin, Ethereum, and other digital currencies. Learn about blockchain technology, wallets, and trading.",
        image: "/crypto.png",
        author_type: "advisor",
        author_id: 2,
        status: "approved",
        created_at: new Date(),
      },
      {
        title: "Budgeting 101: How to Create a Budget That Works",
        content:
          "Master your personal finances with a step-by-step guide to creating and sticking to a budget that actually works.",
        image: "/budget.png",
        author_type: "user",
        author_id: 3,
        status: "approved",
        created_at: new Date(),
      }
    ];

    await Blog.insertMany(defaultBlogs);

    console.log("✅ Default 3 blogs have been added!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding blogs:", err);
    process.exit(1);
  }
}

seedBlogs();
