/**
 * Migration: Create pipeline metadata tables
 * Run this if pipeline_runs table doesn't exist
 */
const pool = require('../../config/db');
const fs = require('fs');
const path = require('path');

async function createPipelineTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Read SQL file
    const sqlFile = path.join(__dirname, '002_create_pipeline_tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute SQL
    await client.query(sql);
    
    await client.query('COMMIT');
    console.log('✅ Pipeline tables created successfully!');
    console.log('   - pipeline_runs');
    console.log('   - schema_versions');
    console.log('   - data_quality_metrics');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating pipeline tables:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  createPipelineTables()
    .then(() => {
      console.log('Migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = createPipelineTables;
