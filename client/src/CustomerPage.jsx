import React from 'react';

const CustomerPage = () => {
  const topCustomers = [
    { rank: 1, name: 'Alex', visits: 45, clv: '₹1,52,000' },
    { rank: 2, name: 'Charlie', visits: 38, clv: '₹1,20,500' },
  ];

  return (
    <>
      <header className="dashboard-header">
        <h1>Customer Intelligence</h1>
        <p>Behavioral Analytics & Lifetime Value Insights</p>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">New Customers</div>
          <div className="kpi-value">452</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Average CLV</div>
          <div className="kpi-value">₹14,200</div>
        </div>
      </div>

      <div className="data-grid">
        <div className="grid-item flex-center" style={{flexDirection: 'column'}}>
           <h3 className="kpi-label" style={{marginBottom: '2rem'}}>New vs Returning</h3>
           <div className="pie-simulation">
              <div className="pie-label-overlay">72% Returning</div>
           </div>
        </div>

        <div className="grid-item">
          <h3 className="kpi-label" style={{marginBottom: '1rem'}}>Top Customers by CLV</h3>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Visits</th>
                <th>CLV</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c) => (
                <tr key={c.rank}>
                  <td>#{c.rank}</td>
                  <td>{c.name}</td>
                  <td>{c.visits}</td>
                  <td><span className="status-pill delivered">{c.clv}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CustomerPage;