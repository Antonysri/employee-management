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

// Make this function available to the controller.
export default {
  createEmployee,
};