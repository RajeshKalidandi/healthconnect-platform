import { API_BASE_URL } from './config';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

export async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAdminAuthenticated');
      window.location.href = '/admin-login';
      throw new Error('Session expired. Please login again.');
    }
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}
