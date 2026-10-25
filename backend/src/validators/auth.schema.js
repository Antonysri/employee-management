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

export default {
  loginSchema,
};