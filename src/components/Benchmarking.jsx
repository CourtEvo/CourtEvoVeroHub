import React from 'react';

const clubData = {
  name: "Your Club",
  diagnostics: {
    "Athlete Development": 8.5,
    "Coaching Structure": 9.0,
    "Operational Efficiency": 7.8,
    "Player Retention": 8.1,
    "Community Engagement": 7.5
  }
};

// Your proprietary market data
const marketBenchmarks = {
  elite: {
    "Athlete Development": 8.8,
    "Coaching Structure": 9.2,
    "Operational Efficiency": 8.5,
    "Player Retention": 8.6,
    "Community Engagement": 8.2
  },
  median: {
    "Athlete Development": 7.2,
    "Coaching Structure": 7.5,
    "Operational Efficiency": 6.8,
    "Player Retention": 7.1,
    "Community Engagement": 6.9
  }
};

function getStatus(club, elite, median) {
  if (club >= elite - 0.2) return { label: "Elite Tier", color: "#27ef7d" };
  if (club >= median) return { label: "On Track", color: "#FFD700" };
  return { label: "Below Market", color: "#ff725c" };
}

const Benchmarking = () => (
  <section>
    <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: '#FFD700' }}>
      Club Benchmarking Report
    </h2>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 28
    }}>
      {Object.keys(clubData.diagnostics).map(area => {
        const score = clubData.diagnostics[area];
        const elite = marketBenchmarks.elite[area];
        const median = marketBenchmarks.median[area];
        const status = getStatus(score, elite, median);
        return (
          <div key={area} style={{
            background: 'rgba(255,255,255,0.07)',
            borderRadius: 20,
            padding: 24,
            border: '1px solid #FFD70022',
            minHeight: 160,
            boxShadow: '0 2px 12px 0 #0002'
          }}>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
              {area}
            </div>
            <div style={{
              fontSize: 25,
              fontWeight: 700,
              color: status.color,
              marginBottom: 5
            }}>
              {score} <span style={{
                marginLeft: 12,
                fontSize: 16,
                background: status.color,
                color: '#222',
                borderRadius: 6,
                padding: '2px 10px',
                fontWeight: 600
              }}>{status.label}</span>
            </div>
            <div style={{ fontSize: 14, color: '#FFD700' }}>
              Elite: {elite} | Median: {median}
            </div>
            <div style={{ fontSize: 15, color: "#fff", marginTop: 8 }}>
              {status.label === "Elite Tier" && "You are among the best in the market—defend your position!"}
              {status.label === "On Track" && "Your performance is above average—target elite metrics for full potential."}
              {status.label === "Below Market" && "Opportunity for rapid gains—target elite benchmarks in your strategic plan."}
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

export default Benchmarking;
