export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const API = {
  base: BACKEND_URL,
  login: `${BACKEND_URL}/api/auth/login`,
  register: `${BACKEND_URL}/api/auth/register`,
  // ... other routes ...
  advisorClients: `${BACKEND_URL}/api/advisor/clients`,
};

export default API;