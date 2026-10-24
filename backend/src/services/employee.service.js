// Import the repository that handles employee database queries.
import employeeRepository from '../repositories/employee.repository.js';

// Create an employee after checking the business rules.
const createEmployee = async (employeeData) => {
  // Check whether another employee already uses this email.
  const existingEmployee = await employeeRepository.findByEmail(
    employeeData.email
  );

  // Stop creation when the email is already in use.
  if (existingEmployee) {
    const error = new Error('An employee with this email already exists');

    // Use HTTP 409 to show that the data conflicts with an existing employee.
    error.statusCode = 409;

    // Send this error to the controller and central error handler.
    throw error;
  }

  // Save the employee when the email is available.
  return employeeRepository.createEmployee(employeeData);
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