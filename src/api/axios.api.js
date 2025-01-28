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
  const token = getToken();
  const method = config.method?.toUpperCase() || "UNKNOWN";
  const url = config.url || "unknown";

  console.log(`\n[AXIOS-REQ] ${method} ${url}`);
  console.log(`[AXIOS-REQ] Interceptor is RUNNING`);

  if (!token) {
    console.warn(`[AXIOS-REQ] ⚠️ No token in localStorage`);
  } else {
    console.log(`[AXIOS-REQ] ✓ Token found (${token.substring(0, 10)}...)`);
  }

  // Ensure headers object exists
  if (!config.headers) {
    console.log("[AXIOS-REQ] Creating headers object");
    config.headers = {};
  }

  // Attach token if available
  if (token && token.length > 0) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers["x-auth-token"] = token;
    console.log(`[AXIOS-REQ] ✓ Token attached to headers`);
  } else {
    console.warn(`[AXIOS-REQ] ✗ No token to attach`);
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
        console.log("[AXIOS-ERR] Clearing invalid token from storage");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
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
