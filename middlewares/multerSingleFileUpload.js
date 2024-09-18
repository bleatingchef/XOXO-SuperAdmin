const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Utility function for file upload
function fileUpload(folderName) {
    const uploadPath = path.resolve(__dirname, "..", "public", folderName);
    
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    console.log(uploadPath);
    
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            const uniqueId = uuidv4(); // Generate a unique identifier
            const fileExtension = path.extname(file.originalname);
            cb(null, `${uniqueId}${fileExtension}`);
        }
    });

    const fileFilter = (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true); // Accept file
        } else {
            cb(new Error('Only image files are allowed!'), false); // Reject file
        }
    };

    return multer({ storage: storage, fileFilter: fileFilter });
}

// Define the multer middleware for handling multiple files
const uploadCampaignImages = fileUpload("template-logo&main-img").fields([
    { name: 'logoImg', maxCount: 1 },
    { name: 'mainImage', maxCount: 1 }
]);

module.exports = { uploadCampaignImages };
