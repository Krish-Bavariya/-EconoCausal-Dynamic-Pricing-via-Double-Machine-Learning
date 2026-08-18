import React from 'react';
import Plot from 'react-plotly.js';
import { upliftCurveData } from '../utils/mockData';

export default function QiniCurve() {
  return (
    <div className="card">
      <h3 className="card-title">Qini Curve</h3>
      <div style={{ width: '100%', height: '300px' }}>
        <Plot
          data={[
            {
              x: upliftCurveData.x,
              y: upliftCurveData.y.map(y => y * 1.2), // Mock qini values
              type: 'scatter',
              mode: 'lines',
              name: 'Qini Model',
              line: { color: '#10b981', width: 3 }
            },
            {
              x: upliftCurveData.x,
              y: upliftCurveData.random_y,
              type: 'scatter',
              mode: 'lines',
              name: 'Random Targeting',
              line: { color: '#94a3b8', width: 2, dash: 'dash' }
            }
          ]}
          layout={{
            autosize: true,
            margin: { t: 10, l: 40, r: 10, b: 40 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: '#94a3b8' },
            xaxis: { title: 'Population Treated (%)' },
            yaxis: { title: 'Cumulative Incremental Revenue' },
            legend: { x: 0, y: 1 }
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          config={{ displayModeBar: false }}
        />
      </div>
    </div>
  );
}
