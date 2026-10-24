// Import the service that contains employee business logic.
import employeeService from '../services/employee.service.js';

// 🟢 1. Create one employee from the validated request data.
const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.validatedBody);

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    return next(error);
  }
};

// 🔵 2. Return a filtered and paginated employee list.
const listEmployees = async (req, res, next) => {
  try {
    // Middleware clean panni vecha validatedQuery-ai Service kitta pass panrom
    const result = await employeeService.listEmployees(req.validatedQuery);

    // 200 OK status-oda data + pagination details return panrom
    return res.status(200).json({
      success: true,
      data: result.employees,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
};

// Make controller functions available to the routes.
export default {
  createEmployee,
  listEmployees,
};