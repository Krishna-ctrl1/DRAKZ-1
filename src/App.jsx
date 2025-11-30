import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./components/ziko/Home";
import LoginPage from "./components/ziko/LoginPage";
import Dashboard from "./components/deepthi/Dashboard";
import AdvisorDashboard from "./components/gupta/AdvisorDashboard"; 
import AdvisorVideo from "./components/gupta/AdvisorVideo";       
//import UserVideo from "./components/gupta/UserVideo";            
import FinBot from "./components/gupta/Finbot";
import MyPrivilege from "./components/abhinay/MyPrivilege";
import Blogs from "./components/ragamaie/BlogPage";
import Investments from "./components/ragamaie/InvestmentsPage";

import ProtectedRoute from "./auth/ProtectedRoute";
import RoleRoute from "./auth/RoleRoute";
import Unauthorized from "./auth/Unauthorized";

import AdminDashboard from "./components/ziko/admin/admin.dashboard";
import AdminLayout from "./components/ziko/admin/AdminLayout";
import UserManagementPage from "./components/ziko/admin/UserManagementPage";
import ContentManagementPage from "./components/ziko/admin/ContentManagementPage";
import SettingsPage from "./components/ziko/admin/SettingsPage";
import LogsPage from "./components/ziko/admin/LogsPage";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Auth required */}
        <Route element={<ProtectedRoute />}>
          
          {/* Role: advisor-only */}
          <Route element={<RoleRoute allowed={["advisor"]} />}>
            <Route path="/advisor/dashboard" element={<AdvisorDashboard />} />
            <Route path="/advisor/video" element={<AdvisorVideo />} /> {/* <--- ADDED */}
          </Route>

          {/* Role: admin-only */}
          <Route element={<RoleRoute allowed={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/content" element={<ContentManagementPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
              <Route path="/admin/logs" element={<LogsPage />} />
            </Route>
          </Route>

          {/* Role: user-only */}
          <Route element={<RoleRoute allowed={["user"]} />}>
            <Route path="/user/dashboard" element={<Dashboard />} />
            <Route path="/user/blog" element={<Blogs/>} />
            <Route path="/user/investments" element={<Investments />} />
            <Route path="/user/finbot" element={<FinBot />} />
            <Route path="/user/privileges" element={<MyPrivilege />} />
            {/* <Route path="/user/video" element={<UserVideo />} /> */}
          </Route>

        </Route>
      </Routes>
    </div>
  );
}

export default App;