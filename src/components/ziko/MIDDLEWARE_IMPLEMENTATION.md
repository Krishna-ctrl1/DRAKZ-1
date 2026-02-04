# Middleware Implementation Documentation

## Overview
Comprehensive middleware system has been implemented for the ziko component/admin section with full authentication, authorization, validation, logging, and error handling.

---

## 1. Authentication Middleware (`auth.middleware.js`)

### Functions:
- **`auth`** - Validates JWT tokens from request headers
  - Checks for token in `x-auth-token` or `Authorization` header
  - Returns 401 if token is missing or invalid
  
- **`requireRole(roles)`** - Role-based access control (role-agnostic)
  - Accepts array of allowed roles: `['admin', 'user', 'advisor']`
  - Returns 403 if user role not in allowed list
  
- **`requireAdmin`** - Admin-specific access control
  - Ensures user role is exactly 'admin'
  - Returns 403 if not admin

### Usage Example:
```javascript
router.delete('/users/:id', auth, requireAdmin, userController.deleteUser);
```

---

## 2. Error Handler Middleware (`errorHandler.middleware.js`)

### Features:
- Centralized error handling for all routes
- Logs errors to console
- Returns structured error responses
- Includes stack traces in development mode
- Must be registered LAST in middleware chain

### Response Format:
```json
{
  "success": false,
  "status": 500,
  "message": "Error message here"
}
```

---

## 3. Logger Middleware (`logger.middleware.js`)

### Features:
- Logs all incoming requests with method, path, and IP address
- Logs response status codes
- Timestamp for every request
- Helps track API usage and debug issues

### Log Format:
```
[2026-02-04T10:30:45.123Z] GET /api/users - IP: 192.168.1.1
[2026-02-04T10:30:45.456Z] Response - Status: 200
```

---

## 4. Request Validation Middleware (`validateUserInput.middleware.js`)

### Validates:
- **Required fields**: name, email, password, role (on POST)
- **Email format**: Must be valid email format
- **Password length**: Minimum 6 characters
- **Role validity**: Must be one of ['user', 'admin', 'advisor']

### Usage:
```javascript
router.post('/users', auth, requireAdmin, validateUserInput, userController.createUser);
router.put('/users/:id', auth, requireAdmin, validateUserInput, userController.updateUser);
```

---

## 5. Protected Routes

### User Management Routes (require auth + admin role):

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/dashboard-stats` | Get dashboard statistics |
| GET | `/api/server-metrics` | Get server metrics |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

All user endpoints now require:
1. Valid JWT token (from `auth` middleware)
2. Admin role (from `requireAdmin` middleware)
3. Valid input (from `validateUserInput` middleware)

---

## 6. Global Middleware Chain

In `server.js`, middleware is applied in this order:

```javascript
app.use(cors(...));                    // CORS headers
app.use(express.json({ limit: "10mb" }));      // Parse JSON
app.use(express.urlencoded(...));      // Parse URL-encoded
app.use(logger);                       // Request logging

// Routes registered here
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);           // These routes use their own middlewares
...

app.use(errorHandler);                 // ERROR HANDLER MUST BE LAST
```

---

## 7. Testing the Middleware

### 1. Test without token:
```bash
curl -X GET http://localhost:3001/api/users
# Response: 401 "No token, authorization denied"
```

### 2. Test with token but without admin role:
```bash
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
# Response: 403 "Admin access required"
```

### 3. Test with valid admin token:
```bash
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
# Response: 200 with user data
```

### 4. Test validation:
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","role":"invalid"}'
# Response: 400 "Role must be one of: user, admin, advisor"
```

---

## 8. Files Modified/Created

### Created:
- ✅ `src/middlewares/errorHandler.middleware.js` - Global error handling
- ✅ `src/middlewares/logger.middleware.js` - Request logging
- ✅ `src/middlewares/validateUserInput.middleware.js` - Input validation

### Modified:
- ✅ `src/middlewares/auth.middleware.js` - Added `requireAdmin` function
- ✅ `src/routes/user.routes.js` - Applied auth, requireAdmin, and validation middlewares
- ✅ `server.js` - Added global middleware setup and error handler

---

## 9. Security Summary

✅ **Authentication**: All protected routes require valid JWT token
✅ **Authorization**: Admin routes require admin role
✅ **Validation**: User inputs are validated before processing
✅ **Error Handling**: Centralized error handling with proper status codes
✅ **Logging**: All requests and responses are logged
✅ **No Simulation**: All middleware is production-ready and fully functional

---

## 10. Middleware Execution Flow Example

```
Client Request
    ↓
CORS Middleware ✓
    ↓
JSON Parser ✓
    ↓
Logger Middleware ✓ (logs request)
    ↓
Route Specific Middlewares:
    - auth ✓ (checks token)
    - requireAdmin ✓ (checks role)
    - validateUserInput ✓ (validates data)
    ↓
Controller Handler ✓
    ↓
Response Sent
    ↓
Logger Middleware ✓ (logs response)
    ↓
Error Handler (if error occurs)
```

---

## Notes for Admin Dashboard

Your admin dashboard components in `/src/components/ziko/admin/` can now safely call:
- `/api/users` - Get all users
- `/api/dashboard-stats` - Dashboard statistics
- `/api/server-metrics` - Server metrics
- `/api/users` (POST) - Create user
- `/api/users/:id` (PUT) - Update user
- `/api/users/:id` (DELETE) - Delete user

All with full authentication and authorization protection!
