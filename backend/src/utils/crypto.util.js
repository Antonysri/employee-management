// backend/src/utils/crypto.util.js

// Node.js built-in cryptography engine-ai import panrom.
// Idhuku thaniya npm install thevai illa.
import crypto from 'crypto';

// ============================================================================
// 🔐 CRYPTOGRAPHY UTILITY (TOKEN GENERATOR & HASHER)
// Account invitation links, password reset tokens generate panna matrum
// avatrai database-il bathiramaga SHA-256 hash panni store panna use aagum.
// ============================================================================

/**
 * 1. HASH TOKEN (SHA-256):
 * Raw token-ai eduthu, database-il store panna koodiya secure SHA-256 hash-aaga maatrum.
 * 
 * @param {string} token - The raw token (eg: from email URL)
 * @returns {string} 64-character SHA-256 hex hash
 */
export const hashToken = (token) => {
  return crypto
    .createHash('sha256') // SHA-256 algorithm engine initialize panrom
    .update(token)        // Raw token-ai hashing engine-kulla anupurom
    .digest('hex');       // Hash aana result-ai 64-char hex string-a edukkirom
};

/**
 * 2. GENERATE INVITATION / RESET TOKEN PAIR:
 * Ore call-il rendu vishayangalai ready panni tharum:
 *  - rawToken: Email link-il user-kku anupa vendiya unmaiyana token.
 *  - hashedToken: Database-il save panna vendiya sha-256 hash.
 * 
 * @param {number} [byteSize=32] - Default 32 bytes (generates 64-character string)
 * @returns {{ rawToken: string, hashedToken: string }}
 */
export const generateTokenPair = (byteSize = 32) => {
  // A. 32 bytes ultra-secure random string generate panrom:
  const rawToken = crypto.randomBytes(byteSize).toString('hex');

  // B. Andha raw token-ai udaney SHA-256 vachu hash panrom:
  const hashedToken = hashToken(rawToken);

  // C. Irandayum oru object-a return panrom:
  return {
    rawToken,
    hashedToken,
  };
};

/**
 * 3. GENERATE 6-DIGIT NUMERIC OTP:
 * Cryptographically secure 6-digit random number generate pannum (100000 - 999999).
 * Math.random()-ku badhila Node.js crypto engine use panradhala hackers-al guess panna mudiyadhu.
 * 
 * @returns {string} 6-digit numeric string (eg: "849201")
 */
export const generateNumericOtp = () => {
  // 100000-la irundhu 999999 varaikkum cryptographically random integer generate panrom:
  return crypto.randomInt(100000, 1000000).toString();
};

export default {
  hashToken,
  generateTokenPair,
  generateNumericOtp,
};