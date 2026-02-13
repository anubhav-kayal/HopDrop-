# Fix: "pipeline_runs does not exist" Error

## Problem
You're getting this error because the pipeline metadata tables haven't been created in your database.

## Quick Fix (Choose One)

### Option 1: Run Migration Script (Recommended)

```bash
cd server
node database/migrations/002_create_pipeline_tables.js
```

This will create:
- `pipeline_runs` table
- `schema_versions` table  
- `data_quality_metrics` table

### Option 2: Run Full Star Schema

If you want the complete star schema setup:

```bash
cd server
psql -U your_user -d nexusretail -f database/schema_star.sql
node database/migrations/001_init_time_dimension.js
```

### Option 3: Manual SQL

Connect to your database and run:

```sql
CREATE TABLE IF NOT EXISTS pipeline_runs (
    run_id SERIAL PRIMARY KEY,
    pipeline_name VARCHAR(100) NOT NULL,
    run_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    rows_processed INTEGER DEFAULT 0,
    rows_succeeded INTEGER DEFAULT 0,
    rows_failed INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_name ON pipeline_runs(pipeline_name);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_started ON pipeline_runs(started_at);
```

## After Running Migration

1. **Restart your server**: `npm start`
2. **Try uploading again** in Postman
3. **Should work now!** ✅

## What These Tables Do

- **pipeline_runs**: Tracks pipeline execution history
- **schema_versions**: Tracks schema changes over time
- **data_quality_metrics**: Stores data quality check results

## Note

The code has been updated to automatically create these tables if they don't exist, but running the migration is still recommended for proper setup.
