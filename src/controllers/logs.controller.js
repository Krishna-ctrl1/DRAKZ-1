const fs = require('fs');
const path = require('path');

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
