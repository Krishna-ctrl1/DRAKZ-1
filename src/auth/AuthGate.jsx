import React, { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import axios from "../api/axios.api";
import { isAuthenticated } from "./auth";
import { clearAuth } from "../utils/auth.util";

const AuthGate = ({ children }) => {
  const [status, setStatus] = useState("checking"); // 'checking' | 'ok' | 'redirect'
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      // Client-side token validation first
      if (!isAuthenticated()) {
        setStatus("redirect");
        return;
      }
      try {
        await axios.get("/api/auth/me");
        setStatus("ok");
      } catch (e) {
        clearAuth();
        setStatus("redirect");
      }
    };
    check();
  }, [location.key]);

  if (status === "checking") return null; // or a spinner
  if (status === "redirect")
    return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
};

export default AuthGate;
