import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// Example data: from U14 to Pro
const flowData = [
  { stage: "U14", count: 45 },
  { stage: "U16", count: 30 },
  { stage: "U18", count: 18 },
  { stage: "Seniors", count: 10 },
  { stage: "Pro/College", count: 4 }
];

const TalentFlowChart = () => (
  <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, marginBottom: 32 }}>
    <h3 style={{ color: '#FFD700', fontWeight: 600, fontSize: 22, marginBottom: 16 }}>
      Talent Flow: Player Progression
    </h3>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={flowData} layout="vertical">
        <CartesianGrid stroke="#33557733" />
        <XAxis type="number" tick={{ fill: '#fff', fontWeight: 600 }} stroke="#fff" />
        <YAxis dataKey="stage" type="category" tick={{ fill: '#fff', fontWeight: 600 }} stroke="#fff" />
        <Tooltip
          contentStyle={{ background: "#283E51", border: "1px solid #FFD700" }}
          itemStyle={{ color: "#FFD700" }}
        />
        <Bar dataKey="count" fill="#FFD700" barSize={22} name="Players" />
        <Legend wrapperStyle={{ color: '#fff', fontWeight: 700 }} />
      </BarChart>
    </ResponsiveContainer>
    <div style={{ fontSize: 15, marginTop: 10, color: "#FFD700cc" }}>
      Shows player transition and drop-off from youth to pro/college level.
    </div>
  </div>
);

export default TalentFlowChart;
