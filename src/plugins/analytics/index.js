// src/plugins/analytics/index.js
import React from 'react';
import { FaChartLine } from 'react-icons/fa';
import { registerPlugin } from '../../pluginSystem/pluginRegistry';

function AnalyticsView() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Advanced Analytics (Plugin!)</h2>
      {/* …your existing <AdvancedAnalytics /> content… */}
    </div>
  );
}

export function register() {
  registerPlugin({
    key: 'AdvancedAnalyticsPlugin',
    label: 'Advanced Analytics',
    icon: <FaChartLine />,
    // dynamic import for code-splitting
    loadView: React.lazy(() => import('./AnalyticsView'))
  });
}
