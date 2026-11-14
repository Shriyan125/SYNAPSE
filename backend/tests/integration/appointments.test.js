import request from 'supertest';
import app from '../../src/app.js';
import { pool, query } from '../../src/config/db.js';

describe('Appointments & Catalog Endpoints (Integration)', () => {
  let authToken;

  beforeAll(async () => {
    // Log in as Alice (Patient, user_id = 8)
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'Password123!',
      });
    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Catalog Endpoints', () => {
    it('GET /api/v1/providers should return list of seeded providers with offered services', async () => {
      const res = await request(app).get('/api/v1/providers');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
      expect(res.body.data[0]).toHaveProperty('offered_services');
    });

    it('GET /api/v1/services should return list of active services', async () => {
      const res = await request(app).get('/api/v1/services');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Appointments Booking & Double-Booking Prevention', () => {
    it('GET /api/v1/appointments should return paginated list of user appointments', async () => {
      const res = await request(app)
        .get('/api/v1/appointments?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('page', 1);
      expect(res.body.meta).toHaveProperty('total');
    });

    it('should successfully book an available future slot and prevent double booking on the same slot', async () => {
      // 1. Create a dedicated future slot for Provider 1
      const futureStart = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days ahead
      const futureEnd = new Date(futureStart.getTime() + 45 * 60 * 1000);

      const slotRes = await query(
        `INSERT INTO availability_slots (provider_id, start_time, end_time, is_booked)
         VALUES (1, $1, $2, false)
         RETURNING id`,
        [futureStart.toISOString(), futureEnd.toISOString()]
      );
      const testSlotId = slotRes.rows[0].id;

      // 2. First booking attempt -> should succeed (201)
      const bookRes1 = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          provider_id: 1,
          service_id: 2,
          slot_id: testSlotId,
          notes: 'Integration test appointment',
        });

      expect(bookRes1.status).toBe(201);
      expect(bookRes1.body.success).toBe(true);
      expect(bookRes1.body.data.slot_id).toBe(testSlotId);

      // 3. Second booking attempt on the same slot -> MUST be rejected with 409 Conflict
      const bookRes2 = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          provider_id: 1,
          service_id: 2,
          slot_id: testSlotId,
          notes: 'Attempted duplicate booking',
        });

      expect(bookRes2.status).toBe(409);
      expect(bookRes2.body.success).toBe(false);
      expect(bookRes2.body.error.code).toBe('CONFLICT');
    });
  });
});
