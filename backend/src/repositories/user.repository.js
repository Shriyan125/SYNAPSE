import { query } from '../config/db.js';

export const userRepository = {
  /**
   * Find user by email
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async findByEmail(email) {
    const res = await query(
      `SELECT id, full_name, email, password_hash, role, phone, avatar_url, created_at, updated_at
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    return res.rows[0] || null;
  },

  /**
   * Find user by primary key ID
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    const res = await query(
      `SELECT id, full_name, email, role, phone, avatar_url, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  /**
   * Insert a new user
   * @param {object} params
   * @returns {Promise<object>}
   */
  async create({ fullName, email, passwordHash, role = 'user', phone = null, avatarUrl = null }) {
    const res = await query(
      `INSERT INTO users (full_name, email, password_hash, role, phone, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, role, phone, avatar_url, created_at`,
      [fullName, email, passwordHash, role, phone, avatarUrl]
    );
    return res.rows[0];
  },

  /**
   * Update user profile information
   * @param {number} id
   * @param {object} updates
   * @returns {Promise<object>}
   */
  async update(id, { fullName, phone, avatarUrl }) {
    const res = await query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           avatar_url = COALESCE($3, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, full_name, email, role, phone, avatar_url, updated_at`,
      [fullName, phone, avatarUrl, id]
    );
    return res.rows[0];
  },
};
