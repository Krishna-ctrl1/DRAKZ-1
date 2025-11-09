import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getRole } from '../utils/auth.util.js';

const RoleRoute = ({ allowed }) => {
  const role = getRole(); // 'admin' | 'advisor' | 'user' | null

  if (!role) return <Navigate to="/login" replace />;
  if (!allowed.includes(role)) {
    // Optional: send to a dedicated "Unauthorized" page or home
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default RoleRoute;
