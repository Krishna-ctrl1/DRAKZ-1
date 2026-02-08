import { configureStore } from "@reduxjs/toolkit";
import advisorReducer from "./slices/advisorSlice";
import authReducer from "./slices/authSlice";
import stocksReducer from "./slices/stocksSlice";

export const store = configureStore({
  reducer: {
    advisor: advisorReducer,
    auth: authReducer,
    stocks: stocksReducer,
  },
});

// Persist auth slice to localStorage for basic persistence
// IMPORTANT: Only SET values, never REMOVE them automatically here.
// This prevents race conditions where initialization wipes out valid tokens.
store.subscribe(() => {
  try {
    const state = store.getState();
    const { token, role, user } = state.auth || {};
    
    // Only persist if values are explicitly set (truthy)
    // Never remove - that should only happen via explicit logout action
    if (token) {
      localStorage.setItem("token", token);
    }
    if (role) {
      localStorage.setItem("role", role);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  } catch {}
});

export default store;
