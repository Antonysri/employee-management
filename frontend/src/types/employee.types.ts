// frontend/src/types/employee.types.ts

// ============================================================================
// 🚦 1. EMPLOYEE STATUS (UNION TYPE)
// ============================================================================
// Oru employee companiyila vela seyyaraara (ACTIVE) illa resign pannitaara (INACTIVE).
// Intha 2 words thavira vera dummy text poga mudiyathu!
//
// 💡 EXAMPLE:
// const status1: EmployeeStatus = 'ACTIVE';    // ✅ Valid
// const status2: EmployeeStatus = 'PENDING';   // ❌ Red Error! TS compile pannaathu!
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

// ============================================================================
// 👤 2. MASTER EMPLOYEE BLUEPRINT (MongoDB-la irunthu varum Data)
// ============================================================================
// Database-la irunthu frontend-ku varum oru complete employee record shape.
//
// 💡 EXAMPLE OBJECT:
// {
//   _id: "65e8a7b9c1d2e3f4a5b6c7d8",
//   name: "Antony Sri",
//   email: "antony@company.com",
//   department: "Engineering",
//   position: "Frontend Lead",
//   salary: 85000,
//   status: "ACTIVE",
//   createdAt: "2026-03-01T10:00:00.000Z",
//   updatedAt: "2026-03-02T12:00:00.000Z"
// }
export interface Employee {
  _id: string;               // MongoDB generate panna unique ID
  name: string;              // Employee full name
  email: string;             // Official email address
  department: string;        // Department name (eg: 'Engineering', 'HR', 'Finance')
  position: string;          // Job title (eg: 'Frontend Developer')
  salary: number;            // Monthly or annual salary (Kandippa number ah thaan irukanum)
  status: EmployeeStatus;    // 'ACTIVE' or 'INACTIVE'
  createdAt?: string;        // Optional (?): Record create aana timestamp
  updatedAt?: string;        // Optional (?): Record update aana timestamp
}

// ============================================================================
// 📝 3. CREATE EMPLOYEE REQUEST (DTO - Data Transfer Object)
// ============================================================================
// Puthu employee create panra form-la submit aagura fields.
// Inga '_id' thevai illa, yenna ID-ah MongoDB thaan generate pannum!
//
// 💡 EXAMPLE OBJECT:
// const newJoiner: CreateEmployeeInput = {
//   name: "Kavitha",
//   email: "kavitha@company.com",
//   department: "Human Resources",
//   position: "HR Specialist",
//   salary: 60000,
//   status: "ACTIVE"
// };
export interface CreateEmployeeInput {
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  status?: EmployeeStatus;   // Anuppalana backend default-ah 'ACTIVE' assign pannikkum
}

// ============================================================================
// ✏️ 4. UPDATE EMPLOYEE REQUEST (Partial Data)
// ============================================================================
// Oru employee-oda salary mattum maathanum-na, ella fields-um thirumba poda thevai illa.
// 'Partial' na ella fields-um optional aagidum.
//
// 💡 EXAMPLE OBJECT (Verum salary mattum update panrom):
// const salaryHike: UpdateEmployeeInput = {
//   salary: 95000
// };
export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;

// ============================================================================
// 🔍 5. SEARCH & FILTER QUERY PARAMS (For Table Filters)
// ============================================================================
// Table-ku mela irukura Search bar & Dropdowns-la irunthu backend-ku anuppura filters.
//
// 💡 EXAMPLE URL PARAMS:
// /api/v1/employees?page=1&limit=10&search=Antony&department=Engineering
export interface EmployeeQueryParams {
  page?: number;             // E.g., 1, 2, 3 (Default: 1)
  limit?: number;            // E.g., 10 records per page (Default: 10)
  search?: string;           // E.g., "Antony" (Name, Email, Dept-la search aagum)
  department?: string;       // E.g., "Engineering"
  status?: EmployeeStatus;   // E.g., "ACTIVE"
}

// ============================================================================
// 📑 6. PAGINATION METADATA BLUEPRINT
// ============================================================================
// Backend pagination calculation panni tharura summary report.
//
// 💡 EXAMPLE OBJECT:
// {
//   page: 1,        // Ipo irukura current page
//   limit: 10,      // Oru page-ku 10 records
//   total: 45,      // Total-ah company-la 45 employees irukaanga
//   totalPages: 5   // Math.ceil(45 / 10) = 5 Pages total-ah irukku
// }
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// 📦 7. EMPLOYEE LIST API RESPONSE
// ============================================================================
// Backend GET /api/v1/employees hit panna tharura complete box!
//
// 💡 EXAMPLE OBJECT:
// {
//   success: true,
//   data: [ { _id: "...", name: "Antony", ... }, { _id: "...", name: "Kavitha", ... } ],
//   pagination: { page: 1, limit: 10, total: 45, totalPages: 5 }
// }
export interface EmployeeListResponse {
  success: boolean;
  data: Employee[];           // Employee objects irukura array []
  pagination: PaginationMeta; // Pagination summary
}

// ============================================================================
// 📦 8. SINGLE EMPLOYEE API RESPONSE
// ============================================================================
// Single employee view / create / update panrapo backend tharura response.
//
// 💡 EXAMPLE:
// {
//   success: true,
//   message: "Employee updated successfully",
//   data: { _id: "...", name: "Antony", salary: 95000, ... }
// }
export interface SingleEmployeeResponse {
  success: boolean;
  message?: string;
  data: Employee;
}