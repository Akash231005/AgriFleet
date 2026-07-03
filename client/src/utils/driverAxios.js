import axios from 'axios';

const driverAxios = axios.create({
  baseURL: import.meta.env.VITE_DRIVER_API_URL || 'https://agrifleet.onrender.com/api/driver',
  timeout: 10000,
});

driverAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('driverToken') || localStorage.getItem('agrifleet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default driverAxios;
