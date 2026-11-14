import { apiClient } from './client.js';

export const appointmentsApi = {
  getAll: (params) => apiClient.get('/appointments', { params }),
  getById: (id) => apiClient.get(`/appointments/${id}`),
  create: (payload) => apiClient.post('/appointments', payload),
  reschedule: (id, payload) => apiClient.patch(`/appointments/${id}/reschedule`, payload),
  cancel: (id, payload) => apiClient.patch(`/appointments/${id}/cancel`, payload),
};
