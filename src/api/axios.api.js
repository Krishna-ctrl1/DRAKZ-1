import axios from "axios";
import API from "../config/api.config.js";
import { getToken } from "../auth/auth.js";

const instance = axios.create({
  baseURL: API.base,
  timeout: 8000, // 8 seconds - faster timeout for better UX
});

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Add retry counter
  config.metadata = { retryCount: 0 };
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;

    // Handle 401 - redirect to login
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
      return Promise.reject(err);
    }

    // Retry on timeout or 5xx errors (max 2 retries)
    const shouldRetry =
      (err.code === "ECONNABORTED" || err?.response?.status >= 500) &&
      config?.metadata?.retryCount < 2;

    if (shouldRetry) {
      config.metadata.retryCount++;
      console.log(
        `⚠️ Retry attempt ${config.metadata.retryCount} for ${config.url}`,
      );

      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * config.metadata.retryCount),
      );

      return instance(config);
    }

    return Promise.reject(err);
  },
);

export default instance;
