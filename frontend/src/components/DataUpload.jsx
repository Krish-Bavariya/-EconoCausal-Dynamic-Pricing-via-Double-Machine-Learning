import React from 'react';

export default function DataUpload() {
  return (
    <div className="card">
      <h3 className="card-title">Data Ingestion</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Upload customer dataset or connect to CRM to begin causal analysis.</p>
      <div style={{ border: '2px dashed var(--border-color)', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center' }}>
        <p>Drag and drop CSV files here</p>
        <button className="btn" style={{ marginTop: '1rem' }}>Browse Files</button>
      </div>
    </div>
  );
}
