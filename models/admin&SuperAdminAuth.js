const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the schema for Admin
const adminAndSuperAdminAuthSchema = new mongoose.Schema({
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
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'superadmin'],  // Two possible roles: 'admin' and 'superadmin'
        required: true,
        default: 'admin'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],  // Admins can be active or inactive
        default: 'active'
    },
    balance: {
        type: Number,
        default: function() {
            // Only set the balance for admins, not for superadmins
            return this.role === 'admin' ? 1000 : undefined;
        }
    }
}, { timestamps: true });

// Pre-save hook to hash passwords before saving to the database
adminAndSuperAdminAuthSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        return next(error);
    }
});

// Method to compare entered password with stored hashed password
adminAndSuperAdminAuthSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if the user is super admin
adminAndSuperAdminAuthSchema.methods.isSuperAdmin = function () {
    return this.role === 'superadmin';
};

// Create and export the model
const AdminAndSuperAdminModel = mongoose.model('Admin&SuperAdmin', adminAndSuperAdminAuthSchema);

module.exports = AdminAndSuperAdminModel;
