import { pool, query, getClient } from '../config/db.js';
import { ConflictError, BadRequestError, NotFoundError } from '../utils/errors.js';

export const appointmentRepository = {
  /**
   * Find appointment by ID with full joins for provider, service, slot, and patient
   * (Query 1 from queries.md)
   * @param {number} id
   */
  async findById(id) {
    const sql = `
      SELECT 
        a.id,
        a.user_id,
        a.provider_id,
        a.service_id,
        a.slot_id,
        a.status,
        a.notes,
        a.created_at,
        a.updated_at,
        u_prov.id AS provider_user_id,
        u_prov.full_name AS provider_name,
        u_prov.email AS provider_email,
        u_prov.avatar_url AS provider_avatar_url,
        p.specialty AS provider_specialty,
        p.consultation_fee AS provider_fee,
        s.name AS service_name,
        s.duration_minutes AS service_duration,
        s.price AS service_price,
        sl.start_time,
        sl.end_time,
        u_patient.full_name AS patient_name,
        u_patient.email AS patient_email,
        u_patient.phone AS patient_phone
      FROM appointments a
      INNER JOIN providers p ON a.provider_id = p.id
      INNER JOIN users u_prov ON p.user_id = u_prov.id
      INNER JOIN services s ON a.service_id = s.id
      INNER JOIN availability_slots sl ON a.slot_id = sl.id
      INNER JOIN users u_patient ON a.user_id = u_patient.id
      WHERE a.id = $1;
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  /**
   * Find paginated appointments with dynamic filtering and sorting
   * (Query 9 from queries.md)
   */
  async findAll({ userId = null, providerId = null, status = null, from = null, to = null, limit = 10, offset = 0, sort = 'start_time:asc' }) {
    let sql = `
      SELECT 
        a.id,
        a.user_id,
        a.provider_id,
        a.service_id,
        a.slot_id,
        a.status,
        a.notes,
        a.created_at,
        a.updated_at,
        sl.start_time,
        sl.end_time,
        s.name AS service_name,
        s.duration_minutes,
        s.price,
        u_prov.full_name AS provider_name,
        u_prov.avatar_url AS provider_avatar_url,
        p.specialty AS provider_specialty,
        u_patient.full_name AS patient_name,
        u_patient.email AS patient_email,
        u_patient.phone AS patient_phone
      FROM appointments a
      INNER JOIN availability_slots sl ON a.slot_id = sl.id
      INNER JOIN services s ON a.service_id = s.id
      INNER JOIN providers p ON a.provider_id = p.id
      INNER JOIN users u_prov ON p.user_id = u_prov.id
      INNER JOIN users u_patient ON a.user_id = u_patient.id
      WHERE 1=1
    `;

    const params = [];
    let pIdx = 1;

    if (userId) {
      sql += ` AND a.user_id = $${pIdx}`;
      params.push(userId);
      pIdx++;
    }

    if (providerId) {
      sql += ` AND a.provider_id = $${pIdx}`;
      params.push(providerId);
      pIdx++;
    }

    if (status) {
      sql += ` AND a.status = $${pIdx}`;
      params.push(status);
      pIdx++;
    }

    if (from) {
      sql += ` AND sl.start_time >= $${pIdx}`;
      params.push(from);
      pIdx++;
    }

    if (to) {
      sql += ` AND sl.start_time <= $${pIdx}`;
      params.push(to);
      pIdx++;
    }

    // Dynamic sort
    const [sortField, sortDir] = sort.split(':');
    const validSortFields = {
      start_time: 'sl.start_time',
      created_at: 'a.created_at',
      status: 'a.status',
    };
    const validDir = sortDir && sortDir.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    const chosenField = validSortFields[sortField] || 'sl.start_time';

    sql += ` ORDER BY ${chosenField} ${validDir} LIMIT $${pIdx} OFFSET $${pIdx + 1}`;
    params.push(limit, offset);

    const res = await query(sql, params);
    return res.rows;
  },

  /**
   * Count total appointments matching filter criteria
   */
  async countAll({ userId = null, providerId = null, status = null, from = null, to = null }) {
    let sql = `
      SELECT COUNT(a.id) AS total
      FROM appointments a
      INNER JOIN availability_slots sl ON a.slot_id = sl.id
      WHERE 1=1
    `;

    const params = [];
    let pIdx = 1;

    if (userId) {
      sql += ` AND a.user_id = $${pIdx}`;
      params.push(userId);
      pIdx++;
    }

    if (providerId) {
      sql += ` AND a.provider_id = $${pIdx}`;
      params.push(providerId);
      pIdx++;
    }

    if (status) {
      sql += ` AND a.status = $${pIdx}`;
      params.push(status);
      pIdx++;
    }

    if (from) {
      sql += ` AND sl.start_time >= $${pIdx}`;
      params.push(from);
      pIdx++;
    }

    if (to) {
      sql += ` AND sl.start_time <= $${pIdx}`;
      params.push(to);
      pIdx++;
    }

    const res = await query(sql, params);
    return parseInt(res.rows[0].total, 10);
  },

  /**
   * Concurrent-safe booking transaction using row-level locking
   * (Query 4 from queries.md)
   */
  async bookAppointmentTransaction({ userId, providerId, serviceId, slotId, notes }) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Lock the slot row exclusively
      const slotRes = await client.query(
        `SELECT id, provider_id, start_time, end_time, is_booked
         FROM availability_slots
         WHERE id = $1
         FOR UPDATE`,
        [slotId]
      );

      if (slotRes.rows.length === 0) {
        throw new NotFoundError('Availability slot not found');
      }

      const slot = slotRes.rows[0];

      if (slot.provider_id !== providerId) {
        throw new BadRequestError('Slot does not belong to the selected provider');
      }

      if (slot.is_booked) {
        throw new ConflictError('This time slot is already booked. Please choose another slot.');
      }

      if (new Date(slot.start_time) <= new Date()) {
        throw new BadRequestError('Cannot book an availability slot in the past');
      }

      // Check if slot already has an active appointment (redundant defensive check)
      const existingRes = await client.query(
        `SELECT id FROM appointments WHERE slot_id = $1 AND status = 'booked'`,
        [slotId]
      );
      if (existingRes.rows.length > 0) {
        throw new ConflictError('This slot is already actively reserved.');
      }

      // 2. Mark the slot as booked
      await client.query(
        `UPDATE availability_slots
         SET is_booked = true, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [slotId]
      );

      // 3. Insert the appointment
      const apptRes = await client.query(
        `INSERT INTO appointments (user_id, provider_id, service_id, slot_id, status, notes)
         VALUES ($1, $2, $3, $4, 'booked', $5)
         RETURNING id, user_id, provider_id, service_id, slot_id, status, notes, created_at`,
        [userId, providerId, serviceId, slotId, notes]
      );

      await client.query('COMMIT');
      return apptRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Atomic reschedule transaction
   * (Query 10 from queries.md)
   */
  async rescheduleAppointmentTransaction({ appointmentId, newSlotId, previousSlotId, providerId }) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Lock and verify new slot
      const newSlotRes = await client.query(
        `SELECT id, provider_id, start_time, end_time, is_booked
         FROM availability_slots
         WHERE id = $1
         FOR UPDATE`,
        [newSlotId]
      );

      if (newSlotRes.rows.length === 0) {
        throw new NotFoundError('Selected new availability slot does not exist');
      }

      const newSlot = newSlotRes.rows[0];
      if (newSlot.provider_id !== providerId) {
        throw new BadRequestError('New slot belongs to a different provider');
      }

      if (newSlot.is_booked) {
        throw new ConflictError('Selected new slot is already booked');
      }

      if (new Date(newSlot.start_time) <= new Date()) {
        throw new BadRequestError('Cannot reschedule to a past slot');
      }

      // 2. Release previous slot
      if (previousSlotId) {
        await client.query(
          `UPDATE availability_slots
           SET is_booked = false, updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [previousSlotId]
        );
      }

      // 3. Mark new slot as booked
      await client.query(
        `UPDATE availability_slots
         SET is_booked = true, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [newSlotId]
      );

      // 4. Update appointment
      const updatedRes = await client.query(
        `UPDATE appointments
         SET slot_id = $1, status = 'booked', updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, user_id, provider_id, service_id, slot_id, status, notes, updated_at`,
        [newSlotId, appointmentId]
      );

      await client.query('COMMIT');
      return updatedRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Cancel appointment transaction
   */
  async cancelAppointmentTransaction({ appointmentId, slotId, reason = null }) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Release availability slot
      if (slotId) {
        await client.query(
          `UPDATE availability_slots
           SET is_booked = false, updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [slotId]
        );
      }

      // 2. Mark appointment as cancelled
      const cancelNote = reason ? ` [Cancelled: ${reason}]` : ' [Cancelled by user]';
      const res = await client.query(
        `UPDATE appointments
         SET status = 'cancelled',
             notes = COALESCE(notes, '') || $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, status, updated_at`,
        [cancelNote, appointmentId]
      );

      await client.query('COMMIT');
      return res.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};
