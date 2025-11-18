import axios from "axios";
import API from "../config/api.config.js";
import { getToken } from "../auth/auth.js";

const instance = axios.create({
  baseURL: API.baseURL, // http://localhost:3002
});

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default instance;