import React, { useState } from 'react';

export default function BudgetInput({ onOptimize, loading }) {
  const [budget, setBudget] = useState(50000);
  const [tiers, setTiers] = useState({ 0: true, 10: true, 20: true });

  const handleToggle = (val) => {
    setTiers(curr => ({ ...curr, [val]: !curr[val] }));
  };

  const handleRun = () => {
    const activeTiers = Object.keys(tiers)
      .filter(k => tiers[k])
      .map(Number);
    onOptimize(budget, activeTiers);
  };

  return (
    <div className="card" style={{ height: 'fit-content' }}>
      <h3 className="card-title">Budget Constraints</h3>
      <p style={{ color: 'var(--on-surface-var)', marginBottom: '1.25rem', fontSize: 13 }}>
        Set the maximum marketing budget and active tiers to optimize discount allocation.
      </p>
      
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: 13 }}>
          Total Budget ($)
        </label>
        <input 
          type="number" 
          value={budget} 
          min="0"
          onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))} 
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: 13 }}>
          Allowed Discounts
        </label>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[0, 10, 20].map(val => (
            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              <input 
                type="checkbox" 
                checked={tiers[val]} 
                onChange={() => handleToggle(val)} 
              /> 
              ${val}
            </label>
          ))}
        </div>
      </div>
      
      <button 
        className="btn btn-primary btn-full" 
        onClick={handleRun} 
        disabled={loading || Object.values(tiers).filter(Boolean).length === 0}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>play_arrow</span>
        {loading ? 'Optimizing...' : 'Run Optimization'}
      </button>
    </div>
  );
}
