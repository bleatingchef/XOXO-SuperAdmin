const mongoose = require('mongoose');

// Define the schema for Employee
const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    otp: {
        type: String, // We'll store the OTP when requested
        default: null
    },
    otpCreatedAt:{
        type: Date, // Expiration time for OTP
        default: null   
    },
    otpExpiresAt: {
        type: Date, // Expiration time for OTP
        default: null
    },
    adminRef: {  // Reference to the admin who added the employee
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin&SuperAdmin',  // Assuming the admin model is called 'Admin'
        // required: true
    }
}, { timestamps: true });

// Create and export the model
const EmployeeModel = mongoose.model('Employee', employeeSchema);

module.exports = EmployeeModel;
