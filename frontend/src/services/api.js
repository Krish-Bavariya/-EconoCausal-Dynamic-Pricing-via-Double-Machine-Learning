// ============================================================
// EconoCausal — API Service Layer
// Connected directly to FastAPI backend routes
// ============================================================

const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

// Health check — GET /health
export const checkHealth = async () => {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) throw new Error('API health check failed');
  return await response.json();
};

// Get Dashboard KPIs — GET /dashboard
export const getDashboard = async () => {
  const response = await fetch(`${API_BASE}/dashboard`);
  if (!response.ok) throw new Error('Failed to fetch dashboard KPIs');
  return await response.json();
};

// Upload dataset — POST /upload
export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'Upload failed');
  }
  return await response.json();
};

// Validate dataset — POST /validate
export const validateDataset = async () => {
  const response = await fetch(`${API_BASE}/validate`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'Validation failed');
  }
  return await response.json();
};

// Run full causal analysis — POST /causal-analysis
export const runCausalAnalysis = async () => {
  const response = await fetch(`${API_BASE}/causal-analysis`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'Causal analysis failed');
  }
  return await response.json();
};

// Get ITE results — GET /ite
export const getITE = async () => {
  const response = await fetch(`${API_BASE}/ite`);
  if (!response.ok) throw new Error('Failed to fetch ITE scores');
  return await response.json();
};

// Get propensity scores — GET /propensity
export const getPropensity = async () => {
  const response = await fetch(`${API_BASE}/propensity`);
  if (!response.ok) throw new Error('Failed to fetch propensity scores');
  return await response.json();
};

// Run optimization — POST /optimization
export const runOptimization = async (params) => {
  const response = await fetch(`${API_BASE}/optimization`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      budget: Number(params?.budget ?? 50000),
      min_discount: Number(params?.min_discount ?? 0),
      max_discount: Number(params?.max_discount ?? 20),
      target_count: params?.target_count ? Number(params.target_count) : null,
      tiers: params?.tiers ? params.tiers.map(Number) : [0, 10, 20],
    }),
  });
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'Optimization failed');
  }
  return await response.json();
};

// Get customers — GET /customers
export const getCustomers = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== 'all') {
    params.append('category', filters.category);
  }
  if (filters.treatment !== undefined && filters.treatment !== 'all') {
    params.append('treatment', filters.treatment);
  }
  if (filters.search) {
    params.append('search', filters.search);
  }
  
  const response = await fetch(`${API_BASE}/customers?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch customers');
  return await response.json();
};

// Get reports — GET /reports
export const getReports = async () => {
  const response = await fetch(`${API_BASE}/reports`);
  if (!response.ok) throw new Error('Failed to fetch reports');
  return await response.json();
};

// Get system status — GET /monitoring
export const getSystemStatus = async () => {
  const response = await fetch(`${API_BASE}/monitoring`);
  if (!response.ok) throw new Error('Failed to fetch system monitoring status');
  return await response.json();
};
