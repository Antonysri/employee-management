import mongoose from 'mongoose';

// Define the fields stored for each employee.
const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    
    // minSalary: {
    //   type: Number,
    //   required: true,
    //   },

    // salary: {
    //   type: Number,
    //   required: [true, 'Salary is required'],
    //   min: [0, 'Salary cannot be negative'],

    //   validate: {
    //     validator: function (value) {
    //       return value >= this.minSalary;
    //     },
    //     message: 'Salary is below minimum',
    //   },
    // },

    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  {
    // Add createdAt and updatedAt automatically.
    timestamps: true,
  }
);

// Create the Employee model from the schema.
const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;