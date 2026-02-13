# API Routes Reference

## Base URL
```
http://localhost:5001
```

## Available Routes

### 1. Upload CSV File
**Endpoint**: `POST /api/files/upload`

**Full URL**: `http://localhost:5001/api/files/upload`

**Description**: Upload and process CSV files containing sales data for store, warehouse, or online inventory.

**Request Type**: `multipart/form-data`

**Parameters**:
- `file` (required): CSV file to upload
- `channel` (optional): One of `store`, `warehouse`, or `online`

**Response**:
```json
{
  "message": "File processed successfully!",
  "totalRows": 10,
  "inserted": 8,
  "rejected": 2,
  "channel": "STORE",
  "channelSource": "csv-column",
  "details": {
    "validRowsProcessed": 8,
    "initialRejects": 2,
    "finalInserted": 8,
    "finalRejected": 2
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad Request (no file or invalid file type)
- `500`: Server Error

---

## Channel Detection Priority

The system detects the channel in this order:

1. **Request Parameter** (`channel` in form-data)
2. **CSV Column Data** (checks for columns like `channel`, `store_type`, `inventory_type` or values containing keywords)
3. **Filename** (checks if filename contains "store", "warehouse", or "online")
4. **Default** (defaults to "STORE")

---

## CSV Column Requirements

### Required Columns:
- `transaction_id` (must be unique, no duplicates)
- `transaction_date`
- `customer_name`
- `product`
- `total_items` (must be >= 0)
- `total_cost` (must be >= 0)
- `city`

### Optional Columns:
- `payment_method`
- `discount_percentage`
- `season`
- `channel` (or `store_type`, `inventory_type`)

---

## Validation Rules

Rows are rejected if:
1. ❌ Negative quantity (`total_items < 0`)
2. ❌ Negative sales amount (`total_cost < 0`)
3. ❌ Duplicate transaction ID (within same file or in database)
4. ❌ Missing required fields
5. ❌ Invalid date format
