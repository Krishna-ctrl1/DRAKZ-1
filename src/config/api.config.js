const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

const API = {
  baseURL: baseURL, // This is http://localhost:3002
  
  // Your login page will call http://localhost:3002/api/auth/login
  login: `${baseURL}/api/auth/login`, 
  
  // Note: Your privilege page calls /api/privilege/*
  // This is handled by api.get() in the component itself
};

export default API;