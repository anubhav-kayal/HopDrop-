import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Operations = () => {
  const inventoryData = [
    { id: "PID-401", item: "Wireless Mouse", stock: 8, wh: "Warehouse A", status: "low" },
    { id: "PID-402", item: "Mechanical Keyboard", stock: 45, wh: "Warehouse B", status: "healthy" },
    { id: "PID-403", item: "USB-C Hub", stock: 5, wh: "Warehouse A", status: "low" },
  ];

  return (
    <>
      <header className="dashboard-header">
        <h1>Operations Command</h1>
        <p>Supply Chain Logistics & Inventory Health</p>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Inventory Turnover Ratio</div>
          <div className="kpi-value">4.2x</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Delivery Time</div>
          <div className="kpi-value">1.8 Days</div>
        </div>
      </div>

      <div className="grid-item" style={{marginTop: '1.5rem'}}>
        <div className="kpi-label" style={{marginBottom: '1rem'}}>Inventory Fact Table</div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item</th>
              <th>Warehouse</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((item) => (
              <tr key={item.id}>
                <td style={{color: 'var(--accent-blue)'}}>{item.id}</td>
                <td>{item.item}</td>
                <td>{item.wh}</td>
                <td>
                  <span className={`status-pill ${item.status === 'low' ? 'processing' : 'delivered'}`}
                        style={item.status === 'low' ? {color: 'var(--accent-red)', background: 'rgba(239,68,68,0.1)'} : {}}>
                    {item.status.toUpperCase()} ({item.stock})
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Operations;