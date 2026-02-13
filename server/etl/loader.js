const pool = require("../config/db");

async function processRow(row) {

  // If rejectionReason exists → insert into rejected table
  if (row.rejectionReason) {
    await pool.query(
      `INSERT INTO rejected_sales
       (transaction_id, transaction_date, customer_name, product,
        total_items, total_cost, payment_method, city,
        discount_percentage, season, channel, rejection_reason)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        row.transaction_id,
        row.transaction_date,
        row.customer_name,
        row.product,
        row.total_items,
        row.total_cost,
        row.payment_method,
        row.city,
        row.discount_percentage,
        row.season,
        row.channel,
        row.rejectionReason
      ]
    );
    return;
  }

  // Insert valid row
  await pool.query(
    `INSERT INTO sales
     (transaction_id, transaction_date, customer_name, product,
      total_items, total_cost, payment_method, city,
      discount_percentage, season, channel)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (transaction_id) DO NOTHING`,
    [
      row.transaction_id,
      row.transaction_date,
      row.customer_name,
      row.product,
      row.total_items,
      row.total_cost,
      row.payment_method,
      row.city,
      row.discount_percentage,
      row.season,
      row.channel
    ]
  );
}

module.exports = processRow;

