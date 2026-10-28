// backend/tests/integration/auth.test.js

import 'dotenv/config'; // .env credentials படிக்க
import mongoose from 'mongoose';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js'; // நம்ம Express app

// ============================================================================
// 🔐 AUTHENTICATION & SECURITY INTEGRATION TESTS
// ============================================================================
// 1. Vitest தரும் Test Framework:
describe('Auth API Integration Tests (/api/v1/auth)', () => {

  // டெஸ்ட்டுகளில் மீண்டும் மீண்டும் பயன்படுத்த சேமித்து வைக்கப்படும் Admin Token:
  let adminAccessToken = '';

  // 🍃 1. Test தொடங்கும் முன் MongoDB Atlas-உடன் கனெக்ட் செய்கிறோம்:Supertest
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  // 🔌 2. எல்லா டெஸ்ட்டுகளும் முடிந்ததும் Connection-ஐ மூடுகிறோம்:
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // ==========================================================================
  // 1️⃣ LOGIN ENDPOINT TESTS
  // ==========================================================================
  // 1. Vitest தரும் Test Framework:
  describe('POST /api/v1/auth/login', () => {

    // ❌ TEST: தவறான பாஸ்வேர்ட் போட்டால் 401 Unauthorized வர வேண்டும்:
    it('should return 401 Unauthorized for incorrect password', async () => {
      // 🤖 2. SUPERTEST வேலை (HTTP Request அனுப்புவது மட்டும்):
      // Act: Supertest மூலம் தவறான பாஸ்வேர்டுடன் Login API-ஐ அழைக்கிறோம்
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@gmail.com',
          password: 'wrong_password_999',
        });

      // Assert: ⚖️ 3. VITEST வேலை (ரிசல்ட்டை சோதிக்கும் நீதிபதி):
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    // ✅ TEST: சரியான Admin Credentials போட்டால் 200 OK & JWT Token வர வேண்டும்:
    it('should login successfully and return JWT accessToken for valid admin', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@gmail.com',
          password: 'admin@123',
        });

      // Assert:
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.role).toBe('ADMIN');

      // அடுத்தடுத்த டெஸ்ட்டுகளில் பயன்படுத்த Token-ஐ சேமித்துக்கொள்கிறோம்:
      adminAccessToken = response.body.data.token;
    });
  });

  // ==========================================================================
  // 2️⃣ PROTECTED PROFILE (/me) ENDPOINT TESTS
  // ==========================================================================
  describe('GET /api/v1/auth/me', () => {

    // ❌ TEST: Bearer Token இல்லாமல் அழைத்தால் 401 தடுத்து நிறுத்த வேண்டும்:
    it('should return 401 Unauthorized when no token is provided', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('No token provided');
    });

    // ✅ TEST: Valid Bearer Token கொடுத்தால் 200 OK-ல் Profile வர வேண்டும்:
    it('should return 200 OK with authenticated user profile when valid token is sent', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminAccessToken}`); // 👈 Header-ல் Token அனுப்புகிறோம்!

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('admin@gmail.com');
      expect(response.body.data.role).toBe('ADMIN');
    });
  });

  // ==========================================================================
  // 3️⃣ FORGOT PASSWORD & COOLDOWN TESTS
  // ==========================================================================
  describe('POST /api/v1/auth/forgot-password', () => {

    // 🛡️ TEST: இல்லாத Email-ஐப் போட்டாலும் Anti-Enumeration பாதுகாப்புக்காக 200 OK வர வேண்டும்:
    it('should return 200 OK even for non-existing email (anti-enumeration security)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'ghost-user-does-not-exist@random.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('If that email address is in our database');
    });

    // ⏱️ TEST: அடுத்தடுத்து அழைத்தால் 60-second cooldown 429 Too Many Requests தர வேண்டும்:
    it('should trigger 429 Too Many Requests cooldown when requested consecutively', async () => {
      // 🧼 Test Isolation: முந்தைய டெஸ்ட் ரன்னின் Cooldown-ஐ மட்டும் ரீசெட் செய்கிறோம்:
      await mongoose.model('User').updateOne(
        { email: 'admin@gmail.com' },
        { $unset: { passwordResetLastSentAt: 1 } }
      );

      // 1. முதல் முறை Admin-க்கு OTP கேட்கிறோம் (இது இப்போது எப்போதுமே Fresh 200 OK தரும்):
      const firstResponse = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'admin@gmail.com' });

      expect(firstResponse.status).toBe(200);

      // 2. உடனடியாக ஒரு வினாடிக்குள் மறுபடியும் அதே API-ஐ அழைக்கிறோம்:
      const secondResponse = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'admin@gmail.com' });

      // Assert: Cooldown செயல்பட்டு துல்லியமாக 429 எர்ரர் தர வேண்டும்!
      expect(secondResponse.status).toBe(429);
      expect(secondResponse.body.success).toBe(false);
      expect(secondResponse.body.message).toContain('seconds before requesting a new code');
    }, 15000);
  });
});