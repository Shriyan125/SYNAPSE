import { query } from '../config/db.js';

export const serviceRepository = {
  /**
   * Find all services
   * @param {boolean} activeOnly
   */
  async findAll(activeOnly = true) {
    let sql = `
      SELECT id, name, description, duration_minutes, price, is_active, created_at, updated_at
      FROM services
    `;
    if (activeOnly) {
      sql += ` WHERE is_active = true`;
    }
    sql += ` ORDER BY name ASC`;

    const res = await query(sql);
    return res.rows;
  },

  /**
   * Find single service by ID
   * @param {number} id
   */
  async findById(id) {
    const res = await query(
      `SELECT id, name, description, duration_minutes, price, is_active, created_at, updated_at
       FROM services
       WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  /**
   * Create a new service
   */
  async create({ name, description, durationMinutes, price }) {
    const res = await query(
      `INSERT INTO services (name, description, duration_minutes, price)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, duration_minutes, price, is_active, created_at`,
      [name, description, durationMinutes, price]
    );
    return res.rows[0];
  },

  /**
   * Update service
   */
  async update(id, { name, description, durationMinutes, price, isActive }) {
    const res = await query(
      `UPDATE services
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           duration_minutes = COALESCE($3, duration_minutes),
           price = COALESCE($4, price),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, name, description, duration_minutes, price, is_active, updated_at`,
      [name, description, durationMinutes, price, isActive, id]
    );
    return res.rows[0];
  },

  /**
   * Soft-delete service by setting is_active to false
   */
  async softDelete(id) {
    const res = await query(
      `UPDATE services
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, is_active`,
      [id]
    );
    return res.rows[0];
  },
};
