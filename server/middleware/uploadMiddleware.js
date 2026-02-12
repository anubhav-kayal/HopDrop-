console.log("✅ DEBUG: uploadMiddleware.js is loading...");
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// 1. Define where the files should go
const uploadDir = 'uploads/';

// CRITICAL: Create the 'uploads' folder automatically if it doesn't exist.
// This prevents the "Directory not found" crash.
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. Configure Storage (Where to save & what to name it)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save to 'server/uploads/'
    },
    filename: function (req, file, cb) {
        // We add a timestamp to the name to prevent overwriting.
        // Example: "warehouse-1707823423.csv"
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 3. File Filter (Optional: Only allow CSV and JSON)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/json') {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Only CSV or JSON files are allowed!'), false); // Reject file
    }
};

// 4. Initialize Multer
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

console.log("DEBUG: Exporting upload object:", upload);
module.exports = upload;