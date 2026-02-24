# DRAKZ Project API Documentation

This document outlines all RESTful APIs, WebSockets, and other web services implemented within the DRAKZ project. 

## 1. RESTful APIs

The application uses Express.js for routing. The base URL for most API routes is prefixed with `/api` as defined in `server.js`. The routes are mapped to underlying controllers which implement the primary business logic.

### Authentication (`/api/auth`)
*Location: `src/routes/auth.route.js`*
- **POST `/api/auth/register`**: Registers a new user. Supports optional `documents` upload via Multer for document processing.
- **POST `/api/auth/login`**: Authenticates a user and returns a JWT token for authorized sessions.
- **GET `/api/auth/me`**: Retrieves the details of the currently authenticated user.

### User Management (`/api/users` & general metrics)
*Location: `src/routes/user.routes.js`*
- **GET `/api/users`**: Retrieves a list of all users (Admin only).
- **POST `/api/users`**: Creates a new user (Admin only).
- **PUT `/api/users/:id`**: Updates a specific user's details (Admin only).
- **DELETE `/api/users/:id`**: Deletes a specific user (Admin only).
- **GET `/api/dashboard-stats`**: Gets system-wide dashboard statistics (Admin only, wrapped in a rate-limiter middleware).
- **GET `/api/server-metrics`**: Pulls internal server metrics / diagnostics (Admin only).

### Privilege & Admin Access (`/api/privilege`)
*Location: `src/routes/privilege.route.js`*
- **GET `/api/privilege/profile`**: Gets the user's customized privilege profile metrics.
- **GET / POST `/api/privilege/properties`**: Lists personal properties or adds a new one to the user's portfolio.
- **PUT / DELETE `/api/privilege/properties/:id`**: Updates or deletes a user property.
- **GET `/api/privilege/insurances`**: Retrieves user properties tied to their insurance scope.
- **GET / POST `/api/privilege/precious_holdings`**: Lists or adds precious holdings (e.g. gold, investments).
- **DELETE `/api/privilege/precious_holdings/:id`**: Specifically deletes a precious holding.
- **GET / POST `/api/privilege/transactions`**: Lists or logs individual transaction actions.
- **PUT `/api/privilege/transactions/:id`**: Updates an established transaction.
- **GET `/api/privilege/live-metal-prices`**: An unauthenticated, public endpoint to fetch real-time metal spot prices.
- **POST `/api/privilege/seed`**: Triggers a backend random insurance data seeder.
- **Admin System Endpoints**:
  - `GET /admin/analytics`: Retrieves full dashboard analytics algorithms.
  - `GET /admin/users` & `PATCH /admin/users/:id/status`: View all platform users or perform a suspension toggling status change.
  - `PATCH /admin/advisors/:id/approve` & `PATCH /admin/advisors/:id/reject`: Finalizes onboarding checks for business advisors.
  - `POST /admin/assign`: Forces the association linking an advisor to a user ID.
  - `GET /admin/business-analytics`, `GET /admin/support`, `PATCH /admin/support/:id`, `GET /admin/settings`, `PUT /admin/settings`: Manage internal organizational elements and app configs.
  - `POST /admin/create-admin`, `PATCH /admin/update-permissions/:id`: Role-Based Access Control configuration to spin up admin peers.

### Blogs (`/api/blogs`)
*Location: `src/routes/blog.route.js`*
- **GET `/api/blogs`**: Public open feed that compiles active, approved blogs.
- **POST `/api/blogs`**: Create and draft a new blog entry.
- **GET `/api/blogs/my-blogs`**: Returns blogs composed exclusively by the authenticated user.
- **PUT `/api/blogs/update/:id`**: Updates an existing blog's text or title.
- **DELETE `/api/blogs/:id`**: Deletes a specific blog created by the user.
- **POST `/api/blogs/:id/like`**,  **POST `/api/blogs/:id/dislike`**: Registers upvote/downvote engagement interactions.
- **GET `/api/blogs/:id/interactions`**: View overall statuses on a single blog item.
- **POST / GET `/api/blogs/:id/comments`**: Allows submission or viewing of comments tethered to a given blog string.
- **DELETE `/api/blogs/comments/:id`**: Eliminates a single written comment.
- **Admin Endpoints**:
  - `GET /admin/list`: Comprehensive unfiltered access strictly for checking new unverified blogs.
  - `PATCH /admin/:id/status`, `PATCH /admin/:id/flag`, `DELETE /admin/:id`: Moderation capabilities.

### Credit Score (`/api/credit-score`)
*Location: `src/routes/creditScore.routes.js`*
- **GET `/api/credit-score/me`**: Pulls the score linked in DB for the currently logged-in personal account.
- **POST `/api/credit-score`**: Informs the user's initial credit score logic initialization. 
- **GET `/api/credit-score/:userId`**: Evaluates individual scores remotely (Admin only).

### Spendings (`/api/spendings`)
*Location: `src/routes/spending.routes.js`*
- **POST `/api/spendings`**: Ingests new structured expenses.
- **GET `/api/spendings/weekly`**: Generates trailing week calculations for graph endpoints.
- **GET `/api/spendings/list`**: Queries standard paginated arrays of the most recent spends.
- **GET `/api/spendings/distribution-pie`**: Maps categorized spending arrays useful for UI pie chart elements.
- **DELETE `/api/spendings/range`**: Wipes records completely matching chronological window constraints.

### Cards (`/api/cards`)
*Location: `src/routes/card.routes.js`*
- **GET / POST `/api/cards`**: Retrieve stored debit/credit components or securely save a validated card block.
- **DELETE `/api/cards/:cardId`**: Withdraws an active card entity.
- **POST `/api/cards/:cardId/reveal`**: Internal unmasking handler requesting clear text returns of secure card digits.

### Advisors (`/api/advisor`)
*Location: `src/routes/advisor.route.js`*
- **GET `/api/advisor/list`**: Fetches an index of all certified advisors open to operations.
- **GET `/api/advisor/clients`**: A route targeting advisors requesting mapped relations to their pool of personal users.
- **GET `/api/advisor/requests`**: Tracks all user-advisor connections waiting to be settled.
- **POST `/api/advisor/requests/:requestId/respond`**: Issues an "approve" or "decline" instruction confirming the bond.
- **GET `/api/advisor/stats`**: Aggregates general advisor statistics globally for profiles.

### User -> Advisor Endpoints (`/api/user`)
*Location: `src/routes/user.advisor.route.js`*
- **GET `/api/user/advisors`**: A duplicate or refined route presenting advisors specific dynamically to user variables.
- **POST `/api/user/advisor/request`**: Sends a directed pairing invite.
- **GET `/api/user/advisor/status`**: Allows the user application to poll whether their pairing logic has successfully completed.
- **DELETE `/api/user/advisor/request/:requestId`**: Recalls a pending connection request previously authorized.

### Contact (`/api/contact`)
*Location: `src/routes/contactRoutes.js`*
- **POST `/api/contact/submit`**: Handles general 'Contact Us' mailer/lead payloads.
- **GET `/api/contact/all`**: Collects all contact leads sequentially.
- **POST `/api/contact/reply`**: Facilitates replying directly backend to submitted queries.

### Investments (`/api`)
*Location: `src/routes/investments.routes.js`*
*(Note that routes map directly onto `/api` in `server.js` without a nested prefix)*
- **GET `/api/getStockApiKey`**: Pulls external third-party (Finnhub) config tokens.
- **GET `/api/stocks/realtime`**: Performs live-calls to third parties gathering particular single-stock tick data.
- **GET `/api/user-investments`**: Combines users purchased assets returning grouped balances.
- **GET `/api/user-loans`**: Evaluates and lists an active users borrowing state parameters.
- **GET `/api/investment-history`**: Pulls chronologically framed investment trajectory maps for Chart.js.

### Account Summary (`/api/account-summary`)
*Location: `src/routes/accountSummary.routes.js`*
- **GET `/api/account-summary`**: Returns total grouped balances and total cumulative tracking for main views.

### Settings (`/api/settings`)
*Location: `src/routes/settings.routes.js`*
- **GET / PUT `/api/settings/profile`**: Syncs overarching standard text configurations (Name, bio, etc).
- **PUT `/api/settings/financial`**: Modifies the user's primary financial goal models.
- **PUT `/api/settings/password`**: Encrypts and swaps previous credential schemas.
- **POST `/api/settings/profile-picture`**: Mutates the upload stream pipeline, attaching picture assets uniquely attached to profiles.

### KYC (`/api/kyc`)
*Location: `src/routes/kyc.routes.js`*
- **POST `/api/kyc/submit`**: Primary submission handler for Know Your Customer document bundles.
- **GET `/api/kyc/me`**: Fetches the processing or approved KYC verification parameters of the requesting user.
- **GET `/api/kyc/pending`** & **PATCH `/api/kyc/:id/status`**: Control loops built to aid Admin manual review validation checks.

### Logs (`/api/logs`)
*Location: `src/routes/logs.routes.js`*
- **GET `/api/logs/access`**: Fetches overarching login/HTTP trails for system metrics visualization.
- **GET `/api/logs/error`**: Pulls exception histories output for monitoring operational debugging.

---

## 2. WebSockets / Web Services
*Location:* `server.js`

A `Socket.IO` instance runs directly natively attached to the `Express.js` HTTP server object. It controls live, real-time channels:
- **`join_room`**: Configures users and admins into personalized isolated chat groupings routing ID channels uniquely.
- **`send_message`**: Handles transferring dual-direction (Advisor ↔ User) messaging payloads. Connects tightly with MongoDB (`Chat.model.js`) ensuring all texts persist asynchronously. 
- **`typing`**: Hooks into UI states allowing users to visually see when the recipient hits strokes.
- **`broadcast_video`**: Bypasses typical message bounds, forcing video stream broadcast payloads completely outwardly to all online targeted socket recipients.

---
