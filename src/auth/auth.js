export function getToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("[AUTH] getToken: token is null/undefined in localStorage");
      // List all localStorage keys for debugging
      const keys = Object.keys(localStorage);
      console.warn("[AUTH] localStorage keys available:", keys);
    }
    return token;
  } catch (e) {
    console.error("[AUTH] getToken: Error accessing localStorage:", e.message);
    return null;
  }
}

export function getRole() {
  return localStorage.getItem("role");
}

export function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload?.exp) return true;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function isAuthenticated() {
  const token = getToken();
  return isTokenValid(token);
}
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user"); // if you store it
}
