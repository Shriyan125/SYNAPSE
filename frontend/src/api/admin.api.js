import { apiClient } from './client.js';

export const adminApi = {
  getStats: () => apiClient.get('/admin/stats'),
  getAppointments: (params) => apiClient.get('/admin/appointments', { params }),
};
