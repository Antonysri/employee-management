import express from 'express';

// 1. Controller import (The Waiter - Handles request & response)
import employeeController from '../controllers/employee.controller.js';

// 2. Middleware & Zod Schema import (Security Guard & Rule Book)
import validateRequest from '../middlewares/validateRequest.js';
import validateQuery from '../middlewares/validateQuery.js';
import validateParams from '../middlewares/validateParams.js';
import {
  createEmployeeSchema,
  listEmployeesQuerySchema,
  employeeIdParamSchema,
  updateEmployeeSchema,
  deleteEmployeeQuerySchema,
} from '../validators/employee.schema.js';

// 🛡️ 3. Security Guards (Authentication & RBAC) & Constants
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { ROLES } from '../constants/roles.js';

// 4. Express Router create panrom
const router = express.Router();
// ============================================================================
// 🔒 GLOBAL AUTHENTICATION GUARD:
// Intha router-la irukura endha employee API-ai call pannaalum,
// kandippa user Login panni valid JWT Token anupirukanum!
// ============================================================================
router.use(authenticate);
// -------------------------------------------------------------
// ROUTES DEFINITIONS (RBAC PROTECTED)
// -------------------------------------------------------------
// 🟢 1. CREATE EMPLOYEE (POST /api/v1/employees)
// Role: ADMIN & HR mattume allow pannuvom!
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.HR),
  validateRequest(createEmployeeSchema),
  employeeController.createEmployee
);
// 🔵 2. GET ALL EMPLOYEES (GET /api/v1/employees) PAGINATION
// Role: ADMIN & HR mattume allow pannuvom!
router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.HR),
  validateQuery(listEmployeesQuerySchema),
  employeeController.listEmployees
);
// 🔵 3. GET SINGLE EMPLOYEE BY ID (GET /api/v1/employees/:id)
// Role: ADMIN & HR mattume allow pannuvom!
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.HR),
  validateParams(employeeIdParamSchema),
  employeeController.getEmployeeById
);
// 🟡 4. UPDATE EMPLOYEE (PATCH /api/v1/employees/:id)
// Role: ADMIN & HR mattume allow pannuvom!
router.patch(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.HR),
  validateParams(employeeIdParamSchema),
  validateRequest(updateEmployeeSchema),
  employeeController.updateEmployee
);
// 🔴 5. DELETE / DEACTIVATE EMPLOYEE (DELETE /api/v1/employees/:id)
// Role: ADMIN ONLY! (HR-ku kooda delete panna permission kidayadhu)
router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validateParams(employeeIdParamSchema),
  validateQuery(deleteEmployeeQuerySchema),
  employeeController.deleteEmployee
);
// Export the router
export default router;