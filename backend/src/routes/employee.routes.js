import express from 'express';

// 1. Controller import (The Waiter - Handles request & response)
import employeeController from '../controllers/employee.controller.js';

// 2. Middleware & Zod Schema import (Security Guard & Rule Book)
import validateRequest from '../middlewares/validateRequest.js';

import validateQuery from '../middlewares/validateQuery.js';

import validateParams from '../middlewares/validateParams.js';

import { createEmployeeSchema,listEmployeesQuerySchema,employeeIdParamSchema,updateEmployeeSchema , deleteEmployeeQuerySchema } from '../validators/employee.schema.js';


// 3. Express Router create panrom
const router = express.Router();

// -------------------------------------------------------------
// ROUTES DEFINITIONS
// -------------------------------------------------------------

// 🟢 1. CREATE EMPLOYEE (POST /api/v1/employees)
// Naduvula validateRequest guard nikkaradha paarunga!
router.post(
  '/',
  validateRequest(createEmployeeSchema), // 👈 Zod Validation Guard!
  employeeController.createEmployee     // 👈 Controller
);

// 🔵 2. GET ALL EMPLOYEES (GET /api/v1/employees) PAGINATION
router.get(
  '/',
  validateQuery(listEmployeesQuerySchema), // 👈 URL Query validation guard!
  employeeController.listEmployees
);

// 🔵 3. GET SINGLE EMPLOYEE BY ID
router.get(
  '/:id',
  validateParams(employeeIdParamSchema), // 👈 3. Zod ObjectId Guard!
  employeeController.getEmployeeById     // 👈 Controller
);

// 🟡 4. UPDATE EMPLOYEE (PATCH /api/v1/employees/:id)
// 🛡️ 2 GUARDS:
// Guard 1: validateParams -> Checks :id is a 24-character hexadecimal ObjectId
// Guard 2: validateRequest -> Checks body has at least one valid partial field
router.patch(
  '/:id',
  validateParams(employeeIdParamSchema),
  validateRequest(updateEmployeeSchema),
  employeeController.updateEmployee
);

// -------------------------------------------------------------
// 🔴 5. DELETE / DEACTIVATE EMPLOYEE (DELETE /api/v1/employees/:id)
// -------------------------------------------------------------
router.delete(
  '/:id',
  validateParams(employeeIdParamSchema),     // ID Guard
  validateQuery(deleteEmployeeQuerySchema), // Query Guard (?permanent=true)
  employeeController.deleteEmployee         // Controller
);

// // 🔵 2. GET ALL EMPLOYEES (GET /api/v1/employees)
// router.get(
//   '/', 
//   employeeController.getAllEmployees
// );

// // 🔵 3. GET SINGLE EMPLOYEE BY ID (GET /api/v1/employees/:id)
// router.get(
//   '/:id', 
//   employeeController.getEmployeeById
// );

// // 🟡 4. UPDATE EMPLOYEE (PUT /api/v1/employees/:id)
// router.put(
//   '/:id',
//   validateRequest(createEmployeeSchema), // 👈 Update-kum validation check pannuvom
//   employeeController.updateEmployee
// );

// // 🔴 5. DELETE EMPLOYEE (DELETE /api/v1/employees/:id)
// router.delete(
//   '/:id', 
//   employeeController.deleteEmployee
// );

// 4. Export the router
export default router;