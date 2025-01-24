// API and WebSocket configuration
const isDevelopment = import.meta.env.VITE_APP_MODE !== 'production';
const API_URL = import.meta.env.VITE_API_URL || 'https://healthconnect-platform.onrender.com/api';

export const API_BASE_URL = isDevelopment
  ? 'http://localhost:3000/api'
  : API_URL;

export const WS_BASE_URL = isDevelopment
  ? 'ws://localhost:3000'
  : API_URL.replace('http', 'ws');

// Supabase configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Feature flags
export const DEMO_MODE = true;

export const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const handleApiError = (error: any) => {
  if (error.message === 'Failed to fetch') {
    return 'Unable to connect to server. Please check your internet connection.';
  }
  if (error.status === 401) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdminAuthenticated');
    window.location.href = '/admin-login';
    return 'Session expired. Please login again.';
  }
  return error.message || 'An error occurred. Please try again.';
};