import { configureStore } from "@reduxjs/toolkit";
import advisorReducer from "./slices/advisorSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    advisor: advisorReducer,
    auth: authReducer,
  },
});

// Persist auth slice to localStorage for basic persistence
store.subscribe(() => {
  try {
    const state = store.getState();
    const { token, role, user } = state.auth || {};
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  } catch {}
});

export default store;
