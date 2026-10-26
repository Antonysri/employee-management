// Mongoose-ai import panrom.
// Idhu MongoDB schema matrum model create panna use aagum.
import mongoose from 'mongoose';
// 🎭 Roles constants import panrom:
import { ALL_ROLES, ROLES } from '../constants/roles.js';
// ============================================================================
// USER SCHEMA
// User login details, role, account status, invitation information store aagum.
// Employee personal details Employee model-la thaniya irukkum.
// ============================================================================
const userSchema = new mongoose.Schema(
  {
    // Employee document-oda ID-ai inga reference panrom.
    // Example: employeeId = Employee collection-la irukkura oru document-oda _id.
    employeeId: {
      // MongoDB ObjectId type-la value expect panrom.
      type: mongoose.Schema.Types.ObjectId,

      // Indha ID Employee model-ai refer pannudhu.
      // Populate pannumbodhu linked Employee details edukkalaam.
      ref: 'Employee',

      // Super Admin-kku employee record avasiyam illa; appo null-a irukkalaam.
      default: null,
    },

    // User login panna use panra email address.
    // Example: "admin@company.com"
    email: {
      // Email illama account create panna koodadhu.
      required: [true, 'Email is required for user account'],

      // Ovvoru account-ukkum unique email irukkanum.
      // Idhu database-la unique index create pannum.
      unique: true,

      // Email-ai lowercase-a store pannum.
      // Example: "ADMIN@COMPANY.COM" → "admin@company.com"
      lowercase: true,

      // Email-oda start/end-la irukkura spaces-ai remove pannum.
      // Example: " admin@company.com " → "admin@company.com"
      trim: true,

      // Email string format-la store aagum.
      type: String,
    },

    // User password-oda hash value mattum inga store aagum.
    // Original password-ai database-la store panna koodadhu.
    passwordHash: {
      // API query-la User document edukkumbodhu indha field default-ah varaadhu.
      // Login verify panna thevai irundhaal .select('+passwordHash') use pannalaam.
      select: false,

      // Hash value string format-la irukkum.
      // Example: "$2b$12$..." — bcrypt hash.
      type: String,

      // Account 'ACTIVE' ஆக இருக்கும் போது மட்டுமே Password கட்டாயம்!
      // 'INVITED' ஆக இருக்கும் போது Password இல்லாமலே சேவ் பண்ணலாம்!
      required : function(){
        return this.status === 'ACTIVE'
      },

    },

    // User enna actions panna mudiyum-nu role decide pannum.
    // Idhudhaan RBAC: Role-Based Access Control.
    role: {
      // Indha moonu values mattum allow pannuvom.
      // ADMIN: full administration permissions.
      // HR: employee management permissions.
      // EMPLOYEE: limited employee permissions.
      // Hardcoded string array-ku badhila ALL_ROLES constant use panrom:
      enum: ALL_ROLES,           // ['ADMIN', 'HR', 'EMPLOYEE']
      // Default-a EMPLOYEE role:
      default: ROLES.EMPLOYEE,
      // Role string format-la store aagum.
      type: String,
    },

    // Account-oda current lifecycle state-ai kaattum.
    status: {
      // Indha status values mattum allow pannuvom.
      // INVITED: invitation anuppiyirukkom; account setup mudiyala.
      // ACTIVE: user account setup panni use panna ready.
      // DEACTIVATED: account disable pannappattadhu.
      enum: ['INVITED', 'ACTIVE', 'DEACTIVATED'],

      // Pudhu invited account default-ah INVITED state-la start aagum.
      default: 'INVITED',

      // Status string format-la store aagum.
      type: String,
    },

    // Email invitation link verify panna token store aagum.
    // Token random, secure value-a generate pannanum.
    invitationToken: {
      // API-la User document edukkumbodhu token default-ah varaadhu.
      select: false,

      // Example: "random-long-single-use-token"
      type: String,
    },

    // Invitation token endha time varaikkum valid-nu store pannum.
    invitationExpiresAt: {
      // Token expiry date/time-ai Date format-la store pannuvom.
      // Example: invitation create panna time + 24 hours.
      select: false,

      // Invitation create pannumbodhu expiry date set pannalaam.
      type: Date,
    },
    // 🚪 Logout aana kadaisi neram:
    // Idharku munnadi create aana endha pazhaiya JWT-aiyum block panna use aagum!
    lastLogoutAt: {
      type: Date,
      default: null,
    },
  },
  
  {
    // Mongoose createdAt and updatedAt fields-ai automatic-ah add pannum.
    // createdAt: user account create aana time.
    // updatedAt: user document kadaisiya update aana time.
    timestamps: true,
  }
);

// User schema use panni Mongoose model create panrom.
// Idhai use panni User collection-la documents create, find, update pannalaam.
const User = mongoose.model('User', userSchema);

// Vera files-la import panni use panna model-ai export panrom.
export default User;