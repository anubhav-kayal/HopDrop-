const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { Readable } = require("stream");
const csv = require("csv-parser");
const BatchPipeline = require("../pipelines/batch_pipeline");
const { requirePermission } = require("../middleware/auth");

/**
 * Valid CSV types: store, warehouse, online
 */
const VALID_CHANNELS = ['STORE', 'WAREHOUSE', 'ONLINE'];

/**
 * Normalize CSV column names to standard format
 * Handles case sensitivity, spaces, and common variations
 */
function normalizeRowKeys(row) {
  const normalized = {};
  const keyMap = {
    'transaction_id': ['transaction_id', 'transaction id', 'transactionid', 'id', 'transaction_id'],
    'transaction_date': ['transaction_date', 'transaction date', 'transactiondate', 'date', 'transaction_date'],
    'customer_name': ['customer_name', 'customer name', 'customername', 'customer'],
    'product': ['product', 'item', 'product_name', 'product name'],
    'total_items': ['total_items', 'total items', 'totalitems', 'quantity', 'qty', 'items'],
    'total_cost': ['total_cost', 'total cost', 'totalcost', 'amount', 'price', 'cost'],
    'payment_method': ['payment_method', 'payment method', 'paymentmethod', 'payment'],
    'city': ['city', 'location', 'store_city', 'store city'],
    'discount_percentage': ['discount_percentage', 'discount percentage', 'discountpercentage', 'discount', 'discount%'],
    'season': ['season'],
    'channel': ['channel', 'store_type', 'inventory_type', 'source', 'location_type', 'sales_channel', 'channel_type']
  };

  // Normalize key lookup helper
  const normalizeKey = (key) => key ? String(key).trim().toLowerCase().replace(/\s+/g, '_') : '';
  
  // Map each standard key
  for (const [standardKey, variations] of Object.entries(keyMap)) {
    for (const rowKey in row) {
      const normalizedRowKey = normalizeKey(rowKey);
      if (variations.some(v => normalizeKey(v) === normalizedRowKey)) {
        normalized[standardKey] = row[rowKey];
        break;
      }
    }
  }

  // Copy any remaining keys that weren't mapped
  for (const key in row) {
    if (!normalized.hasOwnProperty(key)) {
      normalized[key] = row[key];
    }
  }

  return normalized;
}

/**
 * Detect channel from CSV row data
 * Checks column names and values for explicit mentions of store/warehouse/online
 */
function detectChannelFromRow(row) {
  // Check common column names that might contain channel info
  const channelColumns = [
    'channel', 'store_type', 'inventory_type', 'source', 
    'location_type', 'sales_channel', 'channel_type'
  ];
  
  // Check column names first
  for (const col of channelColumns) {
    if (row[col]) {
      const value = String(row[col]).toUpperCase().trim();
      if (VALID_CHANNELS.includes(value)) {
        return value;
      }
      // Check for partial matches
      if (value.includes('STORE') && !value.includes('WAREHOUSE')) {
        return 'STORE';
      }
      if (value.includes('WAREHOUSE')) {
        return 'WAREHOUSE';
      }
      if (value.includes('ONLINE')) {
        return 'ONLINE';
      }
    }
  }
  
  // Check all column values for keywords
  for (const [key, value] of Object.entries(row)) {
    if (value) {
      const strValue = String(value).toUpperCase();
      if (strValue.includes('STORE') && !strValue.includes('WAREHOUSE')) {
        return 'STORE';
      }
      if (strValue.includes('WAREHOUSE')) {
        return 'WAREHOUSE';
      }
      if (strValue.includes('ONLINE')) {
        return 'ONLINE';
      }
    }
  }
  
  return null;
}

/**
 * Upload and process CSV file
 * Supports three types: store, warehouse, online inventory
 * 
 * Request body should include:
 * - file: CSV file (multipart/form-data)
 * - channel: (optional) 'store', 'warehouse', or 'online' - if not provided, will try to infer from CSV
 */
router.post("/upload", upload.single("file"), requirePermission('write'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    const requestedChannel = (req.body.channel || req.query.channel || '').toUpperCase().trim();
    const pipeline = new BatchPipeline();
    
    const result = await pipeline.processFile(
      req.file.buffer,
      req.file.originalname,
      requestedChannel || null
    );

    res.status(200).json({
      message: "File processed successfully!",
      runId: result.runId,
      totalRows: result.processed,
      inserted: result.succeeded,
      rejected: result.failed,
      metadata: result.metadata
    });
  } catch (error) {
    console.error("Processing error:", error);
    res.status(500).json({ 
      error: "Processing failed.",
      message: error.message 
    });
  }
});

/**
 * Debug endpoint to inspect CSV structure without processing
 * Useful for troubleshooting column name issues
 */
router.post("/upload/debug", upload.single("file"), requirePermission('read'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const stream = Readable.from(req.file.buffer);
  const rows = [];
  let headerRow = null;

  stream
    .pipe(csv())
    .on("headers", (headers) => {
      headerRow = headers;
    })
    .on("data", (row) => {
      if (rows.length < 3) { // Only keep first 3 rows for debugging
        rows.push(row);
      }
    })
    .on("end", () => {
      res.status(200).json({
        message: "CSV structure analysis",
        filename: req.file.originalname,
        totalRows: rows.length,
        headers: headerRow,
        headerCount: headerRow ? headerRow.length : 0,
        sampleRows: rows.map((row, idx) => ({
          rowNumber: idx + 1,
          keys: Object.keys(row),
          values: row,
          keyCount: Object.keys(row).length
        })),
        detectedChannel: rows.length > 0 ? detectChannelFromRow(rows[0]) : null
      });
    })
    .on("error", (err) => {
      res.status(500).json({ 
        error: "CSV parsing failed.",
        message: err.message 
      });
    });
});

module.exports = router;
