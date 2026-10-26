import { z } from 'zod';

// 🎭 Roles constants import panrom (Magic strings thavirkka):
import { ROLES } from '../constants/roles.js';

// ============================================================================
// 🟢 CREATE EMPLOYEE VALIDATION SCHEMA
// POST /api/v1/employees request body-la vara data-vai verify panna idhu thevai.
// ============================================================================
export const createEmployeeSchema = z.object({
  // 1. NAME:
  // - Must be String, trimmed, 2 to 100 characters
  name: z.string().trim().min(2).max(100),

  // 2. EMAIL:
  // - Must be valid email, lowercase transformation
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),

  // 3. DEPARTMENT:
  department: z.string().trim().min(2).max(100),

  // 4. POSITION:
  position: z.string().trim().min(2).max(100),

  // 5. SALARY:
  // - Non-negative number (>= 0)
  salary: z.number().nonnegative(),

  // 6. STATUS (Optional):
  // - Default-a Mongoose 'ACTIVE' vachikkum
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),

  // 7. 🎭 ACCOUNT ROLE (Optional with Default):
  // - Kudutha ADMIN, HR, EMPLOYEE mattum dhaan allow aagum.
  // - Client indha field-ai anupala na, Zod automatic-ah 'EMPLOYEE' role assign pannidum!
  role: z
    .enum([ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE])
    .default(ROLES.EMPLOYEE),
});

// Validate query parameters used to list employees.
export const listEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  department: z.string().trim().max(100).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

// ============================================================================
// 🆔 ROUTE PARAMETER VALIDATION SCHEMA
// ============================================================================
export const employeeIdParamSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID format. Must be a 24-character hexadecimal string'),
});

// ============================================================================
// 4. 🟡 MODERN UPDATE SCHEMA (DRY Standard with .partial())
// ============================================================================
export const updateEmployeeSchema = createEmployeeSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    'At least one field must be provided for update'
  );

// ============================================================================
// 🗑️ DELETE / DEACTIVATE QUERY SCHEMA
// ============================================================================
export const deleteEmployeeQuerySchema = z.object({
  permanent: z.coerce.boolean().default(false),
});