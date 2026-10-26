import bcrypt from 'bcryptjs';
import { hashToken,generateTokenPair } from '../utils/crypto.util.js';

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

  // 6. ✉️ EMAIL SERVICE SIMULATION:
  console.log('\n============================================================');
  console.log('✉️  [EMAIL SERVICE SIMULATION - RESEND INVITATION]');
  console.log(`To: ${user.email}`);
  console.log(`Subject: Your New Invitation Link to Employee Portal`);
  console.log(`Role: ${user.role}`);
  console.log(`🔗 NEW Activation Link: ${newInvitationLink}`);
  console.log(`⏳ New Expiry: ${newExpiresAt.toISOString()}`);
  console.log('============================================================\n');

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

export default {
  login,
  setupPassword,
  getMe,
  resendInvitation,
  logout
};