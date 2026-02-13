# Backend Cleanup Guide

## Files to Remove (Deprecated/Redundant)

### 1. **Old Schema File** ❌
- `database/schema.sql` 
- **Reason**: Replaced by `database/schema_star.sql` (star schema)
- **Action**: DELETE

### 2. **Old Loader** ❌
- `etl/loader.js`
- **Reason**: Replaced by `etl/loader_star.js` (works with star schema)
- **Status**: Already marked as `@deprecated`
- **Action**: DELETE

### 3. **Redundant Pipeline Wrapper** ❌
- `injetion/storePipeline.js` (note: typo in folder name "injetion" should be "injection")
- **Reason**: Just wraps old loader, completely redundant
- **Action**: DELETE entire `injetion/` folder

### 4. **Temporary Upload Files** 🗑️
- `uploads/` folder and contents
- **Reason**: We use memory storage (multer.memoryStorage), files shouldn't be saved
- **Action**: DELETE folder or add to `.gitignore`

### 5. **Backup Files** 🗑️
- `.env.save`
- **Reason**: Backup file, not needed
- **Action**: DELETE (ensure `.env` is in `.gitignore`)

### 6. **Sample CSV Files** (Optional) 📝
- `sample_csv/` folder
- **Reason**: Just examples for testing
- **Action**: Keep for reference OR move to `docs/examples/`

## Files to Keep ✅

### Core Files
- `index.js` - Main server
- `config/db.js` - Database config
- `package.json` - Dependencies

### ETL Files
- `etl/validator.js` - Data validation
- `etl/transformer.js` - Data transformation
- `etl/loader_star.js` - **NEW** Star schema loader
- `etl/scd_handler.js` - SCD Type 2 handler

### Pipeline Files
- `pipelines/base_pipeline.js` - Base pipeline class
- `pipelines/batch_pipeline.js` - Batch processing

### Routes
- `routes/fileRoutes.js` - File upload routes
- `routes/analytics.js` - Analytics endpoints

### Middleware
- `middleware/auth.js` - Authentication
- `middleware/uploadMiddleware.js` - File upload handling

### Monitoring
- `monitoring/data_quality.js` - Data quality checks

### Database
- `database/schema_star.sql` - **NEW** Star schema
- `database/migrations/001_init_time_dimension.js` - Time dimension init
- `database/setup.sh` - Setup script

### Documentation
- `README.md` - Main documentation
- `ARCHITECTURE.md` - Architecture docs
- `SETUP_GUIDE.md` - Setup instructions
- `POSTMAN_TESTING_GUIDE.md` - API testing guide
- `DATABASE_SETUP.md` - Database setup
- `API_ROUTES.md` - API reference

## Optimization Recommendations

### 1. Create `.gitignore`
Ensure these are ignored:
```
node_modules/
.env
.env.save
uploads/
*.log
.DS_Store
```

### 2. Consolidate Documentation
Consider merging:
- `DATABASE_SETUP.md` → into `SETUP_GUIDE.md`
- `API_ROUTES.md` → into `README.md`

### 3. Fix Typo
- Rename `injetion/` → `injection/` (if keeping, but we're deleting it)

### 4. Add `.gitignore` for uploads
Since we use memory storage, uploaded files shouldn't be committed.

## Cleanup Script

Run this to clean up:

```bash
# Remove deprecated files
rm database/schema.sql
rm etl/loader.js
rm -rf injetion/
rm -rf uploads/
rm .env.save

# Optional: Remove sample CSVs (or move to docs)
# rm -rf sample_csv/
```

## Verification

After cleanup, verify:
1. ✅ Server still starts: `npm start`
2. ✅ File upload works: Test with Postman
3. ✅ Analytics work: Test analytics endpoints
4. ✅ No broken imports: Check for any references to deleted files
