export const mockITEData = [
  { id: 1, name: 'Alice Smith', tenure: '2 years', baselineProb: 0.1, ite: 0.15, status: 'Persuadable', recommendedDiscount: 20 },
  { id: 2, name: 'Bob Johnson', tenure: '5 years', baselineProb: 0.8, ite: 0.01, status: 'Sure Thing', recommendedDiscount: 0 },
  { id: 3, name: 'Charlie Brown', tenure: '1 month', baselineProb: 0.05, ite: 0.02, status: 'Lost Cause', recommendedDiscount: 0 },
  { id: 4, name: 'Diana Prince', tenure: '3 years', baselineProb: 0.9, ite: -0.05, status: 'Sleeping Dog', recommendedDiscount: 0 },
  { id: 5, name: 'Evan Wright', tenure: '6 months', baselineProb: 0.2, ite: 0.12, status: 'Persuadable', recommendedDiscount: 10 },
  { id: 6, name: 'Fiona Gallagher', tenure: '1 year', baselineProb: 0.3, ite: 0.18, status: 'Persuadable', recommendedDiscount: 20 },
];

export const iteDistributionData = [
  {
    x: mockITEData.map(d => d.ite),
    type: 'histogram',
    marker: { color: '#4f46e5' },
    opacity: 0.7,
  }
];

// Mock curve data
export const upliftCurveData = {
  x: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  y: [0, 15, 35, 50, 60, 65, 68, 70, 71, 71.5, 72],
  random_y: [0, 7.2, 14.4, 21.6, 28.8, 36, 43.2, 50.4, 57.6, 64.8, 72]
};
