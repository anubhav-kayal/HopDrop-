const multer = require("multer");

// ✅ Use memory storage (no files saved to disk)
const storage = multer.memoryStorage();

// ✅ Optional: Only allow CSV
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/csv") {
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
