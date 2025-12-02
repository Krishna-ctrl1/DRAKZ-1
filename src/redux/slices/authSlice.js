import { createSlice } from "@reduxjs/toolkit";

const initialUser = (() => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
})();

const initialState = {
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,
  user: initialUser,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      const { token, role, user } = action.payload;
      state.loading = false;
      state.token = token;
      state.role = role;
      state.user = user || null;
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload || "Login failed";
    },
    logout(state) {
      state.token = null;
      state.role = null;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setUser } =
  authSlice.actions;
export default authSlice.reducer;
