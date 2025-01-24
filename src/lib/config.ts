// API and WebSocket configuration
const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment
  ? 'http://localhost:3000/api'
  : 'https://healthconnect-backend.onrender.com/api';

export const WS_BASE_URL = isDevelopment
  ? 'ws://localhost:3000'
  : 'wss://healthconnect-backend.onrender.com';

// Supabase configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Feature flags
export const DEMO_MODE = true;

export const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdminAuthenticated');
    window.location.href = '/admin-login';
    return 'Session expired. Please login again.';
  }
  return error.message || 'An error occurred. Please try again.';
};