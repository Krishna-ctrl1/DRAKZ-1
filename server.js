// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db.config.js");
const authRoutes = require("./src/routes/auth.route.js");
const blogRoutes = require("./src/routes/blog.route.js");
const privilegeRoutes = require("./src/routes/privilege.route.js");
//const creditRoutes = require('./src/routes/creditScore.routes');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Make sure this matches your frontend port
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
app.use(express.json({ limit: "10mb" })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Test route
app.get("/api/test-all", (req, res) => {
  res.json({ msg: "Backend is LIVE!", time: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/privilege", privilegeRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/credit-score", require("./src/routes/creditScore.routes"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
