# 📝 Morgan Implementation Guide

## ✅ What Was Implemented

**Morgan** - HTTP request logger middleware for Node.js has been successfully integrated into your application.

---

## 🎯 What is Morgan?

Morgan is a popular HTTP request logger middleware for Node.js applications. It logs details about incoming HTTP requests including:
- HTTP method (GET, POST, PUT, DELETE)
- Request URL
- Status code
- Response time
- Content length
- User agent
- IP address
- And more...

---

## 📁 Files Modified/Created

### 1. **Package Installation**
```bash
npm install morgan
```

### 2. **Morgan Configuration:** `src/middlewares/morgan.middleware.js`
Advanced Morgan configuration with multiple logging strategies:

#### **Available Formats:**
- **dev** - Colored output for development (console)
- **production** - Combined Apache format to file
- **custom** - Custom format with user ID and role tracking
- **error** - Logs only 4xx and 5xx errors to error.log
- **success** - Logs only 2xx and 3xx to access.log
- **tiny** - Minimal logging
- **common** - Apache common log format
- **combined** - Apache combined log format (most detailed)

#### **Custom Tokens:**
```javascript
:user-id        // Logged in user's MongoDB ID
:user-role      // User's role (user/admin/advisor)
:response-time-ms // Response time in milliseconds
```

#### **Environment-Based Logging:**
```javascript
// Development: Colored console output (dev format)
// Production: File logging (access.log + error.log)
// Test: No logging
```

### 3. **Server Configuration:** `server.js`
```javascript
const { getMorganMiddleware } = require("./src/middlewares/morgan.middleware.js");

// Apply Morgan middleware
const morganMiddlewares = getMorganMiddleware();
morganMiddlewares.forEach(middleware => app.use(middleware));
```

### 4. **Logs Directory:** `logs/`
```
logs/
  ├── access.log  // Successful requests (2xx, 3xx)
  └── error.log   // Failed requests (4xx, 5xx)
```

### 5. **Git Ignore:** `.gitignore`
```
/logs
*.log
```

---

## 🔍 Morgan Output Examples

### **Development Mode (dev format):**
```
GET /api/privilege/properties 200 52.123 ms - 1234
POST /api/auth/login 200 145.678 ms - 456
GET /api/privilege/live-metal-prices 200 89.456 ms - 789
DELETE /api/privilege/properties/123 404 12.345 ms - 56
```

Color coded:
- 🟢 Green: 2xx (Success)
- 🔵 Cyan: 3xx (Redirect)
- 🟡 Yellow: 4xx (Client Error)
- 🔴 Red: 5xx (Server Error)

### **Production Mode (combined format):**
```
::1 - - [06/Feb/2026:00:40:15 +0000] "GET /api/privilege/properties HTTP/1.1" 200 1234 "-" "Mozilla/5.0..."
::1 - - [06/Feb/2026:00:40:16 +0000] "POST /api/auth/login HTTP/1.1" 200 456 "http://localhost:3000/" "axios/1.13.2"
```

### **Custom Format (with user tracking):**
```
::1 - 507f1f77bcf86cd799439011 [user] "GET /api/privilege/properties HTTP/1.1" 200 1234 "-" "axios/1.13.2" 52.123 ms
::1 - anonymous [none] "POST /api/auth/login HTTP/1.1" 200 456 "http://localhost:3000/" "axios/1.13.2" 145.678 ms
```

---

## 🔧 Configuration Options

### **Using Different Formats:**

Edit `server.js` to use specific formats:

```javascript
// Option 1: Simple dev logging (default)
const { getMorganMiddleware } = require("./src/middlewares/morgan.middleware.js");
const morganMiddlewares = getMorganMiddleware();
morganMiddlewares.forEach(middleware => app.use(middleware));

// Option 2: Use specific format
const { morganConfig } = require("./src/middlewares/morgan.middleware.js");
app.use(morganConfig.dev);        // Development
app.use(morganConfig.tiny);       // Minimal
app.use(morganConfig.custom);     // With user tracking
app.use(morganConfig.error);      // Errors only
app.use(morganConfig.success);    // Success only

// Option 3: Multiple formats (production setup)
app.use(morganConfig.success);    // Log success to access.log
app.use(morganConfig.error);      // Log errors to error.log
```

---

## 📊 Logging Strategies

### **Development Environment:**
```javascript
NODE_ENV=development npm run server
```
- Logs to: **Console**
- Format: **Colored dev format**
- Output: Real-time in terminal

### **Production Environment:**
```javascript
NODE_ENV=production npm run server
```
- Logs to: **Files** (logs/access.log, logs/error.log)
- Format: **Apache combined format**
- Output: Persistent file storage

### **Test Environment:**
```javascript
NODE_ENV=test npm test
```
- Logs to: **Nothing** (silent)
- Format: N/A
- Output: No logging to avoid cluttering test output

---

## 🎨 Custom Token Usage

### **Track Authenticated Users:**
```javascript
// Custom format in morgan.middleware.js
const customFormat = ':remote-addr - :user-id [:user-role] ":method :url" :status :response-time-ms ms';

// Output example:
// ::1 - 507f1f77bcf86cd799439011 [user] "GET /api/privilege/properties" 200 52.123 ms
```

### **Add Your Own Tokens:**
```javascript
// In morgan.middleware.js
morgan.token('custom-header', (req) => {
  return req.get('X-Custom-Header') || 'not-set';
});

morgan.token('request-id', (req) => {
  return req.id || 'no-id';
});
```

---

## 📈 Log File Management

### **View Logs:**
```powershell
# View access logs
Get-Content logs\access.log -Tail 20

# View error logs
Get-Content logs\error.log -Tail 20

# Watch logs in real-time
Get-Content logs\access.log -Wait
```

### **Clear Logs:**
```powershell
# Clear access logs
Clear-Content logs\access.log

# Clear error logs
Clear-Content logs\error.log

# Remove all logs
Remove-Item logs\*.log
```

### **Rotate Logs (Production):**
Consider using log rotation packages:
```bash
npm install rotating-file-stream
```

---

## 🔀 Morgan vs Custom Logger

Your application now has **BOTH** logging systems:

| Feature | Morgan | Custom Logger |
|---------|--------|---------------|
| **Purpose** | HTTP request logging | General purpose logging |
| **Format** | Standardized Apache formats | Custom format |
| **Output** | Console + Files | Console only |
| **File Logging** | ✅ Built-in | ❌ Not implemented |
| **Colored Output** | ✅ In dev mode | ✅ With custom code |
| **Industry Standard** | ✅ Yes | ❌ Custom |
| **User Tracking** | ✅ Custom tokens | ✅ Manual logging |

**Recommendation:** Use both!
- **Morgan**: HTTP request/response logging
- **Custom Logger**: Application-specific events

---

## 🛠️ Advanced Usage

### **Skip Certain Routes:**
```javascript
app.use(morgan('dev', {
  skip: (req, res) => {
    // Don't log health checks
    return req.url === '/health';
  }
}));
```

### **Conditional Logging:**
```javascript
// Log only slow requests (> 1 second)
app.use(morgan('dev', {
  skip: (req, res) => {
    const responseTime = res._startAt 
      ? (Date.now() - req._startAt[0] * 1000 - req._startAt[1] / 1e6)
      : 0;
    return responseTime < 1000;
  }
}));
```

### **Log to Multiple Destinations:**
```javascript
const accessLogStream = fs.createWriteStream('logs/access.log', { flags: 'a' });
const errorLogStream = fs.createWriteStream('logs/error.log', { flags: 'a' });

// Success to access.log
app.use(morgan('combined', {
  stream: accessLogStream,
  skip: (req, res) => res.statusCode >= 400
}));

// Errors to error.log
app.use(morgan('combined', {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400
}));
```

---

## 📊 What Gets Logged in Privilege Page

### **Privilege API Requests:**
```
GET /api/privilege/profile 200 45.123 ms
GET /api/privilege/properties 200 52.987 ms
POST /api/privilege/properties 201 234.567 ms
PUT /api/privilege/properties/123 200 156.789 ms
DELETE /api/privilege/properties/123 200 89.456 ms
GET /api/privilege/insurances 200 67.890 ms
GET /api/privilege/precious_holdings 200 78.901 ms
GET /api/privilege/transactions 200 92.345 ms
GET /api/privilege/live-metal-prices 200 1234.567 ms
POST /api/privilege/seed 201 567.890 ms
```

### **Error Logging:**
```
GET /api/privilege/properties/invalid-id 404 12.345 ms
POST /api/privilege/properties 400 45.678 ms  // Missing required fields
PUT /api/privilege/properties/999 404 23.456 ms  // Property not found
DELETE /api/privilege/properties/888 401 11.111 ms  // Unauthorized
```

---

## 🎯 Benefits of Morgan

1. **✅ Standardized Logging** - Industry-standard Apache log formats
2. **✅ Performance Monitoring** - Track response times
3. **✅ Debugging** - See all HTTP traffic
4. **✅ Audit Trail** - Persistent logs for compliance
5. **✅ Error Tracking** - Separate error logs
6. **✅ Production Ready** - File-based logging
7. **✅ Zero Configuration** - Works out of the box
8. **✅ Customizable** - Add custom tokens and formats

---

## 🔍 Debugging with Morgan

### **Find Slow Requests:**
```bash
# Search access.log for requests > 1000ms
Select-String -Path logs\access.log -Pattern "([0-9]{4,}\.\d+ ms)" | Select-Object -First 10
```

### **Find All Errors:**
```bash
# View all 4xx and 5xx responses
Get-Content logs\error.log
```

### **Monitor Real-Time:**
```bash
# Watch logs as requests come in
Get-Content logs\access.log -Wait
```

---

## 📚 Morgan Format Tokens Reference

| Token | Description | Example |
|-------|-------------|---------|
| `:method` | HTTP method | GET, POST |
| `:url` | Request URL | /api/privilege/properties |
| `:status` | Response status | 200, 404, 500 |
| `:response-time` | Response time (ms) | 52.123 |
| `:remote-addr` | Client IP | ::1, 192.168.1.1 |
| `:http-version` | HTTP version | 1.1 |
| `:user-agent` | User agent | axios/1.13.2 |
| `:referrer` | Referrer header | http://localhost:3000/ |
| `:res[content-length]` | Response size | 1234 bytes |
| `:date` | Timestamp | 06/Feb/2026:00:40:15 |

**Custom Tokens (Your Implementation):**
| Token | Description | Example |
|-------|-------------|---------|
| `:user-id` | MongoDB user ID | 507f1f77bcf86cd799439011 |
| `:user-role` | User role | user, admin, advisor |
| `:response-time-ms` | Response time | 52.123 ms |

---

## 🚀 Testing Morgan

### **1. Start Server:**
```bash
npm run server
```

### **2. Make Requests:**
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@drakz.com","password":"password"}'

# Get properties
curl http://localhost:3001/api/privilege/properties \
  -H "Authorization: Bearer <token>"
```

### **3. Check Logs:**
```powershell
# Console output (dev mode)
GET /api/auth/login 200 145.678 ms - 456
GET /api/privilege/properties 200 52.123 ms - 1234

# File output (production mode)
Get-Content logs\access.log
```

---

## 🎓 Summary

**Morgan Implementation Complete! 🎉**

✅ **Package installed**: `morgan`  
✅ **Configuration created**: Advanced logging strategies  
✅ **Server integrated**: Auto-detects environment  
✅ **Logs directory**: Created with .gitignore  
✅ **Custom tokens**: User ID and role tracking  
✅ **Multiple formats**: dev, production, custom, error, success  
✅ **File logging**: access.log + error.log in production  

**Your application now has professional-grade HTTP request logging!**

---

## 📖 Further Reading

- [Morgan NPM Package](https://www.npmjs.com/package/morgan)
- [Morgan GitHub](https://github.com/expressjs/morgan)
- [Apache Log Formats](https://httpd.apache.org/docs/current/logs.html)
- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
