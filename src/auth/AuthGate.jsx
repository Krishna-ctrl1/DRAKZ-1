import React, { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import axios from "../api/axios.api";
import { isAuthenticated } from "./auth";
import { clearAuth } from "../utils/auth.util";

const AuthGate = ({ children }) => {
  const [status, setStatus] = useState("checking"); // 'checking' | 'ok' | 'redirect'
  const location = useLocation();

  useEffect(() => {
    const runCheck = async () => {
      // First, rely on local token validity (fast, avoids over-eager redirects)
      const authed = isAuthenticated();
      console.log("[AUTHGATE] isAuthenticated:", authed);
      if (!authed) {
        console.log("[AUTHGATE] Not authenticated, redirecting to login");
        setStatus("redirect");
        return;
      }

      // Soft server-side validation: do NOT redirect on transient failures
      try {
        console.log("[AUTHGATE] Validating token with /api/auth/me...");
        await axios.get("/api/auth/me");
        console.log("[AUTHGATE] ✓ Token validation passed");
        setStatus("ok");
      } catch (e) {
        // If server check fails but local token is valid, proceed without redirect
        console.warn("[AUTHGATE] /api/auth/me check failed, but local token valid. Status:", e?.response?.status);
        setStatus("ok");
      }
    };

    runCheck();
  }, [location.key]);

  if (status === "checking") return null; // or a spinner
  if (status === "redirect")
    return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
};

export default AuthGate;
