import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./components/ziko/Home";
import LoginPage from "./components/ziko/LoginPage";
import Dashboard from "./components/deepthi/Dashboard";
import AdvisorDashboard from "./components/gupta/advisor.dashboard";
import FinBot from "./components/gupta/Finbot";
import MyPrivilege from "./components/abhinay/MyPrivilege";

import ProtectedRoute from "./auth/ProtectedRoute";
import RoleRoute from "./auth/RoleRoute";
import Unauthorized from "./auth/Unauthorized";

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
          <Route element={<RoleRoute allowed={['advisor']} />}>
            <Route path="/advisor/dashboard" element={<AdvisorDashboard />} />
          </Route>

          {/* Role: admin-only */}
          <Route element={<RoleRoute allowed={['admin']} />}>
            <Route path="/admin-dashboard" element={<MyPrivilege />} />
          </Route>

          {/* Role: user-only */}
          <Route element={<RoleRoute allowed={['user']} />}>
            <Route path="/user/dashboard" element={<Dashboard />} />
            <Route path="/user/finbot" element={<FinBot />} />
            <Route path="/user/privileges" element={<MyPrivilege />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
