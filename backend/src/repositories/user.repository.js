import User from '../models/user.model.js';

// ============================================================================
// 👤 USER REPOSITORY (Database Queries for Authentication)
// ============================================================================

// 1. FIND BY EMAIL WITH PASSWORD HASH (Only for Login):
// Normal-ah Mongoose password-ai hide pannidum.
// Inga '+passwordHash' nu potta dhaan bcrypt kitta compare panna password kedaikkum!
const findByEmailWithPassword = async (email) => {
  return User.findOne({ email }).select('+passwordHash');
};

// 2. FIND USER BY ID (Safe lookup without password):
// Later auth middleware-la token decode panni user-ai eduka use aagum.
const findById = async (id) => {
  return User.findById(id).lean();
};

export default {
  findByEmailWithPassword,
  findById,
};