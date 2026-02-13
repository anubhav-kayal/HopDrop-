/**
 * Validates a single row according to business rules:
 * - No negative quantity
 * - No negative sales amount
 * - All required fields present
 */
function validateRow(row, seenTransactionIds = new Set()) {
  // Normalize column names (handle case sensitivity and whitespace)
  const normalizeKey = (key) => key ? String(key).trim().toLowerCase().replace(/\s+/g, '_') : '';
  
  // Helper to get value with normalized key lookup
  const getValue = (keys) => {
    for (const key of keys) {
      const normalizedKey = normalizeKey(key);
      for (const rowKey in row) {
        if (normalizeKey(rowKey) === normalizedKey) {
          const value = row[rowKey];
          if (value !== null && value !== undefined && String(value).trim() !== '') {
            return value;
          }
        }
      }
    }
    return null;
  };

  // Check required fields with flexible column name matching
  const transactionId = getValue(['transaction_id', 'transaction id', 'transactionid', 'id']);
  if (!transactionId) return "Missing transaction_id";

  const transactionDate = getValue(['transaction_date', 'transaction date', 'transactiondate', 'date']);
  if (!transactionDate) return "Missing transaction_date";

  const customerName = getValue(['customer_name', 'customer name', 'customername', 'customer']);
  if (!customerName) return "Missing customer_name";

  const product = getValue(['product', 'item', 'product_name', 'product name']);
  if (!product) return "Missing product";

  const city = getValue(['city', 'location', 'store_city', 'store city']);
  if (!city) return "Missing city";

  // Parse numeric values for validation (handle various column names)
  const totalItemsStr = getValue(['total_items', 'total items', 'totalitems', 'quantity', 'qty', 'items']);
  const totalCostStr = getValue(['total_cost', 'total cost', 'totalcost', 'amount', 'price', 'cost']);

  if (!totalItemsStr) return "Missing total_items";
  if (!totalCostStr) return "Missing total_cost";

  const totalItems = parseInt(String(totalItemsStr).replace(/[^0-9.-]/g, ''));
  const totalCost = parseFloat(String(totalCostStr).replace(/[^0-9.-]/g, ''));

  // Check for negative quantity
  if (isNaN(totalItems) || totalItems < 0) {
    return `Negative or invalid quantity: ${totalItemsStr}`;
  }

  // Check for negative sales amount
  if (isNaN(totalCost) || totalCost < 0) {
    return `Negative or invalid sales amount: ${totalCostStr}`;
  }

  // Check for duplicate transaction ID within the same file
  const transactionIdStr = String(transactionId).trim();
  if (seenTransactionIds.has(transactionIdStr)) {
    return `Duplicate transaction_id: ${transactionIdStr}`;
  }
  seenTransactionIds.add(transactionIdStr);

  return null; // valid
}

module.exports = validateRow;
