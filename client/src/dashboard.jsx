import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Title, Tooltip, Legend);

const DUMMY_KPIS = [
  { id: 1, label: 'Total Revenue', value: '₹4,52,900', trend: '+12.5%' },
  { id: 2, label: 'Total Orders', value: '1,240', trend: '+8.2%' },
  { id: 3, label: 'Avg Delivery Time', value: '2.4 Days', trend: '-10%' },
  { id: 4, label: 'Low Stock Alerts', value: '14 Items', trend: 'Critical' },
];

const RECENT_TRANSACTIONS = [
  { id: 'TXN001', customer: 'John doe', product: 'Nike Air Max', amount: '₹12,999', status: 'delivered' },
  { id: 'TXN002', customer: 'Alex', product: 'Leather Wallet', amount: '₹2,499', status: 'processing' },
  { id: 'TXN003', customer: 'Charlie', product: 'Apple Watch S9', amount: '₹41,900', status: 'delivered' },
];

const REVENUE_TRENDS = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
  { month: 'Jul', revenue: 72000 },
];

const SALES_BY_CITY = [
  { city: 'New York', sales: 85000 },
  { city: 'Los Angeles', sales: 72000 },
  { city: 'Chicago', sales: 61000 },
  { city: 'Houston', sales: 58000 },
  { city: 'Phoenix', sales: 45000 },
  { city: 'Miami', sales: 52000 },
];

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <div className="flex-center" style={{height: '60vh'}}>Initializing Nexus Hub...</div>;

  const forecast7Labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const forecast7Data = {
    labels: forecast7Labels,
    datasets: [
      {
        label: 'Predicted Revenue',
        data: [42, 48, 44, 52, 58, 61, 65],
        borderColor: '#7DF9FF',
        backgroundColor: 'rgba(125, 249, 255, 0.15)',
        tension: 0.3,
        fill: false,
        pointRadius: 3,
      },
    ],
  };

  const forecast30Labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
  const forecast30Data = {
    labels: forecast30Labels,
    datasets: [
      {
        label: '30-Day Outlook',
        data: forecast30Labels.map((_, i) => 40 + Math.round(10 * Math.sin(i / 3)) + i * 0.2),
        borderColor: '#C0C0C0',
        backgroundColor: 'rgba(192,192,192,0.18)',
        tension: 0.35,
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    animation: { duration: 2000, easing: 'easeOutQuart' },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#8e8e93' } },
      x: { grid: { display: false }, ticks: { color: '#8e8e93' } },
    },
  };

  const revenueTrendsData = {
    labels: REVENUE_TRENDS.map(d => d.month),
    datasets: [
      {
        label: 'Revenue Trends',
        data: REVENUE_TRENDS.map(d => d.revenue / 1000),
        borderColor: '#6c63ff',
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#6c63ff',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const salesByCityData = {
    labels: SALES_BY_CITY.map(d => d.city),
    datasets: [
      {
        label: 'Sales',
        data: SALES_BY_CITY.map(d => d.sales / 1000),
        backgroundColor: [
          'rgba(108, 99, 255, 0.8)',
          'rgba(255, 110, 199, 0.8)',
          'rgba(255, 180, 0, 0.8)',
          'rgba(52, 199, 89, 0.8)',
          'rgba(255, 59, 48, 0.8)',
          'rgba(0, 122, 255, 0.8)',
        ],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#8e8e93' } },
      x: { grid: { display: false }, ticks: { color: '#8e8e93' } },
    },
  };

  return (
    <>
      <header className="dashboard-header">
        <h1>Retail Command Center</h1>
        <p>Real-time Supply Chain Intelligence</p>
      </header>

      <section className="kpi-grid">
        {DUMMY_KPIS.map((kpi) => (
          <div key={kpi.id} className="kpi-card">
            <span className="kpi-label">{kpi.label}</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{kpi.value}</span>
              <span className={`kpi-trend ${kpi.trend.includes('+') || kpi.trend.includes('Critical') ? 'up' : 'down'}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </section>

      <div className="data-grid">
        <div className="grid-item">
          <h3 className="kpi-label" style={{marginBottom: '1.5rem'}}>Revenue Trends</h3>
          <div className="chart-box">
            <Line data={revenueTrendsData} options={chartOptions} />
          </div>
        </div>

        <div className="grid-item">
          <h3 className="kpi-label" style={{marginBottom: '1.5rem'}}>Sales by City</h3>
          <div className="chart-box">
            <Bar data={salesByCityData} options={barChartOptions} />
          </div>
        </div>

        <div className="grid-item">
          <h3 className="kpi-label" style={{marginBottom: '1rem'}}>Recent Transactions</h3>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_TRANSACTIONS.map((txn) => (
                <tr key={txn.id}>
                  <td style={{color: 'var(--accent-blue)', fontWeight: 'bold'}}>{txn.id}</td>
                  <td>{txn.customer}</td>
                  <td>{txn.amount}</td>
                  <td><span className={`status-pill ${txn.status}`}>{txn.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="charts-scroll-container">
        <div className="scroll-header">
          <h2>Forecasts & Analytics</h2>
          <p>Scroll horizontally to view more charts →</p>
        </div>
        <div className="scrollable-charts">
          <div className="scroll-item">
            <div className="grid-item">
              <h3 className="kpi-label" style={{marginBottom: '1.5rem'}}>7-Day Forecast</h3>
              <div className="chart-box1">
                <Line data={forecast7Data} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="scroll-item">
            <div className="grid-item">
              <h3 className="kpi-label" style={{marginBottom: '1.5rem'}}>30-Day Forecast</h3>
              <div className="chart-box1">
                <Line data={forecast30Data} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
