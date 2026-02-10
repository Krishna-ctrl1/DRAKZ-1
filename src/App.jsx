import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./components/ziko/Home";
import LoginPage from "./components/ziko/LoginPage";
import Dashboard from "./components/deepthi/Dashboard";
import Settings from "./components/deepthi/Settings";
import AdvisorDashboard from "./components/gupta/AdvisorDashboard";
import FinBot from "./components/gupta/Finbot";
import MyPrivilege from "./components/abhinay/MyPrivilege";
import Blogs from "./components/ragamaie/BlogPage";
import Investments from "./components/ragamaie/InvestmentsPage";
import AdvisorList from "./components/gupta/AdvisorList";

// --- NEW SESSION COMPONENT IMPORTS ---
import AdvisorSession from "./components/gupta/AdvisorVideo"; // Uses file AdvisorVideo.jsx
import UserSession from "./components/gupta/UserVideo"; // Uses file UserVideo.jsx

import ProtectedRoute from "./auth/ProtectedRoute";
import AuthGate from "./auth/AuthGate";
import RoleRoute from "./auth/RoleRoute";
import Unauthorized from "./auth/Unauthorized";
import AdminLayout from "./components/ziko/admin/AdminLayout";
import AdminDashboard from "./components/ziko/admin/admin.dashboard";
import UserManagementPage from "./components/ziko/admin/UserManagementPage";
// import AdminMessages from './components/ziko/admin/AdminMessages'; // Replaced by SupportPage
import SupportPage from "./components/ziko/admin/SupportPage";
import ContentManagementPage from "./components/ziko/admin/ContentManagementPage";
import VerificationPage from "./components/ziko/admin/VerificationPage";

import AdminManagementPage from "./components/ziko/admin/AdminManagementPage";
import SettingsPage from "./components/ziko/admin/SettingsPage";
import LogsPage from "./components/ziko/admin/LogsPage";
import ChatWidget from "./components/ziko/ChatWidget"; // NEW
import { AuthProvider, useAuth } from "./context/AuthProvider";

const ChatWrapper = () => {
  const { user } = useAuth();
  return user && user.role !== 'admin' ? <ChatWidget user={user} /> : null;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <ChatWrapper />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<AuthGate><ProtectedRoute /></AuthGate>}>
            {/* ADVISOR ROUTES */}
            <Route element={<RoleRoute allowed={["advisor"]} />}>
              <Route path="/advisor/dashboard" element={<AdvisorDashboard />} />
              <Route path="/advisor/video" element={<AdvisorSession />} />
            </Route>

            {/* ADMIN ROUTES */}
            <Route element={<RoleRoute allowed={["admin"]} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/content" element={<ContentManagementPage />} />
                <Route path="/admin/verification" element={<VerificationPage />} />
                <Route path="/admin/support" element={<SupportPage />} />
                <Route path="/admin/access-control" element={<AdminManagementPage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
                <Route path="/admin/logs" element={<LogsPage />} />
              </Route>
            </Route>

            {/* USER ROUTES */}
            <Route element={<RoleRoute allowed={["user"]} />}>
              <Route path="/user/dashboard" element={<Dashboard />} />
              <Route path="/user/settings" element={<Settings />} />
              <Route path="/user/video" element={<UserSession />} />
              <Route path="/user/blog" element={<Blogs />} />
              <Route path="/user/investments" element={<Investments />} />
              <Route path="/user/finbot" element={<FinBot />} />
              <Route path="/user/privileges" element={<MyPrivilege />} />
              <Route path="/user/advisors" element={<AdvisorList />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
