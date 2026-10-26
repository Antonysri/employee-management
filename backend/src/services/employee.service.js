// backend/src/services/employee.service.js

// 1. Repositories import
import employeeRepository from '../repositories/employee.repository.js';
import userRepository from '../repositories/user.repository.js';

// 2. Token generator helper import
import { generateTokenPair } from '../utils/crypto.util.js';

// 3. Constants import
import { ROLES } from '../constants/roles.js';

// ============================================================================
// 🟢 CREATE EMPLOYEE & START INVITATION WORKFLOW
// 1. Employee create pannum
// 2. Linked User account 'INVITED' state-la create pannum
// 3. 24-hours valid secure token generate panni invitation link ready pannum
// ============================================================================
const createEmployee = async (employeeData) => {
  const { email } = employeeData;
  // --------------------------------------------------------------------------
  // STEP 1: DOUBLE CONFLICT CHECK (Safety First)
  // Employee table-layo alladhu User table-layo indha email irukka koodaadhu!
  // --------------------------------------------------------------------------
  const existingEmployee = await employeeRepository.findByEmail(email);
  if (existingEmployee) {
    const error = new Error('An employee with this email already exists');
    error.statusCode = 409;
    throw error;
  }
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error('A user account with this email already exists');
    error.statusCode = 409;
    throw error;
  }
  // --------------------------------------------------------------------------
  // STEP 2: SEPARATE ROLE FROM EMPLOYEE FIELDS
  // 'role' field User model-kku pogum; meedhi fields Employee model-kku pogum.
  // --------------------------------------------------------------------------
  const { role = ROLES.EMPLOYEE, ...employeeFields } = employeeData;
  // --------------------------------------------------------------------------
  // STEP 3: GENERATE SECURE INVITATION TOKEN PAIR
  // rawToken -> Email link-la poga koodiyadhu
  // hashedToken -> DB-la safe-a store aaga koodiyadhu (SHA-256)
  // --------------------------------------------------------------------------
  const { rawToken, hashedToken } = generateTokenPair();
  // 24 Hours Expiry (Current time + 24 hours in milliseconds):
  const invitationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  // --------------------------------------------------------------------------
  // STEP 4: SAVE EMPLOYEE TO DATABASE
  // --------------------------------------------------------------------------
  const newEmployee = await employeeRepository.createEmployee(employeeFields);
  // --------------------------------------------------------------------------
  // STEP 5: SAVE LINKED USER ACCOUNT (STATUS: 'INVITED')
  // --------------------------------------------------------------------------
  const newUser = await userRepository.createUser({
    employeeId: newEmployee._id,
    email: newEmployee.email,
    role,
    status: 'INVITED',
    invitationToken: hashedToken,
    invitationExpiresAt,
  });
  // --------------------------------------------------------------------------
  // STEP 6: CONSTRUCT INVITATION URL (Frontend Setup Password Link)
  // --------------------------------------------------------------------------
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const invitationLink = `${clientUrl}/setup-password?token=${rawToken}`;
  // --------------------------------------------------------------------------
  // STEP 7: EMAIL SIMULATION (Console Log for Local Dev Testing)
  // Production-la real email pogum; Local dev-la terminal-la link print panrom!
  // --------------------------------------------------------------------------
  console.log('\n============================================================');
  console.log('✉️  [EMAIL SERVICE SIMULATION]');
  console.log(`To: ${newEmployee.email} (${newEmployee.name})`);
  console.log(`Subject: You have been invited to join Employee Portal!`);
  console.log(`Role Assigned: ${newUser.role}`);
  console.log(`🔗 Activation Link: ${invitationLink}`);
  console.log(`⏳ Link Expires At: ${invitationExpiresAt.toISOString()}`);
  console.log('============================================================\n');
  // --------------------------------------------------------------------------
  // STEP 8: RETURN DATA
  // Controller kitta employee details koodave invitation metadata-vai anupurom
  // --------------------------------------------------------------------------
  return {
    employee: newEmployee,
    invitation: {
      accountStatus: newUser.status,
      role: newUser.role,
      expiresAt: invitationExpiresAt,
      // Dev mode-la testing easya irukka response-layum link tharrom:
      invitationLink,
    },
  };
};

// ============================================================================
// 📋 LIST EMPLOYEES SERVICE (Filters, Search & Pagination Logic)
// Controller kitta irundhu vara query values-ai vechu business logic execute pannum.
// ============================================================================
const listEmployees = async (query) => {
  // 1. QUERY VALUES DESTRUCTURING:
  // Controller anupina data-vai edukrom. User kudukkala na safe defaults (page: 1, limit: 10) eduthukkum.
  const {
    page = 1,
    limit = 10,
    search,
    department,
    status,
  } = query;

  // 2. MONGODB FILTER OBJECT (SQL-la 'WHERE' condition maadhiri):
  // Modhalla empty object vechikurom. Conditions vara vara idhukulla add pannuvom.
  const filter = {};

  // 3. SEARCH LOGIC (Google search bar maadhiri):
  if (search) {
    // 'i' flag na Case-Insensitive (Capital/Small letters paarkkaadhu, partial search-um work aagum).
    const searchPattern = new RegExp(search, 'i');

    // MongoDB $or: Name, Email, Department, Position - indha 4-la edhula ethu match aanalum eduthuttu va!
    filter.$or = [
      { name: searchPattern },
      { email: searchPattern },
      { department: searchPattern },
      { position: searchPattern },
    ];
  }

  // 4. EXACT DEPARTMENT FILTER:
  // Dropdown-la specific department (e.g. 'Engineering') select pannina, adhukku mattum match pannum.
  if (department) {
    filter.department = department;
  }

  // 5. STATUS FILTER:
  // 'ACTIVE' illa 'INACTIVE' employees-ai mattum filter panni paaka.
  if (status) {
    filter.status = status;
  }

  // 6. PAGINATION SKIP CALCULATION:
  // Page 1 na: (1 - 1) * 10 = 0 (Skip 0 records, get 1-10)
  // Page 2 na: (2 - 1) * 10 = 10 (Skip first 10, get 11-20)
  const skip = (page - 1) * limit;

  // 7. CALL REPOSITORY (Database-kitta poi data edukurom):
  // Filter, skip, limit kuduthu employees list-aiyum, total count-aiyum vaangurom.
  const { employees, total } = await employeeRepository.findEmployees({
    filter,
    skip,
    limit,
  });

  // 8. FINAL RETURN TO CONTROLLER:
  // Employees data koodave pagination metadata (Total pages, current page) serthu anupurom!
  return {
    employees,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit), // E.g., 25 / 10 = 2.5 -> Math.ceil = 3 Pages
    },
  };
};


// ============================================================================
// 👤 GET EMPLOYEE BY ID (With 404 Not Found check)
// ============================================================================
const getEmployeeById = async (id) => {
  // 1. Database kitta poi indha ID-oda employee-ai edukurom
  const employee = await employeeRepository.findById(id);

  // 2. ⚠️ Oru vela andha ID-la employee yaarum illana:
  // Clean-ah 404 Not Found error throw panrom!
  if (!employee) {
    const error = new Error('Employee not found');
    error.statusCode = 404; // 👈 404 Not Found status!
    throw error;
  }

  // 3. Employee irundha avaroda details-ai return panrom
  return employee;
};

// ============================================================================
// 📝 MODERN UPDATE SERVICE (With Safe Self-Email Exemption & 404 Check)
// ============================================================================
const updateEmployee = async (id, updateData) => {
  // 1. EMAIL CONFLICT LOGIC:
  // User email-ai maatha try pannina, andha email VERA yaaravadhu kitta irukka nu check panrom
  if (updateData.email) {
    const existingEmployee = await employeeRepository.findByEmail(updateData.email);
    // ⚠️ CRITICAL: existingEmployee vera ID aana mattum dhaan 409 Conflict!
    // (Employee thaanoda sontha email-aiye update body-la anupina conflict vara koodaadhu)
    if (existingEmployee && existingEmployee._id.toString() !== id) {
      const error = new Error('Another employee with this email already exists');
      error.statusCode = 409;
      throw error;
    }
  }
  // 2. Database-la $set vechu update panrom
  const updatedEmployee = await employeeRepository.updateEmployee(id, updateData);
  // 3. 404 NOT FOUND CHECK:
  // Indha ID-la employee yaarum illana clean 404 tharanum
  if (!updatedEmployee) {
    const error = new Error('Employee not found');
    error.statusCode = 404;
    throw error;
  }
  // 4. Updated employee data-vai controller kitta return panrom
  return updatedEmployee;
};

// ============================================================================
// 🗑️ DELETE / DEACTIVATE SERVICE (With 404 Check & Dynamic Message)
// ============================================================================
const deleteEmployee = async (id, { permanent = false } = {}) => {
  // 1. Repository kitta solli delete / deactivate panrom
  const employee = await employeeRepository.deleteEmployee(id, { permanent });
  // 2. Oru vela andha ID-la employee yaarum illana:
  if (!employee) {
    const error = new Error('Employee not found');
    error.statusCode = 404;
    throw error;
  }
  // 3. User-kku thagundha message ready panrom
  const message = permanent
    ? 'Employee permanently deleted from database'
    : 'Employee deactivated successfully';
  return { employee, message };
};

// Make this function available to the controller.
export default {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};