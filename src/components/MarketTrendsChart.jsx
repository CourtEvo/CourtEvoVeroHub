import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// Example trend: Enrollments and Funding
const marketTrends = [
  { year: '2019', enrollments: 380, funding: 110 },
  { year: '2020', enrollments: 420, funding: 100 },
  { year: '2021', enrollments: 470, funding: 130 },
  { year: '2022', enrollments: 510, funding: 140 },
  { year: '2023', enrollments: 530, funding: 150 }
];

const MarketTrendsChart = () => (
  <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, marginBottom: 32 }}>
    <h3 style={{ color: '#FFD700', fontWeight: 600, fontSize: 22, marginBottom: 16 }}>
      Market Trends: Enrollments & Funding
    </h3>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={marketTrends}>
        <CartesianGrid stroke="#33557733" />
        <XAxis dataKey="year" tick={{ fill: '#fff', fontWeight: 600 }} stroke="#fff" />
        <YAxis yAxisId="left" tick={{ fill: '#fff', fontWeight: 600 }} stroke="#fff" />
        <YAxis yAxisId="right" orientation="right" tick={{ fill: '#FFD700', fontWeight: 600 }} stroke="#FFD700" />
        <Tooltip
          contentStyle={{ background: "#283E51", border: "1px solid #FFD700" }}
          itemStyle={{ color: "#FFD700" }}
        />
        <Legend wrapperStyle={{ color: '#fff', fontWeight: 700 }} />
        <Line yAxisId="left" type="monotone" dataKey="enrollments" stroke="#FFD700" strokeWidth={3} name="Enrollments" />
        <Line yAxisId="right" type="monotone" dataKey="funding" stroke="#27ef7d" strokeWidth={3} name="Funding (€K)" />
      </LineChart>
    </ResponsiveContainer>
    <div style={{ fontSize: 15, marginTop: 10, color: "#FFD700cc" }}>
      Track club/community growth and financial evolution. Use trends for strategic planning and grant applications.
    </div>
  </div>
);

export default MarketTrendsChart;
