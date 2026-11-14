import { apiClient } from './client.js';

export const providersApi = {
  getAll: (params) => apiClient.get('/providers', { params }),
  getById: (id) => apiClient.get(`/providers/${id}`),
  getSlots: (providerId, params) => apiClient.get(`/providers/${providerId}/slots`, { params }),
};
