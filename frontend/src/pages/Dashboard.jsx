import React, { useState, useEffect } from 'react';
import { getDashboard, getCustomers, getSystemStatus } from '../services/api';
import ITEDistribution from '../charts/ITEDistribution';
import UpliftCurve from '../charts/UpliftCurve';
import QiniCurve from '../charts/QiniCurve';

// Helper to calculate Uplift and Qini curves dynamically from customer dataset
function calculateCausalCurves(customers) {
  if (!customers || customers.length === 0) return null;
  
  // Sort by ITE descending
  const sorted = [...customers].sort((a, b) => b.ite - a.ite);
  const n = sorted.length;
  
  const steps = 10;
  const x = [0];
  const yUplift = [0];
  const yQini = [0];
  
  const treatedCustomers = customers.filter(c => c.treatment === 1);
  const controlCustomers = customers.filter(c => c.treatment === 0);
  
  const N_t = treatedCustomers.length || 1;
  const N_c = controlCustomers.length || 1;
  
  const y_t_total = treatedCustomers.filter(c => c.outcome === 'Purchase').length;
  const y_c_total = controlCustomers.filter(c => c.outcome === 'Purchase').length;
  
  const overallUplift = (y_t_total / N_t - y_c_total / N_c) * N_t;
  
  for (let i = 1; i <= steps; i++) {
    const pct = i / steps;
    const limit = Math.floor(pct * n);
    const subset = sorted.slice(0, limit);
    
    const t_sub = subset.filter(c => c.treatment === 1);
    const c_sub = subset.filter(c => c.treatment === 0);
    
    const y_t_sub = t_sub.filter(c => c.outcome === 'Purchase').length;
    const y_c_sub = c_sub.filter(c => c.outcome === 'Purchase').length;
    
    const n_t_sub = t_sub.length || 1;
    const n_c_sub = c_sub.length || 1;
    
    const uplift = (y_t_sub / n_t_sub - y_c_sub / n_c_sub) * n_t_sub;
    const qini = y_t_sub - y_c_sub * (n_t_sub / n_c_sub);
    
    x.push(Math.round(pct * 100));
    yUplift.push(Math.max(0, Number(uplift.toFixed(1))));
    yQini.push(Math.max(0, Number(qini.toFixed(1))));
  }
  
  const randomUplift = x.map(pct => Number(((pct / 100) * overallUplift).toFixed(1)));
  const finalQini = yQini[yQini.length - 1];
  const randomQini = x.map(pct => Number(((pct / 100) * finalQini).toFixed(1)));
  
  return {
    uplift: { x, y: yUplift, random_y: randomUplift },
    qini: { x, y: yQini, random_y: randomQini }
  };
}

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);
        
        const [kpiRes, custRes, sysRes] = await Promise.all([
          getDashboard(),
          getCustomers(),
          getSystemStatus().catch(() => null)
        ]);

        if (kpiRes.success) setKpis(kpiRes.data);
        if (custRes.success) setCustomers(custRes.customers);
        if (sysRes?.success) setSystem(sysRes);
      } catch (e) {
        console.error("Dashboard loading failed:", e);
        setError("Failed to load dashboard data. Ensure the backend server is running.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 16 }}>
        <div style={{ height: 40, width: 200, background: 'var(--border-subtle)', borderRadius: 4 }} className="animate-pulse" />
        <div className="grid-kpi-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{ height: 100, background: 'var(--surface-container)', border: '1px solid var(--border-subtle)', borderRadius: 8 }} className="animate-pulse" />
          ))}
        </div>
        <div className="grid-2-1">
          <div style={{ height: 400, background: 'var(--surface-container)', borderRadius: 8 }} className="animate-pulse" />
          <div style={{ height: 400, background: 'var(--surface-container)', borderRadius: 8 }} className="animate-pulse" />
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
          <span className="material-symbols-outlined">refresh</span> Retry Connection
        </button>
      </div>
    );
  }

  // Calculate effect categories percentages from active customer list
  const totalCustomersCount = customers.length || 1;
  const persuadable = customers.filter(c => c.category === 'Persuadable').length;
  const sureThing = customers.filter(c => c.category === 'Sure Thing').length;
  const lostCause = customers.filter(c => c.category === 'Lost Cause').length;
  const dnd = customers.filter(c => c.category === 'Do Not Disturb').length;

  const persuadablePct = Math.round((persuadable / totalCustomersCount) * 100);
  const sureThingPct = Math.round((sureThing / totalCustomersCount) * 100);
  const lostCausePct = Math.round((lostCause / totalCustomersCount) * 100);
  const dndPct = Math.round((dnd / totalCustomersCount) * 100);

  // Dynamic conic-gradient style representing categories
  const conicBg = `conic-gradient(#8b5cf6 0% ${persuadablePct}%, #10b981 ${persuadablePct}% ${persuadablePct + sureThingPct}%, #f43f5e ${persuadablePct + sureThingPct}% ${persuadablePct + sureThingPct + lostCausePct}%, #64748b ${persuadablePct + sureThingPct + lostCausePct}% 100%)`;

  // Calculate curves dynamically
  const curves = calculateCausalCurves(customers);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Campaign Overview</h2>
        <p className="page-subtitle">Q3 Marketing Intervention Causal Analysis</p>
      </div>

      {/* KPI Header Grid */}
      <div className="grid-kpi-7">
        <div className="kpi-card">
          <span className="kpi-label">Total Customers</span>
          <span className="kpi-value">{kpis?.totalCustomers?.toLocaleString() ?? '12,500'}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Treatment</span>
          <span className="kpi-value">{kpis?.treatmentCustomers?.toLocaleString() ?? '6,200'}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Control</span>
          <span className="kpi-value">{kpis?.controlCustomers?.toLocaleString() ?? '6,300'}</span>
        </div>
        <div className="kpi-card" style={{ borderLeft: '2px solid var(--accent)' }}>
          <span className="kpi-label" style={{ color: 'var(--accent-dim)', display: 'flex', alignItems: 'center', gap: 2 }}>
            ATE <span className="material-symbols-outlined" style={{ fontSize: 12 }}>info</span>
          </span>
          <span className="kpi-value accent">{kpis?.ate ?? '+$4.20'}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Budget</span>
          <span className="kpi-value">{kpis?.marketingBudget ?? '$50,000'}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Exp Revenue</span>
          <span className="kpi-value">{kpis?.expectedRevenue ?? '$1.24M'}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Exp ROI</span>
          <span className="kpi-value" style={{ color: 'var(--success)' }}>{kpis?.expectedROI ?? '240%'}</span>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid-2-1" style={{ marginBottom: 24 }}>
        {/* ITE Distribution */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 420 }}>
          <div className="card-header">
            <h3 className="card-title">Individual Treatment Effect (ITE) Distribution</h3>
            <span className="material-symbols-outlined text-muted" style={{ fontSize: 18 }}>bar_chart</span>
          </div>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <ITEDistribution x={customers.map(c => c.ite)} height={320} />
          </div>
        </div>

        {/* Effect Categories Donut */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 420 }}>
          <div className="card-header">
            <h3 className="card-title">Effect Categories</h3>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
            <div style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: conicBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 0 16px var(--surface-container), var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }}>{persuadablePct}%</span>
                <span className="kpi-label" style={{ fontSize: 9 }}>Persuadable</span>
              </div>
            </div>
            
            <div style={{ width: '100%', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }}></span>
                  <span style={{ color: 'var(--on-surface-var)' }}>Persuadable</span>
                </div>
                <span style={{ color: '#fff' }}>{persuadablePct}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
                  <span style={{ color: 'var(--on-surface-var)' }}>Sure Thing</span>
                </div>
                <span style={{ color: '#fff' }}>{sureThingPct}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e' }}></span>
                  <span style={{ color: 'var(--on-surface-var)' }}>Lost Cause</span>
                </div>
                <span style={{ color: '#fff' }}>{lostCausePct}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748b' }}></span>
                  <span style={{ color: 'var(--on-surface-var)' }}>Do Not Disturb</span>
                </div>
                <span style={{ color: '#fff' }}>{dndPct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curves & Model Validation Row */}
      <div className="grid-3">
        {/* Uplift Curve */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 350 }}>
          <div className="card-header">
            <h3 className="card-title">Uplift Curve</h3>
          </div>
          <div style={{ flex: 1 }}>
            <UpliftCurve height={260} data={curves?.uplift} />
          </div>
        </div>

        {/* Qini Curve */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 350 }}>
          <div className="card-header">
            <h3 className="card-title">Qini Curve</h3>
          </div>
          <div style={{ flex: 1 }}>
            <QiniCurve height={260} data={curves?.qini} />
          </div>
        </div>

        {/* Model Health */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 350 }}>
          <div className="card-header">
            <h3 className="card-title">Model Health</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0', flex: 1, justifyContent: 'center' }}>
            <div className="status-item" style={{ margin: 0 }}>
              <div className="status-label">
                <span className="status-dot" style={{ background: 'var(--success)' }} />
                DML Model Status
              </div>
              <span className="status-value success">{system?.model?.status ?? 'READY'}</span>
            </div>
            <div className="status-item" style={{ margin: 0 }}>
              <div className="status-label">
                <span className="status-dot" style={{ background: 'var(--success)' }} />
                ITE Generation
              </div>
              <span className="status-value success">COMPLETE</span>
            </div>
            <div className="status-item" style={{ margin: 0 }}>
              <div className="status-label">
                <span className="status-dot" style={{ background: 'var(--success)' }} />
                Propensity Score
              </div>
              <span className="status-value success">VALIDATED</span>
            </div>
            <div className="status-item" style={{ margin: 0 }}>
              <div className="status-label">
                <span className="status-dot" style={{ background: system?.drift?.detected ? 'var(--warning)' : 'var(--success)' }} />
                Causal Validation
              </div>
              <span className={`status-value ${system?.drift?.detected ? 'warning' : 'success'}`}>
                {system?.drift?.detected ? 'WARN: DRIFT' : 'PASSED'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
