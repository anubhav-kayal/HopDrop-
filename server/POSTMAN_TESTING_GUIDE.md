# Postman Testing Guide

## Server Information
- **Base URL**: `http://localhost:5001`
- **Port**: `5001`

## Available Routes

### 1. Upload CSV File
**Endpoint**: `POST /api/files/upload`

### 2. Debug CSV Structure (NEW)
**Endpoint**: `POST /api/files/upload/debug`

**Description**: Inspect CSV file structure without processing. Useful for troubleshooting column name issues.

**Usage**: Same as upload endpoint, but returns CSV structure analysis instead of processing data.

**Description**: Upload and process CSV files containing sales data. Supports three types: store, warehouse, and online inventory.

---

## Postman Setup Instructions

### Step 1: Create a New Request
1. Open Postman
2. Create a new **POST** request
3. Set URL to: `http://localhost:5001/api/files/upload`

### Step 2: Configure Request Headers
1. Go to the **Headers** tab
2. Add the following header:
   - **Key**: `X-API-Key`
   - **Value**: `admin` (or `operator` for write access, `analyst` for read-only)
   - **Description**: API key for authentication

**Available API Keys:**
- `admin` - Full access (read, write, delete, analytics)
- `operator` - Read and write access
- `analyst` - Read and analytics access

**Note**: Content-Type will be automatically set by Postman when using form-data (don't manually set it)

### Step 3: Configure Request Body
1. Go to the **Body** tab
2. Select **form-data** (not raw or x-www-form-urlencoded)
3. Add the following fields:

#### Option A: Upload File Only (Auto-detect channel from CSV)
- **Key**: `file`
- **Type**: Select **File** from the dropdown (not Text)
- **Value**: Click "Select Files" and choose your CSV file

#### Option B: Upload File with Explicit Channel
- **Key**: `file`
- **Type**: Select **File** from the dropdown
- **Value**: Click "Select Files" and choose your CSV file

- **Key**: `channel`
- **Type**: Select **Text** from the dropdown
- **Value**: One of: `store`, `warehouse`, or `online` (case-insensitive)

### Step 4: Send Request
Click the **Send** button

---

## CSV File Format

### Required Columns
Your CSV file should include the following columns:

```
transaction_id, transaction_date, customer_name, product, total_items, total_cost, payment_method, city, discount_percentage, season, channel
```

### Example CSV Content

#### Store Inventory CSV:
```csv
transaction_id,transaction_date,customer_name,product,total_items,total_cost,payment_method,city,discount_percentage,season,channel
1001,2024-01-15 10:30:00,John Doe,Laptop,2,2500.00,Credit Card,New York,5.0,Winter,STORE
1002,2024-01-15 11:00:00,Jane Smith,Mouse,5,250.00,Cash,Los Angeles,0.0,Winter,STORE
```

#### Warehouse Inventory CSV:
```csv
transaction_id,transaction_date,customer_name,product,total_items,total_cost,payment_method,city,discount_percentage,season,channel
2001,2024-01-15 09:00:00,ABC Corp,Keyboard,10,500.00,Wire Transfer,Chicago,10.0,Winter,WAREHOUSE
2002,2024-01-15 09:30:00,XYZ Ltd,Monitor,3,900.00,Credit Card,Chicago,0.0,Winter,WAREHOUSE
```

#### Online Inventory CSV:
```csv
transaction_id,transaction_date,customer_name,product,total_items,total_cost,payment_method,city,discount_percentage,season,channel
3001,2024-01-15 14:00:00,Alice Brown,Headphones,1,150.00,PayPal,Seattle,0.0,Winter,ONLINE
3002,2024-01-15 14:30:00,Bob Wilson,Webcam,2,200.00,Credit Card,Seattle,5.0,Winter,ONLINE
```

### Channel Detection
The system will detect the channel in the following priority order:
1. **Request parameter** (`channel` field in form-data)
2. **CSV column data** (checks for "channel", "store_type", "inventory_type" columns or values containing "store", "warehouse", "online")
3. **Filename** (if filename contains "store", "warehouse", or "online")
4. **Default** (defaults to "STORE")

---

## Expected Responses

### Success Response (200 OK)
```json
{
  "message": "File processed successfully!",
  "totalRows": 2,
  "inserted": 2,
  "rejected": 0,
  "channel": "STORE",
  "channelSource": "csv-column",
  "details": {
    "validRowsProcessed": 2,
    "initialRejects": 0,
    "finalInserted": 2,
    "finalRejected": 0
  }
}
```

### Error Response - No File (400 Bad Request)
```json
{
  "error": "No file uploaded."
}
```

### Error Response - Invalid File Type (400 Bad Request)
```json
{
  "error": "Only CSV files are allowed!"
}
```

### Error Response - Server Error (500 Internal Server Error)
```json
{
  "error": "Processing failed.",
  "message": "Error details here"
}
```

---

## Testing Scenarios

### Scenario 1: Valid Store CSV
1. Create CSV with valid store data
2. Set `channel` = `store` in form-data
3. Upload file
4. **Expected**: All rows inserted into `sales` table

### Scenario 2: CSV with Negative Quantity
1. Create CSV with `total_items = -5`
2. Upload file
3. **Expected**: Row rejected and stored in `rejected_sales` table with reason "Negative or invalid quantity"

### Scenario 3: CSV with Negative Sales Amount
1. Create CSV with `total_cost = -100`
2. Upload file
3. **Expected**: Row rejected and stored in `rejected_sales` table with reason "Negative or invalid sales amount"

### Scenario 4: CSV with Duplicate Transaction IDs
1. Create CSV with same `transaction_id` appearing twice
2. Upload file
3. **Expected**: First occurrence inserted, second rejected with reason "Duplicate transaction_id"

### Scenario 5: CSV with Channel in Column
1. Create CSV with `channel` column containing "ONLINE"
2. Upload file without specifying channel parameter
3. **Expected**: Channel auto-detected from CSV column, rows inserted with channel="ONLINE"

### Scenario 6: CSV with Channel in Other Column Names
1. Create CSV with column `store_type` containing "WAREHOUSE"
2. Upload file without specifying channel parameter
3. **Expected**: Channel auto-detected from `store_type` column

---

## Postman Collection JSON

You can import this into Postman:

```json
{
  "info": {
    "name": "HopDrop CSV Upload API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Upload Store CSV",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": []
            },
            {
              "key": "channel",
              "value": "store",
              "type": "text"
            }
          ]
        },
        "url": {
          "raw": "http://localhost:5001/api/files/upload?channel=store",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5001",
          "path": ["api", "files", "upload"],
          "query": [
            {
              "key": "channel",
              "value": "store"
            }
          ]
        }
      }
    },
    {
      "name": "Upload Warehouse CSV",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": []
            },
            {
              "key": "channel",
              "value": "warehouse",
              "type": "text"
            }
          ]
        },
        "url": {
          "raw": "http://localhost:5001/api/files/upload",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5001",
          "path": ["api", "files", "upload"]
        }
      }
    },
    {
      "name": "Upload Online CSV",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": []
            },
            {
              "key": "channel",
              "value": "online",
              "type": "text"
            }
          ]
        },
        "url": {
          "raw": "http://localhost:5001/api/files/upload",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5001",
          "path": ["api", "files", "upload"]
        }
      }
    }
  ]
}
```

---

## Quick Test Checklist

- [ ] Server is running on port 5001
- [ ] Database connection is configured
- [ ] CSV file has required columns
- [ ] CSV file size is under 5MB
- [ ] CSV file is valid format
- [ ] Request uses form-data (not raw JSON)
- [ ] File field type is set to "File" in Postman

---

## Troubleshooting

### Issue: "No file uploaded"
- **Solution**: Make sure the form-data field is named `file` and type is set to "File" (not "Text")

### Issue: "Only CSV files are allowed"
- **Solution**: Ensure your file has `.csv` extension or correct MIME type

### Issue: "Processing failed"
- **Solution**: Check server logs for detailed error. Common issues:
  - Database connection problems
  - Invalid date formats
  - Missing required columns

### Issue: All rows rejected
- **Solution**: Check CSV format matches expected schema. Verify:
  - No negative quantities
  - No negative costs
  - No duplicate transaction IDs
  - All required fields present
