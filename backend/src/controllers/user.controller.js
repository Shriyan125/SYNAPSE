import { userService } from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';

export const userController = {
  /**
   * Get current authenticated user profile
   */
  async getMe(req, res, next) {
    try {
      const user = await userService.getMe(req.user.id);
      return sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update current authenticated user profile
   */
  async updateMe(req, res, next) {
    try {
      const updated = await userService.updateMe(req.user.id, req.body);
      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Upload avatar to Cloudinary and update profile
   */
  async uploadAvatar(req, res, next) {
    try {
      const result = await userService.uploadAvatar(req.user.id, req.file);
      return sendSuccess(res, result, 200, null);
    } catch (err) {
      next(err);
    }
  },
};
