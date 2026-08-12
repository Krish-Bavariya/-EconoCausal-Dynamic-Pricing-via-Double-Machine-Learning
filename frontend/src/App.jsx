import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Prescription from './pages/Prescription';

function Navigation() {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        EconoCausal
      </div>
      <div className="nav-menu">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          Causal Overview
        </NavLink>
        <NavLink to="/prescription" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          Prescriptive Optimization
        </NavLink>
      </div>
    </nav>
  );
}

function Header() {
  return (
    <header className="top-header">
      <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '500' }}>Dashboard</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Marketing Director</span>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          MD
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <div className="main-content">
          <Header />
          <div className="page-container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/prescription" element={<Prescription />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
