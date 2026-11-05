// frontend/src/services/auth.service.ts

import apiClient, { TOKEN_STORAGE_KEY } from './api';
import { 
  LoginCredentials, 
  AuthResponse, 
  AuthUser 
} from '../types/auth.types';

// ============================================================================
// 📦 OTP & PASSWORD RESET TYPES (For Forgot Password Flow)
// ============================================================================
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  resetToken: string; // 6-digit OTP correct-ah iruntha backend tharura 1-time token
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// 🛡️ AUTH SERVICE (The Diplomat)
// ============================================================================
export const authService = {

  // ==========================================================================
  // 1. 🔑 LOGIN API CALL (POST /api/v1/auth/login)
  // ==========================================================================
  // User email & password submit panna udane backend-ku anuppi token vaangurom.
  //
  // 💡 EXAMPLE USAGE IN LOGIN COMPONENT:
  // try {
  //   const response = await authService.login({
  //     email: "admin@company.com",
  //     password: "Password@123"
  //   });
  //   console.log("Logged inAuthResponse user:", response.user.email);
  //   console.log("JWT Token:", response.token);
  // } catch (err) {
  //   console.error("Login failed!");
  // }
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // apiClient already baseURL (/api/v1) vechirukku, so verum '/auth/login' pothum!
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Login success aana udane, browser localStorage-la token-ah save panrom!
    if (response.data.token) {AuthResponse
      localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
    }

    return response.data;
  },

  // ==========================================================================
  // 2. 👤 GET CURRENT LOGGED-IN USER (GET /api/v1/auth/me)
  // ==========================================================================
  // Page refresh aana, user login-la thaan irukana nu backend kitta verify panna.
  // Inga token pass panna thevaiye illa! apiClient interceptor automatic-ah anuppidum!
  //
  // 💡 EXAMPLE USAGE:
  // const { user } = await authService.getCurrentUser();
  // console.log("Current user role:", user.role); // e.g., 'ADMIN'
  getCurrentUser: async (): Promise<{ success: boolean; user: AuthUser }> => {
    const response = await apiClient.get<{ success: boolean; user: AuthUser }>('/auth/me');
    return response.data;
  },

  // ==========================================================================
  // 3. 🚪 LOGOUT API CALL (POST /api/v1/auth/logout)
  // ==========================================================================
  // Backend session invalidate pannittu, browser localStorage token-ah clean panrom.
  //
  // 💡 EXAMPLE USAGE:
  // await authService.logout();
  // // Screen will auto redirect to /login
  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/auth/logout');
      return response.data;
    } finally {
      // Backend error adichalum seri, browser-la irunthu token-ah kandippa thookiduvom!
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  },

  // ==========================================================================
  // 4. 📩 FORGOT PASSWORD (POST /api/v1/auth/forgot-password)
  // ==========================================================================
  // User email kudutha, backend 6-digit OTP mail anuppum (60s cooldown limit oda).
  //
  // 💡 EXAMPLE USAGE:
  // const res = await authService.forgotPassword("antony@company.com");
  // alert(res.message); // "6-digit OTP sent to your registered email!"
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  // ==========================================================================
  // 5. 🔢 VERIFY 6-DIGIT OTP (POST /api/v1/auth/verify-reset-code)
  // ==========================================================================
  // Mail-ku vantha 6-digit OTP code-ah verify panni, password maatha thevayana resetToken vaangurom.
  //
  // 💡 EXAMPLE USAGE:
  // const res = await authService.verifyResetCode("antony@company.com", "482910");
  // console.log("Secret Reset Token:", res.resetToken);
  verifyResetCode: async (email: string, code: string): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post<VerifyOtpResponse>('/auth/verify-reset-code', {
      email,
      code,
    });
    return response.data;
  },

  // ==========================================================================
  // 6. 🔐 SET NEW PASSWORD (POST /api/v1/auth/reset-password)
  // ==========================================================================
  // Verify aana resetToken vechu puthu password set panrom.
  //
  // 💡 EXAMPLE USAGE:
  // await authService.resetPassword(resetToken, "NewPass@2026", "NewPass@2026");
  // alert("Password changed successfully! Please login with your new password.");
  resetPassword: async (
    resetToken: string,
    password: string,
    confirmPassword: string
  ): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', {
      resetToken,
      password,
      confirmPassword,
    });
    return response.data;
  },
};

export default authService;