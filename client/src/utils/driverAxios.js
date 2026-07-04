import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) throw new Error('VITE_API_URL environment variable is missing.');

const driverAxios = axios.create({
  baseURL: `${apiUrl}/api/driver`,
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
