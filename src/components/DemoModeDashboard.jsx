import React from "react";
const DemoModeDashboard = ({ onLoadDemoData }) => (
  <div style={{ padding: 40 }}>
    <h2>Demo Mode</h2>
    <button onClick={onLoadDemoData} style={{ fontWeight: 900 }}>Load Demo Data</button>
    <p>This will overwrite current session data with sample club data. For client demos, onboarding, or training.</p>
  </div>
);
export default DemoModeDashboard;
