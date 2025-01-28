# Dashboard and Settings Middleware Changes (Deepthi)

This document explains what was added to support robust, secure Dashboard and Settings pages, why the specific middleware types were chosen, and what was already in use.

## Summary of Middleware Types Used

- Application-level: `express.json()`, `express.urlencoded()`, global `logger`, `userActivity`, and scoped `requestContext` for Settings.
- Router-level: Validation specific to Settings routes, and route-scoped `cacheControl` on Admin Dashboard stats.
- Error-handling: Global `errorHandler` (enhanced to show a user-friendly error page and log to file) and `settingsErrorHandler` (router-level) for Settings.
- Built-in: `express.json()`, `express.urlencoded()`, `express.static()` for uploads.
- Third-party: `morgan` (HTTP logs) and `express-rate-limit` for Admin Dashboard stats.

---

## Changes for Settings Page

- Router-level validation (`src/middlewares/settingsValidation.middleware.js`)

  - `validateProfileUpdate`, `validateFinancialUpdate`, `validatePasswordChange` are attached in `src/routes/settings.routes.js` before controllers.
  - Purpose: Fail fast on invalid input with clear messages; keeps controllers focused.
  - Why router-level: The validation rules are specific to the Settings endpoints and shouldn’t affect unrelated routes.

- Application-level context (`src/middlewares/requestContext.middleware.js`)

  - Attached to `/api/settings` in `server.js`.
  - Purpose: Annotates requests with `req.context.page = "settings"` to aid diagnostics and future feature toggles.
  - Why application-level (scoped): It runs for all Settings requests without mixing concerns in controllers.

- Error-handling middleware

  - Global `errorHandler` enhanced (`src/middlewares/errorHandler.middleware.js`) to:
    - Show a minimal HTML error page to users (no technical details).
    - Log full error details (timestamp, route, user id/role, stack) to `logs/error-details.log`.
  - Router-level `settingsErrorHandler` added in `src/routes/settings.routes.js` to format validation and runtime errors consistently for Settings.
  - Why error-handling: Dedicated four-arg middleware is the correct way to centralize error responses and logging.

- Already used on Settings
  - `auth` (JWT) to protect all Settings endpoints.
  - Built-ins: `express.json`, `express.urlencoded`.
  - Global `morgan` for request logs.

## Changes for Dashboard Page (Admin)

- Third-party rate limiting (`express-rate-limit`)

  - `dashboardStatsLimiter` (`src/middlewares/rateLimit.middleware.js`) applied to `GET /api/dashboard-stats` in `src/routes/user.routes.js`.
  - Purpose: Protect the stats endpoint from abuse.
  - Why third-party: A proven library gives accurate, configurable rate limiting with minimal code.

- Router-level cache control (`src/middlewares/cacheControl.middleware.js`)

  - Applied to `GET /api/dashboard-stats` before controller.
  - Purpose: Prevent browsers/proxies from caching sensitive admin metrics.
  - Why router-level: Only the stats endpoint requires strict no-cache headers.

- Application-level user activity logging (`src/middlewares/userActivity.middleware.js`)

  - Attached globally in `server.js` so all requests are tracked.
  - Logs: user id/role (if authenticated), request method/path, status, response time; approximates session duration per user.
  - Why application-level: User activity spans multiple routes/pages and benefits from central logging.

- Already used on Dashboard
  - `auth` + `requireAdmin` on admin-only endpoints like dashboard stats.
  - `morgan` for HTTP logs.

## Why these middleware kinds

- Validation: Router-level keeps concerns close to the route and avoids global coupling.
- Rate limiting: Third-party provides reliability and best practices.
- Cache headers: Router-level precision – only critical endpoints get no-cache.
- Error page & logging: Error-handling middleware is the standard, and global scope ensures coverage everywhere.
- Activity logging: Application-level centralizes cross-cutting concerns and captures full app behavior.

## Files Touched

- `src/middlewares/settingsValidation.middleware.js`
- `src/routes/settings.routes.js`
- `src/middlewares/rateLimit.middleware.js`
- `src/routes/user.routes.js`
- `src/middlewares/cacheControl.middleware.js`
- `src/middlewares/requestContext.middleware.js`
- `src/middlewares/errorHandler.middleware.js`
- `src/middlewares/userActivity.middleware.js`
- `server.js`

## Notes

- Error pages are returned only for HTML-accepting requests; API clients receive JSON with a generic message.
- Logs are written under `logs/` (created automatically) and can be rotated by ops tooling.
