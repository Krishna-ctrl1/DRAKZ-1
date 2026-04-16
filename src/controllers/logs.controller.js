const fs = require('fs');
const path = require('path');
const os = require('os');
const mongoose = require('mongoose');
const { getRedisClient, isRedisReady } = require('../config/redis.config');

// Path to logs directory
const logsDir = path.join(__dirname, '../../logs');

/**
 * Helper function to read log file
 * @param {string} filename 
 * @param {number} lines Limit number of lines
 * @returns {Promise<string[]>}
 */
const readLogFile = (filename, lines = 50) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(logsDir, filename);

    if (!fs.existsSync(filePath)) {
      return resolve(["Log file not found."]);
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return reject(err);
      
      const fileLines = data.trim().split('\n');
      const recentLines = fileLines.slice(-lines).reverse(); // Get last N lines
      resolve(recentLines);
    });
  });
};

exports.getAccessLogs = async (req, res) => {
  try {
    const logs = await readLogFile('access.log');
    res.json({ logs });
  } catch (err) {
    console.error("Error reading access logs:", err);
    res.status(500).json({ msg: 'Error reading access logs' });
  }
};

exports.getErrorLogs = async (req, res) => {
  try {
    const logs = await readLogFile('error.log');
    res.json({ logs });
  } catch (err) {
    console.error("Error reading error logs:", err);
    res.status(500).json({ msg: 'Error reading error logs' });
  }
};

// ==========================================
// DEVOPS & TELEMETRY FEATURES (Admin Panel)
// ==========================================

exports.getTelemetry = async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    
    // Extract base Redis metrics string
    let redisMemoryStr = "Disconnected";
    if (isRedisReady()) {
      const client = getRedisClient();
      redisMemoryStr = await client.info("memory"); 
    }

    const telemetry = {
      uptimeSeconds: Math.floor(process.uptime()),
      systemMemory: {
        totalGB: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2),
        freeGB: (os.freemem() / 1024 / 1024 / 1024).toFixed(2)
      },
      nodeProcessMemoryMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
      databaseConnectionState: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      redisStatus: isRedisReady() ? "Active" : "Offline",
    };

    res.json(telemetry);
  } catch (err) {
    console.error("Telemetry error:", err);
    res.status(500).json({ msg: "Failed to fetch telemetry" });
  }
};

exports.flushCache = async (req, res) => {
  try {
    if (!isRedisReady()) return res.status(400).json({ msg: "Redis caching layer is currently offline." });
    
    const client = getRedisClient();
    await client.flushdb(); // Violently purge entire cache instances
    
    // Log this action securely
    console.warn("⚠️ REDIS CACHE FLUSHED MANUALLY BY ADMIN");
    res.json({ msg: "Redis Cache successfully invalidated and flushed limitlessly." });
  } catch (err) {
    console.error("Flush error:", err);
    res.status(500).json({ msg: "Failed to flush cache memory" });
  }
};
