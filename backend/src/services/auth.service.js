import bcrypt from 'bcryptjs';
import { hashToken,generateTokenPair,generateNumericOtp } from '../utils/crypto.util.js';
import { sendInvitationEmail,sendPasswordResetOtpEmail } from '../utils/email.util.js';
import userRepository from '../repositories/user.repository.js';
import { generateAccessToken } from '../utils/jwt.util.js';

// ============================================================================
// 🔐 AUTH SERVICE (Login Business Logic & Token Issuance)
// ============================================================================
const login = async ({ email, password }) => {
  // 1. CHECK EMAIL: Database-la indha email-oda user irukaangala nu thedurom
  const user = await userRepository.findByEmailWithPassword(email);

  // ⚠️ SECURITY RULE: User illana "Email not found" nu solla koodaadhu!
  // Hacker-kku clue kedaika koodaadhu nu "Invalid email or password" nu solli 401 tharanum!
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401; // 401 Unauthorized
    throw error;
  }

  // 2. CHECK ACCOUNT STATUS:
  // Account innum invite accept pannala na login panna vida koodaadhu!
  if (user.status === 'INVITED') {
    const error = new Error('Please set up your password using the invitation link first');
    error.statusCode = 403; // 403 Forbidden
    throw error;
  }

  // Deactivate aana accounts-ai block panrom
  if (user.status === 'DEACTIVATED') {
    const error = new Error('Your account has been deactivated. Please contact your administrator');
    error.statusCode = 403;
    throw error;
  }

  // 3. COMPARE PASSWORDS WITH BCRYPT:
  // User anupina plain password-aiyum, DB-la irukura hash-aiyum bcrypt compare pannum
  const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // 4. GENERATE JWT ACCESS TOKEN:
  // User verify aagittaaru! Ippo avangalukku Digital Access Card (Token) tharom:
  const tokenPayload = {
    userId: user._id,
    role: user.role,
    email: user.email,
  };
  const token = generateAccessToken(tokenPayload);

  // 5. SANITIZE USER OBJECT:
  // Response anupura data-la passwordHash kandippa irukka koodaadhu!
  const sanitizedUser = {
    _id: user._id,
    email: user.email,
    role: user.role,
    status: user.status,
    employeeId: user.employeeId,
  };

  // 6. Return user details + JWT token!
  return {
    user: sanitizedUser,
    token,
  };
};

// ============================================================================
// 2. 🔑 SETUP INITIAL PASSWORD SERVICE (For Invited Employees)
// ============================================================================
const setupPassword = async ({ token, password }) => {
  // 1. URL-la irundhu vandha raw token-ai SHA-256 hash panrom (DB match panna):
  const hashedToken = hashToken(token);
  console.log(`hashedToken ${hashedToken}`);
  // 2. DB-la indha token match aagudhaa nu thedurom:
  const user = await userRepository.findValidInvitationUser(hashedToken);
  // Oru vela token thappa irundhaalo alladhu 24 hours mudinjirundhaalo:
  if (!user) {
    const error = new Error('Invalid or expired invitation token');
    error.statusCode = 400; // 👈 400 Bad Request
    throw error;
  }
  // 3. New Password-ai bcrypt vachu 12 salt rounds-oda hash panrom:
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);
  // 4. User Document-ai update panrom:
  user.passwordHash = passwordHash;
  user.status = 'ACTIVE';                  // 👈 Account Activated!
  user.invitationToken = undefined;       // 👈 Single-use: Token deleted from DB
  user.invitationExpiresAt = undefined;   // 👈 Expiry date removed
  // 5. Database-la save panrom:
  await user.save();
  return {
    message: 'Password setup successful. Your account is now active. Please login.',
  };
};

// ============================================================================
// 3. 👤 GET CURRENT USER PROFILE SERVICE (/me)
// Login aana user-oda full profile details-ai tharum.
// ============================================================================
const getMe = async (userId) => {
  // 1. Repository kitta solli User + Populated Employee data edukkirom:
  const user = await userRepository.findByIdWithProfile(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  // 2. Data-vai clean-a format panni anupurom:
  // Admin-kku employeeId null-a irukkum; Employee-kku full details irukkum!
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    status: user.status,
    employee: user.employeeId || null, // Populated employee object
    createdAt: user.createdAt,
  };
};

// ============================================================================
// 4. 🔁 RESEND INVITATION SERVICE (Admin & HR Only)
// Expire aana alladhu pending-la irukura employee-kku fresh 24h link anupum.
// ============================================================================
const resendInvitation = async (email) => {
  // 1. User database-la irukaangala nu check panrom:
  const user = await userRepository.findDocumentByEmail(email);

  if (!user) {
    const error = new Error('No user account found with this email');
    error.statusCode = 404; // 👈 404 Not Found
    throw error;
  }

  // 2. 🛡️ STATUS GUARDS:
  // User already active aagitaar na marubadiyum invite anupa koodaadhu!
  if (user.status === 'ACTIVE') {
    const error = new Error(
      'This user account is already active. Please ask them to login or use forgot password.'
    );
    error.statusCode = 400; // 👈 400 Bad Request
    throw error;
  }

  // Deactivated user-kku invitation anupa koodaadhu:
  if (user.status === 'DEACTIVATED') {
    const error = new Error('This user account is deactivated. Cannot send invitation.');
    error.statusCode = 403; // 👈 403 Forbidden
    throw error;
  }

  // 3. 🔐 FRESH TOKEN GENERATION & EXPIRY RESET:
  // Pazhaiya token-ai thookittu puthusa oru 24 hours valid token ready panrom:
  const { rawToken, hashedToken } = generateTokenPair();
  const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  // 4. DATABASE-LA PUDHU TOKEN-AI UPDATE PANROM:
  user.invitationToken = hashedToken;
  user.invitationExpiresAt = newExpiresAt;
  await user.save();

  // 5. NEW ACTIVATION LINK THAYAR:
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const newInvitationLink = `${clientUrl}/setup-password?token=${rawToken}`;

  // 6. ✉️ REAL EMAIL DISPATCH:
  await sendInvitationEmail({
    to: user.email,
    name: user.email.split('@')[0], // அல்லது employee name
    role: user.role,
    invitationLink: newInvitationLink,
  });

  return {
    email: user.email,
    status: user.status,
    expiresAt: newExpiresAt,
    invitationLink: newInvitationLink, // Dev mode testing-kku
  };
};

// ============================================================================
// 5. 🚪 LOGOUT SERVICE (With Real-Time Token Invalidation)
// ============================================================================
const logout = async (userId) => {
  // 1. Database-la lastLogoutAt timestamp-ai update panrom:
  await userRepository.updateLastLogout(userId);

  console.log(`🔒 User ${userId} successfully logged out. All prior tokens invalidated.`);

  return {
    message: 'Logged out successfully. Session invalidated.',
  };
};
// ============================================================================
// 6. 📩 FORGOT PASSWORD SERVICE (Request 6-Digit OTP with 60s Cooldown)
// ============================================================================
const forgotPassword = async (email) => {
  // A. User-ai OTP fields kooda thedurom:
  const user = await userRepository.findByEmailWithResetFields(email);

  // 🛡️ ANTI-ENUMERATION PROTECTION:
  // User database-la illana kooda "Email not found" nu solla koodaadhu!
  // Hacker-kku clue tharaama generic 200 success response tharuvom:
  if (!user || user.status === 'DEACTIVATED') {
    return {
      message: 'If that email address is in our database, we will send you a verification code.',
    };
  }

  // B. ⏱️ 60-SECOND COOLDOWN CHECK (Rate Limiting):
  // User adikkadi "Send Code" click panni spam panna koodaadhu:
  if (user.passwordResetLastSentAt) {
    const timePassedInSeconds = (Date.now() - new Date(user.passwordResetLastSentAt).getTime()) / 1000;
    if (timePassedInSeconds < 60) {
      const waitSeconds = Math.ceil(60 - timePassedInSeconds);
      const error = new Error(`Please wait ${waitSeconds} seconds before requesting a new code.`);
      error.statusCode = 429; // 429 Too Many Requests
      throw error;
    }
  }

  // C. 🔢 GENERATE 6-DIGIT OTP & HASH:
  const rawOtp = generateNumericOtp(); // eg: "849201"
  const hashedOtp = hashToken(rawOtp); // SHA-256 hash for database

  // D. 💾 SAVE TO DATABASE:
  user.passwordResetCode = hashedOtp;
  user.passwordResetExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 👈 5 MINUTES EXPIRY!
  user.passwordResetLastSentAt = new Date(); // 60s cooldown-kku
  user.passwordResetAttempts = 0; // 👈 Attempts counter-ai fresh-a 0 aakurom
  await user.save();

  // E. ✉️ SEND REAL EMAIL VIA NODEMAILER:
  await sendPasswordResetOtpEmail({
    to: user.email,
    otpCode: rawOtp,
  });

  return {
    message: 'If that email address is in our database, we will send you a verification code.',
  };
};

// ============================================================================
// 7. 🔢 VERIFY RESET CODE SERVICE (5-Attempt Guard & 15-Minute Token)
// ============================================================================
// Verify the password reset code submitted for the user's email.
// User anuppuna email-um verification code-um verify panna function.
const verifyResetCode = async ({ email, code }) => {
  // Email vachu user-aiyum password reset fields-aiyum database-la thedurom.
  const user = await userRepository.findByEmailWithResetFields(email);

  // Andha email-ku account illaina inga stop panni error anupprom.
  if (!user) {
    const error = new Error('Invalid email or verification code');
    error.statusCode = 400;
    throw error;
  }

  // 5 thadava thappana OTP enter pannitaangala-nu check panrom.
  if (user.passwordResetAttempts >= 5) {
    // Limit reach aana current OTP-um expiry time-um clear panrom.
    user.passwordResetCode = undefined;
    user.passwordResetExpiresAt = undefined;

    // Pudhu OTP request pannina attempt count zero-la start aagum.
    user.passwordResetAttempts = 0;

    // Indha changes-ai MongoDB-la save panrom.
    await user.save();

    // Current OTP invalidate aayiduchu-nu client-kku error anupprom.
    const error = new Error(
      'Too many failed attempts. This verification code has been invalidated. Please request a new code.'
    );
    error.statusCode = 400;
    throw error;
  }

  // Database-la active OTP-um adhan expiry time-um irukka-nu check panrom.
  if (!user.passwordResetCode || !user.passwordResetExpiresAt) {
    // OTP illaina user mudhal-la pudhu code request panna sollrom.
    const error = new Error(
      'No active verification code found. Please request a new code.'
    );
    error.statusCode = 400;
    throw error;
  }

  // Ippo irukkura time OTP expiry time-ai thaandiyachaa-nu check panrom.
  if (Date.now() > new Date(user.passwordResetExpiresAt).getTime()) {
    // OTP expire aayiduchuna, adhaiyum expiry time-aiyum database-la irundhu clear panrom.
    user.passwordResetCode = undefined;
    user.passwordResetExpiresAt = undefined;

    // Expire aana OTP-ku related attempts count-ai reset panrom.
    user.passwordResetAttempts = 0;

    // Clear panna changes-ai MongoDB-la save panrom.
    await user.save();

    // OTP expire aayiduchu-nu client-kku solli pudhu code request panna vaikkurom.
    const error = new Error(
      'Verification code has expired (5-minute limit). Please request a new code.'
    );
    error.statusCode = 400;
    throw error;
  }


  // 🛡️ CHECK 4: CODE HASH MATCHING CHECK
  const hashedInputCode = hashToken(code);

  // ❌ WRONG CODE ENTERED:
  if (hashedInputCode !== user.passwordResetCode) {
    user.passwordResetAttempts += 1;
    await user.save();

    const remainingAttempts = 5 - user.passwordResetAttempts;

    if (remainingAttempts <= 0) {
      // 5-vathu thadava thappa potta udaney code-ai invalidate panrom:
      user.passwordResetCode = undefined;
      user.passwordResetExpiresAt = undefined;
      user.passwordResetAttempts = 0;
      await user.save();

      const error = new Error('Too many failed attempts. This verification code has been blocked. Please request a new code.');
      error.statusCode = 400;
      throw error;
    }

    const error = new Error(`Invalid verification code. You have ${remainingAttempts} attempt(s) remaining.`);
    error.statusCode = 400;
    throw error;
  }

  // ✅ CORRECT CODE ENTERED:
  // A. OTP velai mudinjadhu, DB-la irundhu azhikkirom:
  user.passwordResetCode = undefined;
  user.passwordResetExpiresAt = undefined;
  user.passwordResetAttempts = 0;

  // B. Pudhu password poda 15-minute single-use resetToken tharuvom:
  const { rawToken, hashedToken } = generateTokenPair();
  user.passwordResetToken = hashedToken;
  user.passwordResetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
  await user.save();

  return {
    message: 'Verification code confirmed. You can now reset your password.',
    resetToken: rawToken,
  };
};

// ============================================================================
// 8. 🔑 RESET PASSWORD SERVICE (Set New Password & Revoke Old Sessions)
// ============================================================================
const resetPassword = async ({ resetToken, password }) => {
  // A. 15-minute token valid-a nu SHA-256 vachu thedurom:
  const hashedToken = hashToken(resetToken);
  const user = await userRepository.findByResetToken(hashedToken);

  if (!user) {
    const error = new Error('Invalid or expired reset token. Please request a new verification code.');
    error.statusCode = 400;
    throw error;
  }

  // B. BCRYPT HASHING (12 Rounds):
  const salt = await bcrypt.genSalt(12);//JWT
  user.passwordHash = await bcrypt.hash(password, salt);

  // C. RESET TOKENS-AI DESTROY PANROM:
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresAt = undefined;

  // D. 🚪 SESSION REVOCATION (Security Essential!):
  // Password maathiya udaney, vera enga yaaradhu login panni irundhaalum session invalidate aagidum!
  user.lastLogoutAt = new Date();

  await user.save();

  return {
    message: 'Password has been reset successfully. Please login with your new password.',
  };
};

export default {
  login,
  setupPassword,
  getMe,
  resendInvitation,
  logout,
  forgotPassword,    // 👈 New
  verifyResetCode,   // 👈 New
  resetPassword,     // 👈 New
};