import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'https://agrifleet.onrender.com'}/api/v1`,
  timeout: 10000,
});

// Automatically inject JWT access token into outgoing headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agrifleet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
