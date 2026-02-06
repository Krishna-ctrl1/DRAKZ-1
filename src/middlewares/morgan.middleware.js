const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for access logs (append mode)
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Create a write stream for error logs (append mode)
const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  if (!req._startAt || !res._startAt) {
    return '';
  }
  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
             (res._startAt[1] - req._startAt[1]) * 1e-6;
  return ms.toFixed(3);
});

// Custom token for user ID (from JWT)
morgan.token('user-id', (req) => {
  return req.user?.id || 'anonymous';
});

// Custom token for user role (from JWT)
morgan.token('user-role', (req) => {
  return req.user?.role || 'none';
});

// Custom format with additional details
const customFormat = ':remote-addr - :user-id [:user-role] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms ms';

// Morgan configurations for different environments
const morganConfig = {
  // Development - colored output to console
  dev: morgan('dev'),

  // Production - combined Apache format to file
  production: morgan('combined', {
    stream: accessLogStream
  }),

  // Custom format with user tracking
  custom: morgan(customFormat, {
    stream: accessLogStream
  }),

  // Error logging only (4xx and 5xx responses)
  error: morgan('combined', {
    stream: errorLogStream,
    skip: (req, res) => res.statusCode < 400
  }),

  // Success logging only (2xx and 3xx responses)
  success: morgan('combined', {
    stream: accessLogStream,
    skip: (req, res) => res.statusCode >= 400
  }),

  // Tiny format for minimal logging
  tiny: morgan('tiny'),

  // Common Apache format
  common: morgan('common'),

  // Combined Apache format (most detailed)
  combined: morgan('combined')
};

// Get appropriate morgan middleware based on environment
const getMorganMiddleware = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      // In production: log to files (both success and errors)
      return [
        morganConfig.success,
        morganConfig.error
      ];
    case 'test':
      // In test: no logging
      return [];
    default:
      // In development: colored console output AND file logging
      return [
        morganConfig.dev,
        morganConfig.success,
        morganConfig.error
      ];
  }
};

module.exports = {
  morganConfig,
  getMorganMiddleware,
  accessLogStream,
  errorLogStream
};
