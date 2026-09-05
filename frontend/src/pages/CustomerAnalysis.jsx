import React, { useState, useEffect, useMemo } from 'react';
import { getCustomers } from '../services/api';

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
      zIndex: 100, padding: 24, overflowY: 'auto',
      animation: 'slideIn 0.2s ease',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--on-surface)' }}>
          Customer details
        </div>
        <button className="header-icon-btn" onClick={onClose}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
        </button>
      </div>

      <div style={{ fontSize: 28, fontWeight: 'bold', color: 'var(--accent-dim)', marginBottom: 20, fontFamily: 'var(--font-mono)' }}>
        {customer.id}
      </div>

      {[
        { label: 'Category', value: <span className={`badge ${getCategoryClass(customer.category)}`}>{customer.category}</span> },
        { label: 'Treatment Group', value: customer.treatment === 1 ? 'Treated (Discount)' : 'Control (No Discount)' },
        { label: 'Observed Outcome', value: customer.outcome },
        { label: 'Age', value: customer.age },
        { label: 'Region', value: customer.region },
        { label: 'Customer Tenure', value: customer.tenure },
        { label: 'Propensity Score', value: customer.propensityScore.toFixed(3) },
        { label: 'ITE (Causal Effect)', value: <span style={{ color: customer.ite >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{customer.ite >= 0 ? '+' : ''}{customer.ite.toFixed(3)}</span> },
        { label: 'Prescribed Discount', value: `$${customer.recommendedDiscount}` },
        { label: 'Expected Revenue Gain', value: `$${customer.expectedGain.toFixed(2)}` },
        { label: 'ROI Estimate', value: customer.recommendedDiscount > 0 ? `${customer.roi.toFixed(1)}%` : '0%' },
      ].map(row => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{row.label}</span>
          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{row.value}</span>
        </div>
      ))}

      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}

export default function CustomerAnalysis() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [treatment, setTreatment] = useState('all');
  const [sortField, setSortField] = useState('ite');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;

  // Fetch customers from backend whenever category, treatment, or search query changes
  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        setError(null);
        const res = await getCustomers({
          category,
          treatment: treatment === 'all' ? undefined : Number(treatment),
          search: search || undefined
        });
        if (res.success) {
          setCustomers(res.customers);
        }
      } catch (e) {
        console.error("Customers load error:", e);
        setError("Failed to load customer records from the API.");
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadCustomers();
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [category, treatment, search]);

  // Client-side sorting on retrieved records
  const sortedCustomers = useMemo(() => {
    const data = [...customers];
    data.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      const sign = sortDir === 'asc' ? 1 : -1;
      
      if (typeof fieldA === 'string') {
        return fieldA.localeCompare(fieldB) * sign;
      }
      return (fieldA > fieldB ? 1 : -1) * sign;
    });
    return data;
  }, [customers, sortField, sortDir]);

  const paged = sortedCustomers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sortedCustomers.length / PAGE_SIZE) || 1;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }) => (
    <span style={{ fontSize: 12, marginLeft: 4, color: sortField === field ? 'var(--accent-dim)' : 'var(--border)' }}>
      {sortDir === 'asc' && sortField === field ? '▲' : '▼'}
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
        <div className="kpi-card">
          <div className="kpi-label">Filtered Customers</div>
          <div className="kpi-value">{customers.length.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Persuadables Identified</div>
          <div className="kpi-value accent">
            {customers.filter(c => c.category === 'Persuadable').length.toLocaleString()}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Average Causal ITE</div>
          <div className="kpi-value success">
            {customers.length > 0 
              ? `+$${(customers.reduce((sum, c) => sum + c.ite, 0) / customers.length).toFixed(3)}` 
              : '$0.000'}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Targeted for discount</div>
          <div className="kpi-value">
            {customers.filter(c => c.recommendedDiscount > 0).length.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters Card */}
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
                placeholder="Search by Customer ID (CUST-xxxx)..."
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
            {customers.length} results
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div className="loading-spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
            <div style={{ color: 'var(--on-surface-var)', fontSize: 14 }}>Fetching database records...</div>
          </div>
        ) : error ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--danger)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, marginBottom: 12 }}>error</span>
            <div>{error}</div>
          </div>
        ) : paged.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined empty-state-icon">group</span>
            <div className="empty-state-title">No matching customers</div>
            <div className="empty-state-sub">Try adjusting search query or filters</div>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Group</th>
                    <th>Outcome</th>
                    <th onClick={() => handleSort('propensityScore')} style={{ cursor: 'pointer' }}>
                      Propensity Score <SortIcon field="propensityScore" />
                    </th>
                    <th onClick={() => handleSort('ite')} style={{ cursor: 'pointer' }}>
                      ITE (Effect) <SortIcon field="ite" />
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
                      <td>{c.recommendedDiscount > 0 ? `${c.roi.toFixed(1)}%` : '—'}</td>
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
          </>
        )}
      </div>

      {/* Customer Detail Drawer */}
      {selected && <CustomerDetailPanel customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
