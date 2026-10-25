// backend/src/constants/roles.js

// ============================================================================
// 🎭 USER ROLES CONSTANTS
// Project முழுக்க Roles-ஐ ஒரே இடத்துல define panni Magic Strings-ai thavirkkirom.
// Object.freeze() use panradhaala yaarum run-time-la indha values-ai maatha mudiyadhu.
// ============================================================================

export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  HR: 'HR',
  EMPLOYEE: 'EMPLOYEE',
});

// Helper array for validation (Zod & Mongoose schemas-la use panna)
export const ALL_ROLES = Object.freeze(Object.values(ROLES)); // ['ADMIN', 'HR', 'EMPLOYEE']

export default ROLES;