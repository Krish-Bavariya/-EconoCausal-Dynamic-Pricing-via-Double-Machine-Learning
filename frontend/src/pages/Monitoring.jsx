import React, { useState, useEffect } from 'react';
import { getSystemStatus } from '../services/api';

function Metric({ label, value, tone = '' }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value ${tone}`}>{value}</div>
    </div>
  );
}

export default function Monitoring() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSystemStatus();
      if (res.success) {
        setStatus(res);
      } else {
        throw new Error(res.detail || "Failed to fetch status.");
      }
    } catch (e) {
      console.error("Monitoring fetch failed:", e);
      setError("Unable to connect to system monitoring APIs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading && !status) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 16 }}>
        <div style={{ height: 40, width: 250, background: 'var(--border-subtle)', borderRadius: 4 }} className="animate-pulse" />
        <div className="grid-kpi-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 100, background: 'var(--surface-container)', border: '1px solid var(--border-subtle)', borderRadius: 8 }} className="animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: 24, margin: 16 }}>
        <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <span className="material-symbols-outlined">warning</span> API Connection Error
        </h3>
        <p style={{ marginTop: 8, color: 'var(--on-surface-var)', fontSize: 14 }}>{error}</p>
        <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={fetchStatus}>
          <span className="material-symbols-outlined">refresh</span> Retry
        </button>
      </div>
    );
  }

  const systemStatus = status || {
    api: { status: 'Offline', latency: '0ms', requests: 0, successRate: '0%' },
    model: { status: 'Unloaded', version: 'None', lastTrained: 'N/A' },
    data: { rows: 0, columns: 0, missingValues: 0, duplicates: 0 },
    drift: { detected: false, severity: 'None', featuresAffected: 0 }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div>
          <h1 className="page-title">System Monitoring</h1>
          <p className="page-subtitle">Causal engine health, data quality, and model performance.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchStatus} disabled={loading}>
          <span className="material-symbols-outlined">refresh</span>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid-kpi-4">
        <Metric label="API Latency" value={systemStatus.api.latency || '42ms'} tone="success" />
        <Metric label="Success Rate" value={systemStatus.api.successRate} tone="success" />
        <Metric label="Model Version" value={systemStatus.model.version} />
        <Metric label="Data Drift" value={systemStatus.drift.detected ? 'Detected' : 'Clear'} tone={systemStatus.drift.detected ? 'warning' : 'success'} />
      </div>

      <div className="grid-1-1">
        {/* API & Model Status */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 12 }}>
            <div>
              <div className="card-title">API & Model Health</div>
              <div className="card-subtitle">Operational status for the active analysis pipeline</div>
            </div>
            <span className={`badge ${systemStatus.api.status === 'Online' || systemStatus.api.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
              {systemStatus.api.status === 'Online' || systemStatus.api.status === 'Active' ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          {[
            ['API Status', systemStatus.api.status],
            ['Total Requests Handled', systemStatus.api.requests.toLocaleString()],
            ['Successful Requests', systemStatus.api.successRate],
            ['Causal ML Model Status', systemStatus.model.status],
            ['Last Trained / Updated', systemStatus.model.lastTrained]
          ].map(([label, value]) => (
            <div className="status-item" key={label} style={{ margin: '4px 0' }}>
              <span className="status-label">{label}</span>
              <span className="status-value success">{value}</span>
            </div>
          ))}
        </div>

        {/* Data Quality Status */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 12 }}>
            <div>
              <div className="card-title">Data Quality</div>
              <div className="card-subtitle">Validation metrics of current raw dataset</div>
            </div>
          </div>
          {[
            ['Total Records (Rows)', systemStatus.data.rows.toLocaleString()],
            ['Features Count (Columns)', systemStatus.data.columns],
            ['Missing Value Cells', systemStatus.data.missingValues],
            ['Duplicate Record Count', systemStatus.data.duplicates],
            ['Features Affected by Drift', systemStatus.drift.featuresAffected]
          ].map(([label, value]) => (
            <div className="status-item" key={label} style={{ margin: '4px 0' }}>
              <span className="status-label">{label}</span>
              <span className={`status-value ${label === 'Duplicate Record Count' && value > 0 ? 'warning' : 'success'}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Drift Status Banner */}
      <div className="card" style={{ marginTop: 24, borderLeft: `4px solid ${systemStatus.drift.detected ? 'var(--warning)' : 'var(--success)'}` }}>
        <h3 className="card-title" style={{ color: systemStatus.drift.detected ? 'var(--warning)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {systemStatus.drift.detected ? 'warning' : 'check_circle'}
          </span>
          {systemStatus.drift.detected ? 'Data Drift Warning' : 'Data Drift Status'}
        </h3>
        <p className="page-subtitle" style={{ margin: '8px 0 0', fontSize: 14 }}>
          {systemStatus.drift.detected 
            ? `${systemStatus.drift.featuresAffected} feature(s) require review. Drift Severity: ${systemStatus.drift.severity}.` 
            : 'No significant distribution shift detected in confounder or target causal features.'}
        </p>
      </div>
    </div>
  );
}
