const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Lazy-loaded to avoid circular dependency issues during startup
let AccessLog = null;
const getAccessLog = () => {
  if (!AccessLog) {
    try { AccessLog = require('../models/accessLog.model'); } catch (e) { /* ignore */ }
  }
  return AccessLog;
};

// Request logging middleware
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const reqPath = req.path;
  const ip = req.ip || req.connection.remoteAddress;
  const startTime = Date.now();

  console.log(`[${timestamp}] ${method} ${reqPath} - IP: ${ip}`);

  // Log response after it completes
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const logLine = `[${timestamp}] ${method} ${reqPath} ${statusCode} ${duration}ms - IP: ${ip}`;

    console.log(`[${timestamp}] Response - Status: ${statusCode}`);

    // Write to file (non-blocking)
    const logFile = statusCode >= 400 ? 'error.log' : 'access.log';
    fs.appendFile(path.join(logsDir, logFile), logLine + '\n', (err) => {
      if (err) console.error('Failed to write log file:', err.message);
    });

    // Write to MongoDB (fire-and-forget, non-blocking)
    const Model = getAccessLog();
    if (Model) {
      Model.create({
        timestamp: new Date(timestamp),
        type: statusCode >= 400 ? 'error' : 'access',
        method,
        path: reqPath,
        statusCode,
        ip,
        duration,
        userAgent: req.get('user-agent') || '',
        message: logLine,
      }).catch(() => {}); // Silently ignore DB write failures
    }

    res.send = originalSend;
    return res.send(data);
  };

  next();
};

module.exports = logger;
