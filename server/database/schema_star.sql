-- ============================================
-- STAR/SNOWFLAKE SCHEMA FOR RETAIL DATA PLATFORM
-- ============================================

-- ============================================
-- DIMENSION TABLES
-- ============================================

-- Products Dimension (Type 2 SCD)
CREATE TABLE IF NOT EXISTS dim_products (
    product_id SERIAL PRIMARY KEY,
    product_sku VARCHAR(100) NOT NULL,
    product_name TEXT NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    brand VARCHAR(100),
    unit_price NUMERIC(12,2),
    cost_price NUMERIC(12,2),
    -- SCD Type 2 fields
    valid_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_to TIMESTAMP,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_sku, valid_from)
);

CREATE INDEX idx_dim_products_sku ON dim_products(product_sku);
CREATE INDEX idx_dim_products_current ON dim_products(is_current) WHERE is_current = TRUE;

-- Stores Dimension (Type 2 SCD)
CREATE TABLE IF NOT EXISTS dim_stores (
    store_id SERIAL PRIMARY KEY,
    store_code VARCHAR(50) NOT NULL,
    store_name TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    store_type VARCHAR(50), -- 'Physical', 'Warehouse', 'Online'
    address TEXT,
    -- SCD Type 2 fields
    valid_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_to TIMESTAMP,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_code, valid_from)
);

CREATE INDEX idx_dim_stores_code ON dim_stores(store_code);
CREATE INDEX idx_dim_stores_current ON dim_stores(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_dim_stores_city ON dim_stores(city);
CREATE INDEX idx_dim_stores_region ON dim_stores(region);

-- Customers Dimension (Type 2 SCD)
CREATE TABLE IF NOT EXISTS dim_customers (
    customer_id SERIAL PRIMARY KEY,
    customer_code VARCHAR(100),
    customer_name TEXT NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(100),
    region VARCHAR(100),
    customer_segment VARCHAR(50), -- 'New', 'Returning', 'VIP', etc.
    registration_date DATE,
    -- SCD Type 2 fields
    valid_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_to TIMESTAMP,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_code, valid_from)
);

CREATE INDEX idx_dim_customers_code ON dim_customers(customer_code);
CREATE INDEX idx_dim_customers_current ON dim_customers(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_dim_customers_segment ON dim_customers(customer_segment);

-- Time Dimension (for partitioning and analytics)
CREATE TABLE IF NOT EXISTS dim_time (
    time_id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL,
    month INTEGER NOT NULL,
    month_name VARCHAR(20),
    week INTEGER NOT NULL,
    day INTEGER NOT NULL,
    day_name VARCHAR(20),
    is_weekend BOOLEAN,
    is_holiday BOOLEAN,
    season VARCHAR(20), -- 'Spring', 'Summer', 'Fall', 'Winter'
    fiscal_year INTEGER,
    fiscal_quarter INTEGER
);

CREATE INDEX idx_dim_time_date ON dim_time(date);
CREATE INDEX idx_dim_time_year_month ON dim_time(year, month);
CREATE INDEX idx_dim_time_season ON dim_time(season);

-- ============================================
-- FACT TABLES
-- ============================================

-- Sales Fact Table (Partitioned by date)
CREATE TABLE IF NOT EXISTS fact_sales (
    sale_id BIGSERIAL,
    transaction_id BIGINT NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    -- Foreign Keys
    product_id INTEGER REFERENCES dim_products(product_id),
    store_id INTEGER REFERENCES dim_stores(store_id),
    customer_id INTEGER REFERENCES dim_customers(customer_id),
    time_id INTEGER REFERENCES dim_time(time_id),
    -- Measures
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    discount_amount NUMERIC(12,2) DEFAULT 0 CHECK (discount_amount >= 0),
    net_amount NUMERIC(12,2) NOT NULL CHECK (net_amount >= 0),
    -- Attributes
    payment_method VARCHAR(50),
    channel VARCHAR(50) NOT NULL, -- 'STORE', 'WAREHOUSE', 'ONLINE'
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sale_id, transaction_date)
) PARTITION BY RANGE (transaction_date);

-- Create monthly partitions for fact_sales (example for 2024-2026)
CREATE TABLE IF NOT EXISTS fact_sales_2024_01 PARTITION OF fact_sales
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE IF NOT EXISTS fact_sales_2024_02 PARTITION OF fact_sales
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE IF NOT EXISTS fact_sales_2024_03 PARTITION OF fact_sales
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE IF NOT EXISTS fact_sales_2024_04 PARTITION OF fact_sales
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE IF NOT EXISTS fact_sales_2024_05 PARTITION OF fact_sales
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
CREATE TABLE IF NOT EXISTS fact_sales_2024_06 PARTITION OF fact_sales
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
CREATE TABLE IF NOT EXISTS fact_sales_2024_07 PARTITION OF fact_sales
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
CREATE TABLE IF NOT EXISTS fact_sales_2024_08 PARTITION OF fact_sales
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');
CREATE TABLE IF NOT EXISTS fact_sales_2024_09 PARTITION OF fact_sales
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
CREATE TABLE IF NOT EXISTS fact_sales_2024_10 PARTITION OF fact_sales
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE IF NOT EXISTS fact_sales_2024_11 PARTITION OF fact_sales
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE IF NOT EXISTS fact_sales_2024_12 PARTITION OF fact_sales
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- 2025 partitions
CREATE TABLE IF NOT EXISTS fact_sales_2025_01 PARTITION OF fact_sales
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE IF NOT EXISTS fact_sales_2025_02 PARTITION OF fact_sales
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE IF NOT EXISTS fact_sales_2025_03 PARTITION OF fact_sales
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE IF NOT EXISTS fact_sales_2025_04 PARTITION OF fact_sales
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE IF NOT EXISTS fact_sales_2025_05 PARTITION OF fact_sales
    FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE IF NOT EXISTS fact_sales_2025_06 PARTITION OF fact_sales
    FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE IF NOT EXISTS fact_sales_2025_07 PARTITION OF fact_sales
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE IF NOT EXISTS fact_sales_2025_08 PARTITION OF fact_sales
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE IF NOT EXISTS fact_sales_2025_09 PARTITION OF fact_sales
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE IF NOT EXISTS fact_sales_2025_10 PARTITION OF fact_sales
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE IF NOT EXISTS fact_sales_2025_11 PARTITION OF fact_sales
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE IF NOT EXISTS fact_sales_2025_12 PARTITION OF fact_sales
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

CREATE INDEX idx_fact_sales_transaction ON fact_sales(transaction_id);
CREATE INDEX idx_fact_sales_date ON fact_sales(transaction_date);
CREATE INDEX idx_fact_sales_product ON fact_sales(product_id);
CREATE INDEX idx_fact_sales_store ON fact_sales(store_id);
CREATE INDEX idx_fact_sales_customer ON fact_sales(customer_id);
CREATE INDEX idx_fact_sales_channel ON fact_sales(channel);

-- Inventory Fact Table (Snapshot)
CREATE TABLE IF NOT EXISTS fact_inventory (
    inventory_id BIGSERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    product_id INTEGER REFERENCES dim_products(product_id),
    store_id INTEGER REFERENCES dim_stores(store_id),
    -- Measures
    opening_stock INTEGER DEFAULT 0,
    stock_received INTEGER DEFAULT 0,
    stock_sold INTEGER DEFAULT 0,
    stock_returned INTEGER DEFAULT 0,
    closing_stock INTEGER DEFAULT 0,
    stock_value NUMERIC(12,2),
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(snapshot_date, product_id, store_id)
) PARTITION BY RANGE (snapshot_date);

-- Create monthly partitions for inventory
CREATE TABLE IF NOT EXISTS fact_inventory_2024_01 PARTITION OF fact_inventory
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE IF NOT EXISTS fact_inventory_2025_01 PARTITION OF fact_inventory
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE INDEX idx_fact_inventory_date ON fact_inventory(snapshot_date);
CREATE INDEX idx_fact_inventory_product_store ON fact_inventory(product_id, store_id);

-- Shipments Fact Table
CREATE TABLE IF NOT EXISTS fact_shipments (
    shipment_id BIGSERIAL PRIMARY KEY,
    shipment_number VARCHAR(100) NOT NULL UNIQUE,
    shipment_date TIMESTAMP NOT NULL,
    -- Foreign Keys
    product_id INTEGER REFERENCES dim_products(product_id),
    from_store_id INTEGER REFERENCES dim_stores(store_id),
    to_store_id INTEGER REFERENCES dim_stores(store_id),
    customer_id INTEGER REFERENCES dim_customers(customer_id),
    time_id INTEGER REFERENCES dim_time(time_id),
    -- Measures
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    shipping_cost NUMERIC(12,2) DEFAULT 0,
    delivery_time_hours INTEGER,
    -- Attributes
    shipment_status VARCHAR(50), -- 'Pending', 'In Transit', 'Delivered', 'Returned'
    delivery_date TIMESTAMP,
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (shipment_date);

CREATE INDEX idx_fact_shipments_date ON fact_shipments(shipment_date);
CREATE INDEX idx_fact_shipments_status ON fact_shipments(shipment_status);

-- ============================================
-- DATA QUALITY & REJECTION TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS rejected_sales (
    id SERIAL PRIMARY KEY,
    transaction_id BIGINT,
    transaction_date TIMESTAMP,
    customer_name TEXT,
    product TEXT,
    total_items INTEGER,
    total_cost NUMERIC(12,2),
    payment_method TEXT,
    city TEXT,
    discount_percentage NUMERIC(5,2),
    season TEXT,
    channel TEXT,
    rejection_reason TEXT,
    raw_data JSONB,
    rejected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (rejected_at);

CREATE TABLE IF NOT EXISTS rejected_sales_2024 PARTITION OF rejected_sales
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE IF NOT EXISTS rejected_sales_2025 PARTITION OF rejected_sales
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE INDEX idx_rejected_sales_date ON rejected_sales(rejected_at);
CREATE INDEX idx_rejected_sales_reason ON rejected_sales(rejection_reason);

-- Data Quality Metrics Table
CREATE TABLE IF NOT EXISTS data_quality_metrics (
    id SERIAL PRIMARY KEY,
    check_date DATE NOT NULL,
    check_type VARCHAR(100) NOT NULL, -- 'completeness', 'validity', 'consistency', 'accuracy'
    table_name VARCHAR(100),
    metric_name VARCHAR(100),
    metric_value NUMERIC(12,2),
    threshold NUMERIC(12,2),
    status VARCHAR(20), -- 'PASS', 'FAIL', 'WARNING'
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dq_metrics_date ON data_quality_metrics(check_date);
CREATE INDEX idx_dq_metrics_status ON data_quality_metrics(status);

-- ============================================
-- PIPELINE METADATA TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS pipeline_runs (
    run_id SERIAL PRIMARY KEY,
    pipeline_name VARCHAR(100) NOT NULL,
    run_type VARCHAR(50) NOT NULL, -- 'BATCH', 'REALTIME'
    status VARCHAR(50) NOT NULL, -- 'RUNNING', 'SUCCESS', 'FAILED'
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    rows_processed INTEGER DEFAULT 0,
    rows_succeeded INTEGER DEFAULT 0,
    rows_failed INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB
);

CREATE INDEX idx_pipeline_runs_name ON pipeline_runs(pipeline_name);
CREATE INDEX idx_pipeline_runs_status ON pipeline_runs(status);
CREATE INDEX idx_pipeline_runs_started ON pipeline_runs(started_at);

-- Schema Evolution Tracking
CREATE TABLE IF NOT EXISTS schema_versions (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    version_number INTEGER NOT NULL,
    schema_definition JSONB NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_by VARCHAR(100),
    UNIQUE(table_name, version_number)
);

CREATE INDEX idx_schema_versions_table ON schema_versions(table_name);
