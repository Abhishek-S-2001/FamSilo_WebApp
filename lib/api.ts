// lib/axios.ts

import axios from 'axios';

// Create a custom axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 1. Request Interceptor: Automatically attach the token to every single request
api.interceptors.request.use((config) => {
  // We check if window is defined to ensure this only runs on the client-side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('family_app_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 2. Response Interceptor: Catch expired tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend yells "401 Unauthorized" (Expired or invalid token)
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        // Nuke the dead token
        localStorage.removeItem('family_app_token');
        // Teleport the user back to the login screen
        window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;