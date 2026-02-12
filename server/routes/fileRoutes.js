const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

// THE ROUTE: POST /api/files/upload
router.post('/upload', upload.single('file'), (req, res) => {
    
    // 1. Check if Multer actually caught a file
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded or wrong format." });
    }

    //3. Send success message (This stops the loading in Postman)
    res.status(200).json({ 
        message: "File uploaded successfully!", 
        filePath: req.file.path,
        originalName: req.file.originalname
    });
});

module.exports = router;