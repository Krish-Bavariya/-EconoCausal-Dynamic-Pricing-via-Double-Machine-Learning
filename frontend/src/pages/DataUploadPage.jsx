import React, { useState, useRef } from 'react';
import { dataPreview } from '../services/mockData';
import { useNavigate } from 'react-router-dom';

function ValidationStatus({ validation }) {
  if (!validation) return null;
  const items = [
    { label: 'Schema Check', ...validation.schemaCheck },
    { label: 'Missing Values', ...validation.missingValues },
    { label: 'Duplicates', ...validation.duplicates },
    { label: 'Required Columns', ...validation.requiredColumns },
    { label: 'Data Types', ...validation.dataTypes },
  ];
  return (
    <div>
      {items.map(item => (
        <div key={item.label} className={`validation-item ${item.status === 'pass' ? 'pass' : 'fail'}`}>
          <div>
            <div className="validation-item-label">{item.label}</div>
            <div className={`validation-item-value ${item.status === 'fail' ? 'danger' : 'success'}`}>
              {item.count !== undefined ? (item.count === 0 ? 'None' : `${item.count} found`) : item.message}
            </div>
          </div>
          <span className="material-symbols-outlined" style={{
            fontSize: 22,
            color: item.status === 'pass' ? 'var(--success)' : 'var(--danger)',
          }}>
            {item.status === 'pass' ? 'check_circle' : 'warning'}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DataUploadPage() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [validation, setValidation] = useState(null);
  const [validating, setValidating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.csv')) return;
    const fileInfo = {
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      rows: null,
      columns: null,
      raw: f,
    };
    setFile(fileInfo);
    setValidation(null);
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      const lines = String(target?.result || '').split(/\r?\n/).filter(Boolean);
      const columns = lines[0] ? lines[0].split(',').length : 0;
      setFile(current => current ? { ...current, rows: Math.max(0, lines.length - 1), columns } : current);
    };
    reader.readAsText(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.csv')) handleFile(f);
  };

  const handleValidate = () => {
    if (!file) return;
    setValidating(true);
    setTimeout(() => {
      setValidation({
        schemaCheck: { status: 'pass', message: 'Valid' },
        missingValues: { status: 'pass', count: 0 },
        duplicates: { status: 'fail', count: 52 },
        requiredColumns: { status: 'pass', message: 'All present' },
        dataTypes: { status: 'pass', message: 'Valid' },
      });
      setValidating(false);
    }, 1200);
  };

  const handleAnalyze = () => {
    if (!file) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      navigate('/causal-analysis');
    }, 2000);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Data Management</h1>
          <p className="page-subtitle">Upload and validate your campaign datasets for causal analysis.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleValidate} disabled={!file || validating}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>fact_check</span>
            {validating ? 'Validating...' : 'Validate Dataset'}
          </button>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={!file || analyzing}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_arrow</span>
            {analyzing ? 'Running...' : 'Run Causal Analysis'}
          </button>
        </div>
      </div>

      <div className="grid-8-4" style={{ marginBottom: 24 }}>
        {/* Upload Area */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Dataset Upload</div>
          </div>

          {/* Drop Zone */}
          <div
            className={`drop-zone${dragOver ? ' drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="drop-zone-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--accent-dim)' }}>cloud_upload</span>
            </div>
            <div className="drop-zone-title">Drag and drop your file here</div>
            <div className="drop-zone-sub">Supported formats: CSV, Parquet (Max 500 MB)</div>
            <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>folder_open</span>
              Browse File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.parquet"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          {/* Uploaded file preview */}
          {file && (
            <div className="file-preview-row">
              <div className="file-preview-info">
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--accent-dim)' }}>csv</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--on-surface)' }}>{file.name}</div>
                  <div className="file-preview-meta">
                    <span>{file.size}</span>
                    <span>·</span>
                    <span>{file.rows?.toLocaleString()} rows</span>
                    <span>·</span>
                    <span>{file.columns} columns</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="badge badge-success">
                  <span className="status-dot" style={{ background: 'var(--success)', width: 6, height: 6 }} />
                  Ready
                </span>
                <button className="header-icon-btn" onClick={() => { setFile(null); setValidation(null); }}
                  style={{ color: 'var(--on-surface-var)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Validation Panel */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Validation Status</div>
            <span className="material-symbols-outlined text-muted" style={{ fontSize: 18 }}>info</span>
          </div>

          {!file && (
            <div className="empty-state">
              <span className="material-symbols-outlined empty-state-icon">upload_file</span>
              <div className="empty-state-title">No file uploaded</div>
              <div className="empty-state-sub">Upload a dataset to see validation results</div>
            </div>
          )}

          {file && !validation && !validating && (
            <div className="empty-state">
              <span className="material-symbols-outlined empty-state-icon">fact_check</span>
              <div className="empty-state-title">Not yet validated</div>
              <div className="empty-state-sub">Click "Validate Dataset" to check data quality</div>
            </div>
          )}

          {validating && (
            <div className="empty-state">
              <div className="loading-spinner" style={{ width: 32, height: 32, marginBottom: 12 }} />
              <div className="empty-state-title">Validating dataset...</div>
            </div>
          )}

          {validation && <ValidationStatus validation={validation} />}

          {validation?.duplicates?.status === 'fail' && (
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-danger btn-full">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_alt_off</span>
                Clean Duplicates
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Data Preview Table */}
      {file && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Data Preview</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--on-surface-var)' }}>
              Showing top 5 of {(file.rows ?? 0).toLocaleString()} rows
            </span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Treatment (0/1)</th>
                  <th>Outcome (Purchase)</th>
                  <th>Age</th>
                  <th>Region</th>
                  <th>Last Purchase (Days)</th>
                </tr>
              </thead>
              <tbody>
                {dataPreview.map(row => (
                  <tr key={row.id}>
                    <td style={{ color: 'var(--accent-dim)', fontWeight: 600 }}>{row.id}</td>
                    <td style={{ color: row.treatment === 1 ? 'var(--accent-dim)' : 'var(--on-surface-var)', fontWeight: row.treatment === 1 ? 700 : 400 }}>
                      {row.treatment}
                    </td>
                    <td>
                      {row.outcome === 'Purchase' ? (
                        <span className="badge badge-success">{row.outcome}</span>
                      ) : (
                        <span style={{ color: 'var(--on-surface-var)' }}>{row.outcome}</span>
                      )}
                    </td>
                    <td>{row.age}</td>
                    <td>{row.region}</td>
                    <td style={{ textAlign: 'right' }}>{row.lastPurchaseDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
