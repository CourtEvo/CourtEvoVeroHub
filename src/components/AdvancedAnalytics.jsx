import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import PlayerStatsBenchmark from './PlayerStatsBenchmark';
import CostEfficiencyChart from './CostEfficiencyChart';
import Recommendations from './Recommendations';
import AIInsights from './AIInsights';
import LLMInsight from './LLMInsight';

// Data examples
const seasonTrends = [
  { year: '2019', Retention: 87, "Skill Progression": 7.2 },
  { year: '2020', Retention: 89, "Skill Progression": 7.9 },
  { year: '2021', Retention: 91, "Skill Progression": 8.3 },
  { year: '2022', Retention: 92, "Skill Progression": 8.5 },
  { year: '2023', Retention: 93, "Skill Progression": 8.8 }
];

const playerPipeline = [
  { stage: "U10", count: 42 },
  { stage: "U12", count: 38 },
  { stage: "U14", count: 29 },
  { stage: "U16", count: 21 },
  { stage: "Senior", count: 12 }
];

const costEfficiencyData = [
  { club: "Your Club", costPerWin: 3400 },
  { club: "League Avg", costPerWin: 4200 },
  { club: "Top Club", costPerWin: 2900 }
];

const playerStatsData = [
  { name: "Player A", PPG: 16.1 },
  { name: "Player B", PPG: 14.3 },
  { name: "Player C", PPG: 10.9 },
  { name: "Player D", PPG: 18.0 }
];

const marketTrendsData = [
  { year: '2019', enrollments: 380, funding: 110 },
  { year: '2020', enrollments: 420, funding: 100 },
  { year: '2021', enrollments: 470, funding: 130 },
  { year: '2022', enrollments: 510, funding: 140 },
  { year: '2023', enrollments: 530, funding: 150 }
];

// Example stats for Recommendations
const clubStats = {
  retention: 89,
  costPerWin: 4000,
  skillProgression: 7.4
};
const marketStats = {
  retention: 92,
  costPerWin: 3700,
  skillProgression: 7.8
};

// --- Predictive Analytics Example --- //
function predictNextYearRetention(seasonTrends) {
  if (seasonTrends.length < 2) return null;
  const diffs = [];
  for (let i = 1; i < seasonTrends.length; i++) {
    diffs.push(seasonTrends[i].Retention - seasonTrends[i-1].Retention);
  }
  const avgDiff = diffs.reduce((a,b) => a+b, 0) / diffs.length;
  return +(seasonTrends[seasonTrends.length-1].Retention + avgDiff).toFixed(1);
}

const predictedRetention = predictNextYearRetention(seasonTrends);

const AdvancedAnalytics = () => (
  <section>
    <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 28, color: '#FFD700' }}>
      Advanced Club Analytics
    </h2>

    {/* Predictive Analytics (Next Year Retention) */}
    {predictedRetention && (
      <div style={{
        background: "#FFD70022",
        color: "#fff",
        padding: "12px 22px",
        borderRadius: 10,
        fontWeight: 700,
        fontSize: 18,
        marginBottom: 24,
        boxShadow: "0 2px 14px #FFD70055"
      }}>
        <span role="img" aria-label="crystal-ball">🔮</span>
        Projected retention for next year: <span style={{ color: "#27ef7d" }}>{predictedRetention}%</span>
      </div>
    )}

    {/* Your existing Season-over-Season Trends */}
    <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, marginBottom: 32 }}>
      <h3 style={{ color: '#FFD700', fontWeight: 600, fontSize: 22, marginBottom: 16 }}>Season-over-Season Trends</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={seasonTrends}>
          <CartesianGrid stroke="#33557733" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#fff', fontWeight: 600 }}
            stroke="#fff"
          />
          <YAxis
            domain={[80, 100]}
            tick={{ fill: '#fff', fontWeight: 600 }}
            stroke="#fff"
          />
          <Tooltip
            contentStyle={{ background: "#283E51", border: "1px solid #FFD700" }}
            itemStyle={{ color: "#FFD700" }}
          />
          <Legend wrapperStyle={{ color: '#fff', fontWeight: 700 }} />
          <Line type="monotone" dataKey="Retention" stroke="#FFD700" strokeWidth={3} />
          <Line type="monotone" dataKey="Skill Progression" stroke="#27ef7d" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* Player Pipeline */}
    <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, marginBottom: 32 }}>
      <h3 style={{ color: '#FFD700', fontWeight: 600, fontSize: 22, marginBottom: 16 }}>Player Pipeline</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={playerPipeline}>
          <CartesianGrid stroke="#33557733" />
          <XAxis
            dataKey="stage"
            tick={{ fill: '#fff', fontWeight: 600 }}
            stroke="#fff"
          />
          <YAxis
            tick={{ fill: '#fff', fontWeight: 600 }}
            stroke="#fff"
          />
          <Tooltip
            contentStyle={{ background: "#283E51", border: "1px solid #FFD700" }}
            itemStyle={{ color: "#FFD700" }}
          />
          <Bar dataKey="count" fill="#FFD700" barSize={30} />
          <Legend wrapperStyle={{ color: '#fff', fontWeight: 700 }} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 15, marginTop: 12, color: "#FFD700cc" }}>
        Visualize drop-off points and progression bottlenecks—target interventions where pipeline narrows.
      </div>
    </div>

    {/* Benchmarking & Cost Efficiency */}
    <PlayerStatsBenchmark />

    <CostEfficiencyChart />

    {/* AI-Driven Insights */}
<AIInsights
  seasonTrends={seasonTrends}
  costEfficiency={costEfficiencyData}
  playerStats={playerStatsData}
  marketTrends={marketTrendsData}
/>
<LLMInsight
  seasonTrends={seasonTrends}
  costEfficiency={costEfficiencyData}
  playerStats={playerStatsData}
  marketTrends={marketTrendsData}
/>
    

    {/* Automated Recommendations based on the above data */}
    <Recommendations club={clubStats} market={marketStats} />
  </section>
);

export default AdvancedAnalytics;
