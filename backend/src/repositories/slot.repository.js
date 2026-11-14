import { query } from '../config/db.js';

export const slotRepository = {
  /**
   * Find slots for a provider with optional date and availability filtering
   * Uses LEFT JOIN anti-pattern when availableOnly is requested
   */
  async findByProviderAndDate(providerId, date = null, availableOnly = false) {
    let sql = `
      SELECT 
        s.id,
        s.provider_id,
        s.start_time,
        s.end_time,
        s.is_booked,
        s.created_at
      FROM availability_slots s
    `;

    const params = [providerId];
    let paramIndex = 2;

    if (availableOnly) {
      sql += `
        LEFT JOIN appointments a 
          ON s.id = a.slot_id 
          AND a.status = 'booked'
        WHERE s.provider_id = $1
          AND s.is_booked = false
          AND a.id IS NULL
          AND s.start_time > CURRENT_TIMESTAMP
      `;
    } else {
      sql += ` WHERE s.provider_id = $1`;
    }

    if (date) {
      sql += ` AND DATE(s.start_time AT TIME ZONE 'UTC') = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }

    sql += ` ORDER BY s.start_time ASC`;

    const res = await query(sql, params);
    return res.rows;
  },

  /**
   * Find single slot by ID
   */
  async findById(id) {
    const res = await query(
      `SELECT id, provider_id, start_time, end_time, is_booked, created_at, updated_at
       FROM availability_slots
       WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  /**
   * Create a new availability slot
   */
  async create({ providerId, startTime, endTime }) {
    const res = await query(
      `INSERT INTO availability_slots (provider_id, start_time, end_time, is_booked)
       VALUES ($1, $2, $3, false)
       RETURNING id, provider_id, start_time, end_time, is_booked, created_at`,
      [providerId, startTime, endTime]
    );
    return res.rows[0];
  },

  /**
   * Update a slot (start_time, end_time)
   */
  async update(id, { startTime, endTime }) {
    const res = await query(
      `UPDATE availability_slots
       SET start_time = COALESCE($1, start_time),
           end_time = COALESCE($2, end_time),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, provider_id, start_time, end_time, is_booked, updated_at`,
      [startTime, endTime, id]
    );
    return res.rows[0] || null;
  },

  /**
   * Delete slot by ID
   */
  async delete(id) {
    const res = await query(
      `DELETE FROM availability_slots
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    return res.rows[0] || null;
  },

  /**
   * Check if a slot has an active appointment
   */
  async hasActiveAppointment(slotId) {
    const res = await query(
      `SELECT id FROM appointments WHERE slot_id = $1 AND status = 'booked' LIMIT 1`,
      [slotId]
    );
    return res.rows.length > 0;
  },
};
