require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/config/db.config.js");

// Routes
const authRoutes = require("./src/routes/auth.route.js");
const blogRoutes = require("./src/routes/blog.route.js");
const privilegeRoutes = require("./src/routes/privilege.route.js");
const spendingsRoutes = require("./src/routes/spending.routes");
const advisorRoutes = require("./src/routes/advisor.route.js");
const userRoutes = require('./src/routes/user.routes');

const app = express();
const server = http.createServer(app);

connectDB();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// --- SOCKET SERVER ---
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`⚡ User Connected: ${socket.id}`);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  // --- NEW: BROADCAST FEATURE ---
  socket.on("broadcast_video", (data) => {
    console.log("📢 Advisor broadcasting video to ALL users");
    // Emits to every connected socket (all users)
    io.emit("receive_video", data); 
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use('/api', userRoutes);
app.use("/api/privilege", privilegeRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/credit-score", require("./src/routes/creditScore.routes"));
app.use("/api/spendings", spendingsRoutes);
app.use("/api/advisor", advisorRoutes);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});