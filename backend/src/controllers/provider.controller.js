import { providerService } from '../services/provider.service.js';
import { sendSuccess } from '../utils/response.js';

export const providerController = {
  /**
   * Get all providers
   */
  async getProviders(req, res, next) {
    try {
      const providers = await providerService.getProviders({
        specialty: req.query.specialty,
      });
      return sendSuccess(res, providers);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single provider by ID
   */
  async getProviderById(req, res, next) {
    try {
      const provider = await providerService.getProviderById(Number(req.params.id));
      return sendSuccess(res, provider);
    } catch (err) {
      next(err);
    }
  },
};
