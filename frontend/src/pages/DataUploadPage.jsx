import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDataset, validateDataset, runCausalAnalysis } from '../services/api';

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
  const [uploading, setUploading] = useState(false);
  const [validation, setValidation] = useState(null);
  const [validating, setValidating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = async (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are supported.');
      return;
    }
    
    setError(null);
    setUploading(true);
    setValidation(null);
    try {
      const res = await uploadDataset(f);
      if (res.success) {
        setFile({
          name: res.filename,
          size: `${(res.size / (1024 * 1024)).toFixed(2)} MB`,
          rows: res.rows,
          columns: res.columns,
          preview: res.preview
        });
      } else {
        throw new Error("Invalid response schema from backend.");
      }
    } catch (e) {
      console.error("Upload failed:", e);
      setError(e.message || "Failed to upload file to backend.");
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleValidate = async () => {
    if (!file) return;
    setValidating(true);
    setError(null);
    try {
      const res = await validateDataset();
      setValidation(res);
    } catch (e) {
      console.error("Validation failed:", e);
      setError(e.message || "Failed to validate dataset.");
    } finally {
      setValidating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await runCausalAnalysis();
      if (res.success) {
        navigate('/causal-analysis');
      } else {
        throw new Error(res.detail || "Causal analysis training failed.");
      }
    } catch (e) {
      console.error("Causal analysis failed:", e);
      setError(e.message || "Double Machine Learning analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div>
          <h1 className="page-title">Data Management</h1>
          <p className="page-subtitle">Upload and validate your campaign datasets for causal analysis.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleValidate} disabled={!file || validating || uploading}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>fact_check</span>
            {validating ? 'Validating...' : 'Validate Dataset'}
          </button>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={!file || analyzing || uploading}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_arrow</span>
            {analyzing ? 'Running DML...' : 'Run Causal Analysis'}
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--danger)', marginBottom: 24, padding: '12px 20px' }}>
          <div style={{ color: 'var(--danger)', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
            {error}
          </div>
        </div>
      )}

      <div className="grid-8-4" style={{ marginBottom: 24 }}>
        {/* Upload Area */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card-header" style={{ margin: 0, paddingBottom: 12 }}>
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
            <div className="drop-zone-title">
              {uploading ? 'Uploading to server...' : 'Drag and drop your file here'}
            </div>
            <div className="drop-zone-sub">Supported formats: CSV (Max 100 MB)</div>
            <button className="btn btn-secondary btn-sm" disabled={uploading} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>folder_open</span>
              Browse File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
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
                  Ingested
                </span>
                <button className="header-icon-btn" onClick={() => { setFile(null); setValidation(null); setError(null); }}
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
        </div>
      </div>

      {/* Data Preview Table */}
      {file && file.preview && (
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
                  <th>Outcome (Conversion)</th>
                  <th>Recency (Days)</th>
                  <th>History ($)</th>
                  <th>Newbie Status</th>
                </tr>
              </thead>
              <tbody>
                {file.preview.map(row => (
                  <tr key={row.customer_id || row.id}>
                    <td style={{ color: 'var(--accent-dim)', fontWeight: 600 }}>{row.customer_id}</td>
                    <td>
                      <span className={`badge ${row.discount_offered === 1 ? 'badge-accent' : 'badge-neutral'}`}>
                        {row.discount_offered === 1 ? 'Treated' : 'Control'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${row.purchased === 1 ? 'badge-success' : 'badge-neutral'}`}>
                        {row.purchased === 1 ? 'Conversion' : 'No Purchase'}
                      </span>
                    </td>
                    <td>{row.recency} days</td>
                    <td>${Number(row.history).toFixed(2)}</td>
                    <td>{row.newbie === 1 ? 'New Customer' : 'Existing Customer'}</td>
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
