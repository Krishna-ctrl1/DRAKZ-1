import axios from "axios";
import API from "../config/api.config.js";
import { getToken } from "../auth/auth.js";

const instance = axios.create({
  baseURL: API.base,
  timeout: 8000,
});

console.log("[AXIOS-INIT] ✓ Axios instance created");
console.log("[AXIOS-INIT] Base URL:", API.base);
console.log("[AXIOS-INIT] Registering request interceptor...");

// REQUEST INTERCEPTOR - Attach authentication token
const requestInterceptor = instance.interceptors.request.use((config) => {
  // Try getting token from auth helper first
  let token = localStorage.getItem("token");

if (!token) {
  token = getToken();
}


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
    if (err?.response?.status === 401) {
      console.error(
        `[AXIOS-ERR] 🚫 401 Unauthorized on ${config?.url}`,
        err.response?.data,
      );

      // Only clear token if one exists (prevent double-logout)
      const tokenExists = localStorage.getItem("token");
      if (tokenExists) {
        console.warn("[AXIOS-ERR] Valid session might be expired, but suppressing auto-logout for stability.");
        // console.log("[AXIOS-ERR] Clearing invalid token from storage");
        // localStorage.removeItem("token");
        // localStorage.removeItem("role");
        // localStorage.removeItem("user");
        // window.location.replace("/login");
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
