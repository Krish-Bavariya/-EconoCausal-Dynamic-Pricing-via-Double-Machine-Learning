import React, { useState } from 'react';
import BudgetInput from '../components/BudgetInput';
import CustomerTable from '../components/CustomerTable';
import { runOptimization } from '../services/api';

export default function Prescription() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOptimize = async (budget, tiers) => {
    setLoading(true);
    setError(null);
    try {
      const res = await runOptimization({ budget, tiers });
      if (res.success) {
        setResult(res);
      } else {
        throw new Error(res.detail || "Optimization failed.");
      }
    } catch (e) {
      console.error("Optimization failed:", e);
      setError(e.message || "Failed to solve SciPy budget optimization model.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Prescription</h1>
        <p className="page-subtitle">Prescribe optimized discounts under a fixed budget using Double ML treatment estimates.</p>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--danger)', marginBottom: 24, padding: '12px 20px' }}>
          <div style={{ color: 'var(--danger)', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
            {error}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <BudgetInput onOptimize={handleOptimize} loading={loading} />
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 180 }}>
          <h3 className="card-title" style={{ marginBottom: 12 }}>Optimization Summary</h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div className="loading-spinner" style={{ width: 24, height: 24, margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: 13, color: 'var(--on-surface-var)' }}>Solving SciPy Optimization Engine...</p>
            </div>
          ) : result ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              <div>
                <div style={{ color: 'var(--on-surface-var)', fontSize: 13, marginBottom: 4 }}>Estimated Revenue</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
                  ${result.expectedRevenue.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--on-surface-var)', fontSize: 13, marginBottom: 4 }}>Budget Utilized</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--on-surface)' }}>
                  ${result.allocated.toLocaleString()} / ${result.budget.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--on-surface-var)', fontSize: 13, marginBottom: 4 }}>ROI Estimate</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
                  {result.roi.toFixed(1)}%
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 12 }}>
              <span className="material-symbols-outlined empty-state-icon" style={{ fontSize: 24, marginBottom: 4 }}>analytics</span>
              <div className="empty-state-title" style={{ fontSize: 13 }}>No budget active</div>
              <div className="empty-state-sub" style={{ fontSize: 11 }}>Configure the constraints on the left and click "Run Optimization"</div>
            </div>
          )}
        </div>
      </div>

      <CustomerTable customers={result?.allocation} />
    </div>
  );
}
