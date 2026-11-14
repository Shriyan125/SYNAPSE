import { query } from '../config/db.js';

export const refreshTokenRepository = {
  /**
   * Save a newly hashed refresh token
   */
  async create({ userId, tokenHash, expiresAt }) {
    const res = await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, expires_at, created_at`,
      [userId, tokenHash, expiresAt]
    );
    return res.rows[0];
  },

  /**
   * Find a valid, non-revoked, unexpired refresh token
   */
  async findValid(tokenHash) {
    const res = await query(
      `SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
       FROM refresh_tokens
       WHERE token_hash = $1
         AND revoked_at IS NULL
         AND expires_at > CURRENT_TIMESTAMP`,
      [tokenHash]
    );
    return res.rows[0] || null;
  },

  /**
   * Revoke a specific token by hash
   */
  async revoke(tokenHash) {
    const res = await query(
      `UPDATE refresh_tokens
       SET revoked_at = CURRENT_TIMESTAMP
       WHERE token_hash = $1
       RETURNING id, revoked_at`,
      [tokenHash]
    );
    return res.rows[0] || null;
  },

  /**
   * Revoke all tokens for a user (e.g. on full logout)
   */
  async revokeAllForUser(userId) {
    await query(
      `UPDATE refresh_tokens
       SET revoked_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
  },
};
