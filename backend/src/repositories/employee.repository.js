// Import the Employee model to access the employees collection.
import Employee from '../models/employee.model.js';

// Search the database for an employee with this email.
const findByEmail = async (email) => {
  return Employee.findOne({ email });
};

// Save a new employee document in the database.
const createEmployee = async (employeeData) => {
  return Employee.create(employeeData);
};

// Make these functions available to the service layer.
export default {
  findByEmail,
  createEmployee,
};