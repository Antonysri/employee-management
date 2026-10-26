import { z } from 'zod';

// ============================================================================
// 🔐 LOGIN VALIDATION SCHEMA
// POST /api/v1/auth/login request body-ai verify pannum.
// ============================================================================
export const loginSchema = z.object({
  // 1. EMAIL:
  // Must be valid email, spaces trim pannum, automatic-ah lowercase maathum
  email: z
    .string()
    .trim()
    .email('Please provide a valid email address')
    .transform((val) => val.toLowerCase()),

  // 2. PASSWORD:
  // Password minimum 6 characters irukkanum
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
});

// ============================================================================
// 2. 🔑 SETUP INITIAL PASSWORD SCHEMA (For Invited Users)
// New employee email invitation link click panni password set panna idhu thevai.
// ============================================================================
export const setupPasswordSchema = z
  .object({
    // Email link-il irundhu vara 64-char raw hex token:
    token: z
      .string()
      .trim()
      .min(1, 'Invitation token is required'),
    // Employee vaikka virumbum new password (min 6 chars):
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    // Confirm password:
    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters'),
  })
  // 🛡️ Password and Confirm Password renduமே match aaganum:
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'], // Error confirmPassword field-ku keela kaattum
  });

// ============================================================================
// 3. 🔁 RESEND INVITATION VALIDATION SCHEMA
// Admin / HR oru employee-kku marubadiyum invite anupa indha email validation thevai.
// ============================================================================
export const resendInvitationSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Invalid email address format')
    .max(255)
    .transform((val) => val.toLowerCase()),
});

export default {
  loginSchema,
  setupPasswordSchema,
  resendInvitationSchema
};