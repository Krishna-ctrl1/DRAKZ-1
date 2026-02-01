import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getRole } from '../utils/auth.util.js';

const RoleRoute = ({ allowed }) => {
  const role = getRole(); // 'admin' | 'advisor' | 'user' | null

  console.log('[RoleRoute] Checking access:', { role, allowed });

  if (!role) {
    console.log('[RoleRoute] ❌ No role found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  if (!allowed.includes(role)) {
    console.log('[RoleRoute] ❌ Role not allowed, redirecting to home');
    // Optional: send to a dedicated "Unauthorized" page or home
    return <Navigate to="/" replace />;
  }
  
  console.log('[RoleRoute] ✅ Access granted');
  return <Outlet />;
};

export default RoleRoute;
