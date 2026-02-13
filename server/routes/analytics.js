/**
 * Analytics Routes
 * Provides KPI endpoints for business intelligence
 */
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * Commercial KPIs
 */

// Daily/Monthly Revenue
router.get('/revenue', async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    
    let groupBy, dateFormat;
    if (period === 'monthly') {
      groupBy = 'dt.year, dt.month, dt.month_name';
      dateFormat = "TO_CHAR(fs.transaction_date, 'YYYY-MM')";
    } else {
      groupBy = 'dt.date, dt.year, dt.month, dt.day';
      dateFormat = "TO_CHAR(fs.transaction_date, 'YYYY-MM-DD')";
    }

    let whereClause = '';
    const params = [];
    if (startDate && endDate) {
      whereClause = 'WHERE fs.transaction_date BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        ${dateFormat} as period,
        SUM(fs.net_amount) as total_revenue,
        SUM(fs.total_amount) as gross_revenue,
        SUM(fs.discount_amount) as total_discounts,
        COUNT(DISTINCT fs.transaction_id) as transaction_count,
        COUNT(DISTINCT fs.customer_id) as unique_customers
      FROM fact_sales fs
      JOIN dim_time dt ON fs.time_id = dt.time_id
      ${whereClause}
      GROUP BY ${groupBy}
      ORDER BY period DESC
    `;

    const result = await pool.query(query, params);
    res.json({
      period,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// City-wise Sales
router.get('/sales-by-city', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let whereClause = '';
    const params = [];
    if (startDate && endDate) {
      whereClause = 'WHERE fs.transaction_date BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        ds.city,
        ds.state,
        ds.region,
        COUNT(DISTINCT fs.transaction_id) as transaction_count,
        SUM(fs.net_amount) as total_revenue,
        SUM(fs.quantity) as total_quantity,
        AVG(fs.net_amount) as avg_transaction_value
      FROM fact_sales fs
      JOIN dim_stores ds ON fs.store_id = ds.store_id
      ${whereClause}
      GROUP BY ds.city, ds.state, ds.region
      ORDER BY total_revenue DESC
    `;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Top Selling Products
router.get('/top-products', async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    let whereClause = '';
    const params = [limit];
    if (startDate && endDate) {
      whereClause = 'WHERE fs.transaction_date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        dp.product_name,
        dp.category,
        dp.brand,
        SUM(fs.quantity) as total_quantity_sold,
        SUM(fs.net_amount) as total_revenue,
        COUNT(DISTINCT fs.transaction_id) as transaction_count,
        AVG(fs.unit_price) as avg_unit_price
      FROM fact_sales fs
      JOIN dim_products dp ON fs.product_id = dp.product_id
      ${whereClause}
      GROUP BY dp.product_id, dp.product_name, dp.category, dp.brand
      ORDER BY total_revenue DESC
      LIMIT $1
    `;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Operations KPIs
 */

// Inventory Turnover Ratio
router.get('/inventory-turnover', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let whereClause = '';
    const params = [];
    if (startDate && endDate) {
      whereClause = 'WHERE fi.snapshot_date BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        dp.product_name,
        dp.category,
        AVG(fi.closing_stock) as avg_inventory,
        SUM(fs.stock_sold) as total_sold,
        CASE 
          WHEN AVG(fi.closing_stock) > 0 
          THEN SUM(fs.stock_sold) / AVG(fi.closing_stock)
          ELSE 0
        END as turnover_ratio
      FROM fact_inventory fi
      JOIN dim_products dp ON fi.product_id = dp.product_id
      LEFT JOIN fact_sales fs ON fs.product_id = fi.product_id AND fs.transaction_date::date = fi.snapshot_date
      ${whereClause}
      GROUP BY dp.product_id, dp.product_name, dp.category
      ORDER BY turnover_ratio DESC
    `;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Average Delivery Times
router.get('/delivery-times', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let whereClause = '';
    const params = [];
    if (startDate && endDate) {
      whereClause = 'WHERE fs.shipment_date BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        ds_from.city as from_city,
        ds_to.city as to_city,
        AVG(fs.delivery_time_hours) as avg_delivery_hours,
        MIN(fs.delivery_time_hours) as min_delivery_hours,
        MAX(fs.delivery_time_hours) as max_delivery_hours,
        COUNT(*) as shipment_count
      FROM fact_shipments fs
      JOIN dim_stores ds_from ON fs.from_store_id = ds_from.store_id
      JOIN dim_stores ds_to ON fs.to_store_id = ds_to.store_id
      ${whereClause}
      GROUP BY ds_from.city, ds_to.city
      ORDER BY avg_delivery_hours DESC
    `;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seasonal Demand Trends
router.get('/seasonal-trends', async (req, res) => {
  try {
    const { year } = req.query;
    
    const params = year ? [year] : [];
    const whereClause = year ? 'WHERE dt.year = $1' : '';

    const query = `
      SELECT 
        dt.season,
        dt.month_name,
        dt.year,
        SUM(fs.net_amount) as total_revenue,
        SUM(fs.quantity) as total_quantity,
        COUNT(DISTINCT fs.transaction_id) as transaction_count,
        COUNT(DISTINCT fs.customer_id) as unique_customers
      FROM fact_sales fs
      JOIN dim_time dt ON fs.time_id = dt.time_id
      ${whereClause}
      GROUP BY dt.season, dt.month_name, dt.year
      ORDER BY dt.year, dt.month
    `;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Customer KPIs
 */

// New vs Returning Customers
router.get('/customer-segments', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let whereClause = '';
    const params = [];
    if (startDate && endDate) {
      whereClause = 'WHERE fs.transaction_date BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        dc.customer_segment,
        COUNT(DISTINCT dc.customer_id) as customer_count,
        SUM(fs.net_amount) as total_revenue,
        AVG(fs.net_amount) as avg_revenue_per_customer,
        COUNT(DISTINCT fs.transaction_id) as transaction_count
      FROM fact_sales fs
      JOIN dim_customers dc ON fs.customer_id = dc.customer_id
      ${whereClause}
      GROUP BY dc.customer_segment
      ORDER BY total_revenue DESC
    `;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customer Lifetime Value (CLV)
router.get('/customer-lifetime-value', async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const query = `
      SELECT 
        dc.customer_id,
        dc.customer_name,
        dc.city,
        dc.customer_segment,
        COUNT(DISTINCT fs.transaction_id) as total_transactions,
        SUM(fs.net_amount) as lifetime_value,
        AVG(fs.net_amount) as avg_transaction_value,
        MIN(fs.transaction_date) as first_purchase_date,
        MAX(fs.transaction_date) as last_purchase_date,
        EXTRACT(EPOCH FROM (MAX(fs.transaction_date) - MIN(fs.transaction_date))) / 86400 as customer_lifespan_days
      FROM fact_sales fs
      JOIN dim_customers dc ON fs.customer_id = dc.customer_id
      GROUP BY dc.customer_id, dc.customer_name, dc.city, dc.customer_segment
      ORDER BY lifetime_value DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Market Basket Analysis (Products bought together)
router.get('/market-basket', async (req, res) => {
  try {
    const { productId, limit = 10 } = req.query;
    
    if (!productId) {
      return res.status(400).json({ error: 'productId parameter is required' });
    }

    const query = `
      WITH product_transactions AS (
        SELECT DISTINCT transaction_id
        FROM fact_sales
        WHERE product_id = $1
      )
      SELECT 
        dp.product_id,
        dp.product_name,
        dp.category,
        COUNT(DISTINCT fs.transaction_id) as co_occurrence_count,
        SUM(fs.quantity) as total_quantity,
        SUM(fs.net_amount) as total_revenue
      FROM fact_sales fs
      JOIN product_transactions pt ON fs.transaction_id = pt.transaction_id
      JOIN dim_products dp ON fs.product_id = dp.product_id
      WHERE fs.product_id != $1
      GROUP BY dp.product_id, dp.product_name, dp.category
      ORDER BY co_occurrence_count DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [productId, limit]);
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
