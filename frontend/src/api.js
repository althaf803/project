import axios from 'axios';

// Create an instance of axios for Vite
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export default api;