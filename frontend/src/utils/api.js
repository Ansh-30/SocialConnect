import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,

  headers: {
    'Content-Type': 'application/json',
  },

  withCredentials: true,
});


// ─────────────────────────────────────────────
// Request Interceptor
// ─────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('sc_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ─────────────────────────────────────────────
// Response Interceptor
// ─────────────────────────────────────────────

api.interceptors.response.use(

  (response) => response,

  (error) => {

    // Unauthorized
    if (error.response?.status === 401) {

      localStorage.removeItem('sc_token');

      localStorage.removeItem('sc_user');

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;