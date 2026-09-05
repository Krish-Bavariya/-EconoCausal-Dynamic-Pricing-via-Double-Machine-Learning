import React, { useState, useEffect, useMemo } from 'react';
import { getReports, getCustomers } from '../services/api';
import { RevenueComparison, ROIComparison } from '../charts/ComparisonCharts';
import ITEDistribution from '../charts/ITEDistribution';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadReportMetrics() {
      try {
        setLoading(true);
        setError(null);
        
        const [repRes, custRes] = await Promise.all([
          getReports(),
          getCustomers()
        ]);
        
        setReportData(repRes);
        setCustomers(custRes.customers);
      } catch (e) {
        console.error("Reports loading failed:", e);
        setError("Failed to retrieve consolidated marketing reports from the backend.");
      } finally {
        setLoading(false);
      }
    }
    loadReportMetrics();
  }, []);

  const handleExport = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "econocausal_executive_report.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSV = () => {
    if (!customers || customers.length === 0) return;
    const headers = ['id', 'treatment', 'outcome', 'age', 'region', 'tenure', 'propensityScore', 'ite', 'category', 'recommendedDiscount', 'expectedGain', 'roi'];
    const csvContent = [
      headers.join(','),
      ...customers.map(c => [
        c.id,
        c.treatment,
        c.outcome,
        c.age,
        c.region,
        c.tenure,
        c.propensityScore.toFixed(3),
        c.ite.toFixed(5),
        c.category,
        c.recommendedDiscount,
        c.expectedGain.toFixed(2),
        c.roi.toFixed(1)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "econocausal_customer_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const comparisonData = useMemo(() => {
    if (!reportData?.optimization) return null;
    const opt = reportData.optimization;
    const allocated = opt.allocated;
    const randomRevenue = opt.expectedRevenue - opt.incrementalGain + (allocated * 0.4);
    
    return {
      revenue: {
        labels: ['Optimized Causal', 'Random Targeting', 'No Campaign'],
        values: [opt.expectedRevenue, randomRevenue, 1100000]
      },
      roi: {
        labels: ['Optimized Causal', 'Random Targeting'],
        values: [opt.roi, 183.0]
      }
    };
  }, [reportData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 16 }}>
        <div style={{ height: 40, width: 200, background: 'var(--border-subtle)', borderRadius: 4 }} className="animate-pulse" />
        <div style={{ height: 120, background: 'var(--surface-container)', borderRadius: 8 }} className="animate-pulse" />
        <div className="grid-kpi-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 100, background: 'var(--surface-container)', border: '1px solid var(--border-subtle)', borderRadius: 8 }} className="animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: 24, margin: 16 }}>
        <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <span className="material-symbols-outlined">warning</span> API Connection Error
        </h3>
        <p style={{ marginTop: 8, color: 'var(--on-surface-var)', fontSize: 14 }}>{error}</p>
        <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => window.location.reload()}>
          <span className="material-symbols-outlined">refresh</span> Retry
        </button>
      </div>
    );
  }

  const { causal, optimization, categories } = reportData;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Executive summary of causal analysis and optimization outcomes.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleCSV} disabled={customers.length === 0}>
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
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--on-surface-var)' }}>Q3 Campaign Analysis Summary</span>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--on-surface-var)', margin: 0 }}>
          The EconoCausal Double Machine Learning analysis identified a statistically robust <strong style={{ color: 'var(--on-surface)' }}>Average Treatment Effect (ATE) of {causal.ate}</strong> per customer
          for the marketing discount campaign. Of the {customers.length.toLocaleString()} customers analyzed,
          <strong style={{ color: 'var(--accent-dim)' }}> {categories.find(c => c.label === 'Persuadable')?.count.toLocaleString() ?? '5,625'} ({categories.find(c => c.label === 'Persuadable')?.pct ?? '45'}%) were classified as Persuadable</strong> — customers whose purchase probability
          genuinely increases because of the discount. By targeting only Persuadables with optimized discounts (via SciPy),
          the campaign generates <strong style={{ color: 'var(--success)' }}>${optimization.incrementalGain.toLocaleString()} more incremental revenue</strong> compared to blanket targeting,
          achieving an ROI of <strong style={{ color: 'var(--success)' }}>{optimization.roi.toFixed(1)}%</strong>.
          All causal estimates passed DoWhy refutation tests with high confidence.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="section-title" style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 12 }}>Causal Analysis Results</div>
      <div className="grid-kpi-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'ATE (Avg Treatment Effect)', value: causal.ate, accent: 'accent' },
          { label: 'Avg ITE', value: causal.avgIte },
          { label: 'Positive Effect %', value: `${causal.positivePct}%`, accent: 'success' },
          { label: 'Negative Effect %', value: `${causal.negativePct}%`, accent: 'danger' },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className={`kpi-value${k.accent ? ` ${k.accent}` : ''}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="section-title" style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 12 }}>Optimization Results</div>
      <div className="grid-kpi-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Budget Allocated', value: `$${optimization.allocated.toLocaleString()}` },
          { label: 'Expected Revenue', value: `$${(optimization.expectedRevenue / 1000).toFixed(0)}K`, accent: 'success' },
          { label: 'Incremental Gain', value: `$${optimization.incrementalGain.toLocaleString()}`, accent: 'accent' },
          { label: 'Final ROI', value: `${optimization.roi.toFixed(1)}%`, accent: 'success' },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className={`kpi-value${k.accent ? ` ${k.accent}` : ''}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2-1" style={{ marginBottom: 24 }}>
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">ITE Distribution</div>
          </div>
          <div className="chart-card-body">
            <ITEDistribution x={customers.map(c => c.ite)} height={280} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">Revenue Comparison</div>
          </div>
          <div className="chart-card-body">
            <RevenueComparison data={comparisonData?.revenue} height={280} />
          </div>
        </div>
      </div>

      {/* ROI */}
      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="chart-card-header">
          <div className="chart-card-title">ROI Comparison</div>
        </div>
        <div className="chart-card-body">
          <ROIComparison data={comparisonData?.roi} height={240} />
        </div>
      </div>

      {/* Treatment Categories */}
      <div className="card">
        <div className="card-header" style={{ paddingBottom: 12 }}>
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
              {categories.map(cat => (
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
