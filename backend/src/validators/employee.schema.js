import { z } from 'zod';

// Validate the data required to create an employee.
export const createEmployeeSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  department: z.string().trim().min(2).max(100),
  position: z.string().trim().min(2).max(100),
  salary: z.number().nonnegative(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
}); 

export default createEmployeeSchema;