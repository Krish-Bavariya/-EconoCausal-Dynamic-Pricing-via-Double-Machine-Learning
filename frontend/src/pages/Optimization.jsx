import React from 'react';
import { optimizationResults } from '../services/mockData';
import { RevenueComparison, ROIComparison } from '../charts/ComparisonCharts';
import UpliftCurve from '../charts/UpliftCurve';
import QiniCurve from '../charts/QiniCurve';

const vsRandom = optimizationResults.vsRandom;

export default function Optimization() {
  const opt = optimizationResults;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Optimization Results</h1>
        <p className="page-subtitle">Causal targeting vs random targeting — revenue and ROI impact analysis.</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid-kpi-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Budget Utilized', value: `$${opt.allocated.toLocaleString()}`, sub: `/ $${opt.budget.toLocaleString()}` },
          { label: 'Expected Revenue', value: `$${(opt.expectedRevenue / 1000).toFixed(0)}K`, accent: 'success' },
          { label: 'Incremental Gain', value: `$${opt.incrementalGain.toLocaleString()}`, accent: 'accent' },
          { label: 'ROI', value: `${opt.roi}%`, accent: 'success' },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className={`kpi-value${k.accent ? ` ${k.accent}` : ''}`}>{k.value}</div>
            {k.sub && <div style={{ fontSize: 11, color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Comparison Cards */}
      <div className="grid-1-1" style={{ marginBottom: 24 }}>
        {/* Optimized */}
        <div className="card" style={{ border: '1px solid rgba(139,92,246,0.3)' }}>
          <div className="card-header">
            <div>
              <div className="card-title" style={{ color: 'var(--accent-dim)' }}>Optimized Causal Targeting</div>
              <div className="card-subtitle">Double Machine Learning + SciPy Budget Optimizer</div>
            </div>
            <span className="badge badge-success">OPTIMAL</span>
          </div>
          {[
            { label: 'Revenue Uplift', value: vsRandom.revenueUplift, accent: true },
            { label: 'ROI Improvement', value: vsRandom.roiImprovement, accent: true },
            { label: 'Customers Targeted', value: vsRandom.customersTargeted.toLocaleString() },
            { label: 'Budget Utilization', value: vsRandom.budgetUtilization },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: 13, color: 'var(--on-surface-var)' }}>{r.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: r.accent ? 'var(--success)' : 'var(--on-surface)' }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Random */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Random Targeting Baseline</div>
              <div className="card-subtitle">Uniform discount to all customers — no causal model</div>
            </div>
            <span className="badge badge-neutral">BASELINE</span>
          </div>
          {[
            { label: 'Revenue Uplift', value: '+$0' },
            { label: 'ROI Improvement', value: 'N/A (reference)' },
            { label: 'Customers Targeted', value: '12,500 (all)' },
            { label: 'Budget Utilization', value: '100% (wasted)' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: 13, color: 'var(--on-surface-var)' }}>{r.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--on-surface-var)' }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid-1-1" style={{ marginBottom: 24 }}>
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Revenue Comparison</div>
              <div className="chart-card-sub">Optimized vs random vs no campaign</div>
            </div>
          </div>
          <div className="chart-card-body">
            <RevenueComparison height={280} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">ROI Comparison</div>
              <div className="chart-card-sub">Return on marketing investment</div>
            </div>
          </div>
          <div className="chart-card-body">
            <ROIComparison height={280} />
          </div>
        </div>
      </div>

      {/* Uplift + Qini */}
      <div className="grid-1-1">
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">Uplift Curve</div>
          </div>
          <div className="chart-card-body">
            <UpliftCurve height={260} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">Qini Curve</div>
          </div>
          <div className="chart-card-body">
            <QiniCurve height={260} />
          </div>
        </div>
      </div>
    </div>
  );
}
