const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  // Developer error log (with details)
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl || req.url,
    status,
    message,
    user: req.user ? { id: req.user.id, role: req.user.role } : null,
    ip: req.ip,
    stack: err.stack || null,
  };
  try {
    fs.appendFileSync(
      path.join(logsDir, "error.log"),
      JSON.stringify(logEntry) + "\n",
      { encoding: "utf8" },
    );
  } catch (e) {
    // Fallback to console if file write fails
    console.error("Failed to write error log:", e);
  }

  // error page for users
  const wantsHTML = req.accepts(["html", "json"]) === "html";
  if (wantsHTML) {
    // Send the response with status and use a template literal for the message
    return res.status(status).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Error ${status}</title>
    <style>
      body { margin:0; font-family: system-ui, sans-serif; background:#0f1220; color:#fff; display:flex; align-items:center; justify-content:center; height:100vh; }
      .card { background:#1e2137; padding:32px; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.3); text-align:center; max-width:480px; border: 1px solid #333; }
      h1 { margin:0 0 12px; font-size:24px; color: #ff4d4d; }
      p { margin:0; opacity:0.85; font-size: 18px; }
      .hint { margin-top:16px; font-size:14px; opacity:0.6; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Error ${status}</h1>
      <p>Whoops! Something went wrong.</p>
      <div class="hint">Please refresh or try again later</div>
    </div>
  </body>
</html>`);
  }

  // Default JSON response for API clients
  res.status(status).json({
    success: false,
    status,
    message: "An error occurred",
  });
};

module.exports = errorHandler;
