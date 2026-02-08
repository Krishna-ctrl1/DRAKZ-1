import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.api';

// ==================== ADVISOR THUNKS ====================

// Fetch clients for advisor dashboard
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

// Fetch pending requests for advisor
export const fetchAdvisorRequests = createAsyncThunk(
  'advisor/fetchRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/advisor/requests');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || 'Failed to fetch requests');
    }
  }
);

// Respond to a client request
export const respondToRequest = createAsyncThunk(
  'advisor/respondToRequest',
  async ({ requestId, action }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/advisor/requests/${requestId}/respond`, { action });
      return { requestId, action, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || 'Failed to respond to request');
    }
  }
);

// Fetch advisor stats
export const fetchAdvisorStats = createAsyncThunk(
  'advisor/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/advisor/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || 'Failed to fetch stats');
    }
  }
);

// ==================== USER THUNKS ====================

// Fetch available advisors (for users)
export const fetchAvailableAdvisors = createAsyncThunk(
  'advisor/fetchAvailableAdvisors',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('[ADVISOR-SLICE] Calling /api/user/advisors...');
      console.log('[ADVISOR-SLICE] localStorage token:', token ? 'EXISTS' : 'MISSING');

      if (!token) {
        console.error('[ADVISOR-SLICE] No token available, aborting request');
        return rejectWithValue('No authentication token available');
      }

      const response = await api.get('/api/user/advisors');

      console.log('[ADVISOR-SLICE] Response:', response.data?.length, 'advisors');
      return response.data;
    } catch (error) {
      console.error('[ADVISOR-SLICE] Error fetching advisors:', error.response?.status, error.response?.data);
      return rejectWithValue(error.response?.data?.msg || 'Failed to fetch advisors');
    }
  }
);

// Request an advisor
export const requestAdvisor = createAsyncThunk(
  'advisor/requestAdvisor',
  async ({ advisorId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/user/advisor/request', { advisorId, message });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || 'Failed to send request');
    }
  }
);

// Fetch user's advisor status
export const fetchMyAdvisorStatus = createAsyncThunk(
  'advisor/fetchMyStatus',
  async (_, { rejectWithValue }) => {
    try {
      // Log token status for debugging
      const token = localStorage.getItem('token');
      console.log('[ADVISOR-SLICE] fetchMyAdvisorStatus - Token exists:', !!token);
      
      if (!token) {
        console.error('[ADVISOR-SLICE] No token available, aborting status check');
        return rejectWithValue('No authentication token available');
      }
      
      // DO NOT pass headers explicitly - let the axios interceptor handle it!
      const response = await api.get('/api/user/advisor/status');
      return response.data;
    } catch (error) {
      console.error('[ADVISOR-SLICE] fetchMyAdvisorStatus Error:', error.response?.status);
      return rejectWithValue(error.response?.data?.msg || 'Failed to fetch status');
    }
  }
);

// Cancel a pending request
export const cancelAdvisorRequest = createAsyncThunk(
  'advisor/cancelRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/user/advisor/request/${requestId}`);
      return requestId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || 'Failed to cancel request');
    }
  }
);

// ==================== SLICE ====================

const advisorSlice = createSlice({
  name: 'advisor',
  initialState: {
    // Advisor dashboard state
    clients: [],
    pendingRequests: [],
    stats: { totalClients: 0, pendingRequests: 0 },
    selectedClient: null,

    // User advisor browsing state
    availableAdvisors: [],
    myAdvisor: null,
    myPendingRequests: [],
    recentDeclined: [],

    // Loading states
    loading: false,
    requestsLoading: false,
    advisorsLoading: false,
    statusLoading: false,

    // Errors
    error: null,
    successMessage: null,
  },
  reducers: {
    selectClient: (state, action) => {
      state.selectedClient = action.payload;
    },
    clearSelectedClient: (state) => {
      state.selectedClient = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch clients
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
      })

      // Fetch advisor requests
      .addCase(fetchAdvisorRequests.pending, (state) => {
        state.requestsLoading = true;
      })
      .addCase(fetchAdvisorRequests.fulfilled, (state, action) => {
        state.requestsLoading = false;
        state.pendingRequests = action.payload;
      })
      .addCase(fetchAdvisorRequests.rejected, (state, action) => {
        state.requestsLoading = false;
        state.error = action.payload;
      })

      // Respond to request
      .addCase(respondToRequest.fulfilled, (state, action) => {
        const { requestId, action: responseAction } = action.payload;
        state.pendingRequests = state.pendingRequests.filter(r => r._id !== requestId);
        state.successMessage = responseAction === 'approve' ? 'Client approved!' : 'Request declined';
        if (responseAction === 'approve') {
          state.stats.totalClients += 1;
        }
        state.stats.pendingRequests = Math.max(0, state.stats.pendingRequests - 1);
      })
      .addCase(respondToRequest.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch stats
      .addCase(fetchAdvisorStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // Fetch available advisors
      .addCase(fetchAvailableAdvisors.pending, (state) => {
        state.advisorsLoading = true;
      })
      .addCase(fetchAvailableAdvisors.fulfilled, (state, action) => {
        state.advisorsLoading = false;
        state.availableAdvisors = action.payload;
      })
      .addCase(fetchAvailableAdvisors.rejected, (state, action) => {
        state.advisorsLoading = false;
        state.error = action.payload;
      })

      // Request advisor
      .addCase(requestAdvisor.fulfilled, (state, action) => {
        state.successMessage = 'Request sent successfully!';
        state.myPendingRequests.push(action.payload.request);
      })
      .addCase(requestAdvisor.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch my advisor status
      .addCase(fetchMyAdvisorStatus.pending, (state) => {
        state.statusLoading = true;
      })
      .addCase(fetchMyAdvisorStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.myAdvisor = action.payload.assignedAdvisor;
        state.myPendingRequests = action.payload.pendingRequests;
        state.recentDeclined = action.payload.recentDeclined;
      })
      .addCase(fetchMyAdvisorStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.error = action.payload;
      })

      // Cancel request
      .addCase(cancelAdvisorRequest.fulfilled, (state, action) => {
        state.myPendingRequests = state.myPendingRequests.filter(r => r._id !== action.payload);
        state.successMessage = 'Request cancelled';
      });
  },
});

export const { selectClient, clearSelectedClient, clearMessages } = advisorSlice.actions;
export default advisorSlice.reducer;