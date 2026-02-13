import React, { useState } from 'react';
import SalesAnalytics from './SalesAnalytics';
import Operations from './Operations';
import './index.css';

function App() {
  const [activePage, setActivePage] = useState('sales');

  return (
    <div className="dashboard-container" style={{ flexDirection: 'column' }}>
      {/* 1. Horizontal Top Navigation */}
      <header className="top-nav">
        <div className="logo" style={{ marginBottom: 0, marginRight: '3rem' }}>
          NEXUS <span style={{ color: 'var(--accent-blue)' }}>RETAIL</span>
        </div>
        
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >Dashboard</button>
          
          <button 
            className={`nav-item ${activePage === 'sales' ? 'active' : ''}`}
            onClick={() => setActivePage('sales')}
          >Sales Analytics</button>
          
          <button 
            className={`nav-item ${activePage === 'ops' ? 'active' : ''}`}
            onClick={() => setActivePage('ops')}
          >Operations</button>
          
          <button 
            className={`nav-item ${activePage === 'customer' ? 'active' : ''}`}
            onClick={() => setActivePage('customer')}
          >Customer Intel</button>
        </nav>
      </header>

      {/* 2. Main Area (now takes full width) */}
      <main className="main-content" style={{ padding: '2rem' }}>
        {activePage === 'sales' && <SalesAnalytics />}
        {activePage === 'ops' && <Operations />}
        {/* Add placeholders for other pages here */}
      </main>
    </div>
  );
}

export default App;