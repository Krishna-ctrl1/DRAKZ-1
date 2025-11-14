// src/components/deepthi/api/getCreditScore.js
// Use a Vite env var for API base (VITE_API_BASE). If not provided fall back to localhost:3001.
// This prevents the dev server returning the frontend index.html (HTML) when the backend is on a different port.

const API_BASE =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.VITE_API_BASE
    ? import.meta.env.VITE_API_BASE
    : "http://localhost:3001";

export async function getMyCreditScore(token) {
  const url = `${API_BASE}/api/credit-score/me`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  if (!res.ok) {
    // try to parse JSON error, otherwise return a generic message
    const err = await res.json().catch(() => ({}));
    throw new Error(err.msg || "Failed to fetch credit score");
  }
  return res.json();
}

// Admin / other: set credit score
export async function setCreditScore({ score, note, userId, token }) {
  const url = `${API_BASE}/api/credit-score`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({ score, note, userId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.msg || "Failed to set credit score");
  }
  return res.json();
}
