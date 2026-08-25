import React from 'react';
import { causalKPIs, refutationTests, robustnessScore } from '../services/mockData';
import ITEDistribution from '../charts/ITEDistribution';
import PropensityScore from '../charts/PropensityScore';

function RefutationTest({ test }) {
  return (
    <div className="status-item">
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--on-surface)', marginBottom: 4 }}>{test.name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--on-surface-var)' }}>New Effect: {test.newEffect}</div>
      </div>
      <span className={`badge ${test.status === 'Pass' ? 'badge-success' : 'badge-danger'}`}>
        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
          {test.status === 'Pass' ? 'check_circle' : 'cancel'}
        </span>
        {test.status}
      </span>
    </div>
  );
}

function CausalDAG() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 340,
      background: '#151e2e',
      borderRadius: 8,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* SVG DAG visualization */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <marker id="arrow-dag" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-dag-accent" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#8b5cf6" />
          </marker>
        </defs>

        {/* Confounder → Treatment */}
        <line x1="50%" y1="22%" x2="27%" y2="70%"
          stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow-dag)" />
        {/* Confounder → Outcome */}
        <line x1="50%" y1="22%" x2="73%" y2="70%"
          stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow-dag)" />
        {/* Treatment → Outcome (causal path) */}
        <line x1="32%" y1="78%" x2="62%" y2="78%"
          stroke="#8b5cf6" strokeWidth="2.5" markerEnd="url(#arrow-dag-accent)" />
        {/* Features → Treatment (dashed) */}
        <line x1="12%" y1="50%" x2="24%" y2="70%"
          stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,4" markerEnd="url(#arrow-dag)" />

        {/* Edge labels */}
        <text x="55%" y="56%" fontSize="10" fill="#8b5cf6" fontFamily="JetBrains Mono">causal effect</text>
      </svg>

      {/* Nodes */}
      <div className="dag-node dag-node-confounder" style={{ top: '12%', left: '50%', transform: 'translateX(-50%)' }}>
        Confounders (Seasonality, Income)
      </div>
      <div className="dag-node dag-node-treatment" style={{ bottom: '16%', left: '10%' }}>
        Treatment (Discount)
      </div>
      <div className="dag-node dag-node-outcome" style={{ bottom: '16%', right: '10%' }}>
        Outcome (Purchase)
      </div>
      <div className="dag-node" style={{
        top: '42%', left: '2%',
        border: '1px solid var(--border)',
        background: 'var(--surface-variant)',
        color: 'var(--on-surface)',
        borderRadius: 6,
        padding: '6px 12px',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        zIndex: 10,
      }}>
        Features
      </div>
    </div>
  );
}

export default function CausalAnalysis() {
  const kpis = causalKPIs;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Causal Inference</h1>
        <p className="page-subtitle">Understand the true causal impact of discounts on customer purchasing behavior.</p>
      </div>

      {/* KPI Summary */}
      <div className="grid-kpi-4">
        <div className="kpi-card">
          <div className="kpi-label" data-tip="Mean causal impact across the full population">Average Treatment Effect (ATE)</div>
          <div className="kpi-value accent">{kpis.ate}</div>
          <div style={{ fontSize: 12, color: 'var(--on-surface-var)' }}>per customer</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Average ITE</div>
          <div className="kpi-value">{kpis.avgIte}</div>
          <div style={{ fontSize: 12, color: 'var(--on-surface-var)' }}>per customer</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Positive Effect %</div>
          <div className="kpi-value success">{kpis.positivePct}%</div>
          <div className="progress-bar">
            <div className="progress-bar-fill success" style={{ width: `${kpis.positivePct}%` }} />
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Negative Effect %</div>
          <div className="kpi-value danger">{kpis.negativePct}%</div>
          <div className="progress-bar">
            <div className="progress-bar-fill danger" style={{ width: `${kpis.negativePct}%` }} />
          </div>
        </div>
      </div>

      {/* DAG + Refutation */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Causal DAG */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Causal Structure (DAG)</div>
              <div className="card-subtitle">DoWhy — Directed Acyclic Graph representing causal assumptions</div>
            </div>
            <span className="material-symbols-outlined text-muted" style={{ fontSize: 18 }}>tune</span>
          </div>
          <CausalDAG />
          <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { color: '#8b5cf6', label: 'Causal Path (T → Y)' },
              { color: '#94a3b8', label: 'Confounding Paths' },
              { color: '#94a3b8', label: 'Feature Paths', dash: true },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 24, height: 2,
                  background: l.color,
                  borderTop: l.dash ? '2px dashed' : 'none',
                  borderColor: l.color,
                }} />
                <span style={{ fontSize: 11, color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Causal Refutation */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Causal Refutation</div>
              <div className="card-subtitle">Model robustness checks</div>
            </div>
          </div>

          {refutationTests.map(test => (
            <RefutationTest key={test.name} test={test} />
          ))}

          {/* Robustness Score Ring */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div className="score-ring" style={{ margin: '0 auto 12px' }}>
              <span className="score-ring-value">{robustnessScore}</span>
              <span className="score-ring-suffix">/100</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Robustness Score</div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-var)' }}>High confidence in causal estimates</div>
          </div>
        </div>
      </div>

      {/* ITE Distribution + Propensity Score */}
      <div className="grid-1-1">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">ITE Distribution</div>
              <div className="chart-card-sub">Individual Treatment Effects across population</div>
            </div>
          </div>
          <div className="chart-card-body">
            <ITEDistribution height={300} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Propensity Score Overlap</div>
              <div className="chart-card-sub">Treatment vs Control matching quality</div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ color: '#8b5cf6', label: 'Treated' }, { color: '#bcc7de', label: 'Control' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-card-body">
            <PropensityScore height={300} />
          </div>
        </div>
      </div>
    </div>
  );
}
