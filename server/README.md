# HopDrop Retail Data Platform - Server

## Overview

A comprehensive retail data platform backend for processing sales, inventory, and shipment data from multiple channels (stores, warehouses, online).

## Features

- ✅ **Star Schema Database**: Fact and dimension tables with SCD Type 2
- ✅ **Batch Processing**: CSV file ingestion with validation and transformation
- ✅ **Data Quality Monitoring**: Automated checks for completeness, validity, consistency, accuracy
- ✅ **Analytics API**: Business KPIs and insights
- ✅ **Security**: API key authentication and role-based access control
- ✅ **Partitioning**: Monthly partitions for optimized query performance
- ✅ **Schema Evolution**: Handles changing data formats
- ✅ **Retry Logic**: Automatic retries with exponential backoff

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=nexusretail
```

### 3. Setup Database

```bash
# Create database and tables
psql -U your_user -d postgres -f database/schema_star.sql

# Initialize time dimension
node database/migrations/001_init_time_dimension.js
```

### 4. Start Server

```bash
npm start
# or for development
npm run dev
```

## API Endpoints

### File Upload

**POST** `/api/files/upload`

Upload CSV file for processing.

**Headers:**
- `X-API-Key: admin` (or `analyst`, `operator`)

**Body (form-data):**
- `file`: CSV file
- `channel`: (optional) `store`, `warehouse`, or `online`

**Response:**
```json
{
  "message": "File processed successfully!",
  "runId": 1,
  "totalRows": 500,
  "inserted": 480,
  "rejected": 20,
  "metadata": {
    "filename": "sales.csv",
    "channel": "STORE"
  }
}
```

### Analytics Endpoints

All analytics endpoints require authentication and `analytics` permission.

**GET** `/api/analytics/revenue?period=daily&startDate=2024-01-01&endDate=2024-01-31`
- Get daily or monthly revenue

**GET** `/api/analytics/sales-by-city?startDate=2024-01-01&endDate=2024-01-31`
- Get city-wise sales breakdown

**GET** `/api/analytics/top-products?limit=10`
- Get top selling products

**GET** `/api/analytics/inventory-turnover`
- Get inventory turnover ratios

**GET** `/api/analytics/customer-lifetime-value?limit=100`
- Get customer lifetime value metrics

**GET** `/api/analytics/market-basket?productId=123&limit=10`
- Get products frequently bought together

### Data Quality

**GET** `/api/data-quality?days=7`
- Get data quality metrics for last N days

## Authentication

Use API key in header or query parameter:

```bash
# Header
curl -H "X-API-Key: admin" http://localhost:5001/api/analytics/revenue

# Query parameter
curl http://localhost:5001/api/analytics/revenue?api_key=admin
```

### Available API Keys

- `admin`: Full access (read, write, delete, analytics)
- `analyst`: Read and analytics access
- `operator`: Read and write access

## CSV Format

### Required Columns

- `transaction_id` (unique)
- `transaction_date` (supports multiple formats)
- `customer_name`
- `product`
- `total_items` (>= 0)
- `total_cost` (>= 0)
- `city`

### Optional Columns

- `payment_method`
- `discount_percentage`
- `season`
- `channel` (or `store_type`, `inventory_type`)

### Date Formats Supported

- `DD/MM/YY HH:mm` (e.g., "25/12/25 5:44")
- `DD/MM/YYYY HH:mm`
- `YYYY-MM-DD HH:mm:ss`
- `MM/DD/YYYY HH:mm`

## Data Validation Rules

Rows are rejected if:
- ❌ Negative quantity (`total_items < 0`)
- ❌ Negative sales amount (`total_cost < 0`)
- ❌ Duplicate transaction ID (within file or database)
- ❌ Missing required fields
- ❌ Invalid date format

## Project Structure

```
server/
├── config/
│   └── db.js                 # Database connection
├── database/
│   ├── schema_star.sql       # Star schema definition
│   └── migrations/           # Database migrations
├── etl/
│   ├── validator.js          # Data validation
│   ├── transformer.js        # Data transformation
│   ├── loader.js             # Legacy loader
│   ├── loader_star.js        # Star schema loader
│   └── scd_handler.js        # SCD Type 2 handler
├── middleware/
│   ├── auth.js               # Authentication/Authorization
│   └── uploadMiddleware.js   # File upload handling
├── monitoring/
│   └── data_quality.js       # Data quality checks
├── pipelines/
│   ├── base_pipeline.js      # Base pipeline class
│   └── batch_pipeline.js     # Batch processing pipeline
├── routes/
│   ├── fileRoutes.js         # File upload routes
│   └── analytics.js          # Analytics routes
└── index.js                  # Main server file
```

## Database Schema

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed schema documentation.

## Development

### Running Tests

```bash
npm test
```

### Code Style

Follow ESLint configuration (if configured).

## Troubleshooting

### Date Parsing Errors

If you see date parsing errors, ensure your CSV dates match supported formats. Use the debug endpoint to inspect CSV structure:

```bash
POST /api/files/upload/debug
```

### Database Connection Issues

Check `.env` file has correct database credentials and database exists.

### All Rows Rejected

Check rejection summary in response. Common issues:
- Column name mismatches (system handles common variations)
- Invalid data types
- Missing required fields

## License

ISC
