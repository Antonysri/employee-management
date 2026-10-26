import User from '../models/user.model.js';

// ============================================================================
// 👤 USER REPOSITORY (Database Queries for Authentication)
// ============================================================================

// 1. FIND BY EMAIL WITH PASSWORD HASH (Only for Login):
// Normal-ah Mongoose password-ai hide pannidum.
// Inga '+passwordHash' nu potta dhaan bcrypt kitta compare panna password kedaikkum!
const findByEmailWithPassword = async (email) => {
  return User.findOne({ email }).select('+passwordHash');
};

// 2. FIND USER BY ID (Safe lookup without password):
// Later auth middleware-la token decode panni user-ai eduka use aagum.
const findById = async (id) => {
  return User.findById(id).lean();
};

// 3. 🔍 FIND USER BY EMAIL (Safe lookup):
// Employee create pannumbodhu indha email-la already user irukaangala nu check panna:
const findByEmail = async (email) => {
  return User.findOne({ email }).lean();
};

// 4. ➕ CREATE NEW USER ACCOUNT (For Employee Invitation):
// Invited employee-kku account create panna use aagum.
const createUser = async (userData) => {
  return User.create(userData);
};

// 5. 🔍 FIND USER BY VALID INVITATION TOKEN:
// Token match aaganum + Expiry time innum mudinjirukka koodaadhu ($gt: now) + status 'INVITED' aaga irukkanum.
// .save() method use panna vendi iruppadhaal .lean() poda koodaadhu!
const findValidInvitationUser = async (hashedToken) => {
  return User.findOne({
    invitationToken: hashedToken,
    invitationExpiresAt: { $gt: new Date() }, // 👈 24h kulla irukkanum
    status: 'INVITED',
  });
};
// 6. 🌟 FIND USER BY ID WITH POPULATED EMPLOYEE PROFILE (/me endpoint-kku):
// User data koodave linked Employee details-aiyum Mongoose .populate() vechu JOIN panni edukkirom!
const findByIdWithProfile = async (id) => {
  return User.findById(id)
    .populate('employeeId') // 👈 Employees table-la irundhu details varum!
    .lean();
};

// 7. 📄 FIND USER DOCUMENT BY EMAIL (Without .lean(), for updates):
// Resend invitation-la user status check panni, new token pottu .save() panna idhu thevai.
const findDocumentByEmail = async (email) => {
  return User.findOne({ email });
};

// 8. 🚪 UPDATE LAST LOGOUT TIMESTAMP:
// User logout aagumbodhu andha nerathai DB-la save panrom.
const updateLastLogout = async (userId) => {
  return User.findByIdAndUpdate(
    userId,
    { $set: { lastLogoutAt: new Date() } },
    { new: true }
  );
};

export default {
  findByEmailWithPassword,
  findById,
  findByEmail,
  createUser,
  findValidInvitationUser,
  findByIdWithProfile,
  findDocumentByEmail,
  updateLastLogout,
};