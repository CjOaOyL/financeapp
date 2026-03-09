import axios from 'axios';

const Api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 5000,
});

export default Api;
