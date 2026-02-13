import React, { useState } from 'react';
import Dashboard from './Dashboard';
import SalesAnalytics from './SalesAnalytics';
import Operations from './Operations';
import CustomerPage from './CustomerPage';
import OnlinePage from './OnlinePage';
import StorePage from './StorePage';
import WarehousePage from './WarehousePage';
import './index.css';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'sales', label: 'Sales Analytics' },
    { id: 'ops', label: 'Operations' },
    { id: 'customer', label: 'Customer Intel' },
    { id: 'online', label: 'Online Transactions' },
    { id: 'store', label: 'Register Sales' },
    { id: 'warehouse', label: 'Inventory' },
  ];

  return (
    <div className="dashboard-container">
      {/* Horizontal Top Navigation Bar */}
      <header className="top-nav">
        <div className="logo">
          NEXUS <span style={{ color: 'var(--accent-blue)' }}>RETAIL</span>
        </div>
        
        <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {navItems.map((item) => (
            <button 
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Area: Renders the active ingestion or analytics component */}
      <main className="main-content">
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'sales' && <SalesAnalytics />}
        {activePage === 'ops' && <Operations />}
        {activePage === 'customer' && <CustomerPage />}
        {activePage === 'online' && <OnlinePage />}
        {activePage === 'store' && <StorePage />}
        {activePage === 'warehouse' && <WarehousePage />}
      </main>
    </div>
  );
}

export default App;