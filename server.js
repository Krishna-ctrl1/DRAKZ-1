require("dotenv").config();
const express = require("express");
const path = require("path");
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
const userRoutes = require("./src/routes/user.routes");
const userAdvisorRoutes = require("./src/routes/user.advisor.route.js");
const investmentsRoutes = require("./src/routes/investments.routes.js");
const accountSummaryRoutes = require("./src/routes/accountSummary.routes.js");
const settingsRoutes = require("./src/routes/settings.routes.js");
const contactRoutes = require("./src/routes/contactRoutes.js");
const logsRoutes = require("./src/routes/logs.routes.js");
const kycRoutes = require("./src/routes/kyc.routes.js");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger.config.js");

const app = express();
const server = http.createServer(app);

// Middleware imports
const logger = require("./src/middlewares/logger.middleware.js");
const errorHandler = require("./src/middlewares/errorHandler.middleware.js");

connectDB();

// Initialize Redis
const { connectRedis } = require("./src/config/redis.config");
connectRedis();

// Global Middleware
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(logger);

// API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- SOCKET SERVER ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
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
app.use("/api", userRoutes);
app.use("/api/user", userAdvisorRoutes);
app.use("/api/privilege", privilegeRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/credit-score", require("./src/routes/creditScore.routes"));
app.use("/api/spendings", spendingsRoutes);
app.use("/api/cards", require("./src/routes/card.routes"));
app.use("/api/advisor", advisorRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/investments", investmentsRoutes);
app.use("/api/account-summary", accountSummaryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/kyc", kycRoutes);

// Simple health-check endpoint for the keep-awake cronjob
app.get("/api/ping", (req, res) => res.status(200).send("pong"));

// Global Error Handler Middleware (MUST be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  
  // --- KEEP-AWAKE CRONJOB ---
  // Sends an HTTP request to the backend and frontend every 10 minutes to reset the sleep timer.
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
  const frontendUrl = process.env.FRONTEND_URL;

  console.log(`🚀 Automated Keep-Awake Cronjob initialized.`);
  setInterval(() => {
    // Ping Backend
    fetch(`${backendUrl}/cron/health`) // Or /api/ping
      .then((res) => console.log(`⏱️ Backend keep-awake ping successful: [${res.status}]`))
      .catch((err) => console.error(`❌ Backend keep-awake ping failed:`, err.message));

    // Ping Frontend (if configured)
    if (frontendUrl) {
      fetch(frontendUrl)
        .then((res) => console.log(`⏱️ Frontend keep-awake ping successful: [${res.status}]`))
        .catch((err) => console.error(`❌ Frontend keep-awake ping failed:`, err.message));
    }
  }, 10 * 60 * 1000); // 10 minutes
});

