// backend/src/middlewares/authenticate.js

// Import token verification helper
import { verifyAccessToken } from '../utils/jwt.util.js';

// Import user repository to fetch current live user state from database
import userRepository from '../repositories/user.repository.js';

// ============================================================================
// 🛡️ AUTHENTICATION MIDDLEWARE (IDENTITY CHECK)
// Varum ovvoru request-layum Authorization Header-il valid JWT token irukkaa,
// andha user unmaiyave active-aa irukaangalaa nu verify panna use aagum.
// ============================================================================

export const authenticate = async (req, res, next) => {
  try {
    // 1. GET AUTHORIZATION HEADER:
    // Request header-la irundhu 'Authorization' value-ai edukkirom
    const authHeader = req.headers.authorization;

    // 2. CHECK FORMAT (Must start with 'Bearer '):
    // Standard OAuth2 / JWT format: "Bearer <token_string>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    // 3. EXTRACT TOKEN:
    // "Bearer eyJhbGciOi..." -> 'Bearer ' prefix-ai split panni token-ai mattum edukkirom
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format.',
      });
    }

    // 4. VERIFY SIGNATURE & EXPIRATION:
    // Token valid-aa illai expired-aa nu check panrom. Thappa irundha jwt error throw aagum.
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      // Token expire aagirundhaalo illai alter pannirundhaalo:
      return res.status(401).json({
        success: false,
        message: err.name === 'TokenExpiredError' 
          ? 'Token has expired. Please login again.' 
          : 'Invalid or tampered token.',
      });
    }

    // 5. LIVE DATABASE CHECK:
    // Token valid dhaan, aana andha user-ai Admin delete pannitaangalaa illai deactive pannitaangalaa?
    // Token-kulla irukura userId vechu database-la fresh user status-ai check panrom.
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    // User status ACTIVE illai endraal (INVITED or DEACTIVATED):
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status.toLowerCase()}. Access denied.`,
      });
    }

    // 6. ATTACH USER TO REQUEST OBJECT:
    // Adutha controller / authorize middleware use panna, req.user-la user info-ai vachidrom!
    req.user = user;

    // Ellam sariyaa irukku, adutha middleware / controller-ku anupu!
    next();
  } catch (error) {
    // Unhandled system errors
    next(error);
  }
};

export default authenticate;