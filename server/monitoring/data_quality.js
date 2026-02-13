/**
 * Data Quality Monitoring
 * Automated checks for data completeness, validity, consistency, and accuracy
 */
const pool = require('../config/db');

/**
 * Run data quality checks
 */
async function runDataQualityChecks() {
  const checks = [];
  const checkDate = new Date().toISOString().split('T')[0];
  
  try {
    // 1. Completeness Check - Missing required fields
    const completenessCheck = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE transaction_id IS NULL) as missing_transaction_id,
        COUNT(*) FILTER (WHERE product_id IS NULL) as missing_product_id,
        COUNT(*) FILTER (WHERE store_id IS NULL) as missing_store_id,
        COUNT(*) FILTER (WHERE customer_id IS NULL) as missing_customer_id,
        COUNT(*) as total_rows
      FROM fact_sales
      WHERE transaction_date >= CURRENT_DATE - INTERVAL '7 days'
    `);
    
    const completeness = completenessCheck.rows[0];
    const completenessScore = completeness.total_rows > 0 
      ? ((completeness.total_rows - 
          completeness.missing_transaction_id - 
          completeness.missing_product_id - 
          completeness.missing_store_id - 
          completeness.missing_customer_id) / completeness.total_rows) * 100
      : 100;
    
    checks.push({
      check_type: 'completeness',
      table_name: 'fact_sales',
      metric_name: 'completeness_score',
      metric_value: completenessScore,
      threshold: 95,
      status: completenessScore >= 95 ? 'PASS' : 'FAIL',
      details: completeness
    });

    // 2. Validity Check - Invalid values
    const validityCheck = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE quantity <= 0) as invalid_quantity,
        COUNT(*) FILTER (WHERE net_amount < 0) as invalid_amount,
        COUNT(*) FILTER (WHERE transaction_date > CURRENT_TIMESTAMP) as future_dates,
        COUNT(*) as total_rows
      FROM fact_sales
      WHERE transaction_date >= CURRENT_DATE - INTERVAL '7 days'
    `);
    
    const validity = validityCheck.rows[0];
    const validityScore = validity.total_rows > 0
      ? ((validity.total_rows - 
          validity.invalid_quantity - 
          validity.invalid_amount - 
          validity.future_dates) / validity.total_rows) * 100
      : 100;
    
    checks.push({
      check_type: 'validity',
      table_name: 'fact_sales',
      metric_name: 'validity_score',
      metric_value: validityScore,
      threshold: 98,
      status: validityScore >= 98 ? 'PASS' : 'FAIL',
      details: validity
    });

    // 3. Consistency Check - Referential integrity
    const consistencyCheck = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE product_id IS NOT NULL AND product_id NOT IN (SELECT product_id FROM dim_products)) as orphan_products,
        COUNT(*) FILTER (WHERE store_id IS NOT NULL AND store_id NOT IN (SELECT store_id FROM dim_stores)) as orphan_stores,
        COUNT(*) FILTER (WHERE customer_id IS NOT NULL AND customer_id NOT IN (SELECT customer_id FROM dim_customers)) as orphan_customers,
        COUNT(*) as total_rows
      FROM fact_sales
      WHERE transaction_date >= CURRENT_DATE - INTERVAL '7 days'
    `);
    
    const consistency = consistencyCheck.rows[0];
    const consistencyScore = consistency.total_rows > 0
      ? ((consistency.total_rows - 
          consistency.orphan_products - 
          consistency.orphan_stores - 
          consistency.orphan_customers) / consistency.total_rows) * 100
      : 100;
    
    checks.push({
      check_type: 'consistency',
      table_name: 'fact_sales',
      metric_name: 'consistency_score',
      metric_value: consistencyScore,
      threshold: 99,
      status: consistencyScore >= 99 ? 'PASS' : 'FAIL',
      details: consistency
    });

    // 4. Accuracy Check - Duplicate transactions
    const accuracyCheck = await pool.query(`
      SELECT 
        COUNT(*) - COUNT(DISTINCT transaction_id) as duplicate_transactions,
        COUNT(*) as total_rows
      FROM fact_sales
      WHERE transaction_date >= CURRENT_DATE - INTERVAL '7 days'
    `);
    
    const accuracy = accuracyCheck.rows[0];
    const accuracyScore = accuracy.total_rows > 0
      ? ((accuracy.total_rows - accuracy.duplicate_transactions) / accuracy.total_rows) * 100
      : 100;
    
    checks.push({
      check_type: 'accuracy',
      table_name: 'fact_sales',
      metric_name: 'accuracy_score',
      metric_value: accuracyScore,
      threshold: 99.9,
      status: accuracyScore >= 99.9 ? 'PASS' : 'FAIL',
      details: accuracy
    });

    // Store results
    for (const check of checks) {
      await pool.query(
        `INSERT INTO data_quality_metrics 
         (check_date, check_type, table_name, metric_name, metric_value, threshold, status, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          checkDate,
          check.check_type,
          check.table_name,
          check.metric_name,
          check.metric_value,
          check.threshold,
          check.status,
          JSON.stringify(check.details)
        ]
      );
    }

    return {
      checkDate,
      checks,
      overallStatus: checks.every(c => c.status === 'PASS') ? 'PASS' : 'FAIL'
    };
    
  } catch (error) {
    console.error('Data quality check failed:', error);
    throw error;
  }
}

/**
 * Get data quality metrics
 */
async function getDataQualityMetrics(days = 7) {
  const result = await pool.query(
    `SELECT * FROM data_quality_metrics 
     WHERE check_date >= CURRENT_DATE - INTERVAL '${days} days'
     ORDER BY check_date DESC, check_type`
  );
  
  return result.rows;
}

module.exports = {
  runDataQualityChecks,
  getDataQualityMetrics
};
