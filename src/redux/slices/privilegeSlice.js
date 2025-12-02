import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import API from '../../config/api.config';

// Thunk to fetch available roles and permissions
export const fetchRoles = createAsyncThunk(
  'privileges/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API.rolesAndPermissions);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || 'Failed to fetch roles');
    }
  }
);

const privilegeSlice = createSlice({
  name: 'privileges',
  initialState: {
    roles: [], // e.g., ['Admin', 'Editor', 'Viewer']
    permissions: {}, // e.g., { 'Admin': ['read', 'write', 'delete'] }
    loading: false,
    error: null,
    currentRole: 'Viewer', // Default fallback
  },
  reducers: {
    assignRole: (state, action) => {
      state.currentRole = action.payload;
    },
    resetPrivileges: (state) => {
      state.roles = [];
      state.permissions = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.roles;
        state.permissions = action.payload.permissions;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { assignRole, resetPrivileges } = privilegeSlice.actions;
export default privilegeSlice.reducer;