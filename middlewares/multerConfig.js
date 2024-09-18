const multer = require('multer');

// Configure multer for file uploads (if needed)
const upload = multer({
  // Set storage options, file size limits, etc.
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;