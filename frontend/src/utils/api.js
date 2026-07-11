import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // blank matches Vite local proxy, overrides in production env
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to handle session expirations globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, could clear local session states if needed
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized request.');
    }
    return Promise.reject(error);
  }
);

export default api;
