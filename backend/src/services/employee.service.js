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
// Make this function available to the controller.
export default {
  createEmployee,
  listEmployees
};