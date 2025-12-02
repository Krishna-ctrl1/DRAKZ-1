import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import API from '../../config/api.config';

// Thunk to fetch all users for the Admin panel
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API.adminUsers);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || 'Failed to fetch users');
    }
  }
);

// Thunk to ban/suspend a user
export const suspendUser = createAsyncThunk(
    'admin/suspendUser',
    async (userId, { rejectWithValue }) => {
      try {
        const response = await axios.post(`${API.adminSuspend}/${userId}`);
        return response.data; // Returns updated user or success msg
      } catch (error) {
        return rejectWithValue(error.response?.data?.msg || 'Failed to suspend user');
      }
    }
  );

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    loading: false,
    actionLoading: false, // For specific actions like suspend
    error: null,
  },
  reducers: {
    // Optimistic update example
    removeUserFromList: (state, action) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Suspend User
      .addCase(suspendUser.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(suspendUser.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(suspendUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { removeUserFromList } = adminSlice.actions;
export default adminSlice.reducer;