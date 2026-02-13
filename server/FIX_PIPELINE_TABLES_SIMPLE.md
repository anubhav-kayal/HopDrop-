# Quick Fix: Create pipeline_runs Table

## Problem
Error: `relation "pipeline_runs" does not exist`

## Solution: Run SQL Directly

### Option 1: Using psql (Easiest)

```bash
cd /Users/apple/bla/HopDrop-/server
psql -U apple -d nexusretail -f database/migrations/QUICK_FIX.sql
```

### Option 2: Copy-Paste SQL

1. Connect to your database:
```bash
psql -U apple -d nexusretail
```

2. Copy and paste this SQL:

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

3. Press Enter, then type `\q` to exit

### Option 3: Use pgAdmin or Database Tool

1. Open your database tool (pgAdmin, DBeaver, etc.)
2. Connect to `nexusretail` database
3. Run the SQL from `database/migrations/QUICK_FIX.sql`

## After Running SQL

1. **Restart your server**: `npm start`
2. **Try uploading again** in Postman
3. **Should work now!** ✅

## Verify Tables Created

```sql
\dt pipeline_runs
```

Should show the table exists.
