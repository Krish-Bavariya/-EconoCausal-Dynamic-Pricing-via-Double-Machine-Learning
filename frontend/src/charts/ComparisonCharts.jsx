import React from 'react';
import Plot from 'react-plotly.js';

const plotlyTheme = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: { family: 'JetBrains Mono, monospace', size: 11, color: '#c6c6cd' },
  xaxis: {
    gridcolor: 'rgba(69,70,77,0.4)',
    linecolor: 'rgba(69,70,77,0.4)',
    tickfont: { size: 10, color: '#c6c6cd' },
    zerolinecolor: 'rgba(69,70,77,0.4)',
  },
  yaxis: {
    gridcolor: 'rgba(69,70,77,0.4)',
    linecolor: 'rgba(69,70,77,0.4)',
    tickfont: { size: 10, color: '#c6c6cd' },
    zerolinecolor: 'rgba(69,70,77,0.4)',
  },
  legend: { bgcolor: 'transparent', bordercolor: 'transparent', font: { color: '#c6c6cd', size: 10 } },
  margin: { t: 20, r: 20, b: 40, l: 50 },
};

const DEFAULT_REVENUE = { labels: ['Optimized Causal', 'Random Targeting', 'No Campaign'], values: [1475000, 1184000, 1100000] };
const DEFAULT_ROI = { labels: ['Optimized Causal', 'Random Targeting'], values: [207, 183] };

export function RevenueComparison({ height = 280, data }) {
  const labels = data?.labels ?? DEFAULT_REVENUE.labels;
  const values = data?.values ?? DEFAULT_REVENUE.values;

  return (
    <div className="chart-container" style={{ height }}>
      <Plot
        data={[{
          type: 'bar',
          x: labels,
          y: values,
          marker: { color: ['#8b5cf6', '#64748b', '#334155'], opacity: 0.85 },
          hovertemplate: '%{x}<br>Revenue: $%{y:,.0f}<extra></extra>',
          text: values.map(v => `$${(v / 1000).toFixed(0)}K`),
          textposition: 'outside',
          textfont: { family: 'JetBrains Mono', size: 11, color: '#c6c6cd' },
        }]}
        layout={{
          ...plotlyTheme,
          yaxis: {
            ...plotlyTheme.yaxis,
            title: { text: 'Revenue ($)', font: { size: 10, color: '#c6c6cd' } },
            tickformat: '$,.0f',
          },
          xaxis: { ...plotlyTheme.xaxis },
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </div>
  );
}

export function ROIComparison({ height = 280, data }) {
  const labels = data?.labels ?? DEFAULT_ROI.labels;
  const values = data?.values ?? DEFAULT_ROI.values;

  return (
    <div className="chart-container" style={{ height }}>
      <Plot
        data={[{
          type: 'bar',
          x: labels,
          y: values,
          marker: { color: ['#8b5cf6', '#64748b'], opacity: 0.85 },
          hovertemplate: '%{x}<br>ROI: %{y}%<extra></extra>',
          text: values.map(v => `${Number(v).toFixed(1)}%`),
          textposition: 'outside',
          textfont: { family: 'JetBrains Mono', size: 11, color: '#c6c6cd' },
        }]}
        layout={{
          ...plotlyTheme,
          yaxis: {
            ...plotlyTheme.yaxis,
            title: { text: 'ROI (%)', font: { size: 10, color: '#c6c6cd' } },
            ticksuffix: '%',
          },
          xaxis: { ...plotlyTheme.xaxis },
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </div>
  );
}
