import { apiClient } from './client.js';

export const servicesApi = {
  getAll: (params) => apiClient.get('/services', { params }),
  getById: (id) => apiClient.get(`/services/${id}`),
};
