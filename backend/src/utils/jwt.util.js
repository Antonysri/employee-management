import jwt from 'jsonwebtoken';

// ============================================================================
// 🎟️ JWT TOKEN GENERATOR UTILITY
// User login aana udane avangalukku digital access card (JWT) ready panni tharum.
// ============================================================================

// 1. GENERATE ACCESS TOKEN:
// Payload: Token-kulla namma store panna vendiya data (userId, role, email)
export const generateAccessToken = (payload) => {
  // process.env.JWT_SECRET vechu digitally sign panrom
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d', // 1 Day valid
  });
};

// 2. VERIFY ACCESS TOKEN:
// Request varum podhu token unmaiyave namma company sign pannadhaa nu check panna
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export default {
  generateAccessToken,
  verifyAccessToken,
};