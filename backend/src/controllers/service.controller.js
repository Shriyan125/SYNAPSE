import { serviceService } from '../services/service.service.js';
import { sendSuccess } from '../utils/response.js';

export const serviceController = {
  /**
   * Get all services
   */
  async getServices(req, res, next) {
    try {
      const activeOnly = req.query.all !== 'true';
      const services = await serviceService.getServices(activeOnly);
      return sendSuccess(res, services);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get service by ID
   */
  async getServiceById(req, res, next) {
    try {
      const service = await serviceService.getServiceById(Number(req.params.id));
      return sendSuccess(res, service);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create a new service (Admin or authorized)
   */
  async createService(req, res, next) {
    try {
      const service = await serviceService.createService(req.body);
      return sendSuccess(res, service, 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update service (Admin or authorized)
   */
  async updateService(req, res, next) {
    try {
      const service = await serviceService.updateService(Number(req.params.id), req.body);
      return sendSuccess(res, service, 200);
    } catch (err) {
      next(err);
    }
  },
};
