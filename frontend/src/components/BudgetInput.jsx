import React, { useState } from 'react';

export default function BudgetInput({ onOptimize }) {
  const [budget, setBudget] = useState(5000);

  return (
    <div className="card">
      <h3 className="card-title">Budget Constraints</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Set the maximum marketing budget to optimize discount allocation.</p>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Total Budget ($)</label>
        <input 
          type="number" 
          value={budget} 
          onChange={(e) => setBudget(e.target.value)} 
        />
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Allowed Discounts</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {['$0', '$10', '$20'].map(d => (
            <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" defaultChecked /> {d}
            </label>
          ))}
        </div>
      </div>
      
      <button className="btn" style={{ width: '100%' }} onClick={() => onOptimize(budget)}>
        Run Optimization
      </button>
    </div>
  );
}
