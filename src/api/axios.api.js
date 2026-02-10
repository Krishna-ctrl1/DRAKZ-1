import axios from "axios";
import API from "../config/api.config.js";
// Removed legacy getToken import
// import { getToken } from "../auth/auth.js";

const instance = axios.create({
  baseURL: API.base,
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR - Attach authentication token
const requestInterceptor = instance.interceptors.request.use((config) => {
  // Try getting token from localStorage
  let token = localStorage.getItem("token");

  // Legacy fallback removed



  const method = config.method?.toUpperCase() || "UNKNOWN";
  const url = config.url || "unknown";

  console.log(`\n[AXIOS-REQ] ${method} ${url}`);

  // Ensure headers object exists
  if (!config.headers) {
    config.headers = {};
  }

  
 if (token && token.length > 0) {
  if (!config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`[AXIOS-REQ] ✓ Authorization header attached`);
  }
} else {
  console.warn(`[AXIOS-REQ] ✗ No token found to attach`);
}
// Attach token if available
  /* if (token && token.length > 0) {
    // Check if Authorization header is already set (e.g. by explicit config)
    if (!config.headers.Authorization) {
       config.headers.Authorization = `Bearer ${token}`;
       console.log(`[AXIOS-REQ] ✓ Authorization header attached`);
    } else {
       console.log(`[AXIOS-REQ] ! Authorization header already present`);
    }

    if (!config.headers["x-auth-token"]) {
       //config.headers["x-auth-token"] = token;
       console.log(`[AXIOS-REQ] ✓ x-auth-token header attached`);
    }
  } else {
    console.warn(`[AXIOS-REQ] ✗ No token found to attach`);
  } */

  config.metadata = { retryCount: 0 };
  return config;
});

console.log("[AXIOS-INIT] ✓ Request interceptor registered, ID:", requestInterceptor);

// RESPONSE INTERCEPTOR - Handle errors and retries
 instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;

    // Handle 401 Unauthorized
    // Handle 401 Unauthorized
    if (err?.response?.status === 401) {
      console.error(
        `[AXIOS-ERR] 🚫 401 Unauthorized on ${config?.url}`,
        err.response?.data,
      );

      // FORCE LOGOUT
      console.warn("[AXIOS-ERR] Session expired or invalid. Logging out.");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
          window.location.replace("/login");
      }
      return Promise.reject(err);
    }
 


    // Retry on timeout or 5xx errors (max 2 retries)
    const shouldRetry =
      (err.code === "ECONNABORTED" || err?.response?.status >= 500) &&
      config?.metadata?.retryCount < 2;

    if (shouldRetry) {
      config.metadata.retryCount++;
      console.log(
        `[AXIOS-ERR] ⚠️ Retry ${config.metadata.retryCount}/2 for ${config?.url}`,
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * config.metadata.retryCount),
      );

      return instance(config);
    }

    return Promise.reject(err);
  },
);

export default instance;
