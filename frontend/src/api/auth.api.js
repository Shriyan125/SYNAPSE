import { apiClient } from './client.js';

export const authApi = {
  register: (payload) => apiClient.post('/auth/register', payload),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  refresh: () => apiClient.post('/auth/refresh'),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/users/me'),
  updateMe: (payload) => apiClient.patch('/users/me', payload),
};
