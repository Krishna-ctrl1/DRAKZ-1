import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const AuthGate = ({ children }) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You might want a spinner here
    return null;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Optional: Check if user data is loaded if you require it for all protected routes
  // if (!user) { return null; }

  return children;
};

export default AuthGate;
