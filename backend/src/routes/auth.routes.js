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
  resendInvitationSchema,
  forgotPasswordSchema, 
  verifyResetCodeSchema, 
  resetPasswordSchema  
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

//5. POST /api/v1/auth/logout
router.post('/logout', authenticate, authController.logout);

// ============================================================================
// 5. 📩 POST /api/v1/auth/forgot-password (PUBLIC)
// 60-second cooldown + 6-digit OTP mail அனுப்பும்
// ============================================================================
router.post(
  '/forgot-password',
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);

// ============================================================================
// 6. 🔢 POST /api/v1/auth/verify-reset-code (PUBLIC)
// 6-digit OTP verify செய்யும் + 5-thadava thappu panna block pannum
// ============================================================================
router.post(
  '/verify-reset-code',
  validateRequest(verifyResetCodeSchema),
  authController.verifyResetCode
);

// ============================================================================
// 7. 🔑 POST /api/v1/auth/reset-password (PUBLIC)
// resetToken வைத்து புதிய பாஸ்வேர்ட் மாற்றும் + பழைய session-களை logout செய்யும்
// ============================================================================
router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

export default router;