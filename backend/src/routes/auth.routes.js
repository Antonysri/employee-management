import express from 'express';
import authController from '../controllers/auth.controller.js';
import validateRequest from '../middlewares/validateRequest.js'; // 👈 Reused Body Guard!
import { loginSchema } from '../validators/auth.schema.js';

const router = express.Router();

// ============================================================================
// 🔐 AUTH ROUTES (POST /api/v1/auth/login)
// ============================================================================
router.post(
  '/login',
  validateRequest(loginSchema), // Body Guard checks email and password
  authController.login          // Controller
);

export default router;