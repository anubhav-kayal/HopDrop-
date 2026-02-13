/**
 * Transforms and normalizes a single row
 * Uses native Date parsing instead of moment for better performance
 */
function transformRow(row) {
  try {
    // 1️⃣ Normalize Transaction ID
    const transactionId = parseInt(row.transaction_id);
    if (isNaN(transactionId)) {
      throw new Error("Invalid transaction_id format");
    }
    row.transaction_id = transactionId;

    // 2️⃣ Normalize Date Format
    // Try multiple date formats including 2-digit years and flexible time formats
    const dateStr = String(row.transaction_date).trim();
    let parsedDate = null;

    // Helper function to normalize 2-digit year to 4-digit
    const normalizeYear = (yearStr) => {
      const year = parseInt(yearStr);
      if (yearStr.length === 2) {
        // Assume years 00-99 map to 2000-2099
        return year < 100 ? 2000 + year : year;
      }
      return year;
    };

    // Helper function to pad time components
    const padTime = (timeStr) => {
      return String(timeStr).padStart(2, '0');
    };

    // Try ISO format first
    parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) {
      // Try DD/MM/YY HH:mm or DD/MM/YYYY HH:mm (with flexible time format)
      // Matches: "25/12/25 5:44" or "25/12/2025 5:44" or "25/12/2025 05:44"
      let match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
      if (match) {
          const day = parseInt(match[1]);
          const month = parseInt(match[2]);
          const yearRaw = match[3];
          const year = normalizeYear(yearRaw);
          const hour = parseInt(match[4] || '0');
          const minute = parseInt(match[5] || '0');
          const second = parseInt(match[6] || '0');
          
          // Validate date components
          if (day < 1 || day > 31 || month < 1 || month > 12) {
            throw new Error(`Invalid date components: day=${day}, month=${month}`);
          }
          
          // DD/MM/YYYY format - use UTC to avoid timezone issues
          parsedDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
          
          // Verify the date was created correctly
          if (isNaN(parsedDate.getTime())) {
            throw new Error(`Failed to parse date: ${dateStr}`);
          }
          
          // Verify date components match (handles invalid dates like Feb 30)
          if (parsedDate.getUTCDate() !== day || 
              parsedDate.getUTCMonth() !== month - 1 || 
              parsedDate.getUTCFullYear() !== year) {
            throw new Error(`Invalid date: ${dateStr} (day/month mismatch)`);
          }
      }

      // Try DD-MM-YY HH:mm or DD-MM-YYYY HH:mm
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        match = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
        if (match) {
          const day = padTime(match[1]);
          const month = padTime(match[2]);
          const year = normalizeYear(match[3]);
          const hour = padTime(match[4]);
          const minute = padTime(match[5]);
          const second = match[6] ? padTime(match[6]) : '00';
          parsedDate = new Date(Date.UTC(year, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second)));
        }
      }

      // Try YYYY-MM-DD HH:mm:ss or YYYY-MM-DD HH:mm
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
        if (match) {
          const year = parseInt(match[1]);
          const month = padTime(match[2]);
          const day = padTime(match[3]);
          const hour = padTime(match[4]);
          const minute = padTime(match[5]);
          const second = match[6] ? padTime(match[6]) : '00';
          parsedDate = new Date(Date.UTC(year, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second)));
        }
      }

      // Try YYYY/MM/DD format
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        match = dateStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
        if (match) {
          const year = parseInt(match[1]);
          const month = padTime(match[2]);
          const day = padTime(match[3]);
          const hour = match[4] ? padTime(match[4]) : '00';
          const minute = match[5] ? padTime(match[5]) : '00';
          const second = match[6] ? padTime(match[6]) : '00';
          parsedDate = new Date(Date.UTC(year, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second)));
        }
      }

      // Try MM/DD/YYYY format (US format)
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
        if (match) {
          const month = padTime(match[1]);
          const day = padTime(match[2]);
          const year = parseInt(match[3]);
          const hour = padTime(match[4]);
          const minute = padTime(match[5]);
          const second = match[6] ? padTime(match[6]) : '00';
          parsedDate = new Date(Date.UTC(year, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second)));
        }
      }
    }

    if (!parsedDate || isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date format: ${dateStr}. Supported formats: DD/MM/YY HH:mm, DD/MM/YYYY HH:mm, YYYY-MM-DD HH:mm:ss`);
    }

    // Validate the parsed date is reasonable (not too far in past/future)
    const year = parsedDate.getUTCFullYear();
    if (year < 1900 || year > 2100) {
      throw new Error(`Invalid date year: ${year} (from: ${dateStr})`);
    }

    // Convert to PostgreSQL timestamp format: YYYY-MM-DD HH:mm:ss
    // This is more reliable than ISO string for PostgreSQL
    const yearStr = parsedDate.getUTCFullYear();
    const monthStr = String(parsedDate.getUTCMonth() + 1).padStart(2, '0');
    const dayStr = String(parsedDate.getUTCDate()).padStart(2, '0');
    const hourStr = String(parsedDate.getUTCHours()).padStart(2, '0');
    const minuteStr = String(parsedDate.getUTCMinutes()).padStart(2, '0');
    const secondStr = String(parsedDate.getUTCSeconds()).padStart(2, '0');
    
    // Format: YYYY-MM-DD HH:mm:ss (PostgreSQL standard timestamp format)
    row.transaction_date = `${yearStr}-${monthStr}-${dayStr} ${hourStr}:${minuteStr}:${secondStr}`;

    // 3️⃣ Clean Text Fields
    row.customer_name = String(row.customer_name || '').trim();
    row.product = String(row.product || '').trim();
    row.city = String(row.city || '').trim();
    row.payment_method = String(row.payment_method || '').trim() || null;
    row.season = String(row.season || '').trim() || null;
    row.channel = String(row.channel || '').trim().toUpperCase() || null;

    // 4️⃣ Convert Numeric Fields
    row.total_items = parseInt(row.total_items);
    row.total_cost = parseFloat(row.total_cost);
    row.discount_percentage = row.discount_percentage
      ? parseFloat(row.discount_percentage)
      : 0;

    // 5️⃣ Ensure No NaN (shouldn't happen after validation, but safety check)
    if (isNaN(row.total_items) || row.total_items < 0) {
      throw new Error("Invalid total_items");
    }
    if (isNaN(row.total_cost) || row.total_cost < 0) {
      throw new Error("Invalid total_cost");
    }
    if (isNaN(row.discount_percentage)) {
      row.discount_percentage = 0;
    }

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
