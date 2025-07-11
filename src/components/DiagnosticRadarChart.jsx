import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Sync these to your current diagnostic scores!
const data = [
  { area: "Athlete Dev", score: 8.5 },
  { area: "Coaching", score: 9.0 },
  { area: "Operations", score: 7.8 },
  { area: "Retention", score: 8.1 },
  { area: "Community", score: 7.5 }
];

const DiagnosticRadarChart = () => (
  <div style={{
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 32,
    marginBottom: 36,
    boxShadow: '0 2px 14px #FFD70022'
  }}>
    <h3 style={{ color: '#FFD700', fontSize: 24, fontWeight: 700, marginBottom: 18 }}>
      Club Performance Radar (CourtEvo Vero Diagnostic)
    </h3>
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="area" tick={{ fill: '#fff', fontWeight: 600 }} />
        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#FFD700', fontWeight: 500 }} />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#FFD700"
          fill="#FFD700"
          fillOpacity={0.4}
        />
        <Tooltip
          contentStyle={{ background: "#283E51", border: "1px solid #FFD700" }}
          itemStyle={{ color: "#FFD700" }}
        />
      </RadarChart>
    </ResponsiveContainer>
    <div style={{ fontSize: 15, marginTop: 18, color: "#FFD700cc" }}>
      <strong>Legend:</strong> 10 = Global Elite, 7–9 = On Track, 6 or lower = At Risk. <br />
      CourtEvo Vero Benchmarking, {new Date().getFullYear()}.
    </div>
  </div>
);

export default DiagnosticRadarChart;
