CREATE TABLE sales (
    transaction_id BIGINT PRIMARY KEY,
    transaction_date TIMESTAMP NOT NULL,
    customer_name TEXT NOT NULL,
    product TEXT NOT NULL,
    total_items INTEGER NOT NULL CHECK (total_items > 0),
    total_cost NUMERIC(12,2) NOT NULL CHECK (total_cost >= 0),
    payment_method TEXT,
    city TEXT NOT NULL,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    season TEXT,
    channel TEXT NOT NULL
);

CREATE TABLE rejected_sales (
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
    rejected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
