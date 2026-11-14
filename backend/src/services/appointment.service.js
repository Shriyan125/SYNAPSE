import { appointmentRepository } from '../repositories/appointment.repository.js';
import { providerRepository } from '../repositories/provider.repository.js';
import { serviceRepository } from '../repositories/service.repository.js';
import { slotRepository } from '../repositories/slot.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { notificationRepository } from '../repositories/notification.repository.js';
import {
  sendBookingConfirmationEmail,
  sendRescheduleEmail,
  sendCancellationEmail,
} from '../utils/email.js';
import { env } from '../config/env.js';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from '../utils/errors.js';
import { logger } from '../config/logger.js';

export const appointmentService = {
  /**
   * Book an appointment with concurrency-safe transaction
   */
  async bookAppointment({ user, providerId, serviceId, slotId, notes }) {
    // 1. Verify provider & service
    const provider = await providerRepository.findById(providerId);
    if (!provider) {
      throw new NotFoundError('Selected provider does not exist');
    }

    const service = await serviceRepository.findById(serviceId);
    if (!service || !service.is_active) {
      throw new BadRequestError('Selected service is not currently offered or active');
    }

    // 2. Execute transactional booking (SELECT FOR UPDATE)
    const booking = await appointmentRepository.bookAppointmentTransaction({
      userId: user.id,
      providerId,
      serviceId,
      slotId,
      notes,
    });

    // 3. Fetch detailed record for email and client response
    const detailed = await appointmentRepository.findById(booking.id);

    // 4. Record notification and send confirmation email asynchronously
    notificationRepository
      .create({
        userId: user.id,
        appointmentId: booking.id,
        type: 'booking_confirmed',
        metadata: { recipient: detailed.patient_email },
      })
      .catch((e) => logger.warn(`Failed to log notification record: ${e.message}`));

    sendBookingConfirmationEmail({
      to: detailed.patient_email,
      patientName: detailed.patient_name,
      providerName: detailed.provider_name,
      serviceName: detailed.service_name,
      startTime: detailed.start_time,
      endTime: detailed.end_time,
    }).catch((e) => logger.error(`Email dispatch error: ${e.message}`));

    return detailed;
  },

  /**
   * List appointments with pagination, filtering, and role-based scoping
   */
  async getAppointments({ user, status = null, from = null, to = null, page = 1, limit = 10, sort = 'start_time:asc' }) {
    let userId = null;
    let providerId = null;

    if (user.role === 'user') {
      userId = user.id;
    } else if (user.role === 'provider') {
      const provider = await providerRepository.findByUserId(user.id);
      if (provider) {
        providerId = provider.id;
      } else {
        // If provider profile doesn't exist yet, return empty
        return { items: [], pagination: { total: 0, page, limit, totalPages: 0 } };
      }
    }
    // Admin sees all without scoping by userId or providerId

    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      appointmentRepository.findAll({
        userId,
        providerId,
        status,
        from,
        to,
        limit,
        offset,
        sort,
      }),
      appointmentRepository.countAll({
        userId,
        providerId,
        status,
        from,
        to,
      }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  /**
   * Get appointment details with ownership check
   */
  async getAppointmentById({ user, id }) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError(`Appointment #${id} not found`);
    }

    // Centralized ownership enforcement
    if (user.role === 'user' && appointment.user_id !== user.id) {
      throw new ForbiddenError('You are not authorized to view this appointment');
    }

    if (user.role === 'provider') {
      const provider = await providerRepository.findByUserId(user.id);
      if (!provider || appointment.provider_id !== provider.id) {
        throw new ForbiddenError('You are not authorized to view this appointment');
      }
    }

    return appointment;
  },

  /**
   * Reschedule appointment with 2-hour window enforcement and atomic transaction
   */
  async rescheduleAppointment({ user, appointmentId, newSlotId }) {
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError(`Appointment #${appointmentId} not found`);
    }

    // Ownership check (only the booking user or an admin can reschedule)
    if (user.role === 'user' && appointment.user_id !== user.id) {
      throw new ForbiddenError('You can only reschedule your own appointments');
    }

    if (appointment.status !== 'booked') {
      throw new BadRequestError(`Cannot reschedule an appointment with status '${appointment.status}'`);
    }

    // Check cancellation/reschedule cutoff window (e.g. 2 hours)
    const slotTime = new Date(appointment.start_time).getTime();
    const now = Date.now();
    const cutoffMs = env.cancellationWindowHours * 60 * 60 * 1000;

    if (slotTime - now < cutoffMs) {
      throw new BadRequestError(
        `Appointments cannot be rescheduled within ${env.cancellationWindowHours} hours of the scheduled start time.`
      );
    }

    // Execute atomic reschedule
    await appointmentRepository.rescheduleAppointmentTransaction({
      appointmentId: appointment.id,
      newSlotId,
      previousSlotId: appointment.slot_id,
      providerId: appointment.provider_id,
    });

    const updated = await appointmentRepository.findById(appointment.id);

    // Audit and notify
    notificationRepository
      .create({
        userId: appointment.user_id,
        appointmentId: appointment.id,
        type: 'rescheduled',
        metadata: { newSlotId, previousSlotId: appointment.slot_id },
      })
      .catch((e) => logger.warn(`Notification log failed: ${e.message}`));

    sendRescheduleEmail({
      to: updated.patient_email,
      patientName: updated.patient_name,
      providerName: updated.provider_name,
      serviceName: updated.service_name,
      newStartTime: updated.start_time,
    }).catch((e) => logger.error(`Email dispatch error: ${e.message}`));

    return updated;
  },

  /**
   * Cancel appointment with 2-hour window enforcement and atomic slot release
   */
  async cancelAppointment({ user, appointmentId, reason = null }) {
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError(`Appointment #${appointmentId} not found`);
    }

    // Ownership check
    if (user.role === 'user' && appointment.user_id !== user.id) {
      throw new ForbiddenError('You can only cancel your own appointments');
    }

    if (user.role === 'provider') {
      const provider = await providerRepository.findByUserId(user.id);
      if (!provider || appointment.provider_id !== provider.id) {
        throw new ForbiddenError('You can only cancel your own scheduled appointments');
      }
    }

    if (appointment.status === 'cancelled') {
      throw new BadRequestError('Appointment is already cancelled');
    }

    if (appointment.status === 'completed') {
      throw new BadRequestError('Cannot cancel an appointment that has already taken place');
    }

    // Check cutoff window (applies to users; admins/providers can override)
    if (user.role === 'user') {
      const slotTime = new Date(appointment.start_time).getTime();
      const now = Date.now();
      const cutoffMs = env.cancellationWindowHours * 60 * 60 * 1000;

      if (slotTime - now < cutoffMs) {
        throw new BadRequestError(
          `Appointments cannot be cancelled within ${env.cancellationWindowHours} hours of the scheduled start time.`
        );
      }
    }

    // Execute atomic cancellation
    await appointmentRepository.cancelAppointmentTransaction({
      appointmentId: appointment.id,
      slotId: appointment.slot_id,
      reason,
    });

    const updated = await appointmentRepository.findById(appointment.id);

    // Audit and notify
    notificationRepository
      .create({
        userId: appointment.user_id,
        appointmentId: appointment.id,
        type: 'cancelled',
        metadata: { reason },
      })
      .catch((e) => logger.warn(`Notification log failed: ${e.message}`));

    sendCancellationEmail({
      to: updated.patient_email,
      patientName: updated.patient_name,
      providerName: updated.provider_name,
      serviceName: updated.service_name,
      startTime: updated.start_time,
      reason,
    }).catch((e) => logger.error(`Email dispatch error: ${e.message}`));

    return updated;
  },
};
