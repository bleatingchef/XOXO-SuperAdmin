const { AdminAndSuperAdminModel, Campaign, walletRequest, EmployeeModel } = require("../../models");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { validateRequiredFields } = require("../../utils/validator");
const { default: mongoose } = require("mongoose");


// Configure the transporter for Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'developer.sourabhsingh@gmail.com',
        pass: `jvdf hdvf abvf xbzf`,
    },
});

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required', success: false });
        }

        // Find the admin by email
        const admin = await AdminAndSuperAdminModel.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found', success: false });
        }

        // Check if the password matches
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials', success: false });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Set token expiration time
        );

        // Respond with success and token
        res.json({
            message: 'Login successful',
            success: true,
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                },
                token // Include the JWT token in the response
            }
        });

    } catch (error) {
        // Handle errors
        console.error('Error logging in:', error);
        res.status(500).json({
            message: 'Server error while logging in',
            success: false,
            error: error.message
        });
    }
};

const createCampaign = async (req, res) => {
    try {
        // Access files from req.files
        const logoImgFilename = req.files['logoImg'] ? req.files['logoImg'][0].filename : null;
        const mainImageFilename = req.files['mainImage'] ? req.files['mainImage'][0].filename : null;

        // Other form fields from req.body
        const { campaignName, denominationCurrency, campaignStartDate, campaignEndDate, productCategories, giftVoucherBrand, title, description, buttonName, url } = req.body;
        const { admin } = req.query;

        // Validate admin ID
        if (!admin || !mongoose.Types.ObjectId.isValid(admin)) {
            return res.status(400).json({
                message: 'Valid admin ID is required',
                success: false
            });
        }

        // Convert comma-separated values to arrays
        const categoriesArray = productCategories ? productCategories.split(',').map(item => item.trim()) : [];
        const brandsArray = giftVoucherBrand ? giftVoucherBrand.split(',').map(item => item.trim()) : [];

        // Validate required fields
        const requiredFields = ['campaignName', 'denominationCurrency', 'campaignStartDate', 'campaignEndDate', 'title', 'description', 'buttonName', 'url'];
        const missingFields = validateRequiredFields(requiredFields, {
            campaignName,
            denominationCurrency,
            campaignStartDate,
            campaignEndDate,
            title,
            description,
            buttonName,
            url
        });

        if (missingFields.length) {
            return res.status(400).json({
                message: `Missing or empty fields: ${missingFields.join(', ')}`,
                success: false
            });
        }

        if (!categoriesArray.length) {
            return res.status(400).json({
                message: 'At least one product category is required',
                success: false
            });
        }

        if (!brandsArray.length) {
            return res.status(400).json({
                message: 'At least one gift voucher brand is required',
                success: false
            });
        }

        // Create a new campaign instance
        const newCampaign = new Campaign({
            campaignName,
            campaignStartDate: new Date(campaignStartDate),
            campaignEndDate: new Date(campaignEndDate),
            productCategories: categoriesArray,
            giftVoucherBrand: brandsArray,
            denominationCurrency,
            admin,
            landingPage: {
                template: {
                    logoImg: logoImgFilename,
                    mainImage: mainImageFilename,
                    title,
                    description,
                    buttonName,
                    url
                }
            }
        });

        // Save the campaign to the database
        await newCampaign.save();

        // Respond with success message
        res.status(201).json({
            message: 'Campaign created successfully',
            success: true,
            data: newCampaign
        });

    } catch (error) {
        // Log the error and respond with server error
        console.error('Error creating campaign:', error);
        res.status(500).json({
            message: 'Server error while creating campaign',
            success: false,
            error: error.message
        });
    }
};

const getAllCampaigns = async (req, res) => {
    try {
        // Extract adminId from query parameters
        const { adminId } = req.query;

        // Validate the adminId
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({
                message: 'Valid admin ID is required',
                success: false
            });
        }

        // Fetch campaigns for the given admin
        const campaigns = await Campaign.find({ admin: adminId });

        // Respond with the list of campaigns
        res.status(200).json({
            message: 'Campaigns fetched successfully',
            success: true,
            numnerOfCampaigns: campaigns.length,
            data: campaigns,

        });

    } catch (error) {
        // Log the error and respond with server error
        console.error('Error fetching campaigns:', error);
        res.status(500).json({
            message: 'Server error while fetching campaigns',
            success: false,
            error: error.message
        });
    }
};

const getActiveCampaigns = async (req, res) => {
    try {
        // Extract adminId from query parameters
        const { adminId } = req.query;

        // Validate the adminId
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({
                message: 'Valid admin ID is required',
                success: false
            });
        }

        // Fetch campaigns for the given admin with status 'planning' or 'running'
        const activeCampaigns = await Campaign.find({
            admin: adminId,
            status: { $in: ['planning', 'running'] } // Check for statuses
        });

        // Check if no campaigns were found
        if (!activeCampaigns || activeCampaigns.length === 0) {
            return res.status(404).json({
                message: 'No active campaigns found for this admin',
                success: false
            });
        }

        // Respond with the list of active campaigns
        res.status(200).json({
            message: 'Active campaigns fetched successfully',
            success: true,
            numberOfCampaigns: activeCampaigns.length,
            data: activeCampaigns,
        });

    } catch (error) {
        // Log the error and respond with server error
        console.error('Error fetching active campaigns:', error);
        res.status(500).json({
            message: 'Server error while fetching campaigns',
            success: false,
            error: error.message
        });
    }
};

const sendVoucherEmail = async (req, res) => {
    try {
        const { email, name, redirectUrl, campaignId } = req.body; // Add campaignId
        const imageFile = req.file; // Image attached

        // Check required fields
        if (!email || !name || !redirectUrl || !imageFile) {
            return res.status(400).json({
                message: 'Email, name, redirectUrl, campaignId, and image are required',
                success: false
            });
        }

        // Ensure employee exists or create a new one
        let employee = await EmployeeModel.findOne({ email });
        if (!employee) {
            employee = new EmployeeModel({ email, name, adminRef: req.user.id });
            await employee.save();
        }

        // Modify the email template to include the campaignId in the redirect URL
        let htmlContent = fs.readFileSync(path.join(__dirname, '..', '..', 'templates', 'voucher-email-template.html'), 'utf8');
        htmlContent = htmlContent.replace('${name}', name)
            .replace('${redirectUrl}', `${redirectUrl}?campaignId=${campaignId}/?email=${email}`)
            .replace('${imageSrc}', 'cid:voucherImage');

        // Define mail options
        const mailOptions = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USERNAME}>`,
            to: email,
            subject: 'Your Gift Voucher',
            html: htmlContent,
            attachments: [
                {
                    filename: imageFile.originalname,
                    path: imageFile.path,
                    cid: 'voucherImage'
                }
            ]
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Clean up
        fs.unlink(imageFile.path, (err) => {
            if (err) console.error('Error deleting image:', err);
        });

        res.status(200).json({
            message: 'Voucher email sent successfully with campaignId',
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error sending voucher email',
            success: false,
            error: error.message
        });
    }
};


const deleteCampaign = async (req, res) => {
    try {
        const { campaignId } = req.query;

        if (!campaignId || typeof campaignId !== 'string') {
            return res.status(400).json({
                message: 'Invalid or missing campaign ID',
                success: false
            });
        }

        if (!/^[0-9a-fA-F]{24}$/.test(campaignId)) {
            return res.status(400).json({
                message: 'Invalid campaign ID format',
                success: false
            });
        }

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({
                message: 'Campaign not found',
                success: false
            });
        }

        // Paths from the campaign
        const logoImgPath = campaign.landingPage?.template?.logoImg;
        const mainImagePath = campaign.landingPage?.template?.mainImage;

        const publicFolderPath = path.resolve(__dirname, '..', '..', 'public', 'template-logo&main-img');

        console.log('Public folder path:', publicFolderPath);
        console.log('Logo image path:', logoImgPath);
        console.log('Main image path:', mainImagePath);

        // Full paths to images
        const logoImageFullPath = path.join(publicFolderPath, logoImgPath);
        const mainImageFullPath = path.join(publicFolderPath, mainImagePath);

        console.log('Full path to logo image:', logoImageFullPath);
        console.log('Full path to main image:', mainImageFullPath);

        // Delete logo image
        try {
            if (logoImgPath) {
                if (fs.existsSync(logoImageFullPath)) {
                    console.log('Deleting logo image:', logoImageFullPath);
                    fs.unlinkSync(logoImageFullPath);
                } else {
                    console.log('Logo image not found for deletion:', logoImageFullPath);
                }
            }
        } catch (err) {
            console.error('Error deleting logo image:', err);
        }

        // Delete main image
        try {
            if (mainImagePath) {
                if (fs.existsSync(mainImageFullPath)) {
                    console.log('Deleting main image:', mainImageFullPath);
                    fs.unlinkSync(mainImageFullPath);
                } else {
                    console.log('Main image not found for deletion:', mainImageFullPath);
                }
            }
        } catch (err) {
            console.error('Error deleting main image:', err);
        }

        // Finally, delete the campaign from the database
        await Campaign.findByIdAndDelete(campaignId);

        res.status(200).json({
            message: 'Campaign and associated images deleted successfully',
            success: true
        });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({
            message: 'Error deleting campaign',
            success: false,
            error: error.message
        });
    }
};



const requestWalletBalance = async (req, res) => {
    try {
        const { requestedAmount } = req.body;
        const adminId = req.user.id; // Assuming you have admin authentication in place

        // Validate request
        if (!requestedAmount || requestedAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount requested' });
        }

        // Create a new wallet request
        const newRequest = new walletRequest({
            adminId,
            requestedAmount,
        });

        await newRequest.save();

        res.status(200).json({
            success: true,
            message: 'Request submitted successfully',
            request: newRequest
        });
    } catch (error) {
        console.error('Error submitting wallet request:', error);
        res.status(500).json({ success: false, message: 'Error submitting request' });
    }
};

const getAdminData = async (req, res) => {
    try {
        // Assuming the admin is authenticated, and req.user contains their ID from the JWT token
        const adminId = req.user.id;

        // Find the admin by their ID
        const adminData = await AdminAndSuperAdminModel.findById(adminId).select('-password'); // Exclude password from the response

        if (!adminData) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found',
            });
        }

        // Return the admin's data
        res.status(200).json({
            success: true,
            data: adminData,
        });
    } catch (error) {
        console.error('Error fetching admin data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

const sendBulkEmails = async (req, res) => {
    try {
        let { recipients, campaignId } = req.body;
        const imageFile = req.file; // Multer will handle this
        if (!recipients || !Array.isArray(JSON.parse(recipients)) || !campaignId || !imageFile) {
            return res.status(400).json({
                message: 'Recipients, campaignId, and image are required',
                success: false
            });
        }
        const parsedRecipients = JSON.parse(recipients); // Parse recipients from JSON
        const uniqueRecipients = parsedRecipients.filter((recipient, index, self) =>
            index === self.findIndex((r) => r.email === recipient.email)
        );
        const redirectUrl = 'https://xoxoemployee.markletechandmedia.com/employee';
        for (const recipient of uniqueRecipients) {
            const { email, name } = recipient;
            let htmlContent = fs.readFileSync(path.join(__dirname, '..', '..', 'templates', 'voucher-email-template.html'), 'utf8');
            htmlContent = htmlContent.replace('${name}', name)
                .replace('${redirectUrl}', `${redirectUrl}?campaignId=${campaignId}/${email}`)
                .replace('${imageSrc}', 'cid:voucherImage');
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USERNAME}>`,
                to: email,
                subject: 'Your Gift Voucher',
                html: htmlContent,
                attachments: [
                    {
                        filename: imageFile.originalname,
                        path: imageFile.path,
                        cid: 'voucherImage'
                    }
                ]
            };
            await transporter.sendMail(mailOptions);
        }
        fs.unlink(imageFile.path, (err) => {
            if (err) console.error('Error deleting image:', err);
        });
        res.status(200).json({
            message: 'Voucher emails sent successfully',
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error sending voucher emails',
            success: false,
            error: error.message
        });
    }
};

const editCampaignDetails = (req, res) => {
    try {
        const { campaignId } = req.body;


    } catch (error) {
        res.status(500).json({
            message: 'Error while editing campaign details',
            success: false,
            error: error.message
        });
    }
}


module.exports = { loginAdmin, createCampaign, getAllCampaigns, getActiveCampaigns, sendVoucherEmail, deleteCampaign, requestWalletBalance, getAdminData, sendBulkEmails }