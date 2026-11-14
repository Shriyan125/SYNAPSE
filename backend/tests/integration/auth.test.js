import request from 'supertest';
import app from '../../src/app.js';
import { pool } from '../../src/config/db.js';

describe('Auth & User Endpoints (Integration)', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const uniqueEmail = `testuser_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          full_name: 'Integration Test User',
          email: uniqueEmail,
          password: 'Password123!',
          role: 'user',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(uniqueEmail);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject registration with invalid email or weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          full_name: 'Short',
          email: 'not-an-email',
          password: '123',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with already taken email', async () => {
      // Seeded email
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          full_name: 'Alice Johnson',
          email: 'alice@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should log in successfully with seeded credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('alice@example.com');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should reject requests without Authorization token', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return profile for authenticated user', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'Password123!',
        });

      const token = loginRes.body.data.accessToken;

      const profileRes = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.data.email).toBe('alice@example.com');
      expect(profileRes.body.data.fullName).toBe('Alice Johnson');
    });
  });
});
