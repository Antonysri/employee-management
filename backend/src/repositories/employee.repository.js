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


// Find employees using filters, search, and pagination.
const findEmployees = async ({ filter, skip, limit }) => {
  // ⚡ PROMISE.ALL: Find query & Total count query rendaiyum orey nerathula run panrom!
  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .sort({ createdAt: -1 }) // Newest employee modhalla varum ASE Orderwise
      .skip(skip)              // Pagination skip
      .limit(limit)            // Page size limit
      .lean(),                 // Fast & lightweight plain JS object!
    Employee.countDocuments(filter), // Filter-ku match aana total count
  ]);
  // Return the records and the total number of matches.
  return { employees, total };
};

// ============================================================================
// 🔍 FIND ONE EMPLOYEE BY ID
// MongoDB ObjectId vechu specific employee document-ai thedum.
// ============================================================================
const findById = async (id) => {
  // .lean(): Plain JS object-ah fast-ah edukkum
  return Employee.findById(id).lean();
};

// ============================================================================
// 📝 MODERN UPDATE REPOSITORY (MongoDB Atomic $set & Query Context)
// ============================================================================
const updateEmployee = async (id, updateData) => {
  return Employee.findByIdAndUpdate(
    id,
    // 1. $set: MongoDB-oda explicit operator (Field-level safe partial update)
    { $set: updateData },
    {
      new: true,           // 👈 Modified pudhu document-ai return pannum
      runValidators: true, // 👈 Update-layum Schema rules (min: 0, enum) enforce aagum
      //context: 'query',    // 👈 Required: Update query-kulla validators 'this' context sariya bind aaga
    }
  ).lean();                // 👈 Plain JS object (High performance)
};

// Make these functions available to the service layer.
export default {
  findByEmail,
  createEmployee,
  findEmployees,
  findById,
  updateEmployee,
};