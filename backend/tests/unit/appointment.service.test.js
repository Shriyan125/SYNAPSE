import { jest } from '@jest/globals';
import { appointmentService } from '../../src/services/appointment.service.js';
import { appointmentRepository } from '../../src/repositories/appointment.repository.js';
import { providerRepository } from '../../src/repositories/provider.repository.js';
import { serviceRepository } from '../../src/repositories/service.repository.js';

describe('AppointmentService (Unit Tests)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('bookAppointment', () => {
    it('should throw NotFoundError if provider does not exist', async () => {
      jest.spyOn(providerRepository, 'findById').mockResolvedValueOnce(null);

      await expect(
        appointmentService.bookAppointment({
          user: { id: 8 },
          providerId: 999,
          serviceId: 1,
          slotId: 5,
        })
      ).rejects.toThrow('Selected provider does not exist');
    });

    it('should throw BadRequestError if service is inactive', async () => {
      jest.spyOn(providerRepository, 'findById').mockResolvedValueOnce({ id: 1 });
      jest.spyOn(serviceRepository, 'findById').mockResolvedValueOnce({ id: 1, is_active: false });

      await expect(
        appointmentService.bookAppointment({
          user: { id: 8 },
          providerId: 1,
          serviceId: 1,
          slotId: 5,
        })
      ).rejects.toThrow('Selected service is not currently offered or active');
    });
  });

  describe('getAppointmentById', () => {
    it('should throw ForbiddenError when a user tries to access another user appointment', async () => {
      jest.spyOn(appointmentRepository, 'findById').mockResolvedValueOnce({
        id: 10,
        user_id: 99, // Owned by user 99
        provider_id: 1,
      });

      await expect(
        appointmentService.getAppointmentById({
          user: { id: 8, role: 'user' }, // Requesting as user 8
          id: 10,
        })
      ).rejects.toThrow('You are not authorized to view this appointment');
    });

    it('should allow user to view their own appointment', async () => {
      const mockAppt = {
        id: 10,
        user_id: 8,
        provider_id: 1,
        service_name: 'Cardiology Consult',
      };
      jest.spyOn(appointmentRepository, 'findById').mockResolvedValueOnce(mockAppt);

      const result = await appointmentService.getAppointmentById({
        user: { id: 8, role: 'user' },
        id: 10,
      });

      expect(result.id).toBe(10);
    });
  });

  describe('cancelAppointment cutoff window', () => {
    it('should reject cancellation within the 2-hour window', async () => {
      // Slot starting in 30 minutes
      const soonStartTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      jest.spyOn(appointmentRepository, 'findById').mockResolvedValueOnce({
        id: 15,
        user_id: 8,
        status: 'booked',
        start_time: soonStartTime,
      });

      await expect(
        appointmentService.cancelAppointment({
          user: { id: 8, role: 'user' },
          appointmentId: 15,
        })
      ).rejects.toThrow(/Appointments cannot be cancelled within 2 hours/);
    });
  });
});
