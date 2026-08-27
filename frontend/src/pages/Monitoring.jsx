import React from 'react';
import { getSystemStatus } from '../services/api';
import { systemStatus } from '../services/mockData';

function Metric({ label, value, tone = '' }) {
  return <div className="kpi-card"><div className="kpi-label">{label}</div><div className={`kpi-value ${tone}`}>{value}</div></div>;
}

export default function Monitoring() {
  const [status, setStatus] = React.useState(systemStatus);
  const [loading, setLoading] = React.useState(false);

  const refresh = async () => {
    setLoading(true);
    try { setStatus(await getSystemStatus()); } finally { setLoading(false); }
  };

  return <div>
    <div className="page-header section-row">
      <div><h1 className="page-title">System Monitoring</h1><p className="page-subtitle">Causal engine health, data quality, and model performance.</p></div>
      <button className="btn btn-secondary" onClick={refresh} disabled={loading}><span className="material-symbols-outlined">refresh</span>{loading ? 'Refreshing...' : 'Refresh'}</button>
    </div>
    <div className="grid-kpi-4">
      <Metric label="API Latency" value={status.api.latency} tone="success" />
      <Metric label="Success Rate" value={status.api.successRate} tone="success" />
      <Metric label="Model Version" value={status.model.version} />
      <Metric label="Data Drift" value={status.drift.detected ? 'Detected' : 'Clear'} tone={status.drift.detected ? 'warning' : 'success'} />
    </div>
    <div className="grid-1-1">
      <div className="card"><div className="card-header"><div><div className="card-title">API & Model Health</div><div className="card-subtitle">Operational status for the active analysis pipeline</div></div><span className="badge badge-success">LIVE</span></div>
        {[['API Status', status.api.status], ['Requests', status.api.requests.toLocaleString()], ['Successful Requests', status.api.successRate], ['Model Status', status.model.status], ['Last Trained', status.model.lastTrained]].map(([label, value]) => <div className="status-item" key={label}><span className="status-label">{label}</span><span className="status-value success">{value}</span></div>)}
      </div>
      <div className="card"><div className="card-header"><div><div className="card-title">Data Quality</div><div className="card-subtitle">Validation and drift signals</div></div></div>
        {[['Rows', status.data.rows.toLocaleString()], ['Columns', status.data.columns], ['Missing Values', status.data.missingValues], ['Duplicate Records', status.data.duplicates], ['Features Affected', status.drift.featuresAffected]].map(([label, value]) => <div className="status-item" key={label}><span className="status-label">{label}</span><span className={`status-value ${label === 'Duplicate Records' && value > 0 ? 'warning' : 'success'}`}>{value}</span></div>)}
      </div>
    </div>
    <div className="card" style={{ marginTop: 24, borderLeft: `3px solid ${status.drift.detected ? 'var(--warning)' : 'var(--success)'}` }}><div className="card-title">{status.drift.detected ? 'Data Drift Warning' : 'Data Drift Status'}</div><p className="page-subtitle">{status.drift.detected ? `${status.drift.featuresAffected} feature(s) require review. Severity: ${status.drift.severity}.` : 'No significant distribution shift detected in causal features.'}</p></div>
  </div>;
}
