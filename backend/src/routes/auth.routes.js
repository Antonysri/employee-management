import express from 'express';
import authController from '../controllers/auth.controller.js';
import validateRequest from '../middlewares/validateRequest.js'; // 👈 Reused Body Guard!

// 🛡️ Security Guards & Constants
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { ROLES } from '../constants/roles.js';

// Schemas import
import { 
  loginSchema, 
  setupPasswordSchema,
  resendInvitationSchema 
} from '../validators/auth.schema.js';

const router = express.Router();

// ============================================================================
// 🔐 AUTH ROUTES (POST /api/v1/auth/login)
// ============================================================================
router.post(
  '/login',
  validateRequest(loginSchema), // Body Guard checks email and password
  authController.login          // Controller
);


// 2. 🔑 POST /api/v1/auth/setup-password (Public Endpoint for Invited Users)
router.post(
  '/setup-password',
  validateRequest(setupPasswordSchema),
  authController.setupPassword
);


// 3. 👤 GET /api/v1/auth/me (PROTECTED - Token Required)
router.get('/me', authenticate, authController.getMe);


// ============================================================================
// 4. 🔁 POST /api/v1/auth/resend-invitation (ADMIN & HR ONLY)
// ============================================================================
router.post(
  '/resend-invitation',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.HR),
  validateRequest(resendInvitationSchema),
  authController.resendInvitation
);

// POST /api/v1/auth/logout
router.post('/logout', authenticate, authController.logout);

export default router;