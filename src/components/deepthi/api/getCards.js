// src/components/deepthi/api/getCards.js

const TIMEOUT = 30000; // 30 seconds - increased to prevent premature abort
const MAX_RETRIES = 1; // Reduced retries since we're increasing timeout

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  const controller = new AbortController();
  let timeoutId = null;
  let isAborted = false;

  // Set up timeout to abort if request takes too long
  timeoutId = setTimeout(() => {
    if (!isAborted) {
      console.warn(
        "[fetchWithRetry] Request timeout after",
        TIMEOUT,
        "ms, aborting",
      );
      isAborted = true;
      controller.abort();
    }
  }, TIMEOUT);

  try {
    console.log(`[fetchWithRetry] Fetching ${url}`);
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    // Request completed - clear the timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    console.log(`[fetchWithRetry] Response received: ${res.status}`);

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Unknown error" }));
      const errorMsg = errorData.error || `HTTP ${res.status}`;
      console.error(`[fetchWithRetry] Error response: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const jsonData = await res.json();
    console.log(`[fetchWithRetry] ✓ Success`, jsonData);
    return jsonData;
  } catch (err) {
    // Clean up timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    console.error(`[fetchWithRetry] Caught error: ${err.name}: ${err.message}`);

    // Determine error type
    const isTimeoutError = err.name === "AbortError" && isAborted;
    const isNetworkError = err instanceof TypeError;

    // Only retry on timeout or network errors, NOT on HTTP errors
    if (retries > 0 && (isTimeoutError || isNetworkError)) {
      console.log(`[fetchWithRetry] Retrying (${retries} retries left)...`);
      await new Promise((r) => setTimeout(r, 1000)); // 1s delay between retries
      return fetchWithRetry(url, options, retries - 1);
    }

    throw err;
  }
}

export async function getCards({ token } = {}) {
  const authToken = token || localStorage.getItem("token");
  console.log("[getCards API] Token present:", !!authToken);
  console.log("[getCards API] Fetching from /api/cards");
  const res = await fetchWithRetry("/api/cards", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: authToken ? `Bearer ${authToken}` : "",
    },
  });
  console.log("[getCards API] Response:", res);
  return res;
}

export async function addCard(cardData, { token } = {}) {
  const authToken = token || localStorage.getItem("token");
  const res = await fetchWithRetry("/api/cards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authToken ? `Bearer ${authToken}` : "",
    },
    body: JSON.stringify(cardData),
  });
  return res;
}

export async function deleteCard(cardId, { token } = {}) {
  const authToken = token || localStorage.getItem("token");
  const res = await fetchWithRetry(`/api/cards/${cardId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: authToken ? `Bearer ${authToken}` : "",
    },
  });
  return res;
}
