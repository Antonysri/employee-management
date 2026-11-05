// frontend/src/types/auth.types.ts

// ============================================================================
// 🎭 1. USER ROLES (UNION TYPE)
// ============================================================================
// Namma backend-la ROLES: 'ADMIN' | 'HR' | 'EMPLOYEE' nu define pannirundhom.
// Intha 3 values thavira vera ethayum TypeScript compile panna vidaathu!
export type UserRole = 'ADMIN' | 'HR' | 'EMPLOYEE';

// ============================================================================
// 👤 2. AUTHENTICATED USER BLUEPRINT
// ============================================================================
// User login panna apram backend anuppura User details
export interface AuthUser {
  id: string;             // MongoDB _id
  email: string;          // User email (eg: admin@company.com)
  role: UserRole;         // ADMIN, HR, or EMPLOYEE
  isVerified: boolean;    // Email verify aairukka illaya
}

// ============================================================================
// 🔑 3. LOGIN REQUEST (What Frontend Sends to Backend)
// ============================================================================
// Login form submit panrapo backend-ku pogum data
export interface LoginCredentials {
  email: string;
  password: string;
}

// ============================================================================
// 📦 4. LOGIN RESPONSE (What Backend Returns to Frontend)
// ============================================================================
// Login success aana backend tharura package: JWT token + User details
export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;          // JWT Bearer Token (LocalStorage-la save pannuvom)
  user: AuthUser;
}

// ============================================================================
// ⚠️ 5. API ERROR RESPONSE BLUEPRINT
// ============================================================================
// Password thappa pottal backend tharura error shape
export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: string[];      // Multiple validation errors iruntha list aagum
}