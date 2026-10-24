import { z } from 'zod';

// ============================================================================
// 🟢 CREATE EMPLOYEE VALIDATION SCHEMA
// POST /api/v1/employees request body-la vara data-vai verify panna idhu thevai.
// ============================================================================
export const createEmployeeSchema = z.object({
  // 1. NAME:
  // - Must be String
  // - .trim(): Munnadi, pinnaadi irukura extra spaces-ai remove pannum
  // - .min(2).max(100): Peyar 2 mudhal 100 characters kulla irukkanum
  name: z.string().trim().min(2).max(100),

  // 2. EMAIL:
  // - .email(): Proper email format-ah nu check pannum (e.g. name@domain.com)
  // - .max(255): Maximum 255 characters
  // - .transform(): User 'Karthik@GMAIL.com' nu type panninaalum, automatic-ah 'karthik@gmail.com' nu lowercase-ah maathidum!
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),

  // 3. DEPARTMENT:
  // - Employee endha department (e.g. 'Engineering', 'HR')
  // - 2 mudhal 100 characters kulla irukkanum
  department: z.string().trim().min(2).max(100),

  // 4. POSITION:
  // - Employee-oda job title (e.g. 'Backend Developer', 'QA Lead')
  // - 2 mudhal 100 characters kulla irukkanum
  position: z.string().trim().min(2).max(100),

  // 5. SALARY:
  // - Must be a Number
  // - .nonnegative(): Negative salary (-500) poda koodaadhu, 0 illa adhukku mela dhaan irukkanum (>= 0)
  salary: z.number().nonnegative(),

  // 6. STATUS (Optional):
  // - .optional(): Indha field mandatory illa, skip pannalaam
  // - .enum(): Kudutha 'ACTIVE' illa 'INACTIVE' mattum dhaan irukkanum, vera endha string-um poda mudiyaadhu
  // - Kudukkala na Mongoose schema automatic-ah default 'ACTIVE' nu assign pannikkum
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

// Validate query parameters used to list employees.
export const listEmployeesQuerySchema = z.object({
  // 1. Convert the page value from a URL string to a number (Default: page 1).
  page: z.coerce.number().int().min(1).default(1),

  // 2. Convert the limit value and prevent very large page requests (Max 100, Default: 10).
  limit: z.coerce.number().int().min(1).max(100).default(10),

  // 3. Search employee names, emails, departments, and positions.
  search: z.string().trim().max(100).optional(),

  // 4. Filter employees by department.
  department: z.string().trim().max(100).optional(),

  // 5. Filter employees by their active status.
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export default {
  createEmployeeSchema,
  listEmployeesQuerySchema,
};