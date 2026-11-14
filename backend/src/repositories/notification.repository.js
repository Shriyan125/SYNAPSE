import { query } from '../config/db.js';

export const notificationRepository = {
  /**
   * Insert notification audit log
   */
  async create({ userId, appointmentId, type, metadata = {} }) {
    const res = await query(
      `INSERT INTO notifications (user_id, appointment_id, type, metadata)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (appointment_id, type) DO NOTHING
       RETURNING id, user_id, appointment_id, type, sent_at`,
      [userId, appointmentId, type, JSON.stringify(metadata)]
    );
    return res.rows[0] || null;
  },

  /**
   * Find appointments scheduled in [23h, 25h] lacking a 24h reminder
   * (Query 8 from queries.md)
   */
  async findPendingReminders24h() {
    const sql = `
      SELECT 
        a.id AS appointment_id,
        a.user_id,
        u.full_name AS patient_name,
        u.email AS patient_email,
        u_prov.full_name AS provider_name,
        s.name AS service_name,
        sl.start_time,
        sl.end_time
      FROM appointments a
      INNER JOIN users u ON a.user_id = u.id
      INNER JOIN providers p ON a.provider_id = p.id
      INNER JOIN users u_prov ON p.user_id = u_prov.id
      INNER JOIN services s ON a.service_id = s.id
      INNER JOIN availability_slots sl ON a.slot_id = sl.id
      WHERE a.status = 'booked'
        AND sl.start_time >= CURRENT_TIMESTAMP + INTERVAL '23 hours'
        AND sl.start_time <= CURRENT_TIMESTAMP + INTERVAL '25 hours'
        AND NOT EXISTS (
          SELECT 1 FROM notifications n 
          WHERE n.appointment_id = a.id 
            AND n.type = 'reminder_24h'
        );
    `;
    const res = await query(sql);
    return res.rows;
  },

  /**
   * Find appointments scheduled in [45m, 75m] lacking a 1h reminder
   */
  async findPendingReminders1h() {
    const sql = `
      SELECT 
        a.id AS appointment_id,
        a.user_id,
        u.full_name AS patient_name,
        u.email AS patient_email,
        u_prov.full_name AS provider_name,
        s.name AS service_name,
        sl.start_time,
        sl.end_time
      FROM appointments a
      INNER JOIN users u ON a.user_id = u.id
      INNER JOIN providers p ON a.provider_id = p.id
      INNER JOIN users u_prov ON p.user_id = u_prov.id
      INNER JOIN services s ON a.service_id = s.id
      INNER JOIN availability_slots sl ON a.slot_id = sl.id
      WHERE a.status = 'booked'
        AND sl.start_time >= CURRENT_TIMESTAMP + INTERVAL '45 minutes'
        AND sl.start_time <= CURRENT_TIMESTAMP + INTERVAL '75 minutes'
        AND NOT EXISTS (
          SELECT 1 FROM notifications n 
          WHERE n.appointment_id = a.id 
            AND n.type = 'reminder_1h'
        );
    `;
    const res = await query(sql);
    return res.rows;
  },
};
