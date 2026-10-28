// backend/tests/integration/employee.test.js

import 'dotenv/config';
import mongoose from 'mongoose';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

// ============================================================================
// 👥 EMPLOYEE CRUD & SECURITY INTEGRATION TESTS
// ============================================================================
describe('Employee API Integration Tests (/api/v1/employees)', () => {

  let adminAccessToken = '';

  // 🍃 1. Test தொடங்கும் முன் DB கனெக்ட் செய்து Admin Token எடுத்துக்கொள்கிறோம்:
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Admin Login செய்து Token எடுக்கிறோம்:
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@gmail.com',
        password: 'admin@123',
      });

    adminAccessToken = loginResponse.body.data.token;
  });

  // 🔌 2. அனைத்து டெஸ்ட்டுகளும் முடிந்ததும் Connection மூடுகிறோம்:
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // ==========================================================================
  // 1️⃣ LIST EMPLOYEES (GET /api/v1/employees)
  // ==========================================================================
  describe('GET /api/v1/employees', () => {

    // ❌ TEST: Token இல்லாமல் அழைத்தால் 401 Unauthorized வர வேண்டும்:
    it('should reject unauthenticated request with 401 Unauthorized', async () => {
      const response = await request(app).get('/api/v1/employees');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });

    // ✅ TEST: Admin Token-உடன் அழைத்தால் 200 OK மற்றும் Pagination டேட்டா வர வேண்டும்:
    it('should return 200 OK and paginated employee list for authenticated admin', async () => {
      const response = await request(app)
        .get('/api/v1/employees')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true); // data array ஆக இருக்க வேண்டும்
      // pagination object-க்குள் உள்ளவற்றை செக் செய்கிறோம்:
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });
  });

  // ==========================================================================
  // 2️⃣ CREATE EMPLOYEE VALIDATION (POST /api/v1/employees)
  // ==========================================================================
  describe('POST /api/v1/employees', () => {

    // ❌ TEST: அரைகுறை டேட்டா (Missing position & salary) அனுப்பினால் 400 Bad Request வர வேண்டும்:
    it('should return 400 Bad Request when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/employees')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: 'Incomplete Employee',
          email: 'incomplete@company.com',
          // position மற்றும் salary விடுபட்டுள்ளது!
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  // ==========================================================================
  // 3️⃣ SINGLE EMPLOYEE LOOKUP & PARAM VALIDATION (GET /api/v1/employees/:id)
  // ==========================================================================
  describe('GET /api/v1/employees/:id', () => {

    // ❌ TEST: 24-character அல்லாத தவறான ID அனுப்பினால் Zod Param Guard 400 தர வேண்டும்:
    it('should return 400 Bad Request for malformed MongoDB ObjectId', async () => {
      const response = await request(app)
        .get('/api/v1/employees/invalid-short-id')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid route parameters');
    });

    // ❌ TEST: சரியான 24-char ID ஆனால் DB-ல் ஆள் இல்லை என்றால் 404 Not Found வர வேண்டும்:
    it('should return 404 Not Found for non-existing valid ObjectId', async () => {
      // 24-character random Hex ID:
      const nonExistingId = '660000000000000000000000';

      const response = await request(app)
        .get(`/api/v1/employees/${nonExistingId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Employee not found');
    });
  });
});