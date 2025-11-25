// src/components/deepthi/api/getSpendings.js

export async function fetchWeeklySpendings({ weeks = 5, token } = {}) {
  const res = await fetch(`/api/spendings/weekly?weeks=${weeks}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token
        ? `Bearer ${token}`
        : localStorage.getItem("token")
          ? `Bearer ${localStorage.getItem("token")}`
          : "",
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ msg: "failed" }));
    throw new Error(err.msg || "Failed to fetch");
  }
  return res.json();
}

export async function fetchRecentSpendings({ limit = 30, token } = {}) {
  const res = await fetch(`/api/spendings/list?limit=${limit}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token
        ? `Bearer ${token}`
        : localStorage.getItem("token")
          ? `Bearer ${localStorage.getItem("token")}`
          : "",
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ msg: "failed" }));
    throw new Error(err.msg || "Failed to fetch list");
  }
  return res.json();
}
