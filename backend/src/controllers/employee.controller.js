// Import the service that contains employee business logic.
import employeeService from '../services/employee.service.js';

// Create one employee from the validated request data.
const createEmployee = async (req, res, next) => {
  try {
    // Pass validated data to the service layer.
    const employee = await employeeService.createEmployee(req.validatedBody);

    // Return the created employee with the HTTP 201 status.
    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    // Pass errors to the central error handler.
    return next(error);
  }
};

// Make the controller available to the route.
export default {
  createEmployee,
};