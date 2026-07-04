import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      useAuthStore.getState().clearAuth();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    if (status === 403 && !window.location.pathname.includes('/403')) {
      window.location.href = '/403';
    }
    return Promise.reject(error);
  },
);

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export default client;
