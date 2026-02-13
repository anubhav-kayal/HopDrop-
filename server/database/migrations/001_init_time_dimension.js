/**
 * Initialize Time Dimension Table
 * Populates dim_time with dates for analysis
 */
const pool = require('../config/db');

async function initializeTimeDimension() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Generate dates from 2020 to 2030
    const startDate = new Date('2020-01-01');
    const endDate = new Date('2030-12-31');
    const dates = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const date = new Date(d);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dayOfWeek = date.getDay();
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'][month - 1];
      
      // Calculate week number
      const weekStart = new Date(year, 0, 1);
      const weekNumber = Math.ceil(((date - weekStart) / 86400000 + weekStart.getDay() + 1) / 7);
      
      // Determine season (Northern Hemisphere)
      let season = 'Winter';
      if (month >= 3 && month <= 5) season = 'Spring';
      else if (month >= 6 && month <= 8) season = 'Summer';
      else if (month >= 9 && month <= 11) season = 'Fall';
      
      // Fiscal year (April to March for India)
      const fiscalYear = month >= 4 ? year : year - 1;
      const fiscalQuarter = month >= 4 && month <= 6 ? 1 :
                           month >= 7 && month <= 9 ? 2 :
                           month >= 10 && month <= 12 ? 3 : 4;
      
      dates.push({
        date: date.toISOString().split('T')[0],
        year,
        quarter: Math.ceil(month / 3),
        month,
        month_name: monthName,
        week: weekNumber,
        day,
        day_name: dayName,
        is_weekend: dayOfWeek === 0 || dayOfWeek === 6,
        is_holiday: false, // Can be enhanced with holiday calendar
        season,
        fiscal_year: fiscalYear,
        fiscal_quarter: fiscalQuarter
      });
    }
    
    // Batch insert dates
    const values = dates.map((d, idx) => {
      const base = idx * 13;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13})`;
    }).join(', ');
    
    const params = dates.flatMap(d => [
      d.date, d.year, d.quarter, d.month, d.month_name, d.week, d.day,
      d.day_name, d.is_weekend, d.is_holiday, d.season, d.fiscal_year, d.fiscal_quarter
    ]);
    
    await client.query(`
      INSERT INTO dim_time (date, year, quarter, month, month_name, week, day, day_name, is_weekend, is_holiday, season, fiscal_year, fiscal_quarter)
      VALUES ${values}
      ON CONFLICT (date) DO NOTHING
    `, params);
    
    await client.query('COMMIT');
    console.log(`Initialized ${dates.length} dates in dim_time`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = initializeTimeDimension;
