const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const API = {
  base: BASE,
  login: `${BASE}/api/auth/login`,
  register: `${BASE}/api/auth/register`,
  test: `${BASE}/api/test-all`,
  // Add more endpoints later
};

export default API;