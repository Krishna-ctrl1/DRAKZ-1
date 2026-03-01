# DRAKZ — Video Demo Script & Flow (15–20 Minutes)

> **How to read this document:**
> - 🎬 **[ACTION]** = What you do on-screen (click, scroll, navigate, type)
> - 🗣️ **Normal text** = What you speak into the mic
> - ⏱️ Rough timestamps are in the section headers so you can pace yourself

---

## 1. INTRODUCTION — Landing Page (0:00 – 1:30)

🎬 **[ACTION: Open the browser. You should be on the DRAKZ landing page (localhost:3000 or your deployed URL). Slowly scroll down through the landing page as you speak.]**

Hey everyone, welcome to the demo of DRAKZ. DRAKZ is a next-generation, modular financial ecosystem that we built as a team of five. The idea behind the project is simple — people today have their investments in one place, insurance in another, bank accounts somewhere else, and when they need financial advice they have to go to a separate platform entirely. We wanted to bring all of that under one roof.

🎬 **[ACTION: Scroll past the hero section. Pause briefly on the 3D card animation.]**

So what you're looking at right now is our landing page. We have designed this with a modern, premium feel — you can see the interactive 3D card model here, which represents the kind of card features that our platform supports.

🎬 **[ACTION: Continue scrolling. Show the "No Fees" section, the "Secure Protection" section, and the "Fast Transactions" section.]**

As you scroll down, we highlight the key selling points of the platform — zero hidden fees, bank-grade security, and fast transactions. These aren't just marketing claims — we've actually implemented the security layer in our backend, which I'll show you in a few minutes.

🎬 **[ACTION: Scroll down to the footer area. Then scroll back up to the top and click on the Login/Get Started button.]**

Alright, let's get into the actual platform. I'm going to log in now.

---

## 2. LOGIN & AUTHENTICATION (1:30 – 2:30)

🎬 **[ACTION: You should now be on the Login page. The page has fields for login (email/password) and also a registration tab. Show the login form.]**

So this is our authentication page. You can either register a new account or log in to an existing one. Let me quickly talk about what's happening under the hood here, because since this is a financial application, security is probably the most important thing.

When a user registers, their password is never stored as plain text. We use **bcrypt** hashing on the server side — so even if someone somehow got access to our database, they would only see a hashed string, not the actual password.

And when you log in, the server validates your credentials and returns a **JSON Web Token**, a JWT. This token is then attached to every single API request you make on the platform. It carries your user ID and your *role* — whether you're a regular user, an advisor, or an admin. This is the foundation of our role-based access control.

🎬 **[ACTION: Type in the user credentials and click Login. Wait for the dashboard to load.]**

Let me log in as a regular user first.

---

## 3. USER PANEL — Dashboard Overview (2:30 – 5:00)

🎬 **[ACTION: You are now on the User Dashboard. Pause for a moment and let the viewer see the full layout — Sidebar on the left, Header on top, and the dashboard grid in the center.]**

Alright, so we're now inside the user dashboard. This is the central hub for any user on the platform. Let me walk you through what we have here.

🎬 **[ACTION: Point your cursor at the Sidebar. Hover over each menu item slowly — Dashboard, Investments, My Privilege, FinBot, Advisors, Blog, Settings.]**

On the left, we have our navigation sidebar. From here, the user can jump to any section — Investments, My Privilege which is our asset management suite, the AI-powered FinBot, the Advisor consultation section, Blogs, and their Settings. I'll go through each one of these.

🎬 **[ACTION: Now focus on the dashboard content. Hover over the Account Summary card.]**

In the main content area, the first thing you see is the **Account Summary**. This gives users a consolidated view of their total balance, income, and expenses — everything at a glance.

🎬 **[ACTION: Move to the Credit Score widget.]**

Right next to it, we have the **Credit Score** tracker. This visualizes the user's credit score in a gauge format, so they can instantly see where they stand.

🎬 **[ACTION: Scroll down slightly to show the Spendings chart.]**

Below that, we have the **Spendings** chart. This shows weekly spending patterns — the user can track how their spending has changed over the last five weeks. It's a bar or line chart that updates dynamically based on the user's transaction data.

🎬 **[ACTION: Move to the Expense Distribution Pie chart.]**

And right next to it is the **Expense Distribution** pie chart. This breaks down spending into categories — Shopping, Food, Transport, Entertainment, Payments. So the user can immediately identify where most of their money is going.

🎬 **[ACTION: Scroll down to the Cards Carousel section.]**

Lastly on the dashboard, we have the **Cards Carousel**. Users can manage their credit and debit cards here. They can see their card number, the cardholder name, expiry date, current balance, available credit, and the credit limit. They can also add new cards.

Now, one important thing to mention about all of this data — every API call that fetches this information is protected. The backend verifies the JWT token on every request, and the data is scoped to the logged-in user's ID. So user A can never see user B's financial data. That data isolation is enforced at the database query level itself.

---

## 4. USER PANEL — Investments & Stocks (5:00 – 7:00)

🎬 **[ACTION: Click on "Investments" in the sidebar. Wait for the Investments page to load.]**

Now let's look at the Investments section.

🎬 **[ACTION: The Investments page should load with stock-related content. Show the stocks list and any charts.]**

Here, users can track their stock investments and monitor real-time market data. We've integrated a **Stock Chart** component that pulls live market data, so users can see price movements, historical performance, and trends — all within the platform itself.

🎬 **[ACTION: Scroll down or click on the Loans section if visible.]**

We also have a **Loans** tracker and a **Loan Calculator**. If a user has any active loans, they can see the outstanding amount, the EMI schedule, and the interest rate. The loan calculator lets them plan ahead — they can input the principal amount, interest rate, and tenure, and it will calculate the monthly installment for them.

🎬 **[ACTION: Briefly show the Blog section by clicking "Blog" in the sidebar.]**

And we have a **Blog** section as well where financial articles and insights are published. Users can read blog posts about market trends, financial tips, and investment strategies. These blogs can be managed from the admin panel, which I'll show later.

---

## 5. USER PANEL — My Privilege (Asset Management) (7:00 – 9:00)

🎬 **[ACTION: Click on "My Privilege" in the sidebar. Wait for it to load.]**

This is the **My Privilege** section — our comprehensive asset management suite. This is one of the most feature-rich parts of the application.

🎬 **[ACTION: Show the different tabs or sections within My Privilege — Holdings, Insurance, Properties, Transactions.]**

From here, users can manage all their assets in one place:

🎬 **[ACTION: Click on or show the Holdings section.]**

First, we have **Holdings** — this tracks all the user's financial holdings, like stocks, mutual funds, gold, or any other precious holdings. Users can add new holdings through a form.

🎬 **[ACTION: Navigate to Insurance Details.]**

Next, the **Insurance** section. Users can add and track all their insurance policies — life insurance, health insurance, vehicle insurance, whatever it may be. It shows the policy number, premium amount, coverage amount, and the due dates.

🎬 **[ACTION: Navigate to Properties.]**

Then we have **Properties**. If a user owns real estate — a flat, a house, a commercial property — they can log it here with details like the property location, current market value, purchase date, and so on. There's also a form to add new properties.

🎬 **[ACTION: Show Transactions section.]**

And finally, the **Transactions** section, where users can view their transaction history, payment receipts, and manage their financial records.

All of this data is stored securely in **MongoDB** with each record tied to the user's unique ID. And again, our middleware ensures that only the authenticated user who owns this data can access it.

---

## 6. USER PANEL — AI FinBot (9:00 – 11:00)

🎬 **[ACTION: Click on "FinBot" in the sidebar. Wait for the AI chatbot interface to load.]**

Now, this is one of the most exciting features of DRAKZ — our **AI-powered Financial Bot**, or FinBot.

🎬 **[ACTION: Show the chat interface. It should have a message input field and potentially some predefined prompt options.]**

FinBot is an intelligent conversational AI that can answer financial questions, give personalized advice, and even provide stock recommendations. It's not a generic chatbot — it's specifically trained and prompted for financial advisory use cases.

🎬 **[ACTION: Type a sample question into the chatbot, something like "What are some good ways to save money?" or "Should I invest in index funds?" and hit send. Wait for the AI response.]**

Let me ask it something. I'll type — "What are some good ways to diversify my investment portfolio?"

🎬 **[ACTION: Wait for the response to appear. Scroll through the response slowly so the viewer can read it.]**

As you can see, it gives a detailed, contextual response. It's not just giving generic answers — it analyzes the question in a financial context and provides actionable advice.

The AI service runs as a separate backend service, and all communication between the frontend and the AI is done through our secured API endpoints. The chat history is also stored in our database, in the **Chat model**, so users can come back and reference previous conversations.

🎬 **[ACTION: Also briefly show the ChatWidget in the bottom corner of the screen, if visible.]**

You might have also noticed this small chat widget at the bottom corner — this is available on every page as a quick-access way to chat with FinBot without navigating away from what you're doing.

---

## 7. USER PANEL — Advisor Consultation & Video (11:00 – 12:30)

🎬 **[ACTION: Click on "Advisors" in the sidebar. Wait for the Advisor List page to load.]**

Now, sometimes a user wants to talk to a real human expert, not just an AI. That's where our **Advisor Consultation** feature comes in.

🎬 **[ACTION: Show the list of available advisors. Each advisor card should show their name, specialization, experience, etc.]**

Here, the user can browse through our verified financial advisors. Each advisor profile shows their specialization, years of experience, and availability. The user can send a consultation request from here.

🎬 **[ACTION: Click on one of the advisors to see more details, or click "Request Consultation" or a similar button.]**

When a user requests a consultation, that request goes to the advisor's dashboard, which I'll show you next. Once the advisor approves the request, they can set up a live video session.

🎬 **[ACTION: Briefly navigate to /user/video or show the video session page.]**

And this is the **Video Session** page from the user's side. It uses **WebRTC** technology, which means the video call happens peer-to-peer — directly between the user's browser and the advisor's browser, without the video data passing through our servers. This is a huge privacy advantage for financial discussions where sensitive information might be shared on screen.

---

## 8. USER PANEL — Settings (12:30 – 13:00)

🎬 **[ACTION: Click on "Settings" in the sidebar.]**

Before we switch roles, let me quickly show the **Settings** page.

🎬 **[ACTION: Show the Settings page — it should have options for profile updates, password changes, notification preferences, etc.]**

Users can update their personal information, change their password, manage notification preferences, and configure their account. All the settings changes go through server-side validation — we have a dedicated **settings validation middleware** that checks every field before the update is saved, so no one can inject malicious data through the settings form.

---

## 9. ADVISOR PANEL (13:00 – 15:30)

🎬 **[ACTION: Log out. You'll be redirected to the login page. Now log in with the Advisor credentials.]**

Alright, now let's see the other side. I'm going to log out and log in as a **Financial Advisor**.

🎬 **[ACTION: Enter advisor credentials and log in. Wait for the Advisor Dashboard to load.]**

Notice that as soon as I log in, the system detects that this account has the "advisor" role, and it automatically redirects me to the advisor-specific dashboard. If an advisor tries to access a user page like `/user/dashboard`, the system will block it and show an "Unauthorized" page. That's our **Role-Based Access Control** in action — it's enforced both on the frontend through route guards and on the backend through the `requireRole` middleware.

🎬 **[ACTION: Show the Advisor Dashboard. It should display upcoming sessions, pending requests, and advisor-specific stats.]**

So this is the **Advisor Dashboard**. Here the advisor can see:
- Their scheduled consultations
- Pending user requests that they need to accept or decline
- An overview of their activity

🎬 **[ACTION: Show the Advisor Requests section or pending consultation requests.]**

Let me look at the pending requests. These are users who have sent consultation requests. The advisor can review the user's query, and choose to accept or reject the session.

🎬 **[ACTION: Click to accept a request or open the video session interface.]**

When a session is scheduled and it's time, the advisor joins the video call from this interface.

🎬 **[ACTION: Show the Advisor Video page at /advisor/video.]**

As I mentioned, this uses **WebRTC** for peer-to-peer video. The advisor gets their own dedicated video interface where they can see the user's camera feed, share their screen, and provide real-time financial guidance. The important thing here is that the video data is end-to-end — it doesn't get stored on our servers.

---

## 10. ADMIN PANEL — Dashboard & Analytics (15:30 – 17:00)

🎬 **[ACTION: Log out. Log in with the Super Admin credentials.]**

Now, the final and most powerful part of the platform — the **Admin Panel**. Let me log in as a Super Admin.

🎬 **[ACTION: You should now be on the Admin Dashboard with the admin sidebar layout. Pause for a moment to show the full admin interface.]**

As you can see, the admin interface has a completely different look. We have a separate sidebar with admin-specific navigation, and the dashboard is designed for platform-level oversight.

🎬 **[ACTION: Point to the Metric Cards at the top — Total Revenue, Total AUM, Total Users, Total Advisors, Pending Approvals.]**

At the top, we have the **Metric Cards**:
- **Total Revenue** — the estimated total volume of transactions on the platform.
- **Total AUM** — Assets Under Management — the combined value of all user assets tracked on DRAKZ.
- **Total Users** — with a sub-count of how many are currently active.
- **Total Advisors** — and how many are active.
- **Pending Approvals** — this shows how many advisor applications or KYC requests are waiting for the admin to act on.

🎬 **[ACTION: Scroll down to show the Advanced Analytics charts.]**

Below the metrics, we have **Advanced Analytics** — charts that show user growth trends, activity patterns, and financial metrics over time. This helps the admin make data-driven decisions about the platform.

🎬 **[ACTION: Show the Top Performing Advisors table.]**

There's also a **Top Performing Advisors** table showing the best advisors by specialization and experience.

🎬 **[ACTION: Point to the Server Load and System Logs sections.]**

And down here, we have the **Server Load** monitor and **System Logs** — which gives the admin real-time visibility into system health and recent activity on the platform. Every critical action — user creation, deletion, role changes, KYC approvals — is logged automatically through our **Morgan middleware** and stored in the admin logs model.

---

## 11. ADMIN PANEL — User & Content Management (17:00 – 18:00)

🎬 **[ACTION: Click on "User Management" in the admin sidebar.]**

Let me show the admin management tools now. First is **User Management**.

🎬 **[ACTION: Show the user directory/table with user details.]**

The admin can see all registered users, their roles, account status, and manage them. They can suspend accounts, change roles, or remove users. But even at the admin level, sensitive data like passwords remains hashed — the admin never sees any raw passwords. All actions performed by the admin are logged with timestamps.

🎬 **[ACTION: Click on "Content Management" in the sidebar.]**

Next, **Content Management**. This is where the admin can manage the blog posts and articles that appear in the user's blog section. They can create, edit, or remove content, and manage what gets published on the platform.

---

## 12. ADMIN PANEL — Verification (KYC), Support & Access Control (18:00 – 19:00)

🎬 **[ACTION: Click on "Verification" in the admin sidebar.]**

This is the **Verification** page — essentially our KYC system. When users submit identity documents for verification, those requests appear here.

🎬 **[ACTION: Show the pending verification requests with document previews and Approve/Reject buttons.]**

The admin can see the user's submitted documents, review them, and either approve or reject the verification. Each action is communicated back to the user and logged in the system.

🎬 **[ACTION: Click on "Support" in the sidebar.]**

Then we have the **Support** page where the admin can handle user queries and support tickets.

🎬 **[ACTION: Click on "Access Control" in the sidebar.]**

And this is the **Access Control** page. This is where granular admin permissions are managed. We don't just have a single "admin" role — we have a **permission-based system** where different admins can have different levels of access. For example, one admin might only have permission to manage content, while another has full access. This is enforced through our `requirePermission` middleware on the backend.

🎬 **[ACTION: Briefly show "Settings" and "Logs" pages in the admin panel.]**

And finally, the admin has their own **Settings** page for platform configuration, and a **Logs** page that shows a detailed audit trail of all administrative actions.

---

## 13. SECURITY RECAP & TECHNICAL OVERVIEW (19:00 – 19:30)

🎬 **[ACTION: You can stay on the admin Logs page, or go back to the admin dashboard as you speak. No major clicking needed here — just talk.]**

Before I wrap up, let me quickly summarize the security architecture, because as a financial platform, this was non-negotiable for us:

1. **Authentication** — We use JWT tokens that expire after a set period. Every API request is validated by our auth middleware.
2. **Password Security** — All passwords are hashed with bcrypt. No plain-text storage anywhere.
3. **Role-Based Access Control** — Three distinct roles — User, Advisor, and Admin — each with their own set of accessible routes and API endpoints, enforced both on the frontend and the backend.
4. **Granular Permissions** — Within the admin role itself, we have a permission system, so not every admin has full access.
5. **Rate Limiting** — We have rate-limiting middleware to prevent brute-force attacks and API abuse.
6. **Input Validation** — Every form submission goes through server-side validation middleware to prevent injection attacks.
7. **CORS Configuration** — Cross-Origin Resource Sharing is strictly configured so only our frontend domain can make API calls.
8. **Secure File Uploads** — We have Multer middleware that validates file types and sizes before any document upload is processed.
9. **Activity Logging** — All critical actions are logged through Morgan and our custom logging system for audit trails.
10. **WebRTC for Video** — Video calls are peer-to-peer, meaning sensitive financial discussions never pass through our servers.

---

## 14. CONCLUSION (19:30 – 20:00)

🎬 **[ACTION: Navigate back to the landing page, or just stay on the current screen.]**

So that's DRAKZ — a complete, modular, full-stack financial management ecosystem. Built using **React with Vite** on the frontend, **Express.js and Node.js** on the backend, **MongoDB** for data storage, and integrated with **AI services** and **WebRTC** for intelligent financial advisory and live video consultations.

This project was built by a team of five, and every member contributed to a specific domain — from AI integration and video advisory, to dashboards and analytics, investments and blogs, asset management, and the admin panel with UI/UX.

Thank you so much for watching. We'd love to hear any feedback or questions.

---

## 📝 Quick Reference — Checklist Before Recording

Use this checklist to make sure everything is ready before you hit record:

- [ ] Backend server is running (`npm run server`)
- [ ] Frontend dev server is running (`npm run dev`)
- [ ] AI/LLM service is running if applicable (`python llm.py`)
- [ ] Have 3 sets of login credentials ready: **User**, **Advisor**, **Admin**
- [ ] Test each login once before recording to make sure data loads properly
- [ ] Clear browser console/network tab so it looks clean on screen
- [ ] Close unrelated browser tabs
- [ ] Screen recording software is set up (record the browser tab or full screen)
- [ ] Microphone is working and audio levels are good
- [ ] Keep this script open on a second monitor or print it out
