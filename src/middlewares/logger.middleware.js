// Request logging middleware
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${path} - IP: ${ip}`);

  // Log response
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`[${timestamp}] Response - Status: ${res.statusCode}`);
    res.send = originalSend;
    return res.send(data);
  };

  next();
};

module.exports = logger;
