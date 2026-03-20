# 🌐 DRAKZ — Web Services & External Integrations

> A comprehensive reference of every web service, external API, and major library integration used in the DRAKZ fintech platform — **where** it's used, **why** it was chosen, and what **alternatives** were considered.

---

## Table of Contents

| # | Service | Category |
|---|---------|----------|
| 1 | [MongoDB Atlas](#1-mongodb-atlas) | Database |
| 2 | [Finnhub API](#2-finnhub-api) | Market Data |
| 3 | [GoldAPI.io](#3-goldapiio) | Market Data |
| 4 | [Gmail SMTP (Nodemailer)](#4-gmail-smtp--nodemailer) | Email |
| 5 | [Socket.IO](#5-socketio) | Real-Time Communication |
| 6 | [JSON Web Tokens (JWT)](#6-json-web-tokens-jwt) | Authentication |
| 7 | [Multer](#7-multer) | File Uploads |
| 8 | [Swagger (OpenAPI)](#8-swagger-openapi) | API Documentation |
| 9 | [Axios](#9-axios) | HTTP Client |
| 10 | [Render](#10-render) | Hosting / Deployment |
| 11 | [Vercel](#11-vercel) | Hosting / Deployment |
| 12 | [TinyLlama (HuggingFace)](#12-tinyllama--huggingface-transformers) | AI / LLM |

---

## 1. MongoDB Atlas

| | |
|---|---|
| **What** | Cloud-hosted MongoDB database (DBaaS) |
| **Package** | `mongoose` v7.8.7 |
| **Env Variable** | `MONGO_URI` |

### Where It's Used

- **`src/config/db.config.js`** — connection initialization via `mongoose.connect()`
- **Every controller** — all data persistence (users, transactions, properties, insurance, loans, KYC, blogs, chats, settings, etc.) goes through Mongoose models

### Why MongoDB Atlas

- **Document-based schema** fits the flexible, JSON-heavy nature of a fintech dashboard (nested user profiles, dynamic transaction fields)
- **Free tier (M0)** is generous enough for development and small-scale production
- **Built-in replication & backups** with zero devops overhead
- **Mongoose ODM** provides schema validation, middleware hooks, and a mature ecosystem

### Alternatives Considered

| Alternative | Why Not |
|---|---|
| **PostgreSQL (Supabase / Neon)** | Relational model adds friction for rapidly evolving schemas; joins are expensive for nested portfolio data |
| **Firebase Firestore** | Vendor lock-in to Google; pricing unpredictable at scale; limited aggregation pipeline support |
| **PlanetScale (MySQL)** | No native JSON document support; less natural fit for this data shape |

---

## 2. Finnhub API

| | |
|---|---|
| **What** | Real-time & reference stock market data API |
| **Endpoint** | `https://finnhub.io/api/v1/` |
| **Env Variable** | `FINNHUB_API_KEY` |

### Where It's Used

- **`src/controllers/investments.controller.js`**
  - `getRealTimeStock()` — fetches live quote for a single stock symbol (e.g. AAPL)
  - `getUserStocks()` — fetches live quotes for the user's portfolio (AAPL, NFLX, META, AMZN) with 30-minute server-side cache
  - `getStockApiKey()` — exposes the API key to the frontend
- **`src/components/gupta/Finbot.jsx`** (frontend)
  - Calls `/quote`, `/stock/profile2`, `/stock/peers`, `/stock/metric` for the AI-powered Finbot analysis

### Why Finnhub

- **Generous free tier** — 60 API calls/minute, real-time US stock quotes
- **Simple REST interface** — easy to integrate; no complex OAuth flows
- **Rich endpoints** — quotes, company profiles, peers, financials, all from one provider
- **WebSocket support** available if we need to upgrade to streaming

### Alternatives Considered

| Alternative | Why Not |
|---|---|
| **Alpha Vantage** | Lower rate limits on free tier (5 calls/min); slower response times |
| **Yahoo Finance API (unofficial)** | Unstable / frequently breaks; no official support; legal grey area |
| **Polygon.io** | Free tier is very limited; premium pricing starts at $99/mo |
| **IEX Cloud** | Free tier discontinued; pay-per-message model gets expensive fast |

---

## 3. GoldAPI.io

| | |
|---|---|
| **What** | Live precious metal prices (Gold, Silver, Platinum) in multiple currencies |
| **Endpoint** | `https://www.goldapi.io/api/{METAL}/{CURRENCY}` |
| **Env Variable** | `GOLDAPI_KEY` |

### Where It's Used

- **`src/controllers/privilege.controller.js`**
  - `getLiveMetalPrices()` — fetches 24K gram prices in INR for Gold (`XAU`), Silver (`XAG`), and Platinum (`XPT`)
  - Implements a 60-minute server-side cache with fallback rates
- Used in the **Privilege Dashboard** for users' precious metal holdings valuation

### Why GoldAPI.io

- **Dedicated metal price API** — purpose-built for Gold/Silver/Platinum; returns price per gram in multiple currencies (including INR)
- **Simple token-based auth** — just an `x-access-token` header
- **Free tier** available for low-volume usage

### Alternatives Considered

| Alternative | Why Not |
|---|---|
| **Metals API** | More expensive at scale; similar feature set but less focused |
| **Open Exchange Rates + manual conversion** | Adds complexity; metal prices aren't standard forex rates |
| **Kitco / Bullion Vault scraping** | Fragile; no official API; violates ToS |

---

## 4. Gmail SMTP / Nodemailer

| | |
|---|---|
| **What** | Email sending via Gmail's SMTP relay |
| **Package** | `nodemailer` v7.0.11 |
| **Env Variables** | `EMAIL_USER`, `EMAIL_PASS` (Gmail App Password) |

### Where It's Used

- **`src/controllers/contactController.js`**
  - `replyToMessage()` — admin replies to user support messages via email
  - Uses `nodemailer.createTransport()` with Gmail service & App Password auth

### Why Nodemailer + Gmail

- **Zero cost** — Gmail SMTP is free for low-volume transactional emails
- **No external service signup** — works with an existing Gmail account + App Password
- **Nodemailer** is the de-facto standard Node.js email library (14M+ weekly downloads)
- **Simple setup** — 10 lines of code to send an email

### Alternatives Considered

| Alternative | Why Not |
|---|---|
| **SendGrid** | Requires account verification; free tier limited to 100 emails/day; more setup overhead |
| **Mailgun** | No longer has a truly free tier; requires domain verification |
| **AWS SES** | Requires AWS account + sandbox approval; overkill for current volume |
| **Resend** | Newer service; requires domain DNS setup |

---

## 5. Socket.IO

| | |
|---|---|
| **What** | Real-time bidirectional event-based communication |
| **Packages** | `socket.io` v4.8.1 (server) · `socket.io-client` v4.8.1 (client) |

### Where It's Used

- **`server.js`** — Socket.IO server initialization with CORS configuration
  - **Live Chat** — `send_message` / `receive_message` events for user-admin chat
  - **Room-based routing** — users join personal rooms; admins join `admin_notifications`
  - **Typing indicators** — `typing` / `display_typing` events
  - **Video broadcast** — `broadcast_video` / `receive_video` for advisor-to-user video sharing
  - Messages are persisted to MongoDB via the `Chat` model
- **`src/components/ziko/ChatWidget.jsx`** — user-facing chat widget
- **`src/components/ziko/admin/SupportPage.jsx`** — admin support dashboard
- **`src/components/gupta/UserVideo.jsx`** / **`AdvisorVideo.jsx`** — video broadcast feature

### Why Socket.IO

- **Automatic fallback** — WebSocket → HTTP long-polling, ensuring connectivity on all networks
- **Room support** — built-in room/namespace abstraction for multi-user chat routing
- **Mature ecosystem** — widely used, well-documented, large community
- **Event-driven API** — clean `emit` / `on` pattern maps directly to chat features

### Alternatives Considered

| Alternative | Why Not |
|---|---|
| **Raw WebSockets (`ws`)** | No auto-reconnect, no room support, no fallback transport — would require significant custom code |
| **Pusher** | Third-party hosted service; free tier limited to 200K messages/day; adds external dependency |
| **Firebase Realtime Database** | Tight coupling to Google ecosystem; less flexible for custom event patterns |
| **Ably** | Paid service; adds vendor dependency for a feature we can self-host |

---

## 6. JSON Web Tokens (JWT)

| | |
|---|---|
| **What** | Stateless token-based authentication |
| **Package** | `jsonwebtoken` v9.0.2 |
| **Env Variable** | `JWT_SECRET` |

### Where It's Used

- **`src/config/jwt.config.js`** — centralized JWT secret & expiry config (7-day expiry)
- **`src/controllers/auth.controller.js`** — token generation on login/register
- **`src/middlewares/`** — auth middleware verifies JWT on protected routes
- **`src/config/swagger.config.js`** — Swagger UI configured with Bearer JWT security scheme

### Why JWT

- **Stateless** — no server-side session storage needed; scales horizontally
- **Self-contained** — token carries user ID and role; reduces DB lookups
- **Standard (RFC 7519)** — universally supported across frontend/backend/mobile
- **Works with `express-session`** as a complementary layer if needed

### Alternatives Considered

| Alternative | Why Not |
|---|---|
| **Session cookies (`express-session` only)** | Requires server-side session store (Redis/DB); harder to scale; not ideal for API-first architecture |
| **OAuth 2.0 / Auth0** | Overkill for a single-tenant app; adds third-party dependency & cost |
| **Passport.js** | Adds abstraction layer; JWT strategy still uses `jsonwebtoken` under the hood |
| **Firebase Auth** | Ties auth to Google ecosystem; less control over token claims and expiry |

---

## 7. Multer

| | |
|---|---|
| **What** | Multipart/form-data file upload middleware for Express |
| **Package** | `multer` v2.0.2 |

### Where It's Used

- **`src/middlewares/upload.middleware.js`** — three upload configurations:

| Upload Type | Destination | Max Size | Allowed Types | Used For |
|---|---|---|---|---|
| `upload` | `uploads/properties` | 10 MB | jpeg, jpg, png, gif, webp | Property images |
| `profileUpload` | `uploads/profile` | 5 MB | jpeg, jpg, png, gif, webp | User profile pictures |
| `advisorDocumentUpload` | `uploads/documents` | 10 MB | jpeg, jpg, png, gif, webp, **pdf** | Advisor registration docs, KYC documents |

- **Routes using Multer:**
  - Property CRUD (`privilege.route.js`) — `upload.single('image')`
  - Profile picture upload (`user.routes.js`) — `profileUpload.single('profilePicture')`
  - KYC document submission (`kyc.routes.js`) — `advisorDocumentUpload.single('document')`
  - Blog image upload (`blog.route.js`)
  - Advisor registration (`auth.route.js`) — `advisorDocumentUpload.single('document')`

### Why Multer

- **Express-native** — designed specifically for Express.js; drop-in middleware
- **Disk or memory storage** — flexible storage backends
- **Fine-grained control** — file size limits, file type filtering, custom naming
- **Zero external dependencies** for storage — files stay on the server filesystem

### Alternatives Considered

| Alternative | Why Not |
|---|---|
| **Formidable** | Less Express-specific; Multer has better middleware integration |
| **Busboy** | Lower-level; Multer is built on top of Busboy with a friendlier API |
| **Cloudinary / AWS S3 direct upload** | Adds external service dependency & cost; local disk storage is sufficient for current scale |

---

## 8. Swagger (OpenAPI)

| | |
|---|---|
| **What** | Auto-generated interactive API documentation |
| **Packages** | `swagger-jsdoc` v6.2.8 · `swagger-ui-express` v5.0.1 |
| **Access URL** | `{BACKEND_URL}/api-docs` |

### Where It's Used

- **`src/config/swagger.config.js`** — OpenAPI 3.0 spec definition:
  - Title: *Drakz API*
  - Servers: production (`BACKEND_URL/api`) + local dev (`localhost:3001/api`)
  - Security: Bearer JWT auth scheme
  - Auto-scans all route files: `src/routes/*.js`
- **`server.js`** — mounted at `/api-docs`:
  ```js
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  ```
- **Route files** — JSDoc annotations (`@swagger`) define endpoint schemas

### Why Swagger

- **Industry standard** — OpenAPI/Swagger is the most widely adopted API documentation format
- **Interactive "Try It Out"** — developers can test endpoints directly from the browser
- **Auto-generated from code** — `swagger-jsdoc` reads JSDoc comments; docs stay in sync with code
- **JWT integration** — "Authorize" button in Swagger UI for authenticated endpoint testing

### Alternatives Considered

| Alternative | Why Not |
|---|---|
| **Postman Collections** | Not embeddable; requires Postman app; harder to keep in sync with code |
| **Redoc** | Better for static docs but lacks "Try It Out" interactive testing |
| **Stoplight** | SaaS product; adds external dependency; free tier is limited |
| **Manual Markdown docs** | Doesn't auto-update; no interactive testing; high maintenance burden |

---

## 9. Axios

| | |
|---|---|
| **What** | Promise-based HTTP client for Node.js and browser |
| **Package** | `axios` v1.13.2 |

### Where It's Used

- **Backend (Node.js)**
  - `src/controllers/investments.controller.js` — calls Finnhub API for stock quotes
  - `src/controllers/privilege.controller.js` — calls GoldAPI.io for metal prices
- **Frontend (React)**
  - `src/config/axios.config.js` — centralized Axios instance with `VITE_BACKEND_URL` base URL
  - `src/api/axios.api.js` — API helper functions for all frontend ↔ backend communication

### Why Axios

- **Isomorphic** — same API works on both server (Node.js) and client (browser)
- **Request/response interceptors** — centralized auth header injection, error handling
- **Timeout support** — built-in request timeouts (used for external API calls)
- **Automatic JSON parsing** — responses are automatically parsed

### Alternatives Considered

| Alternative | Why Not |
|---|---|
| **Native `fetch()`** | No built-in timeout, interceptors, or request cancellation (without AbortController boilerplate) |
| **`got`** | Node.js only; doesn't work in the browser |
| **`ky`** | Browser-only; much smaller ecosystem |
| **`node-fetch`** | Node.js only; fewer features than Axios |

---

## 10. Render

| | |
|---|---|
| **What** | Cloud hosting platform for web services |
| **Env Variables** | `BACKEND_URL=https://drakz-backend.onrender.com` · `FRONTEND_URL=https://drakz-frontend.onrender.com` |

### Where It's Used

- **Backend deployment** — Node.js/Express server hosted on Render as a Web Service
- **Frontend deployment** — Vite-built React SPA hosted on Render as a Static Site
- **`server.js`** — health check endpoint at `/cron/health` for Render's uptime monitoring
- **`.env`** — production URLs point to `*.onrender.com`

### Why Render

- **Free tier** for web services and static sites (with sleep after 15 min inactivity)
- **Zero-config deploys** — auto-deploys on Git push
- **Built-in HTTPS** — automatic SSL certificates
- **Environment variable management** — native support in dashboard

### Alternatives Considered

| Alternative | Why Not |
|---|---|
| **Heroku** | Free tier removed in 2022; paid plans start at $7/mo per dyno |
| **Railway** | Free tier has limited execution hours (~500h/mo); less mature |
| **Fly.io** | More complex setup (Docker-based); free tier is limited |
| **AWS EC2/ECS** | Significant devops overhead; overkill for a project-stage app |

---

## 11. Vercel

| | |
|---|---|
| **What** | Serverless deployment platform (used for frontend SPA) |
| **Config** | `vercel.json` |

### Where It's Used

- **`vercel.json`** — SPA rewrite rule: all routes → `/index.html`
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- **`server.js`** — conditional server start: skips `server.listen()` in Vercel environment
- Used as an **alternative/secondary** frontend deployment option alongside Render

### Why Vercel

- **Optimized for frontend frameworks** — first-class Vite/React support
- **Edge network** — global CDN with excellent performance
- **Free tier** — generous for personal/hobby projects
- **Instant previews** — PR-based preview deployments

### Alternatives Considered

| Alternative | Why Not |
|---|---|
| **Netlify** | Very similar offering; Vercel has slightly better React/Vite integration |
| **GitHub Pages** | No server-side redirects; SPA routing requires workarounds |
| **Cloudflare Pages** | Good option but less ecosystem integration for the current tech stack |

---

## 12. TinyLlama / HuggingFace Transformers

| | |
|---|---|
| **What** | Local LLM for AI-powered financial advice |
| **Model** | `TinyLlama/TinyLlama-1.1B-Chat-v1.0` |
| **Framework** | Python Flask + HuggingFace `transformers` |
| **File** | `llm.py` |

### Where It's Used

- **`llm.py`** — standalone Python Flask server on port `5002`
  - Endpoint: `POST /api/financial-advice`
  - Accepts user query + financial context (income, expenses, savings)
  - Uses prompt engineering with system/user/assistant template
  - Model loaded once at startup; generates responses with `temperature=0.7`

### Why TinyLlama (Local)

- **Free & self-hosted** — no API costs; runs entirely on local hardware
- **Privacy** — user financial data never leaves the server
- **Lightweight** — 1.1B parameters; runs on modest hardware without GPU
- **Chat-optimized** — v1.0 Chat variant is fine-tuned for conversational use

### Alternatives Considered

| Alternative | Why Not |
|---|---|
| **OpenAI GPT API** | Pay-per-token pricing; sends sensitive financial data to third-party servers |
| **Google Gemini API** | Same privacy concerns as OpenAI; requires Google Cloud billing |
| **Llama 2 / Llama 3 (7B+)** | Better quality but requires GPU & significantly more RAM |
| **Ollama** | Good local option but adds another service layer; TinyLlama via transformers is simpler |

---

## Summary Matrix

| Service | Category | Free Tier | Self-Hosted | Key File(s) |
|---|---|---|---|---|
| MongoDB Atlas | Database | ✅ (M0 512MB) | ❌ | `db.config.js` |
| Finnhub | Market Data | ✅ (60 calls/min) | ❌ | `investments.controller.js`, `Finbot.jsx` |
| GoldAPI.io | Market Data | ✅ (limited) | ❌ | `privilege.controller.js` |
| Gmail SMTP | Email | ✅ | ❌ | `contactController.js` |
| Socket.IO | Real-Time | ✅ | ✅ | `server.js`, `ChatWidget.jsx` |
| JWT | Auth | ✅ | ✅ | `jwt.config.js`, `auth.controller.js` |
| Multer | File Upload | ✅ | ✅ | `upload.middleware.js` |
| Swagger | API Docs | ✅ | ✅ | `swagger.config.js` |
| Axios | HTTP Client | ✅ | ✅ | `axios.config.js`, controllers |
| Render | Hosting | ✅ (with limits) | ❌ | `.env`, `server.js` |
| Vercel | Hosting | ✅ | ❌ | `vercel.json` |
| TinyLlama | AI / LLM | ✅ | ✅ | `llm.py` |

---

*Last updated: March 20, 2026*
