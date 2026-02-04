# Quick Reference - Middleware Implementation

## Middleware Structure

```
src/middlewares/
├── auth.middleware.js ..................... Authentication & authorization
├── errorHandler.middleware.js ............ Global error handling
├── logger.middleware.js .................. Request/response logging
└── validateUserInput.middleware.js ....... Input validation
```

## Applied to Routes

### User Routes (`/api/users*`)
```
Route: GET /api/users
Middleware: [auth] → [requireAdmin] → [controller]
Protection: JWT token + Admin role required

Route: POST /api/users
Middleware: [auth] → [requireAdmin] → [validateUserInput] → [controller]
Protection: JWT token + Admin role + Valid data required

Route: PUT /api/users/:id
Middleware: [auth] → [requireAdmin] → [validateUserInput] → [controller]
Protection: JWT token + Admin role + Valid data required

Route: DELETE /api/users/:id
Middleware: [auth] → [requireAdmin] → [controller]
Protection: JWT token + Admin role required
```

## Middleware Details

### `auth` Middleware
```javascript
// Validates JWT token
// Headers: Authorization: Bearer <token> or x-auth-token: <token>
// On success: Attaches req.user with decoded token data
// On failure: Returns 401 Unauthorized
```

### `requireAdmin` Middleware
```javascript
// Checks if user.role === 'admin'
// On success: Proceeds to next middleware/controller
// On failure: Returns 403 Forbidden - Admin access required
```

### `requireRole(roles)` Middleware
```javascript
// Checks if user.role is in allowed roles array
// Usage: requireRole(['admin', 'advisor'])
// On failure: Returns 403 Forbidden - Access denied
```

### `validateUserInput` Middleware
```javascript
// Validates POST/PUT request body
// Checks:
//   - Email format: valid@email.com
//   - Password length: min 6 characters
//   - Required fields: name, email, password, role
//   - Role value: must be 'user', 'admin', or 'advisor'
// On failure: Returns 400 Bad Request with specific error message
```

### `errorHandler` Middleware
```javascript
// Catches all errors from routes and controllers
// Returns structured JSON response
// Format: { success: false, status: 500, message: "..." }
// IMPORTANT: Must be registered LAST in middleware chain
```

### `logger` Middleware
```javascript
// Logs every request and response
// Format: [timestamp] METHOD PATH - IP: xxx.xxx.xxx.xxx
// Example: [2026-02-04T10:30:45.123Z] GET /api/users - IP: 192.168.1.1
```

## Global Middleware Order (in server.js)

```javascript
1. cors() .......................... Cross-Origin Resource Sharing
2. express.json() .................. JSON parser
3. express.urlencoded() ............ Form data parser
4. logger .......................... Request logging
   ↓
5. Routes (with their own middlewares)
   - auth
   - requireAdmin
   - requireRole
   - validateUserInput
   ↓
6. errorHandler .................... Error handling (MUST BE LAST)
```

## API Response Examples

### Success Response
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin"
}
```

### Error Responses

**401 - No Token**
```json
{
  "msg": "No token, authorization denied"
}
```

**401 - Invalid Token**
```json
{
  "msg": "Token is not valid"
}
```

**403 - Admin Required**
```json
{
  "msg": "Admin access required"
}
```

**400 - Validation Error**
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

**500 - Server Error**
```json
{
  "success": false,
  "status": 500,
  "message": "Internal Server Error"
}
```

## Implementation Checklist

✅ Authentication middleware - JWT validation
✅ Authorization middleware - Role-based access
✅ Error handler middleware - Centralized error handling
✅ Logger middleware - Request/response logging
✅ Validation middleware - Input validation
✅ Global middleware setup - Proper execution order
✅ Protected routes - All admin endpoints secured
✅ Documentation - Complete docs and examples
✅ Testing script - Middleware verification

## To Add More Protected Routes

```javascript
const { auth, requireAdmin, requireRole } = require('../middlewares/auth.middleware.js');

// Admin only
router.get('/endpoint', auth, requireAdmin, controller.method);

// Specific roles
router.get('/endpoint', auth, requireRole(['admin', 'advisor']), controller.method);

// With validation
router.post('/endpoint', auth, requireAdmin, validateInput, controller.method);
```

## Environment Variables Needed

```
JWT_SECRET=your_secret_key_here
MONGODB_URI=your_mongodb_connection_string
PORT=3001
NODE_ENV=development
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | No token in header | Add: `Authorization: Bearer <token>` |
| 403 Forbidden | User is not admin | Use admin account token |
| 400 Bad Request | Invalid input data | Check email format and password length |
| 500 Server Error | Middleware not registered | Ensure errorHandler is LAST |
| Logs not showing | Logger not added | Check server.js middleware setup |

## Testing Commands

```bash
# No authentication
curl http://localhost:3001/api/users

# With invalid token
curl -H "Authorization: Bearer invalid" http://localhost:3001/api/users

# With valid admin token
curl -H "Authorization: Bearer ADMIN_TOKEN" http://localhost:3001/api/users

# Create user (with validation)
curl -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","password":"123456","role":"user"}'
```
