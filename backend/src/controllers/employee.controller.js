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

// ============================================================================
// 🎯 CONTROLLER: GET EMPLOYEE BY ID
// ============================================================================
const getEmployeeById = async (req, res, next) => {
  try {
    // 1. validateParams middleware clean panna 'req.validatedParams.id'-ai service kitta pass panrom
    const employee = await employeeService.getEmployeeById(req.validatedParams.id);
    // 2. 200 OK status-oda employee data-vai return panrom
    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    // 3. 404 error illa vera DB error vandha errorHandler kitta pogum
    return next(error);
  }
};

// ============================================================================
// 🎯 MODERN UPDATE CONTROLLER
// ============================================================================
const updateEmployee = async (req, res, next) => {
  try {
    // 1. URL ID (req.validatedParams.id) and Body (req.validatedBody)-ai service kitta pass panrom
    const updatedEmployee = await employeeService.updateEmployee(
      req.validatedParams.id,
      req.validatedBody
    );
    // 2. 200 OK status-oda neat-ana JSON response anupuroam
    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee,
    });
  } catch (error) {
    return next(error);
  }
};


// Make controller functions available to the routes.
export default {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
};