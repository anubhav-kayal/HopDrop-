# Database Migrations

## Migration Files

### 001_init_time_dimension.js
Initializes the `dim_time` table with dates from 2020-2030.

**Run:**
```bash
node database/migrations/001_init_time_dimension.js
```

### 002_create_pipeline_tables.js
Creates pipeline metadata tables:
- `pipeline_runs`
- `schema_versions`
- `data_quality_metrics`

**Run:**
```bash
node database/migrations/002_create_pipeline_tables.js
```

**Or use SQL directly:**
```bash
psql -U your_user -d nexusretail -f database/migrations/002_create_pipeline_tables.sql
```

## Troubleshooting

### Module Not Found Error

If you get `Cannot find module '../config/db'`:

1. **Check you're in the right directory:**
   ```bash
   cd /Users/apple/bla/HopDrop-/server
   ```

2. **Verify the path:**
   - Migration file: `server/database/migrations/002_create_pipeline_tables.js`
   - Config file: `server/config/db.js`
   - Path should be: `../../config/db`

3. **Use SQL directly instead:**
   ```bash
   psql -U your_user -d nexusretail -f database/migrations/002_create_pipeline_tables.sql
   ```

## Quick SQL Fix

If migration scripts don't work, run SQL directly:

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
