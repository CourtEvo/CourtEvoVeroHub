import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend, CartesianGrid } from 'recharts';

// Example player data
const data = [
  { name: "Player A", PPG: 16.1 },
  { name: "Player B", PPG: 14.3 },
  { name: "Player C", PPG: 10.9 },
  { name: "Player D", PPG: 18.0 }
];

const regionAvg = 12.5; // Example benchmark

const PlayerStatsBenchmark = () => (
  <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, marginBottom: 32 }}>
    <h3 style={{ color: '#FFD700', fontWeight: 600, fontSize: 22, marginBottom: 16 }}>
      Player Stats Benchmarking
    </h3>
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid stroke="#33557733" />
        <XAxis dataKey="name" tick={{ fill: '#fff', fontWeight: 600 }} stroke="#fff" />
        <YAxis tick={{ fill: '#fff', fontWeight: 600 }} stroke="#fff" />
        <Tooltip
          contentStyle={{ background: "#283E51", border: "1px solid #FFD700" }}
          itemStyle={{ color: "#FFD700" }}
        />
        <Bar dataKey="PPG" fill="#FFD700" barSize={30} name="Points Per Game" />
        <ReferenceLine y={regionAvg} label={{
          value: "Region Avg",
          fill: '#27ef7d',
          fontWeight: 600,
          position: 'right'
        }} stroke="#27ef7d" strokeDasharray="4 2" />
        <Legend wrapperStyle={{ color: '#fff', fontWeight: 700 }} />
      </BarChart>
    </ResponsiveContainer>
    <div style={{ fontSize: 15, marginTop: 12, color: "#FFD700cc" }}>
      <span style={{ color: '#FFD700', fontWeight: 600 }}>Gold bars:</span> Your players<br />
      <span style={{ color: '#27ef7d', fontWeight: 600 }}>Green line:</span> Regional average
    </div>
  </div>
);

export default PlayerStatsBenchmark;
