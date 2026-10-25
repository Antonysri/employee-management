import bcrypt from 'bcryptjs';
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

export default {
  login,
};