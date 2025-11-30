const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const API = {
  base: BASE,
  login: `${BASE}/api/auth/login`,
  register: `${BASE}/api/auth/register`,
  // ... other routes ...
  advisorClients: `${BASE}/api/advisor/clients`,
};

export default API;