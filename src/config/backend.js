// Centralized backend URL configuration for production deployments
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Helper function to get full URL for API endpoints
export const getApiUrl = (path) => `${BACKEND_URL}${path}`;

// Helper function to get full URL for file uploads/assets
export const getAssetUrl = (path) => `${BACKEND_URL}${path}`;

export default BACKEND_URL;
