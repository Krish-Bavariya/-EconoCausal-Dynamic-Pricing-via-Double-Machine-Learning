import React from 'react';
import { causalKPIs, optimizationResults, treatmentCategories } from '../services/mockData';
import { RevenueComparison, ROIComparison } from '../charts/ComparisonCharts';
import ITEDistribution from '../charts/ITEDistribution';

export default function Reports() {
  const handleExport = () => alert('Report export functionality will connect to the backend API.');
  const handleCSV = () => alert('CSV download will be available when the backend is connected.');

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Executive summary of causal analysis and optimization outcomes.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleCSV}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>table_chart</span>
            Download CSV
          </button>
          <button className="btn btn-primary" onClick={handleExport}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="card" style={{ marginBottom: 24, background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="card-header">
          <div className="card-title" style={{ color: 'var(--accent-dim)' }}>Executive Summary</div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--on-surface-var)' }}>Q3 2026 Campaign Analysis</span>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--on-surface-var)' }}>
          The EconoCausal Double Machine Learning analysis identified a statistically robust <strong style={{ color: 'var(--on-surface)' }}>Average Treatment Effect (ATE) of +$4.20</strong> per customer
          for the Q3 marketing discount campaign. Of the 12,500 customers analyzed,
          <strong style={{ color: 'var(--accent-dim)' }}> 5,625 (45%) were classified as Persuadable</strong> — customers whose purchase probability
          genuinely increases because of the discount. By targeting only Persuadables with optimized discounts (via SciPy),
          the campaign generates <strong style={{ color: 'var(--success)' }}>$84,200 more incremental revenue</strong> compared to blanket targeting,
          achieving an ROI of <strong style={{ color: 'var(--success)' }}>207%</strong>.
          All causal estimates passed DoWhy refutation tests with a robustness score of 94/100.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="section-title">Causal Analysis Results</div>
      <div className="grid-kpi-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'ATE (Avg Treatment Effect)', value: causalKPIs.ate, accent: 'accent' },
          { label: 'Avg ITE', value: causalKPIs.avgIte },
          { label: 'Positive Effect %', value: `${causalKPIs.positivePct}%`, accent: 'success' },
          { label: 'Negative Effect %', value: `${causalKPIs.negativePct}%`, accent: 'danger' },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className={`kpi-value${k.accent ? ` ${k.accent}` : ''}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="section-title">Optimization Results</div>
      <div className="grid-kpi-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Budget Allocated', value: `$${optimizationResults.allocated.toLocaleString()}` },
          { label: 'Expected Revenue', value: `$${(optimizationResults.expectedRevenue / 1000).toFixed(0)}K`, accent: 'success' },
          { label: 'Incremental Gain', value: `$${optimizationResults.incrementalGain.toLocaleString()}`, accent: 'accent' },
          { label: 'Final ROI', value: `${optimizationResults.roi}%`, accent: 'success' },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className={`kpi-value${k.accent ? ` ${k.accent}` : ''}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Treatment Effect Distribution + Revenue Comparison */}
      <div className="grid-1-1" style={{ marginBottom: 24 }}>
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">ITE Distribution</div>
          </div>
          <div className="chart-card-body">
            <ITEDistribution height={280} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">Revenue Comparison</div>
          </div>
          <div className="chart-card-body">
            <RevenueComparison height={280} />
          </div>
        </div>
      </div>

      {/* ROI */}
      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="chart-card-header">
          <div className="chart-card-title">ROI Comparison</div>
        </div>
        <div className="chart-card-body">
          <ROIComparison height={240} />
        </div>
      </div>

      {/* Treatment Categories */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Treatment Effect Category Breakdown</div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
                <th>% of Population</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {treatmentCategories.map(cat => (
                <tr key={cat.label}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, display: 'inline-block' }} />
                      <span style={{ fontWeight: 600, color: cat.color }}>{cat.label}</span>
                    </div>
                  </td>
                  <td>{cat.count.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span>{cat.pct}%</span>
                      <div style={{ flex: 1, height: 4, background: 'var(--border-subtle)', borderRadius: 100, maxWidth: 100 }}>
                        <div style={{ width: `${cat.pct}%`, height: '100%', background: cat.color, borderRadius: 100 }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--on-surface-var)', fontSize: 12 }}>
                    {cat.label === 'Persuadable' ? 'Target with personalized discount'
                      : cat.label === 'Sure Thing' ? 'No discount needed — will purchase anyway'
                      : cat.label === 'Lost Cause' ? 'Discount unlikely to help'
                      : 'Avoid — discount may backfire'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
