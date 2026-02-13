const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { Readable } = require("stream");
const csv = require("csv-parser");

const validateRow = require("../etl/validator");
const transformRow = require("../etl/transformer");
const processRow = require("../etl/loader");

router.post("/upload", upload.single("file"), async (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  // ✅ MUST be inside here
  const stream = Readable.from(req.file.buffer);

  let totalRows = 0;
  let inserted = 0;
  let rejected = 0;

  const rows = [];

  stream
    .pipe(csv())
    .on("data", (row) => {
      rows.push(row);
    })
    .on("end", async () => {
      try {
        for (const row of rows) {
          totalRows++;

          const validationError = validateRow(row);
          if (validationError) {
            await processRow({ ...row, rejectionReason: validationError });
            rejected++;
            continue;
          }

          const transformed = transformRow(row);
          if (transformed.error) {
            await processRow({ ...row, rejectionReason: transformed.message });
            rejected++;
            continue;
          }

          await processRow(transformed);
          inserted++;
        }

        res.status(200).json({
          message: "File processed successfully!",
          totalRows,
          inserted,
          rejected
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Processing failed." });
      }
    })
    .on("error", (err) => {
      console.error(err);
      res.status(500).json({ error: "CSV processing failed." });
    });

});

module.exports = router;
