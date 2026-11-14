import { query } from '../config/db.js';

export const adminRepository = {
  /**
   * System-wide KPI summary metrics
   * (Query 11 from queries.md)
   */
  async getStatsSummary() {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_patients,
        (SELECT COUNT(*) FROM providers) AS total_providers,
        (SELECT COUNT(*) FROM appointments WHERE status = 'booked') AS active_bookings,
        (SELECT COUNT(*) FROM appointments WHERE status = 'completed') AS completed_bookings,
        (SELECT COUNT(*) FROM appointments WHERE status = 'cancelled') AS cancelled_bookings,
        (SELECT COALESCE(SUM(s.price), 0) 
         FROM appointments a 
         INNER JOIN services s ON a.service_id = s.id 
         WHERE a.status = 'completed') AS gross_revenue;
    `;
    const res = await query(sql);
    const row = res.rows[0];
    return {
      totalPatients: parseInt(row.total_patients, 10),
      totalProviders: parseInt(row.total_providers, 10),
      activeBookings: parseInt(row.active_bookings, 10),
      completedBookings: parseInt(row.completed_bookings, 10),
      cancelledBookings: parseInt(row.cancelled_bookings, 10),
      grossRevenue: parseFloat(row.gross_revenue),
    };
  },

  /**
   * Appointments count and revenue per provider
   * (Query 5 from queries.md)
   */
  async getAppointmentsPerProvider() {
    const sql = `
      SELECT 
        p.id AS provider_id,
        u.full_name AS provider_name,
        p.specialty,
        COUNT(a.id) AS total_appointments,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) AS completed_appointments,
        COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) AS cancelled_appointments,
        COALESCE(SUM(CASE WHEN a.status = 'completed' THEN s.price ELSE 0 END), 0) AS total_revenue
      FROM providers p
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN appointments a ON p.id = a.provider_id
      LEFT JOIN services s ON a.service_id = s.id
      GROUP BY p.id, u.full_name, p.specialty
      HAVING COUNT(a.id) > 0
      ORDER BY total_appointments DESC;
    `;
    const res = await query(sql);
    return res.rows;
  },

  /**
   * Busiest days of the week analysis
   * (Query 6 from queries.md)
   */
  async getBusiestDays() {
    const sql = `
      SELECT 
        TO_CHAR(sl.start_time, 'FMDay') AS day_name,
        EXTRACT(DOW FROM sl.start_time) AS day_of_week,
        COUNT(a.id) AS appointment_count
      FROM appointments a
      INNER JOIN availability_slots sl ON a.slot_id = sl.id
      WHERE a.status != 'cancelled'
      GROUP BY day_name, day_of_week
      ORDER BY day_of_week ASC;
    `;
    const res = await query(sql);
    return res.rows;
  },

  /**
   * Frequent patients analysis using Common Table Expression (CTE)
   * (Query 7 from queries.md)
   */
  async getFrequentPatients() {
    const sql = `
      WITH user_booking_stats AS (
        SELECT 
          user_id,
          COUNT(id) AS total_bookings,
          MAX(created_at) AS last_booking_date
        FROM appointments
        GROUP BY user_id
        HAVING COUNT(id) >= 2
      )
      SELECT 
        u.id AS user_id,
        u.full_name,
        u.email,
        u.phone,
        ubs.total_bookings,
        ubs.last_booking_date
      FROM user_booking_stats ubs
      INNER JOIN users u ON ubs.user_id = u.id
      ORDER BY ubs.total_bookings DESC;
    `;
    const res = await query(sql);
    return res.rows;
  },
};
