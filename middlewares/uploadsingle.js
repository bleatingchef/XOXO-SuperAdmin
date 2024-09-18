const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require("uuid");

// Set up multer to handle image uploads
const uploadsingle = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path.resolve(__dirname, '..', 'public');
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueId = uuidv4();
            const fileExtension = path.extname(file.originalname);
            cb(null, `${uniqueId}${fileExtension}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

module.exports = { uploadsingle };
