import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.orqivatech.com/api/v1';


export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('orqiva_admin_token');
};

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('orqiva_admin_token', token);
    } else {
      localStorage.removeItem('orqiva_admin_token');
    }
  }
};

export async function apiRequest(endpoint, { method = 'GET', body = null, headers = {}, isFormData = false } = {}) {
  const token = getAuthToken();

  const requestHeaders = {
    ...headers,
  };

  if (!isFormData) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? (isFormData ? body : JSON.stringify(body)) : null,
    });

    // Handle CSV or file downloads
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/csv')) {
      const blob = await response.blob();
      return blob;
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        if (!window.location.pathname.includes('/login')) {
          setAuthToken(null);
          localStorage.removeItem('orqiva_admin_user');
          window.location.href = '/login';
        }
      }

      const errorMessage = data.message || (data.errors && data.errors[0]?.message) || 'An unexpected error occurred.';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
  upload: (endpoint, formData) => apiRequest(endpoint, { method: 'POST', body: formData, isFormData: true }),
};
