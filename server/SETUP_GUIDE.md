# Setup Guide - HopDrop Retail Data Platform

## Prerequisites

- Node.js 14+ 
- PostgreSQL 12+
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Database Setup

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nexusretail;

# Exit psql
\q
```

#### Run Schema

```bash
# Run star schema SQL
psql -U your_user -d nexusretail -f database/schema_star.sql

# Initialize time dimension (populates dates 2020-2030)
node database/migrations/001_init_time_dimension.js
```

### 3. Environment Configuration

Create `.env` file in `server/` directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=nexusretail
```

### 4. Start Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

Server will start on `http://localhost:5001`

## Testing with Postman

### 1. Setup Request

- **Method**: POST
- **URL**: `http://localhost:5001/api/files/upload`
- **Headers**: 
  - `X-API-Key: admin`

### 2. Body Configuration

- Select **form-data**
- Add field `file` (type: File) - select your CSV
- Optionally add field `channel` (type: Text) - value: `store`, `warehouse`, or `online`

### 3. Send Request

Check response for processing results.

## API Testing Examples

### Upload CSV File

```bash
curl -X POST http://localhost:5001/api/files/upload \
  -H "X-API-Key: admin" \
  -F "file=@sales.csv" \
  -F "channel=store"
```

### Get Revenue Analytics

```bash
curl -X GET "http://localhost:5001/api/analytics/revenue?period=daily&startDate=2024-01-01&endDate=2024-01-31" \
  -H "X-API-Key: admin"
```

### Get Top Products

```bash
curl -X GET "http://localhost:5001/api/analytics/top-products?limit=10" \
  -H "X-API-Key: admin"
```

## Verification

### Check Health

```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "service": "HopDrop Retail Data Platform"
}
```

### Check Data Quality

```bash
curl -X GET "http://localhost:5001/api/data-quality?days=7" \
  -H "X-API-Key: admin"
```

## Common Issues & Solutions

### Issue: "database does not exist"

**Solution**: Create the database first:
```bash
createdb -U your_user nexusretail
```

### Issue: "date/time field value out of range"

**Solution**: Fixed! The transformer now handles 2-digit years and flexible time formats.

### Issue: "All rows rejected"

**Solution**: 
1. Use debug endpoint: `POST /api/files/upload/debug`
2. Check column names match expected format
3. Verify no negative quantities or amounts
4. Check for duplicate transaction IDs

### Issue: "Permission denied"

**Solution**: Ensure you're using correct API key:
- `admin` for full access
- `analyst` for read/analytics
- `operator` for read/write

## Next Steps

1. ✅ Upload sample CSV files
2. ✅ Verify data in database
3. ✅ Test analytics endpoints
4. ✅ Check data quality metrics
5. ✅ Integrate with frontend dashboard

## Support

For issues or questions, check:
- [README.md](./README.md) - General documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture details
- [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md) - Postman examples
