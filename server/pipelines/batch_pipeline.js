/**
 * Batch Pipeline for processing large CSV files
 * Extends BasePipeline with batch-specific functionality
 */
const BasePipeline = require('./base_pipeline');
const { Readable } = require('stream');
const csv = require('csv-parser');
const validateRow = require('../etl/validator');
const transformRow = require('../etl/transformer');
const { batchInsertFactSales } = require('../etl/loader_star');
const { upsertSCD2 } = require('../etl/scd_handler');

// Normalize CSV column names (moved from routes)
function normalizeRowKeys(row) {
  const normalized = {};
  const keyMap = {
    'transaction_id': ['transaction_id', 'transaction id', 'transactionid', 'id'],
    'transaction_date': ['transaction_date', 'transaction date', 'transactiondate', 'date'],
    'customer_name': ['customer_name', 'customer name', 'customername', 'customer'],
    'product': ['product', 'item', 'product_name', 'product name'],
    'total_items': ['total_items', 'total items', 'totalitems', 'quantity', 'qty', 'items'],
    'total_cost': ['total_cost', 'total cost', 'totalcost', 'amount', 'price', 'cost'],
    'payment_method': ['payment_method', 'payment method', 'paymentmethod', 'payment'],
    'city': ['city', 'location', 'store_city', 'store city'],
    'discount_percentage': ['discount_percentage', 'discount percentage', 'discountpercentage', 'discount', 'discount%'],
    'season': ['season'],
    'channel': ['channel', 'store_type', 'inventory_type', 'source', 'location_type', 'sales_channel', 'channel_type']
  };

  const normalizeKey = (key) => key ? String(key).trim().toLowerCase().replace(/\s+/g, '_') : '';
  
  for (const [standardKey, variations] of Object.entries(keyMap)) {
    for (const rowKey in row) {
      const normalizedRowKey = normalizeKey(rowKey);
      if (variations.some(v => normalizeKey(v) === normalizedRowKey)) {
        normalized[standardKey] = row[rowKey];
        break;
      }
    }
  }

  for (const key in row) {
    if (!normalized.hasOwnProperty(key)) {
      normalized[key] = row[key];
    }
  }

  return normalized;
}

class BatchPipeline extends BasePipeline {
  constructor(config = {}) {
    super('batch_sales_pipeline', {
      batchSize: 1000,
      ...config
    });
  }

  /**
   * Process CSV file in batches
   */
  async processFile(fileBuffer, filename, channel = null) {
    const runId = await this.startRun('BATCH');
    const stats = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      metadata: {
        filename,
        channel: channel || 'auto-detected'
      }
    };

    try {
      const stream = Readable.from(fileBuffer);
      const rows = [];
      const seenTransactionIds = new Set();

      // Parse CSV
      await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (row) => {
            rows.push(row);
          })
          .on('end', resolve)
          .on('error', reject);
      });

      // Process in batches
      const validRows = [];
      const rejectedRows = [];
      let detectedChannel = null;

      // Detect channel from first row
      if (rows.length > 0 && !channel) {
        const normalizedRow = normalizeRowKeys(rows[0]);
        const channelCols = ['channel', 'store_type', 'inventory_type'];
        for (const col of channelCols) {
          if (normalizedRow[col]) {
            detectedChannel = String(normalizedRow[col]).toUpperCase().trim();
            break;
          }
        }
      }

      for (const rawRow of rows) {
        stats.processed++;
        
        try {
          const row = normalizeRowKeys(rawRow);
          
          // Set channel
          if (channel) {
            row.channel = channel.toUpperCase();
          } else if (row.channel) {
            row.channel = String(row.channel).toUpperCase().trim();
          } else if (detectedChannel) {
            row.channel = detectedChannel;
          } else {
            const fn = filename.toLowerCase();
            if (fn.includes('store')) row.channel = 'STORE';
            else if (fn.includes('warehouse')) row.channel = 'WAREHOUSE';
            else if (fn.includes('online')) row.channel = 'ONLINE';
            else row.channel = 'STORE';
          }

          // Validate
          const validationError = validateRow(row, seenTransactionIds);
          if (validationError) {
            rejectedRows.push({ ...row, rejectionReason: validationError });
            stats.failed++;
            continue;
          }

          // Transform
          const transformed = transformRow(row);
          if (transformed.error) {
            rejectedRows.push({ ...row, rejectionReason: transformed.message });
            stats.failed++;
            continue;
          }

          validRows.push(transformed);

          // Process in batches
          if (validRows.length >= this.config.batchSize) {
            await this.processBatch(validRows, rejectedRows);
            validRows.length = 0;
            rejectedRows.length = 0;
          }
        } catch (error) {
          stats.failed++;
          rejectedRows.push({
            ...rawRow,
            rejectionReason: `Processing error: ${error.message}`
          });
        }
      }

      // Process remaining rows
      if (validRows.length > 0 || rejectedRows.length > 0) {
        await this.processBatch(validRows, rejectedRows);
      }

      stats.succeeded = stats.processed - stats.failed;
      await this.completeRun(stats);
      
      return {
        runId,
        ...stats
      };
    } catch (error) {
      await this.failRun(error);
      throw error;
    }
  }

  /**
   * Process a batch of rows
   */
  async processBatch(validRows, rejectedRows) {
    // Upsert dimensions using SCD
    for (const row of validRows) {
      // Upsert product
      if (row.product) {
        await upsertSCD2(
          'dim_products',
          'product_sku',
          row.product.toLowerCase().replace(/\s+/g, '_'),
          {
            product_name: row.product,
            category: null,
            subcategory: null,
            brand: null,
            unit_price: row.total_cost / row.total_items,
            cost_price: null
          }
        );
      }

      // Upsert store
      if (row.city) {
        const storeCode = `${row.channel}_${row.city}`.toUpperCase().replace(/\s+/g, '_');
        await upsertSCD2(
          'dim_stores',
          'store_code',
          storeCode,
          {
            store_name: `${row.channel} - ${row.city}`,
            city: row.city,
            state: null,
            region: null,
            store_type: row.channel
          }
        );
      }

      // Upsert customer
      if (row.customer_name) {
        const customerCode = row.customer_name.toLowerCase().replace(/\s+/g, '_');
        await upsertSCD2(
          'dim_customers',
          'customer_code',
          customerCode,
          {
            customer_name: row.customer_name,
            email: null,
            phone: null,
            city: row.city,
            state: null,
            region: null,
            customer_segment: 'New' // Can be enhanced with logic
          }
        );
      }
    }

      // Insert into fact table using star schema loader
      await batchInsertFactSales(validRows, rejectedRows);
  }
}

module.exports = BatchPipeline;
