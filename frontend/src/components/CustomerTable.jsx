import React from 'react';
import { mockITEData } from '../utils/mockData';

export default function CustomerTable() {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Persuadable': return 'var(--success)';
      case 'Sure Thing': return 'var(--text-main)';
      case 'Lost Cause': return 'var(--danger)';
      case 'Sleeping Dog': return 'var(--warning)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Customer Allocation Matrix</h3>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Tenure</th>
              <th>Baseline Prob</th>
              <th>Causal ITE</th>
              <th>Status</th>
              <th>Prescribed Discount</th>
            </tr>
          </thead>
          <tbody>
            {mockITEData.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.tenure}</td>
                <td>{(c.baselineProb * 100).toFixed(1)}%</td>
                <td style={{ color: c.ite > 0 ? 'var(--success)' : c.ite < 0 ? 'var(--danger)' : 'var(--text-main)' }}>
                  {c.ite > 0 ? '+' : ''}{(c.ite * 100).toFixed(1)}%
                </td>
                <td>
                  <span style={{ 
                    color: getStatusColor(c.status),
                    backgroundColor: `${getStatusColor(c.status)}22`,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ fontWeight: 'bold' }}>${c.recommendedDiscount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
