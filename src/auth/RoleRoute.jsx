import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const RoleRoute = ({ allowed }) => {
  const { user, isLoading } = useAuth(); // 'admin' | 'advisor' | 'user' | null

  if (isLoading) return null;

  if (!user || !user.role) {
    console.log('[RoleRoute] ❌ No user/role found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('[RoleRoute] Checking access:', { role: user.role, allowed });

  if (!allowed.includes(user.role)) {
    console.log('[RoleRoute] ❌ Role not allowed, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('[RoleRoute] ✅ Access granted');
  return <Outlet />;
};

export default RoleRoute;
