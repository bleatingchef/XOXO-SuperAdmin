const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ensureAuthenticated, requireSuperAdmin, upload, uploadsingle } = require('../middlewares');
const { createSuperAdmin, createAdmin, superAdminLogin, getAllAdmins, getAllWalletRequests, updateWalletRequestStatus } = require('../controllers/superAdmin');
const { loginAdmin, createCampaign, getAllCampaigns, getActiveCampaigns, sendSingleEmail, sendVoucherEmail, deleteCampaign, requestWalletBalance, getAdminData, sendBulkEmails } = require('../controllers/admin');
const { uploadCampaignImages } = require('../middlewares/multerSingleFileUpload');

const router = express.Router();


//api for super admin

// Register  SuperAdmin
router.post('/superadmin/register-super-admin', createSuperAdmin,requireSuperAdmin);
// super admin login
router.post('/login',upload.none() ,superAdminLogin,requireSuperAdmin);
//with this API super admin can register New Admin 
router.post('/register-admin',upload.none() ,ensureAuthenticated,createAdmin);
// get all admin details
router.get('/getAllAdmins',getAllAdmins)
router.get('/getAllWalletRequest',ensureAuthenticated,getAllWalletRequests)
router.put('/updateWalletRequestStatus',upload.none(),ensureAuthenticated,updateWalletRequestStatus)
router.get('/me', ensureAuthenticated, getAdminData);



//API for admin

// Login Admin
router.post('/login',upload.none(),loginAdmin);
// api for creating campaign
router.post('/campaign/create',uploadCampaignImages,createCampaign)
// get all campaigns
router.get('/getAllCampaigns',getAllCampaigns );
//get campaign those status is running and planning
router.get('/getActiveCampaigns',getActiveCampaigns );
// API for sending mails in bulk
router.post('/send-voucher',ensureAuthenticated, uploadsingle.single('image'), sendVoucherEmail);

router.delete('/deleteCampaign', deleteCampaign);
router.post('/send-bulk-email', uploadsingle.single('imageFile'), sendBulkEmails);

router.post('/walletRequest',upload.none(),ensureAuthenticated, requestWalletBalance);

const adminAuthRoutes = router;

module.exports = adminAuthRoutes;
