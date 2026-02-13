import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesAnalytics = () => {
  const blue = '#3b82f6';
  const green = '#10b981';

  // Chart Options to maintain aspect ratio and fit
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // This is key to controlling height
    plugins: {
      legend: { display: false }
    }
  };

  const citySalesData = {
    labels: ['Indore', 'Bhopal', 'Pune', 'Mumbai', 'Delhi'],
    datasets: [{
      label: 'Revenue',
      data: [45000, 32000, 28000, 52000, 39000],
      backgroundColor: blue,
      borderRadius: 6,
    }]
  };

  return (
    <div className="main-content" style={{ maxWidth: '1200px' }}>
      <header className="dashboard-header">
        <h1>Sales Analytics</h1>
        <p>Commercial Deep Dive & Fact_Sales Analysis</p>
      </header>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ padding: '1rem' }}>
          <div className="kpi-label">Daily Revenue</div>
          <div className="kpi-value-row">
            <div className="kpi-value" style={{ fontSize: '1.2rem' }}>₹12,402</div>
            <div className="kpi-trend up">+12%</div>
          </div>
        </div>
        {/* Add more cards here if needed */}
      </div>

      {/* Data Grid with forced heights */}
      <div className="data-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="grid-item">
          <div className="kpi-label" style={{ marginBottom: '1rem' }}>City-wise Revenue</div>
          <div style={{ height: '250px' }}> {/* Forced height container */}
            <Bar data={citySalesData} options={chartOptions} />
          </div>
        </div>
        
        <div className="grid-item">
          <div className="kpi-label" style={{ marginBottom: '1rem' }}>Top Products</div>
          <div style={{ height: '250px' }}>
            <Bar 
              data={citySalesData} // Reuse data for demo
              options={{ ...chartOptions, indexAxis: 'y' }} 
            />
          </div>
        </div>
      </div>

      {/* Table section stays as is */}
      <div className="grid-item" style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
        <div className="kpi-label">Recent Transactions</div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>City</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ color: blue }}>TXN001</td>
              <td>Indore</td>
              <td>₹12,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesAnalytics;