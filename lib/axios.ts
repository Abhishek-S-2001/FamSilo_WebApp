import axios from 'axios';

let isRedirecting = false;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('family_app_token');

    // If no token at all, don't even send the request
    if (!token) {
      isRedirecting = true;
      localStorage.removeItem('user_id');
      window.location.href = '/login';
      return Promise.reject(new Error('No token'));
    }

    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 401 = expired/invalid token
    // 422 = missing header (FastAPI auto-rejects before our code runs)
    if ((status === 401 || status === 422) && typeof window !== 'undefined') {
      if (!isRedirecting) {
        isRedirecting = true;
        localStorage.removeItem('family_app_token');
        localStorage.removeItem('user_id');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;