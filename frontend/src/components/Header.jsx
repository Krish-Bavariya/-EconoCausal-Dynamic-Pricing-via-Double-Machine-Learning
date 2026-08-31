import React from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/upload': 'Data Upload',
  '/causal-analysis': 'Causal Analysis',
  '/customers': 'Customer Analysis',
  '/prescription': 'Prescription',
  '/optimization': 'Optimization',
  '/reports': 'Reports',
  '/monitoring': 'System Monitoring',
  '/settings': 'Settings',
};

export default function Header({ apiConnected = true }) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'EconoCausal';

  return (
    <header className="top-header">
      {/* Left: Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="header-search">
          <span className="material-symbols-outlined text-muted" style={{ fontSize: 18, opacity: 0.6 }}>search</span>
          <input type="text" placeholder="Search insights..." />
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--on-surface)',
        }}>
          {title}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="header-actions">
        {/* Dataset status */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--on-surface-var)',
          padding: '4px 12px',
          border: '1px solid var(--border)',
          borderRadius: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>dataset</span>
          12,500 rows
        </div>

        {/* API status */}
        <div className="header-status-badge">
          <span className="status-dot" style={{ background: apiConnected ? 'var(--success)' : 'var(--danger)' }}></span>
          {apiConnected ? 'API LIVE' : 'API OFFLINE'}
        </div>

        {/* Notifications */}
        <button className="header-icon-btn">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
        </button>

        {/* Wi-fi / connection */}
        <button className="header-icon-btn">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>wifi_tethering</span>
        </button>

        {/* Avatar */}
        <div className="header-avatar" title="Marketing Director">MD</div>
      </div>
    </header>
  );
}
