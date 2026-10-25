// Load environment variables from the backend .env file.
import 'dotenv/config';

// Import Mongoose to connect to MongoDB.
import mongoose from 'mongoose';

// Import bcrypt to hash the Admin password securely.
import bcrypt from 'bcryptjs';

// Import the User model to create the Admin account.
import User from '../models/user.model.js';

// ============================================================================
// ONE-TIME ADMIN SEED SCRIPT
// Public signup illaadha app-la mudhal Admin account create panna use aagum.
// ============================================================================

// Create the initial Admin account if it does not already exist.
const seedAdmin = async () => {
  try {
    // Read Admin credentials from environment variables.
    // Secret password-ai source code-kulla hardcode panna koodadhu.
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Stop if the required credentials are missing.
    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    }

    // Connect this one-time script to the configured MongoDB database.
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if a user with this email already exists.
    // This makes the script safe to run again without creating duplicates.
    const existingAdmin = await User.findOne({ email: adminEmail });

    // Do not create the account again if the email is already registered.
    if (existingAdmin) {
      console.log(`An account with ${adminEmail} already exists. No changes made.`);
      return;
    }

    // Hash the password before saving it to the database.
    // Only the hash is stored; the original password is never saved.
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Create an active Admin account.
    // No Employee record is linked because this is the initial Admin.
    const adminUser = await User.create({
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    // Show account details, but never print the password or password hash.
    console.log('Admin account created successfully.');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`Status: ${adminUser.status}`);
  } catch (error) {
    // Report the error so the operator can fix the setup problem.
    console.error('Admin seed failed:', error.message);

    // Set a failure exit code for the terminal or automation.
    process.exitCode = 1;
  } finally {
    // Close the MongoDB connection because this script is finished.
    await mongoose.disconnect();
  }
};

// Run the seed function when this script is executed.
seedAdmin();