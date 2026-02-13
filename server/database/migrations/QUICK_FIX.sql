-- Quick Fix: Create pipeline_runs table
-- Run this SQL directly in your database

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

CREATE TABLE IF NOT EXISTS schema_versions (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    version_number INTEGER NOT NULL,
    schema_definition JSONB NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_by VARCHAR(100),
    UNIQUE(table_name, version_number)
);

CREATE INDEX IF NOT EXISTS idx_schema_versions_table ON schema_versions(table_name);

CREATE TABLE IF NOT EXISTS data_quality_metrics (
    id SERIAL PRIMARY KEY,
    check_date DATE NOT NULL,
    check_type VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    metric_name VARCHAR(100),
    metric_value NUMERIC(12,2),
    threshold NUMERIC(12,2),
    status VARCHAR(20),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dq_metrics_date ON data_quality_metrics(check_date);
CREATE INDEX IF NOT EXISTS idx_dq_metrics_status ON data_quality_metrics(status);
