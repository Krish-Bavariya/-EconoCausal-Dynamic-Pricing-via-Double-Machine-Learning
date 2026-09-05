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
  margin: { t: 10, r: 10, b: 40, l: 40 },
};

const DEFAULT = {
  x: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  y: [0, 480, 920, 1310, 1620, 1890, 2100, 2270, 2390, 2460, 2500],
  random_y: [0, 250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500],
};

export default function UpliftCurve({ height = 300, data }) {
  const curve = data ?? DEFAULT;

  return (
    <div className="chart-container" style={{ height, width: '100%' }}>
      <Plot
        data={[
          {
            x: curve.x,
            y: curve.y,
            type: 'scatter',
            mode: 'lines',
            name: 'Causal Model',
            line: { color: '#8b5cf6', width: 3 },
            fill: 'tozeroy',
            fillcolor: 'rgba(139,92,246,0.08)',
            hovertemplate: 'Top %{x}% targeted<br>Cumulative Uplift: %{y:.1f}<extra></extra>',
          },
          {
            x: curve.x,
            y: curve.random_y,
            type: 'scatter',
            mode: 'lines',
            name: 'Random Targeting',
            line: { color: '#64748b', width: 2, dash: 'dash' },
            hovertemplate: 'Top %{x}%<br>Random: %{y:.1f}<extra></extra>',
          }
        ]}
        layout={{
          ...plotlyTheme,
          xaxis: {
            ...plotlyTheme.xaxis,
            title: { text: 'Population Treated (%)', font: { size: 10, color: '#c6c6cd' } }
          },
          yaxis: {
            ...plotlyTheme.yaxis,
            title: { text: 'Cumulative Incremental Outcome', font: { size: 10, color: '#c6c6cd' } }
          },
          legend: { ...plotlyTheme.legend, x: 0.02, y: 0.98 }
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </div>
  );
}
