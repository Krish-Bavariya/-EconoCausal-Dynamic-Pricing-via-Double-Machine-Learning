import React from 'react';
import Plot from 'react-plotly.js';
import { iteDistributionData } from '../utils/mockData';

export default function ITEDistribution() {
  return (
    <div className="card">
      <h3 className="card-title">Individual Treatment Effect (ITE) Distribution</h3>
      <div style={{ width: '100%', height: '300px' }}>
        <Plot
          data={iteDistributionData}
          layout={{
            autosize: true,
            margin: { t: 10, l: 40, r: 10, b: 40 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: '#94a3b8' },
            xaxis: { title: 'Treatment Effect (Prob Increase)' },
            yaxis: { title: 'Customer Count' }
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          config={{ displayModeBar: false }}
        />
      </div>
    </div>
  );
}
