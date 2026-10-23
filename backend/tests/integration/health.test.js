// backend/tests/integration/health.test.js
import 'dotenv/config'; // 👈 .env read panna
import mongoose from 'mongoose'; // 👈 Mongoose connect panna
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('Health Check API (/api/v1/health)', () => {

  // 🍃 1. Test start aagum munnaadi Atlas connect pannu:
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  // 🔌 2. Test mudinjadhum connection close pannu:
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // 🧪 3. Ippo Test Run Aagum:
  it('should return status 200 and database connected', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.database).toBe('Connected');
  });

});