import axios from 'axios';

// In production the API is served from the same domain (Vercel), so paths stay relative.
export const ASSET_BASE_URL =
  import.meta.env.VITE_ASSET_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:3002');

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `${ASSET_BASE_URL}/api`,
  withCredentials: true, // Crucial for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or was modified, we clear localStorage and redirect to login
    if (error.response && error.response.status === 401) {
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/admin/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
