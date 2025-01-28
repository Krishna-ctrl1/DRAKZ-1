import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.api';

// Thunk to fetch clients from Backend
export const fetchClients = createAsyncThunk(
  'advisor/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/advisor/clients');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || 'Failed to fetch clients');
    }
  }
);

const advisorSlice = createSlice({
  name: 'advisor',
  initialState: {
    clients: [],
    loading: false,
    error: null,
    selectedClient: null,
  },
  reducers: {
    selectClient: (state, action) => {
      state.selectedClient = action.payload;
    },
    clearSelectedClient: (state) => {
      state.selectedClient = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { selectClient, clearSelectedClient } = advisorSlice.actions;
export default advisorSlice.reducer;