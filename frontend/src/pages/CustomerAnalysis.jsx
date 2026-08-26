import React, { useState, useMemo } from 'react';
import { mockCustomers } from '../services/mockData';

const CATEGORIES = ['all', 'Persuadable', 'Sure Thing', 'Lost Cause', 'Do Not Disturb'];

function getCategoryClass(cat) {
  switch (cat) {
    case 'Persuadable': return 'cat-persuadable';
    case 'Sure Thing': return 'cat-sure-thing';
    case 'Lost Cause': return 'cat-lost-cause';
    case 'Do Not Disturb': return 'cat-dnd';
    default: return 'badge-neutral';
  }
}

function CustomerDetailPanel({ customer, onClose }) {
  if (!customer) return null;
  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: 380,
      background: 'var(--surface-container)', borderLeft: '1px solid var(--border)',
      zIndex: 50, padding: 24, overflowY: 'auto',
      animation: 'slideIn 0.2s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{customer.id}</div>
        <button className="header-icon-btn" onClick={onClose}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
        </button>
      </div>

      {[
        { label: 'Category', value: <span className={`badge ${getCategoryClass(customer.category)}`}>{customer.category}</span> },
        { label: 'Treatment', value: customer.treatment === 1 ? 'Treated' : 'Control' },
        { label: 'Outcome', value: customer.outcome },
        { label: 'Age', value: customer.age },
        { label: 'Region', value: customer.region },
        { label: 'Tenure', value: customer.tenure },
        { label: 'Propensity Score', value: customer.propensityScore.toFixed(3) },
        { label: 'ITE', value: <span style={{ color: customer.ite >= 0 ? 'var(--success)' : 'var(--danger)' }}>{customer.ite >= 0 ? '+' : ''}{customer.ite.toFixed(3)}</span> },
        { label: 'Recommended Discount', value: `$${customer.recommendedDiscount}` },
        { label: 'Expected Gain', value: `$${customer.expectedGain.toFixed(2)}` },
        { label: 'ROI', value: `${customer.roi}%` },
      ].map(row => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 12, color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{row.label}</span>
          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>{row.value}</span>
        </div>
      ))}

      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}

export default function CustomerAnalysis() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [treatment, setTreatment] = useState('all');
  const [sortField, setSortField] = useState('ite');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;

  const filtered = useMemo(() => {
    let data = [...mockCustomers];
    if (search) data = data.filter(c => c.id.toLowerCase().includes(search.toLowerCase()));
    if (category !== 'all') data = data.filter(c => c.category === category);
    if (treatment !== 'all') data = data.filter(c => String(c.treatment) === treatment);
    data.sort((a, b) => {
      const v = sortDir === 'asc' ? 1 : -1;
      return a[sortField] > b[sortField] ? v : -v;
    });
    return data;
  }, [search, category, treatment, sortField, sortDir]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => (
    <span style={{ fontSize: 12, color: sortField === field ? 'var(--accent-dim)' : 'var(--border)' }}>
      {sortDir === 'asc' && sortField === field ? '↑' : '↓'}
    </span>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Customer Analysis</h1>
        <p className="page-subtitle">Browse, filter, and inspect individual causal treatment effects.</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid-kpi-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Customers', value: mockCustomers.length.toLocaleString() },
          { label: 'Persuadable', value: mockCustomers.filter(c => c.category === 'Persuadable').length, accent: 'accent' },
          { label: 'Avg ITE', value: `$${(mockCustomers.reduce((s, c) => s + c.ite, 0) / mockCustomers.length).toFixed(3)}` },
          { label: 'Discount Recipients', value: mockCustomers.filter(c => c.recommendedDiscount > 0).length },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className={`kpi-value${k.accent ? ` ${k.accent}` : ''}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{
                position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                fontSize: 16, color: 'var(--on-surface-var)',
              }}>search</span>
              <input
                type="text"
                placeholder="Search by Customer ID..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                style={{ paddingLeft: 36 }}
              />
            </div>
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(0); }} style={{ width: 180 }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
          <select value={treatment} onChange={e => { setTreatment(e.target.value); setPage(0); }} style={{ width: 160 }}>
            <option value="all">All Groups</option>
            <option value="1">Treated</option>
            <option value="0">Control</option>
          </select>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--on-surface-var)' }}>
            {filtered.length} results
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Treatment</th>
                <th>Outcome</th>
                <th>Propensity Score <SortIcon field="propensityScore" /></th>
                <th onClick={() => handleSort('ite')} style={{ cursor: 'pointer' }}>
                  ITE <SortIcon field="ite" />
                </th>
                <th>Category</th>
                <th onClick={() => handleSort('recommendedDiscount')} style={{ cursor: 'pointer' }}>
                  Discount <SortIcon field="recommendedDiscount" />
                </th>
                <th onClick={() => handleSort('expectedGain')} style={{ cursor: 'pointer' }}>
                  Exp Gain <SortIcon field="expectedGain" />
                </th>
                <th>ROI</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(c => (
                <tr key={c.id} onClick={() => setSelected(c)} style={{ cursor: 'pointer' }}>
                  <td style={{ color: 'var(--accent-dim)', fontWeight: 600 }}>{c.id}</td>
                  <td>
                    <span className={`badge ${c.treatment === 1 ? 'badge-accent' : 'badge-neutral'}`}>
                      {c.treatment === 1 ? 'Treated' : 'Control'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.outcome === 'Purchase' ? 'badge-success' : 'badge-neutral'}`}>
                      {c.outcome}
                    </span>
                  </td>
                  <td>{c.propensityScore.toFixed(3)}</td>
                  <td style={{ color: c.ite >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    {c.ite >= 0 ? '+' : ''}{c.ite.toFixed(3)}
                  </td>
                  <td><span className={`badge ${getCategoryClass(c.category)}`}>{c.category}</span></td>
                  <td style={{ fontWeight: 600, color: c.recommendedDiscount > 0 ? 'var(--on-surface)' : 'var(--on-surface-var)' }}>
                    ${c.recommendedDiscount}
                  </td>
                  <td style={{ color: 'var(--success)' }}>${c.expectedGain.toFixed(2)}</td>
                  <td>{c.roi > 0 ? `${c.roi}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--on-surface-var)' }}>
            Page {page + 1} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <button className="btn btn-secondary btn-sm" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && <CustomerDetailPanel customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
