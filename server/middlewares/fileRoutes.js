const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware'); // Import the Multer config we just wrote

// THE ROUTE: POST /api/files/upload
// 1. 'upload.single('file')' -> This is Multer catching the file.
//    It looks for a form field named 'file'.
router.post('/upload', upload.single('file'), (req, res) => {
    
    // A. Check if Multer actually caught a file
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded or wrong format." });
    }

    // B. If we get here, the file is safely saved in 'uploads/'
    console.log("File saved at:", req.file.path);

    // C. Send success message back to Frontend
    res.status(200).json({ 
        message: "File uploaded successfully!", 
        filePath: req.file.path,
        originalName: req.file.originalname
    });
});

module.exports = router;