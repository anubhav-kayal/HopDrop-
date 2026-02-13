const multer = require("multer");

// ✅ Use memory storage (no files saved to disk)
const storage = multer.memoryStorage();

// ✅ Only allow CSV files (accept multiple MIME types)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
    "text/plain"
  ];
  
  const isCSV = allowedMimeTypes.includes(file.mimetype) || 
                file.originalname.toLowerCase().endsWith('.csv');
  
  if (isCSV) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;
