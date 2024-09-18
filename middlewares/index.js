const ensureAuthenticated = require("./ensureAuthenticated");
const upload = require("./multerConfig");
const requireSuperAdmin = require("./requireSuperAdmin");
const { uploadsingle } = require("./uploadsingle");

module.exports={requireSuperAdmin,ensureAuthenticated,upload,uploadsingle}