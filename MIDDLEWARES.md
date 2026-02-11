# DRAKZ Middlewares Documentation

This document provides a comprehensive overview of all middlewares used in the DRAKZ project, their purposes, and where they are implemented.

---

## Table of Contents
1. [Global Middlewares](#global-middlewares)
2. [Route-Specific Middlewares](#route-specific-middlewares)
3. [Middleware Summary Table](#middleware-summary-table)

---

## Global Middlewares

These middlewares are applied to all incoming requests.

### 1. CORS Middleware
**Package:** `cors`  
**Location:** `server.js` (lines 57-81)

**Purpose:** Handles Cross-Origin Resource Sharing to allow frontend applications from specific origins to communicate with the backend.

**Configuration:**
- **Allowed Origins:**
  - `http://localhost:3000`
  - `https://drakz-frontend.onrender.com`
  - `https://drakz-backend.onrender.com`
  - Environment variable: `process.env.FRONTEND_URL`
- **Credentials:** Enabled
- **Allowed Headers:** `Content-Type`, `Authorization`, `x-auth-token`, `Cache-Control`, `Pragma`, `Expires`
- **Methods:** `GET`, `POST`, `PUT`, `DELETE`, `PATCH`

---

### 2. Body Parser Middlewares
**Package:** `express`  
**Location:** `server.js` (lines 82-83)

**Purpose:** Parse incoming request bodies in JSON and URL-encoded formats.

**Configuration:**
- **Limit:** 10MB for both JSON and URL-encoded data
- **Extended:** `true` for URL-encoded parser

```javascript
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
```

---

### 3. Morgan Middleware
**File:** `src/middlewares/morgan.middleware.js`  
**Location:** `server.js` (lines 86-87)

**Purpose:** HTTP request logger that logs all incoming requests to both console and log files.

**Features:**
- **Development Mode:** Colored console output + file logging
- **Production Mode:** File logging only
- **Custom Tokens:**
  - `user-id`: Extracted from JWT
  - `user-role`: User's role from JWT
  - `response-time-ms`: Response time in milliseconds
- **Log Files:**
  - `logs/access.log`: Successful requests (2xx, 3xx)
  - `logs/error.log`: Error requests (4xx, 5xx)

**Environment Behavior:**
| Environment | Logger Type |
|-------------|-------------|
| Development | Console (dev) + Success logs + Error logs |
| Production | Success logs + Error logs |
| Test | No logging |

---

### 4. Logger Middleware
**File:** `src/middlewares/logger.middleware.js`  
**Location:** `server.js` (line 89)

**Purpose:** Custom request/response logger that outputs to console.

**Logged Information:**
- Timestamp (ISO format)
- HTTP method
- Request path
- Client IP address
- Response status code

---

### 5. User Activity Middleware
**File:** `src/middlewares/userActivity.middleware.js`  
**Location:** `server.js` (line 92)

**Purpose:** Tracks user activity and session information for analytics and security.

**Tracked Data:**
- Request duration (milliseconds)
- Session duration for authenticated users
- User ID and role (if authenticated)
- IP address
- Timestamp

**Output:** Logs written to `logs/user-activity.log` in JSON format

---

### 6. Static File Serving
**Package:** `express.static`  
**Location:** `server.js` (line 95)

**Purpose:** Serves static files (uploaded images, documents) from the file system.

**Configuration:**
- **Mount Path:** `/uploads`
- **Physical Directory:** `uploads/`

**Example:** `http://localhost:3001/uploads/profile/profile_123_1234567890.jpg`

---

### 7. Error Handler Middleware
**File:** `src/middlewares/errorHandler.middleware.js`  
**Location:** `server.js` (line 202) - **Last middleware**

**Purpose:** Centralized error handling for all uncaught errors in the application.

**Features:**
- Logs detailed error information to `logs/error-details.log`
- Returns user-friendly HTML error pages for browser requests
- Returns JSON error responses for API requests
- Includes stack traces in logs for debugging

**Response Format:**
- **HTML Clients:** Styled error page with status code
- **API Clients:** JSON with `success`, `status`, and `message` fields

---

### 8. Swagger UI Middleware
**Package:** `swagger-ui-express`  
**Location:** `server.js` (line 34)

**Purpose:** Serves interactive API documentation.

**Endpoint:** `/api-docs`

---

## Route-Specific Middlewares

These middlewares are applied to specific routes or route groups.

### 1. Authentication Middleware (auth)
**File:** `src/middlewares/auth.middleware.js`

**Purpose:** JWT-based authentication and authorization.

#### Exported Functions:

##### a) `auth`
Verifies JWT token from `Authorization` header or `x-auth-token` header.

**Token Extraction:**
```javascript
const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
```

**On Success:** Adds `req.user` with decoded token data (id, role, permissions)  
**On Failure:** Returns 401 Unauthorized

##### b) `requireRole(roles)`
Restricts access to users with specific roles.

**Parameters:** `roles` - Array of allowed roles  
**Returns:** 403 Forbidden if user's role is not in the array

##### c) `requireAdmin`
Restricts access to admin users only.

**Returns:** 403 Forbidden if user is not an admin

##### d) `requirePermission(permission)`
Granular permission-based access control for admins.

**Logic:**
1. Requires admin role first
2. Legacy admins (no permissions array): Allowed
3. Checks if user has `all` permission or the specific permission
4. Returns 403 if permission is missing

#### Used In:
- `/api/settings/*` - Profile and settings management
- `/api/logs/*` - Admin log access (`auth + requireAdmin`)
- `/api/advisor/*` - Advisor-specific routes
- `/api/cards/*` - Card management
- `/api/user/advisors` - Advisor discovery
- `/api/credit-score/*` - Credit score operations
- `/api/users/*` - User management (`auth + requireAdmin`)
- `/api/auth/me` - Get current user
- `/api/investments/*` - Investment tracking
- `/api/account-summary/*` - Account summary
- `/api/spendings/*` - Expense tracking
- `/api/privilege/*` - Privileged asset management
- `/api/kyc/*` - KYC document handling

---

### 2. Request Context Middleware
**File:** `src/middlewares/requestContext.middleware.js`  
**Location:** Used on `/api/settings` routes

**Purpose:** Adds contextual metadata to requests for better logging and diagnostics.

**Implementation:**
```javascript
req.context = req.context || {};
req.context.page = "settings";
```

**Usage in server.js:**
```javascript
app.use("/api/settings", requestContext, settingsRoutes);
```

---

### 3. Cache Control Middleware
**File:** `src/middlewares/cacheControl.middleware.js`  
**Location:** Applied to sensitive financial routes

**Purpose:** Prevents caching of sensitive data by browsers and proxies.

**Headers Set:**
```http
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
Pragma: no-cache
Expires: 0
```

#### Applied To:
- `/api/account-summary` - Account summary data
- `/api/investments` - Investment portfolios
- `/api/spendings` - Expense transactions
- `/api/cards` - Credit/debit card information

---

### 4. Upload Middlewares
**File:** `src/middlewares/upload.middleware.js`

**Purpose:** Handle file uploads using Multer.

#### Three Upload Configurations:

##### a) `upload` - Property Images
**Destination:** `uploads/properties`  
**File Types:** JPEG, JPG, PNG, GIF, WebP  
**Size Limit:** 10MB  
**Filename Format:** `{userId}_{timestamp}.{ext}`

**Used In:**
- `/api/privilege/properties` (POST/PUT) - Property image uploads
- `/api/kyc/*` - KYC document uploads

##### b) `profileUpload` - Profile Pictures
**Destination:** `uploads/profile`  
**File Types:** JPEG, JPG, PNG, GIF, WebP  
**Size Limit:** 5MB  
**Filename Format:** `profile_{userId}_{timestamp}.{ext}`

**Used In:**
- `/api/settings/profile-picture` (POST) - User profile picture upload

##### c) `advisorDocumentUpload` - Advisor Documents
**Destination:** `uploads/documents`  
**File Types:** Images (JPEG, JPG, PNG, GIF, WebP) + PDF  
**Size Limit:** 10MB  
**Filename Format:** `doc_{timestamp}_{originalname}`

**Used In:**
- `/api/auth/register` - Advisor registration with documents

---

### 5. Settings Validation Middleware
**File:** `src/middlewares/settingsValidation.middleware.js`

**Purpose:** Validates user settings update requests.

#### Three Validators:

##### a) `validateProfileUpdate`
Validates profile information updates.

**Validated Fields:**
- **name:** 2-100 characters, letters and spaces only
- **phone:** 10-15 digits with valid format
- **occupation:** Letters and spaces only, max 200 characters

**Used In:** `/api/settings/profile` (PUT)

##### b) `validateFinancialUpdate`
Validates financial settings updates.

**Validated Fields:**
- **currency:** Must be INR, USD, EUR, or GBP
- **riskProfile:** Must be Conservative, Moderate, or Aggressive
- **monthlyIncome:** Non-negative number

**Used In:** `/api/settings/financial` (PUT)

##### c) `validatePasswordChange`
Validates password change requests.

**Requirements:**
- Current password: Required
- New password: Required, minimum 8 characters

**Used In:** `/api/settings/password` (PUT)

---

### 6. Validate User Input Middleware
**File:** `src/middlewares/validateUserInput.middleware.js`

**Purpose:** Validates user creation and update requests in admin panel.

**Validations:**

#### For POST (Create User):
- **name:** Required
- **email:** Required, valid email format
- **password:** Required, minimum 6 characters
- **role:** Required, must be `user`, `admin`, or `advisor`

#### For PUT (Update User):
- **email:** If provided, valid email format
- **password:** If provided, minimum 6 characters
- **role:** If provided, must be `user`, `admin`, or `advisor`

**Used In:** `/api/users/*` routes for user management

---

### 7. Rate Limit Middleware
**File:** `src/middlewares/rateLimit.middleware.js`

**Purpose:** Prevents API abuse by limiting request rates.

**Configuration:**
```javascript
{
  windowMs: 60 * 1000,  // 1 minute
  max: 30,              // 30 requests per window
  standardHeaders: true,
  legacyHeaders: false
}
```

**Status:** Currently defined but **not mounted** in server.js  
**Intended For:** Dashboard stats endpoints

---

## Middleware Summary Table

| Middleware | Type | Scope | File/Package | Primary Purpose |
|------------|------|-------|--------------|-----------------|
| **CORS** | Global | All routes | `cors` | Cross-origin access control |
| **Body Parsers** | Global | All routes | `express` | Parse JSON & URL-encoded bodies |
| **Morgan** | Global | All routes | `morgan.middleware.js` | HTTP request logging |
| **Logger** | Global | All routes | `logger.middleware.js` | Custom request/response logging |
| **User Activity** | Global | All routes | `userActivity.middleware.js` | Track user sessions & activity |
| **Static Files** | Global | `/uploads` | `express.static` | Serve uploaded files |
| **Error Handler** | Global | All routes (last) | `errorHandler.middleware.js` | Centralized error handling |
| **Swagger UI** | Global | `/api-docs` | `swagger-ui-express` | API documentation |
| **Auth** | Route | Protected routes | `auth.middleware.js` | JWT authentication |
| **Request Context** | Route | `/api/settings` | `requestContext.middleware.js` | Add request metadata |
| **Cache Control** | Route | Sensitive routes | `cacheControl.middleware.js` | Prevent caching |
| **Upload** | Route | File upload routes | `upload.middleware.js` | Handle multipart uploads |
| **Settings Validation** | Route | `/api/settings` | `settingsValidation.middleware.js` | Validate settings updates |
| **User Input Validation** | Route | `/api/users` | `validateUserInput.middleware.js` | Validate user data |
| **Rate Limit** | Available | Not mounted | `rateLimit.middleware.js` | Prevent API abuse |

---

## Middleware Execution Order

Understanding the order of middleware execution is crucial for debugging:

1. **CORS** - Cross-origin headers
2. **Body Parsers** - Parse request bodies
3. **Morgan** - HTTP logging (multiple instances)
4. **Logger** - Custom logging
5. **User Activity** - Session tracking
6. **Static Files** - Serve uploads (if path matches)
7. **Route-specific middlewares** (in order):
   - Request Context (if applicable)
   - Auth (if required)
   - Role/Permission checks (if required)
   - Cache Control (if applicable)
   - Upload (if handling files)
   - Validation (if required)
   - Route handler
8. **Error Handler** - Last middleware (catches all errors)

---

## Best Practices

### When to Use Each Middleware:

- **`auth`**: Always use for protected routes that require user authentication
- **`requireAdmin`**: Use with `auth` for admin-only operations
- **`requirePermission(permission)`**: Use for granular admin permission control
- **`cacheControl`**: Apply to routes returning sensitive financial data
- **Validation middlewares**: Always validate before controller logic
- **Upload middlewares**: Use appropriate upload config based on file type and destination

### Security Considerations:

1. **Authentication First:** Always apply `auth` before other route-specific middlewares
2. **Validate Early:** Validation middlewares should come before expensive operations
3. **Cache Control:** Never cache sensitive data (account balances, personal info)
4. **File Uploads:** Always validate file types and sizes
5. **Rate Limiting:** Consider implementing rate limiting on public endpoints

---

## Related Files

- **Main Server:** `server.js`
- **Middleware Directory:** `src/middlewares/`
- **JWT Config:** `src/config/jwt.config.js`
- **Swagger Config:** `src/config/swagger.config.js`
- **Log Directory:** `logs/`

---

**Last Updated:** 2026-02-11  
**Project:** DRAKZ - Digital Revenue and Assets Keeper Zone
