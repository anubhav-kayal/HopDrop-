import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Operations = () => {
  const yellow = '#fbbf24';
  const red = '#ef4444';

  // Mock data representing Warehouse (CSV) and Store Sales (CSV)
  const inventoryData = [
    { id: "PID-401", item: "Wireless Mouse", stock: 8, wh: "Warehouse A", status: "low" },
    { id: "PID-402", item: "Mechanical Keyboard", stock: 45, wh: "Warehouse B", status: "healthy" },
    { id: "PID-403", item: "USB-C Hub", stock: 5, wh: "Warehouse A", status: "low" },
    { id: "PID-404", item: "LED Monitor", stock: 12, wh: "Warehouse C", status: "healthy" },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  const turnoverData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Turnover Ratio',
      data: [3.2, 3.8, 4.1, 4.2, 4.5],
      borderColor: yellow,
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  return (
    <div className="main-content">
      <header className="dashboard-header">
        <h1>Operations Command</h1>
        <p>Supply Chain Logistics & Inventory Health</p>
      </header>

      {/* Operations KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Inventory Turnover Ratio</div>
          <div className="kpi-value-row">
            <div className="kpi-value">4.2x</div>
            <div className="kpi-trend up">+0.5</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg. Delivery Time</div>
          <div className="kpi-value-row">
            <div className="kpi-value">1.8 Days</div>
            <div className="kpi-trend down" style={{color: red}}>-10%</div>
          </div>
        </div>
        <div className="kpi-card" style={{borderColor: red}}>
          <div className="kpi-label" style={{color: red}}>Critical Alerts</div>
          <div className="kpi-value-row">
            <div className="kpi-value">02 Items</div>
            <div className="status-pill" style={{background: 'rgba(239, 68, 68, 0.1)', color: red}}>Action Required</div>
          </div>
        </div>
      </div>

      <div className="data-grid">
        <div className="grid-item">
          <div className="kpi-label" style={{marginBottom: '1rem'}}>Seasonal Demand Trends</div>
          <div style={{ height: '250px' }}>
            <Line data={turnoverData} options={chartOptions} />
          </div>
        </div>
        <div className="grid-item">
          <div className="kpi-label" style={{marginBottom: '1rem'}}>Warehouse Stock Distribution</div>
          <div style={{ height: '250px' }}>
             <Bar data={turnoverData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Inventory Table with Low Stock Highlights */}
      <div className="grid-item" style={{ marginTop: '1.5rem' }}>
        <div className="kpi-label">Inventory Fact Table</div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Item Name</th>
              <th>Warehouse</th>
              <th>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((item) => (
              <tr key={item.id}>
                <td style={{ color: yellow }}>{item.id}</td>
                <td>{item.item}</td>
                <td>{item.wh}</td>
                <td>
                  <span className={`status-pill ${item.status === 'low' ? 'processing' : 'delivered'}`} 
                        style={item.status === 'low' ? {color: red, background: 'rgba(239,68,68,0.1)'} : {}}>
                    {item.status === 'low' ? `LOW STOCK (${item.stock})` : `HEALTHY (${item.stock})`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Operations;