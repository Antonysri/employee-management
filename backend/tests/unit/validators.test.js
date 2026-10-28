// backend/tests/unit/validators.test.js

// 🧪 Vitest-ல் இருந்து 3 முக்கியமான டூல்ஸ்களை இறக்குமதி (Import) செய்கிறோம்:
// describe -> பல டெஸ்ட்டுகளை ஒன்றாகக் குடையின் கீழ் வைக்கும் தலைப்பு (Suite)
// it       -> ஒரு குறிப்பிட்ட விஷயத்தை மட்டும் சோதிக்கும் தனித்தனி டெஸ்ட் (Case)
// expect   -> 'இந்த முடிவுதான் வர வேண்டும்' என உறுதிப்படுத்தும் நீதிபதி (Assertion)
import { describe, it, expect } from 'vitest';

// 🛡️ நாம் உருவாக்கிய Auth Zod Schemas-ஐ import செய்கிறோம்:
import { 
  loginSchema, 
  resetPasswordSchema, 
  verifyResetCodeSchema, 
  forgotPasswordSchema 
} from '../../src/validators/auth.schema.js';

// 👥 Employee Creation Schema-வை import செய்கிறோம்:
import { createEmployeeSchema } from '../../src/validators/employee.schema.js';

// ============================================================================
// 1️⃣ SUITE 1: EMPLOYEE CREATION VALIDATOR TESTS
// ============================================================================
describe('Zod Validator: createEmployeeSchema', () => {

  // ✅ TEST 1.1: எல்லா ஃபீல்டுகளும் சரியாக இருந்தால் Pass ஆக வேண்டும்:
  it('should pass validation when all required fields are valid', () => {
    // 1. Arrange: சரியான இன்புட் டேட்டாவை தயார் செய்கிறோம்
    const validEmployeeData = {
      name: 'Ramesh Kumar',
      email: 'Ramesh.Dev@Company.COM', // Capital letters-ல் கொடுக்கிறோம்
      department: 'Engineering',
      position: 'Senior Software Engineer',
      salary: 85000,
      role: 'EMPLOYEE',
    };

    // 2. Act: safeParse மூலம் வேலிடேட் செய்கிறோம்
    const result = createEmployeeSchema.safeParse(validEmployeeData);

    // 3. Assert: Zod பச்சைக்கொடி காட்டியிருக்க வேண்டும்
    expect(result.success).toBe(true);

    // கூடுதல் சோதனை: Email தானாகவே lowercase ஆக மாறியிருக்க வேண்டும்!
    expect(result.data.email).toBe('ramesh.dev@company.com');
  });

  // ❌ TEST 1.2: Position ஃபீல்டு விடுபட்டால் 400 Validation Error வர வேண்டும்:
  it('should fail validation when required position field is missing', () => {
    // 1. Arrange: position இல்லாத அரைகுறை டேட்டா
    const invalidDataWithoutPosition = {
      name: 'Ramesh Kumar',
      email: 'ramesh@company.com',
      department: 'Engineering',
      salary: 85000,
      // 👈 'position' இங்கே விடுபட்டுள்ளது!
    };

    // 2. Act
    const result = createEmployeeSchema.safeParse(invalidDataWithoutPosition);

    // 3. Assert: Zod இதை நிராகரிக்க வேண்டும் (success = false)
    expect(result.success).toBe(false);

    // எர்ரர் மெசேஜில் 'position' என்ற வார்த்தை இருக்கிறதா எனப் பார்க்கிறோம்:
    const errorField = result.error.issues[0].path[0];
    expect(errorField).toBe('position');
  });

  // ❌ TEST 1.3: சம்பளம் மைனஸில் (Negative) இருந்தால் நிராகரிக்க வேண்டும்:
  it('should fail validation when salary is a negative number', () => {
    // 1. Arrange: சம்பளத்தை -5000 என தவறாகக் கொடுக்கிறோம்
    const invalidDataWithNegativeSalary = {
      name: 'Ramesh Kumar',
      email: 'ramesh@company.com',
      department: 'Engineering',
      position: 'Developer',
      salary: -5000, // 👈 மைனஸ் சம்பளம் இருக்கக்கூடாது!
    };

    // 2. Act
    const result = createEmployeeSchema.safeParse(invalidDataWithNegativeSalary);

    // 3. Assert
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// 2️⃣ SUITE 2: LOGIN VALIDATOR TESTS
// ============================================================================
describe('Zod Validator: loginSchema', () => {

  // ✅ TEST 2.1: சரியான Email மற்றும் 6+ பாஸ்வேர்ட் இருந்தால் பாஸ் ஆக வேண்டும்:
  it('should pass validation for valid email and password', () => {
    const validLoginData = {
      email: 'admin@company.com',
      password: 'password123',
    };

    const result = loginSchema.safeParse(validLoginData);
    expect(result.success).toBe(true);
  });

  // ❌ TEST 2.2: பாஸ்வேர்ட் 6 எழுத்துக்களுக்கு குறைவாக இருந்தால் ஃபெயில் ஆக வேண்டும்:
  it('should fail validation when password is less than 6 characters', () => {
    const invalidPasswordData = {
      email: 'admin@company.com',
      password: '123', // 👈 வெறும் 3 எழுத்துக்கள் மட்டுமே!
    };

    const result = loginSchema.safeParse(invalidPasswordData);

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('at least 6 characters');
  });

  // ❌ TEST 2.3: தவறான Email வடிவம் (@ இல்லாதது) இருந்தால் ஃபெயில் ஆக வேண்டும்:
  it('should fail validation when email format is invalid', () => {
    const invalidEmailData = {
      email: 'invalid-email-without-at-symbol',
      password: 'password123',
    };

    const result = loginSchema.safeParse(invalidEmailData);

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('valid email');
  });
});

// ============================================================================
// 3️⃣ SUITE 3: 6-DIGIT OTP VERIFY VALIDATOR TESTS
// ============================================================================
describe('Zod Validator: verifyResetCodeSchema', () => {

  // ✅ TEST 3.1: சரியாக 6 இலக்க எண்கள் இருந்தால் பாஸ் ஆக வேண்டும்:
  it('should pass when OTP code is exactly 6 numeric digits', () => {
    const validOtpData = {
      email: 'user@gmail.com',
      code: '849201', // 👈 சரியாக 6 எண்கள்!
    };

    const result = verifyResetCodeSchema.safeParse(validOtpData);
    expect(result.success).toBe(true);
  });

  // ❌ TEST 3.2: 5 இலக்க எண்கள் மட்டுமே இருந்தால் (குறைவாக இருந்தால்) ஃபெயில் ஆக வேண்டும்:
  it('should fail when OTP code is less than 6 digits', () => {
    const shortOtpData = {
      email: 'user@gmail.com',
      code: '12345', // 👈 5 எண்கள் மட்டுமே!
    };

    const result = verifyResetCodeSchema.safeParse(shortOtpData);

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('exactly 6 digits');
  });

  // ❌ TEST 3.3: எண்களுக்கு நடுவே எழுத்துக்கள் (Alphabets) வந்தால் ஃபெயில் ஆக வேண்டும்:
  it('should fail when OTP code contains non-numeric characters', () => {
    const alphaOtpData = {
      email: 'user@gmail.com',
      code: '12AB56', // 👈 எண்களுக்கு நடுவே AB எழுத்துக்கள்!
    };

    const result = verifyResetCodeSchema.safeParse(alphaOtpData);

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('exactly 6 digits');
  });
});

// ============================================================================
// 4️⃣ SUITE 4: RESET PASSWORD (PASSWORD MATCH REFINE) TESTS
// ============================================================================
describe('Zod Validator: resetPasswordSchema', () => {

  // ✅ TEST 4.1: Password மற்றும் Confirm Password இரண்டும் ஒன்றாக இருந்தால் பாஸ் ஆக வேண்டும்:
  it('should pass when password and confirmPassword match perfectly', () => {
    const matchingPasswordsData = {
      resetToken: 'secure-crypto-reset-token-sample',
      password: 'MySecretPassword@123',
      confirmPassword: 'MySecretPassword@123', // 👈 இரண்டும் ஒன்றுபோலவே உள்ளது!
    };

    const result = resetPasswordSchema.safeParse(matchingPasswordsData);
    expect(result.success).toBe(true);
  });

  // ❌ TEST 4.2: இரண்டும் பொருந்தவில்லை என்றால் (Mismatch) Zod .refine() பிடிக்க வேண்டும்:
  it('should fail when password and confirmPassword do not match', () => {
    const mismatchedPasswordsData = {
      resetToken: 'secure-crypto-reset-token-sample',
      password: 'MySecretPassword@123',
      confirmPassword: 'TotallyDifferentPassword@999', // 👈 தவறான மேட்ச்!
    };

    const result = resetPasswordSchema.safeParse(mismatchedPasswordsData);

    expect(result.success).toBe(false);
    // நாம் refine-ல் எழுதிய 'Passwords do not match' எர்ரர் வர வேண்டும்:
    expect(result.error.issues[0].message).toBe('Passwords do not match');
    // எர்ரர் confirmPassword ஃபீல்டில் விழ வேண்டும்:
    expect(result.error.issues[0].path).toContain('confirmPassword');
  });
});

// ============================================================================
// 2️⃣.B SUITE: FORGOT PASSWORD VALIDATOR TESTS
// ============================================================================
describe('Zod Validator: forgotPasswordSchema', () => {

  // ✅ TEST: சரியான Email இருந்தால் பாஸ் ஆகி lowercase ஆக மாற வேண்டும்:
  it('should pass validation and transform email to lowercase', () => {
    const validData = {
      email: '  User.Test@Gmail.COM  ', // Spaces மற்றும் Capital letters
    };

    const result = forgotPasswordSchema.safeParse(validData);

    expect(result.success).toBe(true);
    // Trim செய்யப்பட்டு lowercase ஆகியிருக்க வேண்டும்:
    expect(result.data.email).toBe('user.test@gmail.com');
  });

  // ❌ TEST: தவறான மின்னஞ்சல் வடிவம் வந்தால் ஃபெயில் ஆக வேண்டும்:
  it('should fail validation when email format is invalid', () => {
    const invalidData = {
      email: 'not-an-email-address',
    };

    const result = forgotPasswordSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('valid email');
  });
});