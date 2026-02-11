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
const userRoutes = require("./src/routes/user.routes");
const investmentsRoutes = require("./src/routes/investments.routes.js");
const accountSummaryRoutes = require("./src/routes/accountSummary.routes.js");
const settingsRoutes = require("./src/routes/settings.routes.js");
const contactRoutes = require("./src/routes/contactRoutes.js");
const logsRoutes = require("./src/routes/logs.routes.js");
const userAdvisorRoutes = require("./src/routes/user.advisor.route.js");
const app = express();
const server = http.createServer(app);

// Middleware imports
const logger = require("./src/middlewares/logger.middleware.js");
const errorHandler = require("./src/middlewares/errorHandler.middleware.js");
const userActivity = require("./src/middlewares/userActivity.middleware.js");
const requestContext = require("./src/middlewares/requestContext.middleware.js");
const cacheControl = require("./src/middlewares/cacheControl.middleware.js");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger.config.js");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const {
  getMorganMiddleware,
} = require("./src/middlewares/morgan.middleware.js");

connectDB();

// Helper to normalize URL (remove trailing slash)
const normalizeUrl = (url) => url ? url.replace(/\/$/, "") : "";

console.log("🔑 JWT_SECRET loaded:", process.env.JWT_SECRET ? "YES" : "NO (using fallback)");
console.log("🔒 CORS Setup - Configured FRONTEND_URL:", process.env.FRONTEND_URL);

const allowedOrigins = [
  "http://localhost:3000",
  "https://drakz-frontend.onrender.com", 
  "https://drakz-backend.onrender.com", 
  process.env.FRONTEND_URL 
].filter(Boolean); // Remove undefined values

console.log("✅ Allowed CORS Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`❌ CORS BLOCKED: Origin '${origin}' not in allowed list.`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-auth-token",
      "Cache-Control",
      "Pragma",
      "Expires",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Morgan HTTP request logger
const morganMiddlewares = getMorganMiddleware();
morganMiddlewares.forEach((middleware) => app.use(middleware));

app.use(logger);

// Global user activity logger (captures user, timing, requests)
app.use(userActivity);

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

app.get("/cron/health", (req, res) => {
  res.status(200).json({ ok: true, timestamp: Date.now() });
});

app.get("/trigger-error", (req, res, next) => {
  console.log("--- Triggering Error Route ---"); // Add this
  const err = new Error("This is a DRAKZ custom error!");
  err.status = 403;
  next(err);
});

// --- SOCKET SERVER ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
});

const Chat = require('./src/models/chat.model');

io.on("connection", (socket) => {
  console.log(`⚡ User Connected: ${socket.id}`);

  // Join Personal Room (User ID or 'admin')
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User/Admin joined room: ${roomId}`);
  });

  // Handle Message
  socket.on("send_message", async (data) => {
    const { userId, text, sender, adminId } = data; // sender: 'user' or 'admin'
    
    // Save to DB
    try {
        // Find active chat or create new
        let chat = await Chat.findOne({ userId, status: 'active' });
        
        if (!chat) {
            chat = new Chat({ userId, messages: [] });
        }
        
        const message = { sender, text, timestamp: new Date() };
        chat.messages.push(message);
        chat.lastActive = new Date();
        if (sender === 'admin' && adminId) chat.adminId = adminId;
        
        await chat.save();
        
        // Emit to User Room
        io.to(userId).emit("receive_message", message);

        // Emit to Admin Room
        if (sender === 'user') {
            io.to('admin_notifications').emit("admin_receive_message", { ...message, userId });
        }
        
    } catch (err) {
        console.error("Chat Error:", err);
    }
  });

  // Typing Indicator
  socket.on("typing", (data) => {
      socket.to(data.room).emit("display_typing", data);
  });

  // --- EXISTING BROADCAST FEATURE ---
  socket.on("broadcast_video", (data) => {
    console.log("📢 Advisor broadcasting video to ALL users");
    io.emit("receive_video", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/privilege", privilegeRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/credit-score", require("./src/routes/creditScore.routes"));
app.use("/api/spendings", spendingsRoutes);
app.use("/api/cards", require("./src/routes/card.routes"));
app.use("/api/advisor", advisorRoutes);
app.use("/api/user", userAdvisorRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api", investmentsRoutes);
app.use("/api/account-summary", accountSummaryRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/kyc", require("./src/routes/kyc.routes.js"));
// Attach app-level context on settings dontenvroutes (single mount)
app.use("/api/settings", requestContext, settingsRoutes);

// --- SENSITIVE API ROUTES WITH CACHE CONTROL ---

app.use("/api/account-summary", cacheControl, accountSummaryRoutes);
app.use("/api/investments", cacheControl, investmentsRoutes);
app.use("/api/spendings", cacheControl, spendingsRoutes);
app.use("/api/cards", cacheControl, require("./src/routes/card.routes"));
// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

// Only start the server if we are NOT in a Vercel environment (or similar serverless)
// Vercel exports the app and runs it differently.
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
