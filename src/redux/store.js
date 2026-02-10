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
// Persistence is handled by authSlice or AuthProvider directly.
// Removed redundant store.subscribe to prevent race conditions.

export default store;
