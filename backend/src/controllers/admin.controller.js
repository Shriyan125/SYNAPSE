import { adminService } from '../services/admin.service.js';
import { sendSuccess } from '../utils/response.js';

export const adminController = {
  /**
   * Get administrative stats
   */
  async getStats(req, res, next) {
    try {
      const stats = await adminService.getStats();
      return sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Admin view of all appointments
   */
  async getAllAppointments(req, res, next) {
    try {
      const result = await adminService.getAllAppointments({
        status: req.query.status,
        from: req.query.from,
        to: req.query.to,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        sort: req.query.sort || 'start_time:desc',
      });
      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  },
};
