const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ensureAuthenticated, requireSuperAdmin, upload, uploadsingle } = require('../middlewares');
const { uploadCampaignImages } = require('../middlewares/multerSingleFileUpload');
const { generateEmployeOTP, verifyOTP } = require('../controllers/employees');

const router = express.Router();

router.post('/generateOTP',upload.none(),generateEmployeOTP);
router.post('/verifyOTP',upload.none(),verifyOTP);


const employeRoutes = router;

module.exports = employeRoutes;
