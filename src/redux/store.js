import { configureStore } from '@reduxjs/toolkit';
import advisorReducer from './slices/advisorSlice';

export const store = configureStore({
  reducer: {
    advisor: advisorReducer,
  },
});

export default store;