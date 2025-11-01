import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from './auth.js';

const ProtectedRoute = () => {
  const authed = isAuthenticated();
  const location = useLocation();

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
