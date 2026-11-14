import { providerRepository } from '../repositories/provider.repository.js';
import { NotFoundError } from '../utils/errors.js';
import { cache } from '../utils/cache.js';

export const providerService = {
  /**
   * Get all providers with caching
   * @param {object} filter - { specialty }
   */
  async getProviders({ specialty = null } = {}) {
    const cacheKey = `providers:list:${specialty || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const providers = await providerRepository.findAll({ specialty });
    cache.set(cacheKey, providers, 300); // 5 min TTL
    return providers;
  },

  /**
   * Get single provider by ID
   * @param {number} id
   */
  async getProviderById(id) {
    const provider = await providerRepository.findById(id);
    if (!provider) {
      throw new NotFoundError(`Provider with ID ${id} not found`);
    }
    return provider;
  },
};
