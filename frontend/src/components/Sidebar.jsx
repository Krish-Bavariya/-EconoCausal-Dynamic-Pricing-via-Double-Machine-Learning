import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', exact: true },
  { to: '/upload', label: 'Data Upload', icon: 'cloud_upload' },
  { to: '/causal-analysis', label: 'Causal Analysis', icon: 'troubleshoot' },
  { to: '/customers', label: 'Customer Analysis', icon: 'group' },
  { to: '/prescription', label: 'Prescription', icon: 'precision_manufacturing' },
  { to: '/optimization', label: 'Optimization', icon: 'insights' },
  { to: '/reports', label: 'Reports', icon: 'assessment' },
  { to: '/monitoring', label: 'System Monitoring', icon: 'monitor_heart' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo-area">
        <div className="sidebar-logo-icon">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>analytics</span>
        </div>
        <div>
          <div className="sidebar-logo-text">EconoCausal</div>
          <div className="sidebar-logo-sub">CAUSAL AI DASHBOARD</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-menu">
        {NAV_ITEMS.slice(0, -1).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <hr className="nav-divider" />

        {/* Settings at bottom */}
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span>
          Settings
        </NavLink>
      </nav>

      {/* CTA */}
      <div className="sidebar-cta">
        <button className="sidebar-cta-btn" onClick={() => navigate('/causal-analysis')}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
          Run New Analysis
        </button>
      </div>
    </aside>
  );
}
