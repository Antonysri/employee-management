import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

// ============================================================================
// 🔑 RESET ADMIN PASSWORD SCRIPT
// Atlas-la irukkura Admin-kku pudhu bcrypt password hash generate panni update pannum.
// ============================================================================
const resetPassword = async () => {
  try {
    // 1. Database Connect panrom
    console.log('🍃 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);

    // 2. Target Email and New Strong Password (Minimum 6 characters for Zod!)
    const targetEmail = process.env.ADMIN_EMAIL;
    const newPlainPassword = process.env.ADMIN_PASSWORD;

    // 3. Bcrypt vechu pudhu password-ai Hash panrom (12 Salt Rounds)
    console.log(`🔒 Hashing new password for ${targetEmail}...`);
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPlainPassword, saltRounds);

    // 4. Atlas-la indha email-kku pudhu hash-ai update panrom
    const updatedUser = await User.findOneAndUpdate(
        { email: targetEmail },
        { $set: { passwordHash: newPasswordHash, status: 'ACTIVE' } },
        { new: true }
    );


    // 5. Check: User illana error sollu
    if (!updatedUser) {
      console.error(`❌ User with email '${targetEmail}' not found in database!`);
      process.exit(1);
    }

    console.log('✅ Admin password updated successfully in Atlas!');
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`🔑 New Password to use in Postman: ${newPlainPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to reset password:', error.message);
    process.exit(1);
  }
};

// Run the reset function
resetPassword();