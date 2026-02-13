/**
 * Loader for Star Schema
 * Inserts data into fact_sales with proper dimension lookups
 */
const pool = require('../config/db');
const { getCurrentDimension } = require('./scd_handler');

/**
 * Get or create time dimension record
 */
async function getTimeDimension(date) {
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date.split('T')[0];
  
  let result = await pool.query(
    'SELECT time_id FROM dim_time WHERE date = $1',
    [dateStr]
  );
  
  if (result.rows.length === 0) {
    // Create time dimension entry if missing
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayOfWeek = d.getDay();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'][month - 1];
    
    const weekStart = new Date(year, 0, 1);
    const weekNumber = Math.ceil(((d - weekStart) / 86400000 + weekStart.getDay() + 1) / 7);
    
    let season = 'Winter';
    if (month >= 3 && month <= 5) season = 'Spring';
    else if (month >= 6 && month <= 8) season = 'Summer';
    else if (month >= 9 && month <= 11) season = 'Fall';
    
    const fiscalYear = month >= 4 ? year : year - 1;
    const fiscalQuarter = month >= 4 && month <= 6 ? 1 :
                         month >= 7 && month <= 9 ? 2 :
                         month >= 10 && month <= 12 ? 3 : 4;
    
    result = await pool.query(
      `INSERT INTO dim_time (date, year, quarter, month, month_name, week, day, day_name, is_weekend, is_holiday, season, fiscal_year, fiscal_quarter)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (date) DO RETURNING time_id`,
      [dateStr, year, Math.ceil(month / 3), month, monthName, weekNumber, day, dayName, 
       dayOfWeek === 0 || dayOfWeek === 6, false, season, fiscalYear, fiscalQuarter]
    );
  }
  
  return result.rows[0]?.time_id || null;
}

/**
 * Batch insert into fact_sales with dimension lookups
 */
async function batchInsertFactSales(validRows, rejectedRows) {
  const client = await pool.connect();
  const BATCH_SIZE = 100;
  
  try {
    await client.query('BEGIN');
    
    let totalInserted = 0;
    let totalRejected = rejectedRows.length;

    // Insert rejected rows
    if (rejectedRows.length > 0) {
      for (let i = 0; i < rejectedRows.length; i += BATCH_SIZE) {
        const batch = rejectedRows.slice(i, i + BATCH_SIZE);
        const values = batch.map((row, idx) => {
          const base = idx * 12;
          return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12})`;
        }).join(', ');

        const params = batch.flatMap(row => [
          row.transaction_id || null,
          // For rejected rows, avoid inserting invalid date strings
          null,
          row.customer_name || null,
          row.product || null,
          row.total_items || null,
          row.total_cost || null,
          row.payment_method || null,
          row.city || null,
          row.discount_percentage || 0,
          row.season || null,
          row.channel || null,
          row.rejectionReason
        ]);

        await client.query(
          `INSERT INTO rejected_sales
           (transaction_id, transaction_date, customer_name, product,
            total_items, total_cost, payment_method, city,
            discount_percentage, season, channel, rejection_reason)
           VALUES ${values}`,
          params
        );
      }
    }

    // Process valid rows - lookup dimensions and insert into fact table
    if (validRows.length > 0) {
      // Check for existing transaction_ids
      const transactionIds = validRows.map(r => r.transaction_id);
      const existingCheck = await client.query(
        `SELECT transaction_id FROM fact_sales WHERE transaction_id = ANY($1::bigint[])`,
        [transactionIds]
      );

      const existingIds = new Set(existingCheck.rows.map(r => r.transaction_id));
      
      const newValidRows = [];
      const duplicateRows = [];

      for (const row of validRows) {
        if (existingIds.has(row.transaction_id)) {
          duplicateRows.push({
            ...row,
            rejectionReason: `Duplicate transaction_id in database: ${row.transaction_id}`
          });
          totalRejected++;
        } else {
          newValidRows.push(row);
        }
      }

      // Insert duplicates as rejected
      if (duplicateRows.length > 0) {
        for (let i = 0; i < duplicateRows.length; i += BATCH_SIZE) {
          const batch = duplicateRows.slice(i, i + BATCH_SIZE);
          const values = batch.map((row, idx) => {
            const base = idx * 12;
            return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12})`;
          }).join(', ');

          const params = batch.flatMap(row => [
            row.transaction_id || null,
            // For duplicate rows, avoid inserting invalid date strings
            null,
            row.customer_name || null,
            row.product || null,
            row.total_items || null,
            row.total_cost || null,
            row.payment_method || null,
            row.city || null,
            row.discount_percentage || 0,
            row.season || null,
            row.channel || null,
            row.rejectionReason
          ]);

          await client.query(
            `INSERT INTO rejected_sales
             (transaction_id, transaction_date, customer_name, product,
              total_items, total_cost, payment_method, city,
              discount_percentage, season, channel, rejection_reason)
             VALUES ${values}`,
            params
          );
        }
      }

      // Insert into fact_sales with dimension lookups
      for (let i = 0; i < newValidRows.length; i += BATCH_SIZE) {
        const batch = newValidRows.slice(i, i + BATCH_SIZE);
        const factRows = [];

        for (const row of batch) {
          // Lookup dimensions
          const productSku = row.product?.toLowerCase().replace(/\s+/g, '_') || null;
          const product = productSku ? await getCurrentDimension('dim_products', 'product_sku', productSku) : null;

          const storeCode = row.city ? `${row.channel}_${row.city}`.toUpperCase().replace(/\s+/g, '_') : null;
          const store = storeCode ? await getCurrentDimension('dim_stores', 'store_code', storeCode) : null;

          const customerCode = row.customer_name?.toLowerCase().replace(/\s+/g, '_') || null;
          const customer = customerCode ? await getCurrentDimension('dim_customers', 'customer_code', customerCode) : null;

          // Ensure transaction_date is in proper format
          let transactionDate;
          if (row.transaction_date instanceof Date) {
            transactionDate = row.transaction_date;
          } else if (typeof row.transaction_date === 'string') {
            // Parse the string date (should already be in YYYY-MM-DD HH:mm:ss format)
            transactionDate = new Date(row.transaction_date);
            if (isNaN(transactionDate.getTime())) {
              throw new Error(`Invalid transaction_date format: ${row.transaction_date}`);
            }
          } else {
            throw new Error(`Invalid transaction_date type: ${typeof row.transaction_date}`);
          }
          
          const timeId = await getTimeDimension(transactionDate);
          
          // Convert to PostgreSQL timestamp format for insertion
          const year = transactionDate.getUTCFullYear();
          const month = String(transactionDate.getUTCMonth() + 1).padStart(2, '0');
          const day = String(transactionDate.getUTCDate()).padStart(2, '0');
          const hour = String(transactionDate.getUTCHours()).padStart(2, '0');
          const minute = String(transactionDate.getUTCMinutes()).padStart(2, '0');
          const second = String(transactionDate.getUTCSeconds()).padStart(2, '0');
          const pgTimestamp = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

          const unitPrice = row.total_items > 0 ? row.total_cost / row.total_items : 0;
          const discountAmount = (row.total_cost * (row.discount_percentage || 0)) / 100;
          const netAmount = row.total_cost - discountAmount;

          factRows.push({
            transaction_id: row.transaction_id,
            transaction_date: pgTimestamp, // Use properly formatted PostgreSQL timestamp
            product_id: product?.product_id || null,
            store_id: store?.store_id || null,
            customer_id: customer?.customer_id || null,
            time_id: timeId,
            quantity: row.total_items,
            unit_price: unitPrice,
            total_amount: row.total_cost,
            discount_amount: discountAmount,
            net_amount: netAmount,
            payment_method: row.payment_method,
            channel: row.channel
          });
        }

        // Batch insert fact rows
        if (factRows.length > 0) {
          const values = factRows.map((row, idx) => {
            const base = idx * 12;
            return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12})`;
          }).join(', ');

          const params = factRows.flatMap(row => [
            row.transaction_id,
            row.transaction_date,
            row.product_id,
            row.store_id,
            row.customer_id,
            row.time_id,
            row.quantity,
            row.unit_price,
            row.total_amount,
            row.discount_amount,
            row.net_amount,
            row.payment_method,
            row.channel
          ]);

          await client.query(
            `INSERT INTO fact_sales
             (transaction_id, transaction_date, product_id, store_id, customer_id, time_id,
              quantity, unit_price, total_amount, discount_amount, net_amount, payment_method, channel)
             VALUES ${values}`,
            params
          );
          
          totalInserted += factRows.length;
        }
      }
    }

    await client.query('COMMIT');
    
    return {
      inserted: totalInserted,
      rejected: totalRejected
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  batchInsertFactSales,
  getTimeDimension
};
