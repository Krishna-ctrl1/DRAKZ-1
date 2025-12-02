import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import API from '../../config/api.config';

// Thunk to fetch summary statistics
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (period, { rejectWithValue }) => { // Accepts 'period' like 'monthly', 'yearly'
    try {
      // Example: passing query param for filtering
      const response = await axios.get(`${API.dashboardStats}?period=${period || 'all'}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || 'Failed to fetch dashboard stats');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: null, // Object containing totalRevenue, activeUsers, etc.
    recentActivities: [],
    periodFilter: 'monthly', // Default filter
    loading: false,
    error: null,
  },
  reducers: {
    setPeriodFilter: (state, action) => {
      state.periodFilter = action.payload;
    },
    clearDashboardData: (state) => {
      state.stats = null;
      state.recentActivities = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        // Assuming payload has { stats: {}, activities: [] }
        state.stats = action.payload.stats;
        state.recentActivities = action.payload.activities;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setPeriodFilter, clearDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;