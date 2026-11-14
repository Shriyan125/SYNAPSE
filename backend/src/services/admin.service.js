import { adminRepository } from '../repositories/admin.repository.js';
import { appointmentRepository } from '../repositories/appointment.repository.js';

export const adminService = {
  /**
   * Get administrative system stats and metrics
   */
  async getStats() {
    const [summary, appointmentsPerProvider, busiestDays, frequentPatients] = await Promise.all([
      adminRepository.getStatsSummary(),
      adminRepository.getAppointmentsPerProvider(),
      adminRepository.getBusiestDays(),
      adminRepository.getFrequentPatients(),
    ]);

    return {
      summary,
      appointmentsPerProvider,
      busiestDays,
      frequentPatients,
    };
  },

  /**
   * Admin view of all appointments across system
   */
  async getAllAppointments({ status = null, from = null, to = null, page = 1, limit = 10, sort = 'start_time:desc' }) {
    const offset = (page - 1) * limit;

    const [items, total] = await Promise.all([
      appointmentRepository.findAll({
        status,
        from,
        to,
        limit,
        offset,
        sort,
      }),
      appointmentRepository.countAll({
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
};
