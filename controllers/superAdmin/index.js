const jwt = require('jsonwebtoken');
const { AdminAndSuperAdminModel, walletRequest,  } = require("../../models");
const { isValidEmail, isValidPassword, validateRequiredFields } = require("../../utils/validator");
const { requestWalletBalance } = require('../admin');

const createSuperAdmin = async (req, res) => {
    try {
        // Check if a superadmin already exists (only allow one superadmin)
        const existingSuperAdmin = await AdminAndSuperAdminModel.findOne({ role: 'superadmin' });
        if (existingSuperAdmin) {
            return res.status(400).json({ message: 'SuperAdmin already exists', success: false });
        }

        // Use environment variables for default credentials (this is a security best practice)
        const defaultName = process.env.SUPERADMIN_NAME || 'superadmin';
        const defaultEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@example.com';
        const defaultPassword = process.env.SUPERADMIN_PASSWORD || 'password123';

        // Create the SuperAdmin
        const newSuperAdmin = new AdminAndSuperAdminModel({
            name: defaultName,
            email: defaultEmail,
            password: defaultPassword,
            role: 'superadmin'
        });

        // Save the new SuperAdmin to the database
        await newSuperAdmin.save();

        // Generate a JWT token for the new SuperAdmin
        const token = jwt.sign(
            { id: newSuperAdmin._id, role: newSuperAdmin.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Set the token expiration time
        );

        res.status(201).json({
            message: 'SuperAdmin registered successfully',
            success: true,
            data: {
                admin: newSuperAdmin,
                token // Include the token in the response
            }
        });

    } catch (error) {
        // Handle potential errors
        console.error('Error creating SuperAdmin:', error);
        res.status(500).json({
            message: 'Server error while creating SuperAdmin',
            success: false,
            error: error.message
        });
    }
};

const superAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for missing fields
        const missingFields = validateRequiredFields(['email', 'password'], req.body);
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `The following fields are required and cannot be empty: ${missingFields.join(', ')}`,
                success: false
            });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Please enter a valid email", success: false });
        }

        // Find the super admin by email
        const superAdmin = await AdminAndSuperAdminModel.findOne({ email });
        if (!superAdmin) {
            return res.status(404).json({ message: 'Super Admin not found', success: false });
        }

        // Check if the password matches
        const isMatch = await superAdmin.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials', success: false });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: superAdmin._id, role: superAdmin.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Token expires in 1 hour
        );

        // Respond with success and token
        res.json({
            message: 'Login successful',
            success: true,
            data: {
                superAdmin: {
                    id: superAdmin._id,
                    email: superAdmin.email,
                    role: superAdmin.role
                },
                token // Include the JWT token
            }
        });

    } catch (error) {
        // Log error and respond with a server error message
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'Server error during login',
            success: false
        });
    }
};


const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input fields: Check if fields are present and not empty strings
        if (!name || !email || !password || name.trim() === '' || email.trim() === '' || password.trim() === '') {
            return res.status(400).json({ message: 'name, email, and password are required and cannot be empty', success: false });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid email', success: false });
        }

        // Validate password strength (custom validator)
        if (!isValidPassword(password)) {
            return res.status(400).json({ message: 'password must be at least 8 characters, include one uppercase letter and one number', success: false });
        }

        // Check if email already exists
        const existingAdmin = await AdminAndSuperAdminModel.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with this email already exists', success: false });
        }

        // Ensure only superadmin can create an admin
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'You do not have permission to create an admin', success: false });
        }

        // Create the new admin
        const newAdmin = new AdminAndSuperAdminModel({
            name,
            email,
            password, // Store the hashed password
            role: 'admin',
            createdBySuperAdmin: true, // Indicating the creator was a superadmin
        });

        // Save the new admin in the database
        await newAdmin.save();

        res.status(201).json({ message: 'Admin created successfully', success: true, data: newAdmin });
    } catch (error) {
        res.status(500).json({ message: 'Error creating admin', success: false, error: error.message });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        // Fetch all users where role is 'admin'
        const admins = await AdminAndSuperAdminModel.find({ role: 'admin' });

        // Check if there are any admins
        if (admins.length === 0) {
            return res.status(404).json({ message: 'No admins found', success: false });
        }

        // Respond with the list of admins
        return res.status(200).json({
            message: 'Admins retrieved successfully',
            success: true,
            code:200,
            numberOfAdmin:admins.length,
            data: admins,
            
        });
    } catch (error) {
        console.error('Error fetching admins:', error);
        return res.status(500).json({
            message: 'Server error while fetching admins',
            success: false,
            error: error.message
        });
    }
};

const approveOrRejectWalletRequest = async (req, res) => {
    try {
        const { walletRequestId, action } = req.body; // Expecting 'approve' or 'reject'
        
        // Ensure the user is a super admin
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only super admins can approve or reject requests' 
            });
        }

        // Find the wallet request by ID
        const walletRequest = await walletRequest.findById(walletRequestId);
        if (!walletRequest) {
            return res.status(404).json({ 
                success: false, 
                message: 'Wallet request not found' 
            });
        }

        // Handle approval or rejection
        if (action === 'approve') {
            // Find the admin and add the requested amount to their balance
            const admin = await AdminAndSuperAdminModel.findById(walletRequest.adminId);
            if (!admin) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Admin not found' 
                });
            }

            // Update the admin's balance
            admin.balance = (admin.balance || 0) + walletRequest.requestedAmount;
            await admin.save();

            // Mark the request as approved
            walletRequest.status = 'approved';
            await walletRequest.save();

            return res.status(200).json({ 
                success: true, 
                message: 'Wallet request approved and balance updated', 
                admin 
            });
        } else if (action === 'reject') {
            // Mark the request as rejected
            walletRequest.status = 'rejected';
            await walletRequest.save();

            return res.status(200).json({ 
                success: true, 
                message: 'Wallet request rejected' 
            });
        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid action. Use "approve" or "reject".' 
            });
        }
    } catch (error) {
        console.error('Error processing wallet request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};


const getAllWalletRequests = async (req, res) => {
    try {
        // Verify if the user is a superadmin
        const user = await AdminAndSuperAdminModel.findById(req.user.id);
        if (!user || user.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }

        // Fetch all wallet requests
        const requests = await walletRequest.find().populate('adminId', 'name email');
        
        res.status(200).json({
            success: true,
            message: 'Wallet requests retrieved successfully',
            requests
        });
    } catch (error) {
        console.error('Error fetching wallet requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching wallet requests'
        });
    }
};

// API to update wallet request status
const updateWalletRequestStatus = async (req, res) => {
    try {
        // Verify if the user is a superadmin
        const user = await AdminAndSuperAdminModel.findById(req.user.id);
        if (!user || user.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }

        const { reqId } = req.query;
        const { status } = req.body; // status should be 'approved' or 'rejected'

        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        // Find and update the wallet request
        const updatedRequest = await walletRequest.findByIdAndUpdate(reqId, { status }, { new: true }).populate('adminId', 'name email');

        if (!updatedRequest) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // If approved, update the admin balance
        if (status === 'approved') {
            const admin = await AdminAndSuperAdminModel.findById(updatedRequest.adminId._id);
            if (admin) {
                admin.balance = (admin.balance || 0) + updatedRequest.requestedAmount;
                await admin.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Wallet request status updated successfully',
            request: updatedRequest
        });
    } catch (error) {
        console.error('Error updating wallet request status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating wallet request status'
        });
    }
};

module.exports = { createSuperAdmin, createAdmin,superAdminLogin,getAllAdmins,getAllWalletRequests,updateWalletRequestStatus }