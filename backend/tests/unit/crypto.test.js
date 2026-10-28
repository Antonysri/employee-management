// backend/tests/unit/crypto.test.js

// 🧪 Vitest டூல்ஸ் import செய்கிறோம்:
import { describe, it, expect } from 'vitest';

// 🔐 நம்முடைய Crypto Helpers-ஐ import செய்கிறோம்:
import { 
  generateNumericOtp, 
  hashToken, 
  generateTokenPair 
} from '../../src/utils/crypto.util.js';

// ============================================================================
// 1️⃣ SUITE 1: 6-DIGIT OTP GENERATOR TESTS
// ============================================================================
describe('Crypto Utility: generateNumericOtp', () => {

  // ✅ TEST 1.1: சரியாக 6 இலக்க ஸ்ட்ரிங் வர வேண்டும்:
  it('should generate an OTP string of exactly 6 characters', () => {
    // Act: OTP generate செய்கிறோம்
    const otp = generateNumericOtp();

    // Assert: நீளம் சரியாக 6 இருக்க வேண்டும்
    expect(otp).toBeTypeOf('string');
    expect(otp.length).toBe(6);
  });

  // ✅ TEST 1.2: எண்கள் மட்டுமே இருக்க வேண்டும் (100000 முதல் 999999 வரை):
  it('should only contain digits between 100000 and 999999', () => {
    const otp = generateNumericOtp();
    const otpNumber = parseInt(otp, 10);

    // 6-digit regex check (/^\d{6}$/):
    expect(otp).toMatch(/^\d{6}$/);

    // எண் வரம்பு check:
    expect(otpNumber).toBeGreaterThanOrEqual(100000);
    expect(otpNumber).toBeLessThanOrEqual(999999);
  });

  // ✅ TEST 1.3: அடுத்தடுத்து வரும் OTP-கள் தனித்துவமாக (Random) இருக்க வேண்டும்:
  it('should generate unique random OTPs on consecutive calls', () => {
    const otp1 = generateNumericOtp();
    const otp2 = generateNumericOtp();

    // அடுத்தடுத்து உருவாக்கப்படும் இரண்டும் ஒரே எண்ணாக இருக்கக்கூடாது:
    expect(otp1).not.toBe(otp2);
  });
});

// ============================================================================
// 2️⃣ SUITE 2: SHA-256 TOKEN HASHER TESTS
// ============================================================================
describe('Crypto Utility: hashToken', () => {

  // ✅ TEST 2.1: 64 எழுத்துக்கள் கொண்ட SHA-256 hex string வர வேண்டும்:
  it('should hash a raw token into a 64-character SHA-256 hex string', () => {
    const rawToken = 'my-secret-invitation-token-12345';
    const hashed = hashToken(rawToken);

    expect(hashed).toBeTypeOf('string');
    expect(hashed.length).toBe(64); // SHA-256 hex எப்போதுமே 64 chars!
  });

  // ✅ TEST 2.2: ஒரே இன்புட்டுக்கு எப்போதும் ஒரே Hash தான் வர வேண்டும் (Deterministic):
  it('should consistently return the exact same hash for identical input', () => {
    const input = 'consistent-test-token';
    const hash1 = hashToken(input);
    const hash2 = hashToken(input);

    expect(hash1).toBe(hash2);
  });

  // ✅ TEST 2.3: வெவ்வேறு இன்புட்டுகளுக்கு வெவ்வேறு Hash வர வேண்டும்:
  it('should generate completely different hashes for different inputs', () => {
    const hash1 = hashToken('token-alpha');
    const hash2 = hashToken('token-beta');

    expect(hash1).not.toBe(hash2);
  });
});

// ============================================================================
// 3️⃣ SUITE 3: TOKEN PAIR GENERATOR TESTS
// ============================================================================
describe('Crypto Utility: generateTokenPair', () => {

  // ✅ TEST 3.1: rawToken மற்றும் hashedToken இரண்டையும் ஒரு ஆப்ஜெக்ட்டாகத் தர வேண்டும்:
  it('should return both rawToken and its corresponding hashedToken', () => {
    const pair = generateTokenPair();

    // ஆப்ஜெக்ட்டில் இரண்டு ஃபீல்டுகளும் இருக்க வேண்டும்:
    expect(pair).toHaveProperty('rawToken');
    expect(pair).toHaveProperty('hashedToken');

    // Default 32 bytes என்பதால் rawToken 64 chars hex ஆக இருக்கும்:
    expect(pair.rawToken.length).toBe(64);
    expect(pair.hashedToken.length).toBe(64);

    // rawToken-ஐ hashToken() போட்டால் வரும் hash, pair.hashedToken-உடன் பொருந்த வேண்டும்:
    const expectedHash = hashToken(pair.rawToken);
    expect(pair.hashedToken).toBe(expectedHash);
  });
});