import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import API from '../../config/api.config';

// Thunk to fetch investment portfolio
export const fetchInvestments = createAsyncThunk(
  'investments/fetchInvestments',
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API.investments}/${clientId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || 'Failed to fetch investments');
    }
  }
);

const investmentSlice = createSlice({
  name: 'investments',
  initialState: {
    portfolio: [], // List of assets (Stocks, Mutual Funds)
    totalValue: 0,
    loading: false,
    error: null,
    selectedAsset: null,
  },
  reducers: {
    selectAsset: (state, action) => {
      state.selectedAsset = action.payload;
    },
    filterByAssetType: (state, action) => {
      // Note: In real apps, usually better to derive filtered lists in the selector, 
      // but simple filtering can happen here if storing separate filtered lists.
      // This is a placeholder for logic.
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestments.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolio = action.payload.assets;
        state.totalValue = action.payload.totalValue;
      })
      .addCase(fetchInvestments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { selectAsset, filterByAssetType } = investmentSlice.actions;
export default investmentSlice.reducer;