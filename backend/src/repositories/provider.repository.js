import { query } from '../config/db.js';

export const providerRepository = {
  /**
   * Find all providers with aggregated services and optional specialty filter
   * @param {object} filter - { specialty }
   */
  async findAll({ specialty = null } = {}) {
    let sql = `
      SELECT 
        p.id,
        p.user_id,
        u.full_name,
        u.email,
        u.phone,
        u.avatar_url,
        p.bio,
        p.specialty,
        p.experience_years,
        p.consultation_fee,
        p.rating,
        p.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'duration_minutes', s.duration_minutes,
              'price', s.price
            )
          ) FILTER (WHERE s.id IS NOT NULL), '[]'::json
        ) AS offered_services
      FROM providers p
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN provider_services ps ON p.id = ps.provider_id
      LEFT JOIN services s ON ps.service_id = s.id AND s.is_active = true
    `;

    const params = [];
    if (specialty) {
      params.push(`%${specialty}%`);
      sql += ` WHERE p.specialty ILIKE $1`;
    }

    sql += `
      GROUP BY p.id, u.id
      ORDER BY p.rating DESC, p.experience_years DESC
    `;

    const res = await query(sql, params);
    return res.rows;
  },

  /**
   * Find single provider by ID with services
   * @param {number} id
   */
  async findById(id) {
    const sql = `
      SELECT 
        p.id,
        p.user_id,
        u.full_name,
        u.email,
        u.phone,
        u.avatar_url,
        p.bio,
        p.specialty,
        p.experience_years,
        p.consultation_fee,
        p.rating,
        p.created_at,
        p.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'description', s.description,
              'duration_minutes', s.duration_minutes,
              'price', s.price
            )
          ) FILTER (WHERE s.id IS NOT NULL), '[]'::json
        ) AS offered_services
      FROM providers p
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN provider_services ps ON p.id = ps.provider_id
      LEFT JOIN services s ON ps.service_id = s.id AND s.is_active = true
      WHERE p.id = $1
      GROUP BY p.id, u.id;
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  /**
   * Find provider by base user account ID
   * @param {number} userId
   */
  async findByUserId(userId) {
    const sql = `
      SELECT 
        p.id,
        p.user_id,
        u.full_name,
        u.email,
        u.phone,
        u.avatar_url,
        p.bio,
        p.specialty,
        p.experience_years,
        p.consultation_fee,
        p.rating,
        p.created_at,
        p.updated_at
      FROM providers p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1;
    `;
    const res = await query(sql, [userId]);
    return res.rows[0] || null;
  },

  /**
   * Insert a new provider profile
   */
  async create({ userId, bio = '', specialty, experienceYears = 0, consultationFee = 0 }) {
    const res = await query(
      `INSERT INTO providers (user_id, bio, specialty, experience_years, consultation_fee)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, bio, specialty, experience_years, consultation_fee, rating, created_at`,
      [userId, bio, specialty, experienceYears, consultationFee]
    );
    return res.rows[0];
  },

  /**
   * Update provider details
   */
  async update(id, { bio, specialty, experienceYears, consultationFee }) {
    const res = await query(
      `UPDATE providers
       SET bio = COALESCE($1, bio),
           specialty = COALESCE($2, specialty),
           experience_years = COALESCE($3, experience_years),
           consultation_fee = COALESCE($4, consultation_fee),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, user_id, bio, specialty, experience_years, consultation_fee, rating, updated_at`,
      [bio, specialty, experienceYears, consultationFee, id]
    );
    return res.rows[0];
  },

  /**
   * Sync services for provider
   */
  async setServices(providerId, serviceIds = []) {
    await query('DELETE FROM provider_services WHERE provider_id = $1', [providerId]);
    if (serviceIds.length > 0) {
      const values = serviceIds.map((sId) => `(${providerId}, ${parseInt(sId, 10)})`).join(', ');
      await query(`INSERT INTO provider_services (provider_id, service_id) VALUES ${values}`);
    }
  },
};
