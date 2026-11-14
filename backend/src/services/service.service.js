import { serviceRepository } from '../repositories/service.repository.js';
import { NotFoundError } from '../utils/errors.js';
import { cache } from '../utils/cache.js';

export const serviceService = {
  /**
   * Get all active services with caching
   */
  async getServices(activeOnly = true) {
    const cacheKey = `services:list:${activeOnly ? 'active' : 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const services = await serviceRepository.findAll(activeOnly);
    cache.set(cacheKey, services, 300); // 5 min TTL
    return services;
  },

  /**
   * Get single service by ID
   */
  async getServiceById(id) {
    const service = await serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError(`Service with ID ${id} not found`);
    }
    return service;
  },

  /**
   * Create a new service and invalidate cache
   */
  async createService({ name, description, durationMinutes, price }) {
    const service = await serviceRepository.create({
      name,
      description,
      durationMinutes,
      price,
    });
    cache.invalidatePrefix('services:list');
    return service;
  },

  /**
   * Update existing service and invalidate cache
   */
  async updateService(id, updates) {
    const existing = await serviceRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Service with ID ${id} not found`);
    }

    const updated = await serviceRepository.update(id, updates);
    cache.invalidatePrefix('services:list');
    return updated;
  },
};
