import { appointmentService } from '../services/appointment.service.js';
import { sendSuccess } from '../utils/response.js';

export const appointmentController = {
  /**
   * Book a new appointment
   */
  async createAppointment(req, res, next) {
    try {
      const appointment = await appointmentService.bookAppointment({
        user: req.user,
        providerId: req.body.provider_id,
        serviceId: req.body.service_id,
        slotId: req.body.slot_id,
        notes: req.body.notes,
      });
      return sendSuccess(res, appointment, 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * List appointments with pagination and filters
   */
  async getAppointments(req, res, next) {
    try {
      const result = await appointmentService.getAppointments({
        user: req.user,
        status: req.query.status,
        from: req.query.from,
        to: req.query.to,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        sort: req.query.sort || 'start_time:asc',
      });
      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get single appointment by ID
   */
  async getAppointmentById(req, res, next) {
    try {
      const appointment = await appointmentService.getAppointmentById({
        user: req.user,
        id: Number(req.params.id),
      });
      return sendSuccess(res, appointment);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(req, res, next) {
    try {
      const updated = await appointmentService.rescheduleAppointment({
        user: req.user,
        appointmentId: Number(req.params.id),
        newSlotId: Number(req.body.new_slot_id),
      });
      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Cancel appointment
   */
  async cancelAppointment(req, res, next) {
    try {
      const updated = await appointmentService.cancelAppointment({
        user: req.user,
        appointmentId: Number(req.params.id),
        reason: req.body.reason,
      });
      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  },
};
