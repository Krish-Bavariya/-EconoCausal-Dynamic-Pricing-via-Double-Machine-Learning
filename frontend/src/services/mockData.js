// ============================================================
// EconoCausal — Centralized Mock Data Layer
// Replace this file's exports with real API calls when backend is ready
// ============================================================

// ------ CUSTOMERS ------
export const mockCustomers = Array.from({ length: 50 }, (_, i) => {
  const regions = ['North America', 'EMEA', 'APAC', 'LATAM'];
  const ite = parseFloat((Math.random() * 0.3 - 0.05).toFixed(3));
  const category =
    ite > 0.08 ? 'Persuadable'
    : ite > 0.02 ? 'Sure Thing'
    : ite < -0.01 ? 'Do Not Disturb'
    : 'Lost Cause';
  const propensity = parseFloat((0.2 + Math.random() * 0.6).toFixed(3));
  const discount = category === 'Persuadable' ? (ite > 0.15 ? 20 : 10) : 0;
  const gain = discount > 0 ? parseFloat((ite * discount * 10).toFixed(2)) : 0;
  return {
    id: `CUST-${8900 + i}`,
    treatment: Math.random() > 0.5 ? 1 : 0,
    outcome: Math.random() > 0.45 ? 'Purchase' : 'No Purchase',
    age: Math.floor(25 + Math.random() * 35),
    region: regions[Math.floor(Math.random() * regions.length)],
    tenure: `${Math.floor(1 + Math.random() * 48)} mo`,
    propensityScore: propensity,
    ite,
    category,
    recommendedDiscount: discount,
    expectedGain: gain,
    roi: discount > 0 ? parseFloat(((gain / discount) * 100).toFixed(1)) : 0,
  };
});

// Legacy alias used by CustomerTable
export const mockITEData = mockCustomers.slice(0, 6).map((c, i) => ({
  id: i + 1,
  name: ['Alice Smith', 'Bob Johnson', 'Charlie Brown', 'Diana Prince', 'Evan Wright', 'Fiona Gallagher'][i],
  tenure: c.tenure,
  baselineProb: c.propensityScore,
  ite: c.ite,
  status: c.category,
  recommendedDiscount: c.recommendedDiscount,
}));

// ------ ITE DISTRIBUTION CHART ------
export const iteDistributionData = [
  {
    x: mockCustomers.map(c => c.ite),
    type: 'histogram',
    nbinsx: 20,
    marker: {
      color: mockCustomers.map(c => (c.ite >= 0 ? '#8b5cf6' : '#f43f5e')),
      opacity: 0.85,
    },
    hovertemplate: 'ITE: %{x:.3f}<br>Count: %{y}<extra></extra>',
    name: 'ITE Distribution',
  },
];

// ------ UPLIFT CURVE ------
export const upliftCurveData = {
  x: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  y: [0, 18, 38, 54, 63, 68, 71, 73, 74, 74.5, 75],
  random_y: [0, 7.5, 15, 22.5, 30, 37.5, 45, 52.5, 60, 67.5, 75],
};

// ------ QINI CURVE ------
export const qiniCurveData = {
  x: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
  y: [0, 420, 820, 1150, 1400, 1580, 1700, 1780, 1820, 1840, 1850],
  random_y: [0, 185, 370, 555, 740, 925, 1110, 1295, 1480, 1665, 1850],
};

// ------ PROPENSITY SCORES ------
export const propensityScoreData = {
  treated: mockCustomers.filter(c => c.treatment === 1).map(c => c.propensityScore),
  control: mockCustomers.filter(c => c.treatment === 0).map(c => c.propensityScore),
};

// ------ TREATMENT EFFECT CATEGORIES ------
export const treatmentCategories = [
  { label: 'Persuadable', count: 5625, pct: 45, color: '#8b5cf6' },
  { label: 'Sure Thing', count: 2500, pct: 20, color: '#10b981' },
  { label: 'Lost Cause', count: 2500, pct: 20, color: '#f43f5e' },
  { label: 'Do Not Disturb', count: 1875, pct: 15, color: '#64748b' },
];

// ------ KPI SUMMARY ------
export const dashboardKPIs = {
  totalCustomers: 12500,
  treatmentCustomers: 6200,
  controlCustomers: 6300,
  ate: '+$4.20',
  marketingBudget: '$50,000',
  expectedRevenue: '$1.24M',
  expectedROI: '240%',
};

// ------ MODEL STATUS ------
export const modelStatus = {
  dmlModel: { label: 'DML Model Status', status: 'READY', color: 'success' },
  iteGeneration: { label: 'ITE Generation', status: 'COMPLETE', color: 'success' },
  propensityScore: { label: 'Propensity Score', status: 'VALIDATED', color: 'success' },
  causalValidation: { label: 'Causal Validation', status: 'PASSED', color: 'success' },
  lastAnalysis: '2026-08-23 14:32 UTC',
};

// ------ CAUSAL ANALYSIS KPIs ------
export const causalKPIs = {
  ate: '+$4.20',
  avgIte: '+$3.85',
  positivePct: 68,
  negativePct: 12,
};

// ------ REFUTATION TESTS ------
export const refutationTests = [
  { name: 'Random Common Cause Test', newEffect: '$4.18', status: 'Pass', detail: 'Effect change: -0.5%. Model is robust.' },
  { name: 'Placebo Treatment Test', newEffect: '$0.02', status: 'Pass', detail: 'Placebo effect near zero. Causality confirmed.' },
  { name: 'Data Subset Refuter', newEffect: '$4.11', status: 'Pass', detail: 'Stable on 80% data subset.' },
];

export const robustnessScore = 94;

// ------ OPTIMIZATION RESULTS ------
export const optimizationResults = {
  budget: 50000,
  allocated: 48750,
  expectedRevenue: 1240000,
  incrementalGain: 52400,
  roi: 207,
  customersTargeted: 3120,
  vsRandom: {
    revenueUplift: '+$84,200',
    roiImprovement: '+24%',
    customersTargeted: 3120,
    budgetUtilization: '97.5%',
  },
};

// Revenue comparison
export const revenueComparisonData = {
  labels: ['Optimized Causal', 'Random Targeting', 'No Campaign'],
  values: [1240000, 1155800, 1100000],
};

// ROI comparison
export const roiComparisonData = {
  labels: ['Optimized Causal', 'Random Targeting'],
  values: [207, 183],
};

// ------ SYSTEM STATUS ------
export const systemStatus = {
  api: { status: 'Online', latency: '42ms', requests: 1240, successRate: '99.8%' },
  model: { status: 'Loaded', version: 'v2.1.0', lastTrained: '2026-08-22' },
  data: { rows: 12500, columns: 14, missingValues: 0, duplicates: 52 },
  drift: { detected: false, severity: 'None', featuresAffected: 0 },
};

// ------ DATA PREVIEW ------
export const dataPreview = [
  { id: 'CUST-8901', treatment: 1, outcome: 'Purchase', age: 34, region: 'North America', lastPurchaseDays: 12 },
  { id: 'CUST-8902', treatment: 0, outcome: 'No Purchase', age: 45, region: 'EMEA', lastPurchaseDays: 89 },
  { id: 'CUST-8903', treatment: 1, outcome: 'No Purchase', age: 28, region: 'APAC', lastPurchaseDays: 4 },
  { id: 'CUST-8904', treatment: 0, outcome: 'Purchase', age: 52, region: 'North America', lastPurchaseDays: 120 },
  { id: 'CUST-8905', treatment: 1, outcome: 'Purchase', age: 31, region: 'EMEA', lastPurchaseDays: 18 },
];

// ------ PLOTLY THEME ------
export const plotlyTheme = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: { family: 'JetBrains Mono, Inter, sans-serif', color: '#c6c6cd', size: 11 },
  xaxis: {
    gridcolor: 'rgba(51,65,85,0.5)',
    zerolinecolor: 'rgba(51,65,85,0.8)',
    tickfont: { size: 10 },
  },
  yaxis: {
    gridcolor: 'rgba(51,65,85,0.5)',
    zerolinecolor: 'rgba(51,65,85,0.8)',
    tickfont: { size: 10 },
  },
  margin: { t: 16, r: 16, b: 40, l: 48 },
  legend: {
    bgcolor: 'transparent',
    font: { size: 11 },
  },
  autosize: true,
};
