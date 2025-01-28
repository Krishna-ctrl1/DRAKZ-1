const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// In-memory session tracking by user ID
const sessionStart = new Map();

module.exports = (req, res, next) => {
  const start = Date.now();

  // Initialize session start for authenticated users
  const userId = req.user?.id;
  if (userId && !sessionStart.has(userId)) {
    sessionStart.set(userId, start);
  }

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const currentUserId = req.user?.id || null;
    const sessionStartTime = currentUserId
      ? sessionStart.get(currentUserId)
      : null;
    const sessionDurationMs = sessionStartTime
      ? Date.now() - sessionStartTime
      : null;

    const entry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs,
      user: req.user ? { id: req.user.id, role: req.user.role } : null,
      sessionDurationMs,
      ip: req.ip,
    };

    try {
      fs.appendFileSync(
        path.join(logsDir, "user-activity.log"),
        JSON.stringify(entry) + "\n",
        { encoding: "utf8" },
      );
    } catch (e) {
      // Fallback to console if file write fails
      console.error("Failed to write user activity log:", e);
    }
  });

  next();
};
