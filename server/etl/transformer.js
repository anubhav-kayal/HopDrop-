const moment = require("moment");

/**
 * Transforms and normalizes a single row
 */
function transformRow(row) {
  try {
    // 1️⃣ Normalize Transaction ID
    row.transaction_id = parseInt(row.transaction_id);

    // 2️⃣ Normalize Date Format
    // Try multiple formats safely
    const parsedDate = moment(
      row.transaction_date,
      [
        "DD/MM/YYYY HH:mm",
        "MM/DD/YYYY HH:mm",
        "YYYY-MM-DD HH:mm:ss",
        "YYYY/MM/DD",
        "DD-MM-YYYY",
        moment.ISO_8601
      ],
      true
    );

    if (!parsedDate.isValid()) {
      throw new Error("Invalid date format");
    }

    // Convert to ISO format (PostgreSQL friendly)
    row.transaction_date = parsedDate.toISOString();

    // 3️⃣ Clean Text Fields
    row.customer_name = row.customer_name?.trim();
    row.product = row.product?.trim();
    row.city = row.city?.trim();
    row.payment_method = row.payment_method?.trim();
    row.season = row.season?.trim();
    row.channel = row.channel?.trim().toUpperCase();

    // 4️⃣ Convert Numeric Fields
    row.total_items = parseInt(row.total_items);
    row.total_cost = parseFloat(row.total_cost);
    row.discount_percentage = row.discount_percentage
      ? parseFloat(row.discount_percentage)
      : 0;

    // 5️⃣ Ensure No NaN
    if (isNaN(row.total_items)) row.total_items = 0;
    if (isNaN(row.total_cost)) row.total_cost = 0;

    return row;

  } catch (error) {
    return {
      error: true,
      message: error.message,
      originalRow: row
    };
  }
}

module.exports = transformRow;
