/**
 * Slowly Changing Dimension (SCD) Type 2 Handler
 * Tracks historical changes to dimension records
 */
const pool = require('../config/db');

/**
 * Update or insert a dimension record with SCD Type 2
 * @param {string} tableName - Name of dimension table (e.g., 'dim_products', 'dim_customers')
 * @param {string} keyColumn - Column name for unique identifier (e.g., 'product_sku', 'customer_code')
 * @param {string} keyValue - Value of the key
 * @param {Object} newData - New record data
 * @returns {Promise<Object>} - Returns the current record ID
 */
async function upsertSCD2(tableName, keyColumn, keyValue, newData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Find current record
    const currentRecord = await client.query(
      `SELECT * FROM ${tableName} 
       WHERE ${keyColumn} = $1 AND is_current = TRUE 
       LIMIT 1`,
      [keyValue]
    );
    
    if (currentRecord.rows.length === 0) {
      // New record - insert as current
      const columns = Object.keys(newData).join(', ');
      const placeholders = Object.keys(newData).map((_, i) => `$${i + 1}`).join(', ');
      const values = Object.values(newData);
      
      const insertQuery = `
        INSERT INTO ${tableName} (${keyColumn}, ${columns}, is_current, valid_from)
        VALUES ($1, ${placeholders.replace(/\$(\d+)/g, (m, n) => `$${parseInt(n) + 1}`)}, TRUE, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      
      const result = await client.query(insertQuery, [keyValue, ...values]);
      await client.query('COMMIT');
      return result.rows[0];
    }
    
    // Check if data has changed
    const currentRow = currentRecord.rows[0];
    let hasChanged = false;
    
    for (const [key, value] of Object.entries(newData)) {
      if (key !== keyColumn && currentRow[key] !== value) {
        hasChanged = true;
        break;
      }
    }
    
    if (!hasChanged) {
      // No changes - return existing record
      await client.query('COMMIT');
      return currentRow;
    }
    
    // Data changed - expire old record and create new one
    await client.query(
      `UPDATE ${tableName} 
       SET is_current = FALSE, valid_to = CURRENT_TIMESTAMP 
       WHERE ${keyColumn} = $1 AND is_current = TRUE`,
      [keyValue]
    );
    
    // Insert new current record
    const columns = Object.keys(newData).join(', ');
    const placeholders = Object.keys(newData).map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(newData);
    
    const insertQuery = `
      INSERT INTO ${tableName} (${keyColumn}, ${columns}, is_current, valid_from)
      VALUES ($1, ${placeholders.replace(/\$(\d+)/g, (m, n) => `$${parseInt(n) + 1}`)}, TRUE, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const result = await client.query(insertQuery, [keyValue, ...values]);
    await client.query('COMMIT');
    return result.rows[0];
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get current dimension record by key
 */
async function getCurrentDimension(tableName, keyColumn, keyValue) {
  const result = await pool.query(
    `SELECT * FROM ${tableName} 
     WHERE ${keyColumn} = $1 AND is_current = TRUE 
     LIMIT 1`,
    [keyValue]
  );
  
  return result.rows[0] || null;
}

/**
 * Get dimension record valid at a specific point in time
 */
async function getDimensionAtTime(tableName, keyColumn, keyValue, timestamp) {
  const result = await pool.query(
    `SELECT * FROM ${tableName} 
     WHERE ${keyColumn} = $1 
       AND valid_from <= $2 
       AND (valid_to IS NULL OR valid_to > $2)
     ORDER BY valid_from DESC
     LIMIT 1`,
    [keyValue, timestamp]
  );
  
  return result.rows[0] || null;
}

module.exports = {
  upsertSCD2,
  getCurrentDimension,
  getDimensionAtTime
};
