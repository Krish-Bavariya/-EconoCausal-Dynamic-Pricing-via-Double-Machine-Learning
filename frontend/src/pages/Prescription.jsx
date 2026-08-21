import React, { useState } from 'react';
import BudgetInput from '../components/BudgetInput';
import CustomerTable from '../components/CustomerTable';

export default function Prescription() {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = (budget) => {
    setIsOptimizing(true);
    setTimeout(() => setIsOptimizing(false), 800); // Mock delay
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <BudgetInput onOptimize={handleOptimize} />
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 className="card-title">Optimization Results</h3>
          {isOptimizing ? (
            <p>Running SciPy Optimizer...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Estimated Revenue</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>$42,500</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Budget Utilized</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>$4,950 / $5,000</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>ROI vs Blanket Targeting</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>+24%</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <CustomerTable />
    </div>
  );
}
