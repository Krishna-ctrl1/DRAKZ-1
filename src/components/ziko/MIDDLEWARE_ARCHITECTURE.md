# Middleware Architecture Diagram

## Complete Middleware Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CLIENT REQUEST                                  │
│                  (HTTP GET/POST/PUT/DELETE)                          │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    1. CORS MIDDLEWARE                                │
│          (Handles cross-origin requests from frontend)               │
│                                                                       │
│  ✓ Allows: http://localhost:3000, http://localhost:5173             │
│  ✓ Methods: GET, POST, PUT, DELETE, PATCH                           │
│  ✓ Headers: Content-Type, Authorization                             │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│              2. JSON & URL PARSER MIDDLEWARE                         │
│           (Parses request body into req.body object)                │
│                                                                       │
│  ✓ Handles: application/json                                        │
│  ✓ Handles: application/x-www-form-urlencoded                       │
│  ✓ Limit: 10MB                                                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│              3. LOGGER MIDDLEWARE (Global)                           │
│           (Logs every incoming request with timestamp)               │
│                                                                       │
│  Log Format: [2026-02-04T10:30:45.123Z] GET /api/users              │
│                                    IP: 192.168.1.1                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   4. ROUTE MATCHING                                  │
│              (Routes request to appropriate handler)                 │
│                                                                       │
│  Does the URL match a registered route?                             │
│  Example: /api/users → user.routes.js                               │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│        5. ROUTE-SPECIFIC MIDDLEWARE (Applied in sequence)            │
│                                                                       │
│    ┌───────────────────────────────────────────────────────┐        │
│    │ A. AUTH MIDDLEWARE                                    │        │
│    │  - Checks for JWT token in headers                   │        │
│    │  - Headers: Authorization: Bearer <token>            │        │
│    │            or x-auth-token: <token>                  │        │
│    │                                                       │        │
│    │    ✓ Token found?                                    │        │
│    │      YES → Verify signature                          │        │
│    │      NO  → Return 401 "No token"                     │        │
│    │                                                       │        │
│    │    ✓ Token valid?                                    │        │
│    │      YES → Decode & attach to req.user               │        │
│    │      NO  → Return 401 "Invalid token"                │        │
│    └───────────────────────────────────────────────────────┘        │
│                           ↓                                          │
│    ┌───────────────────────────────────────────────────────┐        │
│    │ B. REQUIRE ADMIN MIDDLEWARE                           │        │
│    │  - Checks if req.user.role === 'admin'               │        │
│    │                                                       │        │
│    │    ✓ Is admin?                                       │        │
│    │      YES → Continue to next middleware               │        │
│    │      NO  → Return 403 "Admin access required"        │        │
│    └───────────────────────────────────────────────────────┘        │
│                           ↓                                          │
│    ┌───────────────────────────────────────────────────────┐        │
│    │ C. VALIDATION MIDDLEWARE (if POST/PUT)                │        │
│    │  - Validates request body                             │        │
│    │                                                       │        │
│    │    ✓ Email format valid?                             │        │
│    │      YES → Continue                                  │        │
│    │      NO  → Return 400 "Invalid email format"         │        │
│    │                                                       │        │
│    │    ✓ Password >= 6 chars?                            │        │
│    │      YES → Continue                                  │        │
│    │      NO  → Return 400 "Password too short"           │        │
│    │                                                       │        │
│    │    ✓ Role valid?                                     │        │
│    │      YES → Continue to controller                    │        │
│    │      NO  → Return 400 "Invalid role"                 │        │
│    └───────────────────────────────────────────────────────┘        │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   6. CONTROLLER HANDLER                              │
│            (Business logic - create, read, update, delete)           │
│                                                                       │
│  Example:                                                            │
│  - getAllUsers() - Fetch users from database                        │
│  - createUser() - Save new user with hashed password                │
│  - updateUser() - Update user data                                  │
│  - deleteUser() - Remove user                                       │
│                                                                       │
│  Possible outcomes:                                                 │
│  ✓ Success → res.json(data)                                         │
│  ✗ Error → Throw error or res.status(400).json({msg})              │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                   YES            NO
              (No Error)      (Error Thrown)
                    │             │
                    ▼             ▼
        ┌──────────────────┐  ┌──────────────────────────┐
        │ RESPONSE SENT    │  │ 7. ERROR HANDLER MW      │
        │ (HTTP 200)       │  │ - Catches all errors     │
        │                  │  │ - Formats error response │
        │ Example:         │  │ - Logs error             │
        │ {                │  │ - Returns proper code    │
        │  "_id": "...",   │  │                          │
        │  "name": "John"  │  │ Response Format:         │
        │ }                │  │ {                        │
        │                  │  │   "success": false,      │
        │                  │  │   "status": 500,         │
        │                  │  │   "message": "..."       │
        │                  │  │ }                        │
        └──────────┬───────┘  └──────────┬───────────────┘
                   │                     │
                   ▼                     ▼
        ┌──────────────────────────────────────────────┐
        │        8. LOGGER MIDDLEWARE (Response)       │
        │    [2026-02-04T10:30:45.456Z]                │
        │    Response - Status: 200                    │
        │         OR                                   │
        │    Response - Status: 401/403/400/500        │
        └──────────────┬───────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────────────┐
        │        RESPONSE SENT TO CLIENT               │
        │                                              │
        │  HTTP Status Code + JSON/Error Message       │
        └──────────────────────────────────────────────┘
```

## Request Examples

### Example 1: GET /api/users (Successful)

```
Request:
GET /api/users HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Host: localhost:3001

Middleware Execution:
1. CORS ✓ (allowed)
2. Parser ✓ (no body)
3. Logger ✓ (logged)
4. Routing ✓ (user.routes.js)
5. auth ✓ (token valid, admin user found)
6. requireAdmin ✓ (user.role = 'admin')
7. (No validation for GET)
8. Controller ✓ (getAllUsers executed)

Response:
HTTP/1.1 200 OK
Content-Type: application/json

[
  { "_id": "...", "name": "John", "role": "admin" },
  { "_id": "...", "name": "Jane", "role": "user" }
]
```

### Example 2: POST /api/users (Missing Token)

```
Request:
POST /api/users HTTP/1.1
Content-Type: application/json
Host: localhost:3001

{ "name": "Bob", "email": "bob@example.com", "password": "123456", "role": "user" }

Middleware Execution:
1. CORS ✓
2. Parser ✓ (body parsed)
3. Logger ✓
4. Routing ✓
5. auth ✗ (no token found)

Response:
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{ "msg": "No token, authorization denied" }
```

### Example 3: POST /api/users (Invalid Email)

```
Request:
POST /api/users HTTP/1.1
Authorization: Bearer [admin_token]
Content-Type: application/json
Host: localhost:3001

{ "name": "Bob", "email": "invalid-email", "password": "123456", "role": "user" }

Middleware Execution:
1. CORS ✓
2. Parser ✓
3. Logger ✓
4. Routing ✓
5. auth ✓
6. requireAdmin ✓
7. validateUserInput ✗ (email invalid)

Response:
HTTP/1.1 400 Bad Request
Content-Type: application/json

{ "success": false, "message": "Invalid email format" }
```

### Example 4: DELETE /api/users/:id (Not Admin)

```
Request:
DELETE /api/users/507f1f77bcf86cd799439011 HTTP/1.1
Authorization: Bearer [regular_user_token]
Host: localhost:3001

Middleware Execution:
1. CORS ✓
2. Parser ✓
3. Logger ✓
4. Routing ✓
5. auth ✓ (token valid, but user is regular user)
6. requireAdmin ✗ (user.role = 'user', not 'admin')

Response:
HTTP/1.1 403 Forbidden
Content-Type: application/json

{ "msg": "Admin access required" }
```

## Middleware Configuration in server.js

```javascript
// EXECUTION ORDER (CRITICAL!)

app.use(cors(...));                    // 1st - CORS headers
app.use(express.json());               // 2nd - JSON parser
app.use(express.urlencoded());         // 3rd - Form parser
app.use(logger);                       // 4th - Logging

// Routes with their own middleware
app.use("/api/auth", authRoutes);      // No protection
app.use("/api", userRoutes);           // Protected: auth + requireAdmin
app.use("/api/privilege", ...);        // Protected: auth

// CRITICAL: Error handler MUST be LAST
app.use(errorHandler);                 // Last - Error handling
```

## Security Layers

```
Layer 1: CORS
  ↓
Layer 2: Parsing
  ↓
Layer 3: Logging (Optional)
  ↓
Layer 4: Authentication (JWT Token Validation)
  ↓
Layer 5: Authorization (Role-Based Access)
  ↓
Layer 6: Validation (Input Data Validation)
  ↓
Layer 7: Business Logic (Controller)
  ↓
Layer 8: Error Handling (Centralized)
  ↓
Layer 9: Logging (Response Logging)
```

## Middleware Dependencies

```
server.js
├── logger.middleware.js (no dependencies)
├── auth.middleware.js
│   └── config/jwt.config.js
├── errorHandler.middleware.js (no dependencies)
└── user.routes.js
    ├── auth.middleware.js
    ├── validateUserInput.middleware.js
    └── controllers/user.controller.js
```

This architecture ensures:
✅ All requests are validated
✅ All protected endpoints require authentication
✅ All admin operations require admin role
✅ All input data is validated
✅ All errors are handled centrally
✅ All requests/responses are logged
✅ Zero unprotected admin endpoints
