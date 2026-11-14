import { slotService } from '../services/slot.service.js';
import { sendSuccess } from '../utils/response.js';

export const slotController = {
  /**
   * Get slots for a provider (public/authenticated)
   */
  async getSlots(req, res, next) {
    try {
      const slots = await slotService.getSlots({
        providerId: Number(req.params.id),
        date: req.query.date,
        availableOnly: req.query.available === true || req.query.available === 'true',
      });
      return sendSuccess(res, slots);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Provider creates an availability slot
   */
  async createSlot(req, res, next) {
    try {
      const slot = await slotService.createSlot({
        user: req.user,
        startTime: req.body.start_time,
        endTime: req.body.end_time,
      });
      return sendSuccess(res, slot, 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Provider updates a slot
   */
  async updateSlot(req, res, next) {
    try {
      const slot = await slotService.updateSlot({
        user: req.user,
        slotId: Number(req.params.id),
        startTime: req.body.start_time,
        endTime: req.body.end_time,
      });
      return sendSuccess(res, slot);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Provider deletes a slot
   */
  async deleteSlot(req, res, next) {
    try {
      await slotService.deleteSlot({
        user: req.user,
        slotId: Number(req.params.id),
      });
      return sendSuccess(res, { message: 'Slot deleted successfully' }, 200);
    } catch (err) {
      next(err);
    }
  },
};
