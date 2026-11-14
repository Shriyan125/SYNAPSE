import { apiClient } from './client.js';

export const slotsApi = {
  create: (payload) => apiClient.post('/slots', payload),
  update: (id, payload) => apiClient.patch(`/slots/${id}`, payload),
  delete: (id) => apiClient.delete(`/slots/${id}`),
};
