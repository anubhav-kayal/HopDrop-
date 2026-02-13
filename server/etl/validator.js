function validateRow(row) {
  if (!row.transaction_id) return "Missing transaction_id";
  if (!row.transaction_date) return "Missing transaction_date";
  if (!row.customer_name) return "Missing customer_name";
  if (!row.product) return "Missing product";
  if (!row.city) return "Missing city";

  if (row.total_items <= 0) return "Invalid quantity";
  if (row.total_cost < 0) return "Negative total cost";

  return null; // valid
}

module.exports = validateRow;
