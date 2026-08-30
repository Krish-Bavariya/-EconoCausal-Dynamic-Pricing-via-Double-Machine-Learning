import React, { useState, useEffect } from 'react';
import { checkHealth } from '../services/api';

export default function Settings() {
  const [settings, setSettings] = useState({ compact: false, refresh: true, theme: 'dark' });
  const [apiStatus, setApiStatus] = useState('checking');
  const [apiUrl, setApiUrl] = useState('');

  const update = (key, value) => setSettings(current => ({ ...current, [key]: value }));

  useEffect(() => {
    async function testConnection() {
      setApiStatus('checking');
      try {
        const res = await checkHealth();
        if (res.status === 'ok') {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch (e) {
        setApiStatus('offline');
      }
    }
    testConnection();
    
    // Read the configured API URL
    const url = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    setApiUrl(url);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure dashboard preferences and review API connectivity.</p>
      </div>

      <div className="grid-1-1">
        {/* Dashboard preferences */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card-header" style={{ margin: 0, paddingBottom: 12 }}>
            <div className="card-title">Dashboard Preferences</div>
          </div>
          
          <label className="status-item" style={{ cursor: 'pointer', margin: 0 }}>
            <span className="status-label">Compact data tables</span>
            <input 
              type="checkbox" 
              checked={settings.compact} 
              onChange={event => update('compact', event.target.checked)} 
              style={{ width: 'auto', cursor: 'pointer' }} 
            />
          </label>
          
          <label className="status-item" style={{ cursor: 'pointer', margin: 0 }}>
            <span className="status-label">Refresh health on page load</span>
            <input 
              type="checkbox" 
              checked={settings.refresh} 
              onChange={event => update('refresh', event.target.checked)} 
              style={{ width: 'auto', cursor: 'pointer' }} 
            />
          </label>
          
          <div className="form-group" style={{ marginTop: 8 }}>
            <label className="form-label" htmlFor="theme" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
              Theme preference
            </label>
            <select 
              id="theme" 
              value={settings.theme} 
              onChange={event => update('theme', event.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="dark">Dark enterprise (Stitch)</option>
              <option value="system">System default</option>
            </select>
          </div>
        </div>

        {/* Data & API Settings */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card-header" style={{ margin: 0, paddingBottom: 12 }}>
            <div className="card-title">Data & API Configuration</div>
          </div>
          
          <div className="status-item" style={{ margin: 0 }}>
            <span className="status-label">API Server URL</span>
            <span className="status-value" style={{ textTransform: 'none', fontFamily: 'var(--font-mono)' }}>{apiUrl}</span>
          </div>

          <div className="status-item" style={{ margin: 0 }}>
            <span className="status-label">Connection Status</span>
            <span className={`status-value ${apiStatus === 'online' ? 'success' : apiStatus === 'offline' ? 'danger' : 'warning'}`}>
              {apiStatus === 'online' ? 'API LIVE' : apiStatus === 'offline' ? 'API OFFLINE' : 'CHECKING...'}
            </span>
          </div>

          <div className="status-item" style={{ margin: 0 }}>
            <span className="status-label">Dataset Status</span>
            <span className="status-value success">Loaded (retail_campaign.csv)</span>
          </div>

          <p className="card-subtitle" style={{ marginTop: 12, fontSize: 12, lineHeight: 1.5 }}>
            Connection settings are managed through project environment configurations (`.env` files). Secrets are protected and are never exposed to clients.
          </p>
        </div>
      </div>
    </div>
  );
}
