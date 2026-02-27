# DRAKZ 🚀

**Next-Generation Modular Financial Ecosystem**

DRAKZ is a sophisticated, full-stack financial management platform that provides users with a centralized hub for comprehensive asset tracking, AI-driven financial advisory, and secure financial planning. Built with cutting-edge technologies and a focus on modularity, DRAKZ delivers a seamless and intelligent financial management experience.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Recent Updates](#recent-updates)
- [Team Contributions](#team-contributions)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [AI-Powered Features](#ai-powered-features)
- [Development](#development)

---

## 🎯 Overview

DRAKZ revolutionizes personal finance management by combining advanced AI capabilities with intuitive user interfaces. The platform offers real-time financial insights, intelligent advisory services, and comprehensive asset management tools—all in one place.

### Why DRAKZ?

- **AI-Driven Insights**: Intelligent chatbot and financial advisor powered by advanced AI
- **Comprehensive Tracking**: Monitor investments, insurance, properties, and expenses
- **Real-Time Analytics**: Live stock market data and portfolio performance metrics
- **Modular Architecture**: Scalable and maintainable codebase with clear separation of concerns
- **Secure & Reliable**: JWT-based authentication and encrypted data storage

---

## ✨ Key Features

### 🤖 AI-Powered Financial Advisory
- **Interactive Chatbot**: Real-time financial Q&A with intelligent responses
- **Smart Financial Planning**: Automated spending analysis and savings recommendations
- **Stock Recommendations**: AI-driven portfolio diversification suggestions
- **Market Intelligence**: Real-time stock information and trend analysis

### 💼 Comprehensive Asset Management
- **Investment Tracking**: Monitor stocks, mutual funds, and portfolio performance
- **Insurance Management**: Track policies, premiums, and coverage details
- **Property Management**: Organize real estate holdings and valuations
- **Expense Analytics**: Visualize spending patterns and budget adherence

### 📊 Advanced Analytics & Reporting
- **Interactive Dashboards**: Real-time data visualization and insights
- **Account Summaries**: Consolidated view of all financial accounts
- **Expense Distribution**: Categorized spending breakdowns
- **Performance Metrics**: Track financial goals and milestones

### 👥 Expert Consultation
- **Video Advisory Platform**: Schedule and conduct live sessions with financial experts
- **Advisor Hub**: Browse, connect with, and manage certified financial advisors

---

## 🆕 Recent Updates

### Advisor Dashboard Expansion
Three new full pages were added to the Advisor section:

#### 🧑‍💼 Advisor Profile Edit Page (`/advisor/profile`)
- Full profile editing form (name, phone, bio, specialization, price, experience, certificates, languages)
- Toggle to accept/reject new client requests
- Quick stats sidebar (clients, experience, price)
- Backend: `GET /api/advisor/profile`, `PATCH /api/advisor/profile`

#### 👥 Clients Hub Page (`/advisor/clients`)
- Searchable client list with live filtering
- Detailed financial report panel per client (income, expenses, balance, credit score, spending categories, monthly trend charts)
- Remove client with confirmation dialog
- **PDF Export**: Download a professionally branded client financial report as PDF (using jsPDF), including financial summary cards, category bar charts, and monthly data table
- Backend: `GET /api/advisor/clients`, `GET /api/advisor/client/:id/report`, `DELETE /api/advisor/client/:id`

#### 📈 Advisor Analytics Page (`/advisor/analytics`)
- Key performance indicators (total clients, income managed, average credit score, pending requests)
- Portfolio breakdown charts (category spending, monthly income vs expense trends)
- Risk profile distribution
- Client overview table
- Backend: `GET /api/advisor/analytics`

---

### 🔐 Login → Dashboard Transition Animation
- A branded **full-screen loading animation** plays between login and the dashboard for all 3 roles
- **Role-specific colors**: Indigo (User), Green (Advisor), Amber (Admin)
- **Animated elements**: SVG progress ring (0→100%), floating particles, pulsing glow blob, cycling loading tips
- **Smooth exit**: Fades out over the already-rendered dashboard with no flash
- Built with pure CSS animations — no additional library required
- Files: `src/components/global/LoginTransition.jsx`, `src/styles/global/LoginTransition.css`

---

### 📄 Client Report PDF Export
- One-click download of a professionally styled PDF from the Clients Hub
- **PDF contents**: DRAKZ-branded header, client info card, financial summary, spending category bars, monthly trend table, page footer
- Generated entirely client-side with **jsPDF** (no server round-trip)
- File: `src/utils/generateClientPDF.js`

---

### 🧩 Sidebar Navigation Updates
- Added navigation links for Advisor Profile, Clients Hub, and Analytics pages to the advisor sidebar
- Consistent icon styling with Font Awesome

---

## 👨‍💻 Team Contributions

### Krishna Gupta — Lead Architect & AI Integration
**Primary Responsibilities:**
- Overall project architecture and technical planning
- Complete AI ecosystem development including:
  - AI Advisor Chatbot interface
  - Financial Planning automation system
  - Stock Recommendation engine
  - Stock Information display system
- Video Advisory platform development
- Live video session interface implementation
- Backend integration for AI services
- **Advisor Dashboard expansion** (Profile, Clients Hub, Analytics pages)
- **Login transition animation** and global UX improvements
- **PDF report export** for client financial reports

### M Deepthi — Dashboard & Analytics
**Primary Responsibilities:**
- User dashboard development and design
- Account summary visualizations
- Expense distribution analytics
- Data visualization components
- Backend server development for analytics features

### Nagineni Ragamaie — Investments & Content
**Primary Responsibilities:**
- Investment tracking system implementation
- Stock market chart integrations
- Real-time market data visualization
- Financial blog platform development
- Backend server development for investment features

### Zulqarnain Ahmed — UI/UX & Administration
**Primary Responsibilities:**
- Landing page design and development
- 3D card models and animations
- Complete administrative management system
- User interface design and user experience optimization
- Backend server development for admin features

### Malle Abhinay — Privilege & Asset Management
**Primary Responsibilities:**
- "My Privilege" asset management suite
- Insurance tracking and management system
- Property portfolio management
- Asset categorization and organization
- Backend server development for asset management features

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Vanilla CSS with responsive dark-theme design
- **State Management**: Redux Toolkit + React Context API
- **Data Visualization**: Chart.js / Recharts
- **Animations**: CSS keyframe animations, Framer Motion
- **PDF Generation**: jsPDF (client-side)
- **Video Conferencing**: WebRTC integration

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer
- **Real-Time**: Socket.io
- **API Architecture**: RESTful APIs

### AI & Integration
- **AI Services**: Custom AI integration for financial advisory
- **Real-Time Data**: Stock market API integration
- **Video Services**: WebRTC for live sessions

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js**: v14.x or higher
- **npm**: v6.x or higher
- **MongoDB**: Local installation or MongoDB Atlas account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Krishna-ctrl1/DRAKZ-1.git
cd DRAKZ-1
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**

Create a `.env` file in the root directory:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_secure_random_jwt_secret

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# AI Services (if applicable)
AI_API_KEY=your_ai_service_api_key

# Stock Market API (if applicable)
STOCK_API_KEY=your_stock_api_key
```

4. **Start the Development Server**

```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

---

## 📁 Project Structure

```
DRAKZ-1/
├── src/
│   ├── components/
│   │   ├── global/          # Shared components (Header, Sidebar, LoginTransition)
│   │   ├── deepthi/         # User dashboard components
│   │   ├── gupta/           # Advisor dashboard components
│   │   ├── ragamaie/        # Investments & blog components
│   │   ├── abhinay/         # Privilege & asset components
│   │   └── ziko/            # Landing, login, admin components
│   ├── styles/              # Per-module CSS files
│   ├── redux/               # Redux Toolkit slices & store
│   ├── context/             # React Context (AuthProvider)
│   ├── utils/               # Utility functions (generateClientPDF.js)
│   ├── api/                 # Axios API instance
│   ├── auth/                # Route guards (ProtectedRoute, RoleRoute, AuthGate)
│   ├── config/              # App configuration (backend URL, API config)
│   └── App.jsx              # Root component & routing
│
├── src/controllers/         # Express route controllers
├── src/models/              # Mongoose models
├── src/routes/              # Express route definitions
├── src/middleware/          # Auth middleware
├── server.js                # Express entry point
├── package.json
└── README.md
```

---

## 🤖 AI-Powered Features

### AI Advisor Chatbot
An intelligent conversational interface that provides:
- Personalized financial advice based on user data
- Answers to common financial questions
- Contextual recommendations and insights
- 24/7 availability for financial guidance

### Financial Planning System
Automated financial planning that includes:
- Spending pattern analysis
- Budget optimization suggestions
- Savings goal tracking
- Long-term financial strategy recommendations

### Stock Recommendation Engine
AI-driven investment suggestions featuring:
- Market trend analysis
- Portfolio diversification recommendations
- Risk assessment and management
- Real-time stock performance data

### Stock Information Portal
Comprehensive stock data platform providing:
- Real-time stock prices and charts
- Historical performance analysis
- Company fundamentals and metrics
- News and market sentiment analysis

---

## 💻 Development

### Available Scripts

```bash
# Start development server (frontend + backend concurrently)
npm run dev

# Start backend server only
npm run server

# Build frontend for production
npm run build

# Preview production build
npm run preview
```

### API Endpoints

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |

#### Advisor
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/advisor/profile` | Get advisor profile |
| PATCH | `/api/advisor/profile` | Update advisor profile |
| GET | `/api/advisor/clients` | Get all assigned clients |
| GET | `/api/advisor/client/:id/report` | Get client financial report |
| DELETE | `/api/advisor/client/:id` | Remove client |
| GET | `/api/advisor/analytics` | Get advisor analytics |
| GET | `/api/advisor/stats` | Get advisor dashboard stats |
| GET | `/api/advisor/requests` | Get pending client requests |

#### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/settings/profile-picture` | Upload profile picture |

---

## 🔒 Security

DRAKZ implements multiple layers of security:
- **JWT Authentication**: Secure token-based user authentication
- **Password Encryption**: Bcrypt hashing for user passwords
- **HTTPS**: Encrypted data transmission (production)
- **Input Validation**: Protection against injection attacks
- **CORS Configuration**: Controlled cross-origin requests
- **Rate Limiting**: Express rate limiter on sensitive routes

---

## 🤝 Contributing

Each team member maintains their respective modules. For contributions:

1. Create a feature branch
2. Make your changes
3. Submit a pull request with detailed description
4. Ensure all tests pass before merging

---

## 📄 License

This project is developed as part of an academic/professional initiative by the DRAKZ team.

---

## 📧 Contact

For questions or support, please contact the development team:

- **Krishna Gupta** — AI & Architecture
- **M Deepthi Nagineni** — Analytics
- **Nagineni Ragamaie** — Investments
- **Zulqarnain Ahmed** — UI/UX & Admin
- **Malle Abhinay** — Asset Management

---

<div align="center">

**Built with ❤️ by the DRAKZ Team**

⭐ Star this repository if you find it helpful!

</div>
