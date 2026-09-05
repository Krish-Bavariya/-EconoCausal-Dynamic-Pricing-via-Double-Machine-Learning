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

export default function ITEDistribution({ x = [], height = 320 }) {
  const positive = x.filter(v => v >= 0);
  const negative = x.filter(v => v < 0);

  return (
    <div className="chart-container" style={{ height, width: '100%' }}>
      <Plot
        data={[
          {
            x: positive,
            type: 'histogram',
            name: 'Positive Effect',
            marker: { color: 'rgba(139,92,246,0.7)', line: { color: 'rgba(139,92,246,0.9)', width: 1 } },
            hovertemplate: 'ITE: %{x:.3f}<br>Count: %{y}<extra></extra>',
            nbinsx: 30,
          },
          {
            x: negative,
            type: 'histogram',
            name: 'Negative Effect',
            marker: { color: 'rgba(244,63,94,0.55)', line: { color: 'rgba(244,63,94,0.8)', width: 1 } },
            hovertemplate: 'ITE: %{x:.3f}<br>Count: %{y}<extra></extra>',
            nbinsx: 30,
          }
        ]}
        layout={{
          ...plotlyTheme,
          barmode: 'overlay',
          xaxis: {
            ...plotlyTheme.xaxis,
            title: { text: 'Individual Treatment Effect (ITE)', font: { size: 10, color: '#c6c6cd' } }
          },
          yaxis: {
            ...plotlyTheme.yaxis,
            title: { text: 'Customer Count', font: { size: 10, color: '#c6c6cd' } }
          },
          legend: { ...plotlyTheme.legend, x: 0.65, y: 0.98 },
          shapes: [{
            type: 'line',
            x0: 0, x1: 0,
            y0: 0, y1: 1,
            yref: 'paper',
            line: { color: '#94a3b8', width: 1, dash: 'dot' }
          }]
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </div>
  );
}
