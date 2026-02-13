# HopDrop Retail Data Platform - Architecture Documentation

## Overview

HopDrop is a comprehensive retail data platform designed for a mid-sized retailer operating 50+ stores, e-commerce, and logistics networks. The platform provides end-to-end data ingestion, transformation, storage, and analytics capabilities.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                              │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   POS/Store  │  Warehouse   │   Online     │   Logistics       │
│   Systems    │   Systems     │   Platform   │   Systems         │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬──────────┘
       │              │              │                 │
       └──────────────┴──────────────┴─────────────────┘
                      │
       ┌──────────────▼──────────────┐
       │   DATA INGESTION LAYER       │
       ├──────────────────────────────┤
       │  • Batch Pipeline (CSV)      │
       │  • Real-time Pipeline        │
       │  • Schema Evolution Handler   │
       │  • Retry Logic                │
       └──────────────┬───────────────┘
                      │
       ┌──────────────▼──────────────┐
       │   TRANSFORMATION LAYER       │
       ├──────────────────────────────┤
       │  • Data Validation           │
       │  • Data Cleaning             │
       │  • SCD Type 2 Processing     │
       │  • Dimension Lookups         │
       └──────────────┬───────────────┘
                      │
       ┌──────────────▼──────────────┐
       │   STORAGE LAYER              │
       ├──────────────────────────────┤
       │  • Star Schema (PostgreSQL)  │
       │  • Partitioned Fact Tables  │
       │  • Dimension Tables (SCD2)  │
       │  • Data Quality Metrics      │
       └──────────────┬───────────────┘
                      │
       ┌──────────────▼──────────────┐
       │   ANALYTICS LAYER            │
       ├──────────────────────────────┤
       │  • KPI Endpoints             │
       │  • Business Intelligence     │
       │  • Data Quality Monitoring   │
       └──────────────┬───────────────┘
                      │
       ┌──────────────▼──────────────┐
       │   API LAYER                  │
       ├──────────────────────────────┤
       │  • REST API                  │
       │  • Authentication            │
       │  • Authorization             │
       └──────────────────────────────┘
```

## Database Schema (Star Schema)

### Fact Tables

1. **fact_sales** - Sales transactions
   - Partitioned by `transaction_date` (monthly partitions)
   - Foreign keys to dimension tables
   - Measures: quantity, unit_price, total_amount, discount_amount, net_amount

2. **fact_inventory** - Inventory snapshots
   - Partitioned by `snapshot_date`
   - Tracks opening/closing stock, received, sold, returned

3. **fact_shipments** - Shipment tracking
   - Tracks delivery times, shipping costs, status

### Dimension Tables

1. **dim_products** - Product master (SCD Type 2)
   - Tracks product changes over time
   - Fields: product_sku, product_name, category, brand, prices

2. **dim_stores** - Store master (SCD Type 2)
   - Tracks store location and type changes
   - Fields: store_code, store_name, city, state, region, store_type

3. **dim_customers** - Customer master (SCD Type 2)
   - Tracks customer information changes
   - Fields: customer_code, customer_name, city, segment

4. **dim_time** - Time dimension
   - Pre-populated calendar table
   - Fields: date, year, quarter, month, week, day, season, fiscal periods

## Data Pipeline Architecture

### Batch Pipeline

- **Purpose**: Process large CSV files (daily uploads)
- **Features**:
  - Automatic retry with exponential backoff
  - Schema evolution handling
  - Batch processing (1000 rows per batch)
  - Dimension upserts using SCD Type 2
  - Fact table inserts with referential integrity

### Real-time Pipeline

- **Purpose**: Process online orders instantly
- **Features**:
  - Event-driven processing
  - Low latency requirements
  - Same validation and transformation logic

## Data Quality Framework

### Checks Performed

1. **Completeness**: Missing required fields
2. **Validity**: Invalid values (negative quantities, future dates)
3. **Consistency**: Referential integrity (orphan records)
4. **Accuracy**: Duplicate detection

### Monitoring

- Automated daily checks
- Metrics stored in `data_quality_metrics` table
- Threshold-based alerts (PASS/FAIL/WARNING)

## Security & Access Control

### Authentication

- API key-based authentication
- Roles: admin, analyst, operator

### Authorization

- Permission-based access control
- Permissions: read, write, delete, analytics
- Role-based restrictions

### API Keys

- `admin`: Full access
- `analyst`: Read + Analytics
- `operator`: Read + Write

## Partitioning Strategy

### Fact Tables

- **fact_sales**: Monthly partitions by `transaction_date`
- **fact_inventory**: Monthly partitions by `snapshot_date`
- **fact_shipments**: Monthly partitions by `shipment_date`

### Benefits

- Faster queries (partition pruning)
- Easier maintenance (drop old partitions)
- Better performance for time-based analytics

## Analytics & KPIs

### Commercial KPIs

- Daily/Monthly Revenue
- City-wise Sales
- Top Selling Products

### Operations KPIs

- Inventory Turnover Ratio
- Average Delivery Times
- Seasonal Demand Trends

### Customer KPIs

- New vs Returning Customers
- Customer Lifetime Value (CLV)
- Market Basket Analysis

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **File Processing**: csv-parser, multer
- **Architecture**: RESTful API

## Scalability Considerations

1. **Horizontal Scaling**: Stateless API design
2. **Database**: Partitioning for large datasets
3. **Caching**: Can add Redis for frequently accessed data
4. **Load Balancing**: Multiple API instances

## Future Enhancements

1. Real-time pipeline implementation
2. Parquet/Delta format support for analytics
3. Machine learning integration
4. Advanced data quality rules
5. Dashboard visualization
