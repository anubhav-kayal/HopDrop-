/**
 * Base Pipeline Class
 * Provides common functionality for batch and real-time pipelines
 */
const pool = require('../config/db');

class BasePipeline {
  constructor(pipelineName, config = {}) {
    this.pipelineName = pipelineName;
    this.config = {
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000, // milliseconds
      batchSize: config.batchSize || 100,
      ...config
    };
    this.runId = null;
  }

  /**
   * Start a pipeline run
   */
  async startRun(runType = 'BATCH') {
    try {
      const result = await pool.query(
        `INSERT INTO pipeline_runs (pipeline_name, run_type, status, started_at)
         VALUES ($1, $2, 'RUNNING', CURRENT_TIMESTAMP)
         RETURNING run_id`,
        [this.pipelineName, runType]
      );
      
      this.runId = result.rows[0].run_id;
      return this.runId;
    } catch (error) {
      // If table doesn't exist, create it and retry
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.warn('pipeline_runs table not found, creating it...');
        await this.createPipelineTables();
        const result = await pool.query(
          `INSERT INTO pipeline_runs (pipeline_name, run_type, status, started_at)
           VALUES ($1, $2, 'RUNNING', CURRENT_TIMESTAMP)
           RETURNING run_id`,
          [this.pipelineName, runType]
        );
        this.runId = result.rows[0].run_id;
        return this.runId;
      }
      throw error;
    }
  }

  /**
   * Create pipeline tables if they don't exist
   */
  async createPipelineTables() {
    await pool.query(`
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
    `);
  }

  /**
   * Complete a pipeline run
   */
  async completeRun(stats) {
    if (!this.runId) return; // Skip if no run ID
    
    try {
      await pool.query(
        `UPDATE pipeline_runs 
         SET status = 'SUCCESS',
             completed_at = CURRENT_TIMESTAMP,
             rows_processed = $1,
             rows_succeeded = $2,
             rows_failed = $3,
             metadata = $4
         WHERE run_id = $5`,
        [
          stats.processed || 0,
          stats.succeeded || 0,
          stats.failed || 0,
          JSON.stringify(stats.metadata || {}),
          this.runId
        ]
      );
    } catch (error) {
      // Silently fail if table doesn't exist
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.warn('pipeline_runs table not found, skipping metadata update');
      } else {
        throw error;
      }
    }
  }

  /**
   * Fail a pipeline run
   */
  async failRun(error) {
    if (!this.runId) return; // Skip if no run ID
    
    try {
      await pool.query(
        `UPDATE pipeline_runs 
         SET status = 'FAILED',
             completed_at = CURRENT_TIMESTAMP,
             error_message = $1
         WHERE run_id = $2`,
        [error.message || String(error), this.runId]
      );
    } catch (err) {
      // Silently fail if table doesn't exist
      if (err.message.includes('does not exist') || err.code === '42P01') {
        console.warn('pipeline_runs table not found, skipping metadata update');
      } else {
        throw err;
      }
    }
  }

  /**
   * Retry logic wrapper
   */
  async withRetry(fn, context = 'operation') {
    let lastError;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.warn(`${this.pipelineName}: ${context} failed (attempt ${attempt}/${this.config.maxRetries}):`, error.message);
        
        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          await this.sleep(delay);
        }
      }
    }
    
    throw new Error(`${context} failed after ${this.config.maxRetries} attempts: ${lastError.message}`);
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle schema evolution
   */
  async handleSchemaEvolution(tableName, newSchema) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get current schema version
      const currentVersion = await client.query(
        `SELECT MAX(version_number) as max_version 
         FROM schema_versions 
         WHERE table_name = $1`,
        [tableName]
      );
      
      const nextVersion = (currentVersion.rows[0]?.max_version || 0) + 1;
      
      // Store new schema version
      await client.query(
        `INSERT INTO schema_versions (table_name, version_number, schema_definition)
         VALUES ($1, $2, $3)`,
        [tableName, nextVersion, JSON.stringify(newSchema)]
      );
      
      await client.query('COMMIT');
      
      console.log(`Schema evolution: ${tableName} version ${nextVersion} recorded`);
      return nextVersion;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Abstract method - must be implemented by subclasses
   */
  async execute() {
    throw new Error('execute() must be implemented by subclass');
  }
}

module.exports = BasePipeline;
