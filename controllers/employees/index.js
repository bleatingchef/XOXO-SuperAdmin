const crypto = require('crypto');
const { EmployeeModel, Campaign } = require('../../models');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other email services as well
    auth: {
        user: process.env.MAIL_USERNAME, // Your email (e.g. admin@example.com)
        pass: process.env.MAIL_PASSWORD  // Your email password or app-specific password
    }
});


const generateEmployeOTP = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: "email id is required", success: false })
        }
        // Find employee by email
        const employee = await EmployeeModel.findOne({ email });

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found',
                success: false
            });
        }

        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Set OTP expiry time (10 minutes from now)
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in the future

        // Save the OTP and expiry time to the employee's data
        employee.otp = otp;
        employee.otpCreatedAt = new Date(); // Store the creation time
        employee.otpExpiresAt = otpExpiry;     // Store the expiry time
        await employee.save();

        // Email the OTP to the employee
        const mailOptions = {
            from: `"Your Company" <${process.env.MAIL_USERNAME}>`, // Sender's email address
            to: email, // Employee's email address
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It will expire in 10 minutes.`, // Plain text email content
            html: `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 10 minutes.</p>` // HTML email content
        };

        // Send the email with the OTP
        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: 'OTP generated and sent successfully',
            success: true
        });
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({
            message: 'Error generating OTP',
            success: false,
            error: error.message
        });
    }
};


// Verify OTP and generate JWT
const verifyOTP = async (req, res) => {
    const { email, otp, campaignId } = req.body;

    try {
        // Verify employee and OTP
        console.log(campaignId);
        
        const employee = await EmployeeModel.findOne({ email });
        if (!employee || employee.otp !== otp || new Date() > employee.otpExpiresAt) {
            return res.status(400).json({ message: 'Invalid OTP or OTP expired', success: false });
        }

        // Generate JWT token after OTP verification
        const token = jwt.sign({ id: employee._id, email: employee.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Retrieve campaign data using campaignId
        const campaign = await Campaign.findById( campaignId );

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found', success: false });
        }

        res.status(200).json({
            message: 'OTP verified successfully',
            success: true,
            token,
            campaign: campaign.landingPage.template // Send the landing page data
        });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', success: false, error: error.message });
    }
};



module.exports = { generateEmployeOTP,verifyOTP }