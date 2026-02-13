import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesAnalytics = () => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    animation: { duration: 2000, easing: 'easeOutQuart' },
  };

  const citySalesData = {
    labels: ['Indore', 'Bhopal', 'Pune', 'Mumbai', 'Delhi'],
    datasets: [{
      label: 'Revenue',
      data: [45000, 32000, 28000, 52000, 39000],
      backgroundColor: '#7DF9FF',
      borderRadius: 6,
    }]
  };

  return (
    <>
      <header className="dashboard-header">
        <h1>Sales Analytics</h1>
        <p>Commercial Deep Dive & Fact_Sales Analysis</p>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Daily Revenue</div>
          <div className="kpi-value-row">
            <div className="kpi-value">₹12,402</div>
            <div className="kpi-trend up">+12%</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Order Value</div>
          <div className="kpi-value-row">
            <div className="kpi-value">₹1,850</div>
            <div className="kpi-trend up">+5%</div>
          </div>
        </div>
      </div>

      <div className="data-grid">
        <div className="grid-item">
          <div className="kpi-label" style={{ marginBottom: '1rem' }}>City-wise Revenue</div>
          <div className="chart-box">
            <Bar data={citySalesData} options={chartOptions} />
          </div>
        </div>
        
        <div className="grid-item">
          <div className="kpi-label" style={{ marginBottom: '1rem' }}>Top Selling Products</div>
          <div className="chart-box">
            <Bar data={citySalesData} options={{ ...chartOptions, indexAxis: 'y' }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesAnalytics;
