import React from 'react';
import DataUpload from '../components/DataUpload';
import ITEDistribution from '../charts/ITEDistribution';
import UpliftCurve from '../charts/UpliftCurve';
import QiniCurve from '../charts/QiniCurve';

export default function Dashboard() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Customers Analyzed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>12,450</div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Average Treatment Effect</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--success)' }}>+4.2%</div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Persuadables Identified</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>3,120</div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Model Robustness (Refutation)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--success)' }}>Passed</div>
        </div>
      </div>
      
      <div className="grid">
        <DataUpload />
        <ITEDistribution />
      </div>
      
      <div className="grid">
        <UpliftCurve />
        <QiniCurve />
      </div>
    </div>
  );
}
