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

export default function PropensityScore({ treated = [], control = [], height = 300 }) {
  return (
    <div className="chart-container" style={{ height, width: '100%' }}>
      <Plot
        data={[
          {
            x: treated,
            type: 'histogram',
            name: 'Treated',
            opacity: 0.7,
            nbinsx: 20,
            marker: { color: 'rgba(139,92,246,0.7)', line: { color: 'rgba(139,92,246,0.9)', width: 1 } },
            hovertemplate: 'Score: %{x:.2f}<br>Count: %{y}<extra></extra>',
          },
          {
            x: control,
            type: 'histogram',
            name: 'Control',
            opacity: 0.5,
            nbinsx: 20,
            marker: { color: 'rgba(188,199,222,0.55)', line: { color: 'rgba(188,199,222,0.8)', width: 1 } },
            hovertemplate: 'Score: %{x:.2f}<br>Count: %{y}<extra></extra>',
          }
        ]}
        layout={{
          ...plotlyTheme,
          barmode: 'overlay',
          xaxis: {
            ...plotlyTheme.xaxis,
            title: { text: 'Propensity Score', font: { size: 10, color: '#c6c6cd' } },
            range: [0, 1],
          },
          yaxis: {
            ...plotlyTheme.yaxis,
            title: { text: 'Customer Count', font: { size: 10, color: '#c6c6cd' } }
          },
          legend: { ...plotlyTheme.legend, x: 0.65, y: 0.98 },
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </div>
  );
}
