require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); // Required for Socket.io
const { Server } = require("socket.io"); // Required for Real-time
const connectDB = require("./src/config/db.config.js");

// Routes
const authRoutes = require("./src/routes/auth.route.js");
const blogRoutes = require("./src/routes/blog.route.js");
const privilegeRoutes = require("./src/routes/privilege.route.js");
const spendingsRoutes = require("./src/routes/spending.routes");
const advisorRoutes = require("./src/routes/advisor.route.js");

const app = express();
const server = http.createServer(app); // Create HTTP server

// Connect DB
connectDB();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// --- REAL-TIME SOCKET SERVER ---
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`⚡ User Connected: ${socket.id}`);

  // 1. Join Room (User ID matches Client DB ID)
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // 2. Chat Messages
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  // 3. WebRTC Video Signaling
  socket.on("offer", (data) => {
    socket.to(data.room).emit("offer", data.offer);
  });

  socket.on("answer", (data) => {
    socket.to(data.room).emit("answer", data.answer);
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.room).emit("ice-candidate", data.candidate);
  });

  socket.on("end_call", (data) => {
    socket.to(data.room).emit("call_ended");
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// API Routes
app.get("/api/test-all", (req, res) => {
  res.json({ msg: "Backend is LIVE!", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/privilege", privilegeRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/credit-score", require("./src/routes/creditScore.routes"));
app.use("/api/spendings", spendingsRoutes);
app.use("/api/advisor", advisorRoutes);

const PORT = process.env.PORT || 3001;
// IMPORTANT: Listen on 'server', not 'app'
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});