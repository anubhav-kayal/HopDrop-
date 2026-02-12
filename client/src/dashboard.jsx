import React, { useState, useEffect } from 'react';

// DUMMY DATA - Replace these with your API calls later
const DUMMY_KPIS = [
  { id: 1, label: 'Total Revenue', value: '₹4,52,900', trend: '+12.5%' },
  { id: 2, label: 'Total Orders', value: '1,240', trend: '+8.2%' },
  { id: 3, label: 'Avg Delivery Time', value: '2.4 Days', trend: '-10%' },
  { id: 4, label: 'Low Stock Alerts', value: '14 Items', trend: 'Critical' },
];

const RECENT_TRANSACTIONS = [
  { id: 'TXN001', customer: 'John doe', product: 'Nike Air Max', amount: '₹12,999', status: 'Delivered' },
  { id: 'TXN002', customer: 'Alex', product: 'Leather Wallet', amount: '₹2,499', status: 'Processing' },
  { id: 'TXN003', customer: 'Charlie', product: 'Apple Watch S9', amount: '₹41,900', status: 'Shipped' },
];

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating API Call
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <div className="loading">Initializing Nexus Hub...</div>;

  return (
    <div className="dashboard-container">
      {/* Sidebar - Placeholder for your navigation */}
      <aside className="sidebar">
        <div className="logo">NEXUS RETAIL</div>
        <nav>
          <div className="nav-item active">Dashboard</div>
          <div className="nav-item">Inventory</div>
          <div className="nav-item">Sales</div>
          <div className="nav-item">Analytics</div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <h1>Retail Command Center</h1>
          <p>Real-time Supply Chain Intelligence</p>
        </header>

        {/* 1. Summary KPI Section */}
        <section className="kpi-grid">
          {DUMMY_KPIS.map((kpi) => (
            <div key={kpi.id} className="kpi-card">
              <span className="kpi-label">{kpi.label}</span>
              <div className="kpi-value-row">
                <span className="kpi-value">{kpi.value}</span>
                <span className={`kpi-trend ${kpi.trend.includes('+') ? 'up' : 'down'}`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* 2. Charts & Tables Section */}
        <div className="data-grid">
          {/* Revenue Trend - Simplified Box */}
          <div className="grid-item chart-box">
            <h3>Revenue Trend (Monthly)</h3>
            <div className="chart-placeholder">
               {/* Later: Integrate Recharts here */}
               <div className="bar-container">
                  {[40, 70, 45, 90, 65, 80].map((h, i) => (
                    <div key={i} className="bar" style={{height: `${h}%`}}></div>
                  ))}
               </div>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="grid-item table-box">
            <h3>Recent Transactions</h3>
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
                    <td>{txn.id}</td>
                    <td>{txn.customer}</td>
                    <td>{txn.amount}</td>
                    <td><span className={`status-pill ${txn.status.toLowerCase()}`}>{txn.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Operational Section */}
        <div className="ops-grid">
           <div className="grid-item mini-box">
              <h3>Inventory Health</h3>
              <p className="sub-text">Inventory Turnover Ratio: <strong>6.2</strong></p>
           </div>
           <div className="grid-item mini-box">
              <h3>City Sales Distribution</h3>
              <p className="sub-text">Top City: <strong>Indore (32%)</strong></p>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;