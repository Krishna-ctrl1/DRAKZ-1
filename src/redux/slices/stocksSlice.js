import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "http://localhost:3001";

/**
 * Fetch user's stocks (REAL API)
 */
export const fetchStocks = createAsyncThunk(
  "stocks/fetchStocks",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/api/user-investments`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch stocks");
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.message || "Stocks fetch failed");
    }
  }
);

const stocksSlice = createSlice({
  name: "stocks",
  initialState: {
    list: [],
    loading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {
    clearStocks: (state) => {
      state.list = [];
      state.lastUpdated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStocks } = stocksSlice.actions;
export default stocksSlice.reducer;
