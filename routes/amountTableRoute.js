const express = require('express');
const { amounttable, deleteUserBySerial, gettable, viewUserBySerial, updateUserBySerial } = require('../controllers/superAdmin/amountTableController');

const router = express.Router();

// Define routes
router.post('/addamounttable', amounttable);
router.get('/getamounttable', gettable);
router.get('/viewamounttable/:serial', viewUserBySerial); // View by 'serial'
router.put('/updateamounttable/:serial', updateUserBySerial); // Update by 'serial'
router.delete('/deleteamounttable/:serial', deleteUserBySerial); // Delete by 'serial'

module.exports = router;
