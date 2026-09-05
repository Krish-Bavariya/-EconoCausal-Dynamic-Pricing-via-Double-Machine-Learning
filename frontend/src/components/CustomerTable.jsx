import React from 'react';

const getStatusColor = (status) => {
  switch (status) {
    case 'Persuadable': return 'var(--success)';
    case 'Sure Thing': return 'var(--text-main)';
    case 'Lost Cause': return 'var(--danger)';
    case 'Sleeping Dog': case 'Do Not Disturb': return 'var(--warning)';
    default: return 'var(--text-muted)';
  }
};

export default function CustomerTable({ customers = [] }) {
  if (customers.length === 0) {
    return (
      <div className="card">
        <h3 className="card-title">Customer Allocation Matrix</h3>
        <div className="empty-state" style={{ padding: '32px 0' }}>
          <span className="material-symbols-outlined empty-state-icon">table_chart</span>
          <div className="empty-state-title">No optimization data</div>
          <div className="empty-state-sub">Run budget optimization to view customer allocations</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header" style={{ paddingBottom: 12 }}>
        <h3 className="card-title">Customer Allocation Matrix</h3>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--on-surface-var)' }}>
          Showing top {customers.length} optimized allocations
        </span>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Group</th>
              <th>Propensity Score</th>
              <th>Causal ITE</th>
              <th>Status</th>
              <th>Prescribed Discount</th>
              <th>Exp Gain</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td style={{ color: 'var(--accent-dim)', fontWeight: 600 }}>{c.id}</td>
                <td>
                  <span className={`badge ${c.treatment === 1 ? 'badge-accent' : 'badge-neutral'}`}>
                    {c.treatment === 1 ? 'Treated' : 'Control'}
                  </span>
                </td>
                <td>{(c.propensityScore * 100).toFixed(1)}%</td>
                <td style={{ color: c.ite > 0 ? 'var(--success)' : c.ite < 0 ? 'var(--danger)' : 'var(--on-surface)' }}>
                  {c.ite > 0 ? '+' : ''}{(c.ite * 100).toFixed(1)}%
                </td>
                <td>
                  <span style={{ 
                    color: getStatusColor(c.category),
                    backgroundColor: `${getStatusColor(c.category)}18`,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 'bold',
                    display: 'inline-block'
                  }}>
                    {c.category}
                  </span>
                </td>
                <td style={{ fontWeight: 'bold' }}>${c.recommendedDiscount}</td>
                <td style={{ color: 'var(--success)' }}>${c.expectedGain.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
