// API and WebSocket configuration
export const API_BASE_URL = 'http://localhost:3000';
export const WS_BASE_URL = 'ws://localhost:3000';

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