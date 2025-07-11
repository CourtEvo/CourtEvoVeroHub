import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend, CartesianGrid } from 'recharts';

// Example cost efficiency data
const data = [
  { club: "Your Club", costPerWin: 3400 },
  { club: "League Avg", costPerWin: 4200 },
  { club: "Top Club", costPerWin: 2900 }
];

const leagueAvg = 4200;

const CostEfficiencyChart = () => (
  <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, marginBottom: 32 }}>
    <h3 style={{ color: '#FFD700', fontWeight: 600, fontSize: 22, marginBottom: 16 }}>
      Salary/Cost Efficiency
    </h3>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid stroke="#33557733" />
        <XAxis dataKey="club" tick={{ fill: '#fff', fontWeight: 600 }} stroke="#fff" />
        <YAxis tick={{ fill: '#fff', fontWeight: 600 }} stroke="#fff" />
        <Tooltip
          contentStyle={{ background: "#283E51", border: "1px solid #FFD700" }}
          itemStyle={{ color: "#FFD700" }}
        />
        <Bar dataKey="costPerWin" fill="#FFD700" barSize={30} name="€ per Win" />
        <ReferenceLine y={leagueAvg} label={{
          value: "League Avg",
          fill: '#27ef7d',
          fontWeight: 600,
          position: 'right'
        }} stroke="#27ef7d" strokeDasharray="4 2" />
        <Legend wrapperStyle={{ color: '#fff', fontWeight: 700 }} />
      </BarChart>
    </ResponsiveContainer>
    <div style={{ fontSize: 15, marginTop: 10, color: "#FFD700cc" }}>
      Your cost per win compared to the league average and top club efficiency.
    </div>
  </div>
);

export default CostEfficiencyChart;
