import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import DiagnosticRadarChart from './DiagnosticRadarChart';

// Benchmarks for status (your proprietary standards)
const benchmarks = {
  "Athlete Development": 8.3,
  "Coaching Structure": 8.8,
  "Operational Efficiency": 8.0,
  "Player Retention": 8.0,
  "Community Engagement": 7.8
};

// Main diagnostic data (update scores/insights as needed)
const diagnostics = [
  {
    area: "Athlete Development",
    score: 8.5,
    insights: [
      "Skill progression and pathway design are market-leading.",
      "Opportunity: Expand psychological and cognitive skill tracking."
    ],
    recommendation: "Introduce mental training modules and monitor their impact quarterly.",
    story: "Your club's athlete development outperforms 90% of comparable organizations in the region."
  },
  {
    area: "Coaching Structure",
    score: 9.0,
    insights: [
      "Role clarity and internal clinics exceed best-practice benchmarks.",
      "Mentorship structure could be more formalized."
    ],
    recommendation: "Create a documented mentorship protocol and assign each new coach a mentor.",
    story: "You’re in the top 5% for coach education across European youth clubs."
  },
  {
    area: "Operational Efficiency",
    score: 7.8,
    insights: [
      "Resource use is above average.",
      "Potential: Streamline admin tasks for coaching staff."
    ],
    recommendation: "Deploy practice planning automation to free up coach hours for direct athlete work.",
    story: "You are better than 70% of peer clubs in operational workflow—but room to reach the elite tier."
  },
  {
    area: "Player Retention",
    score: 8.1,
    insights: [
      "Excellent youth retention. Some drop-off at transition points."
    ],
    recommendation: "Create a transition support program for U16–U18 athletes.",
    story: "Retention is a core strength; focus on late-stage transitions to reach the 95th percentile."
  },
  {
    area: "Community Engagement",
    score: 7.5,
    insights: [
      "Local visibility is good; alumni engagement could be scaled."
    ],
    recommendation: "Launch a quarterly alumni event and showcase stories in club media.",
    story: "Engagement is above the national median, with high potential for growth."
  }
];

// Elite status badge generator
function badge(score, area) {
  const bench = benchmarks[area];
  if (score >= bench + 0.5) return <span style={badgeStyle("#27ef7d")}>ELITE</span>;
  if (score >= bench) return <span style={badgeStyle("#ffd700")}>ON TRACK</span>;
  return <span style={badgeStyle("#ff725c")}>AT RISK</span>;
}

function badgeStyle(color) {
  return {
    display: 'inline-block',
    marginLeft: 8,
    fontWeight: 700,
    fontSize: 15,
    background: color,
    color: '#222',
    borderRadius: 6,
    padding: '2px 12px'
  };
}

const DiagnosticToolkit = () => {
  const printRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `CourtEvoVero_Diagnostic_${new Date().toISOString().slice(0,10)}`
  });

  return (
    <section>
      {/* Export Button */}
      <button onClick={handlePrint}
        style={{
          background: "#FFD700",
          color: "#222",
          fontWeight: 700,
          border: "none",
          borderRadius: 7,
          padding: "8px 18px",
          fontSize: 17,
          cursor: "pointer",
          boxShadow: "0 2px 8px #FFD70033",
          marginBottom: 16,
          float: "right"
        }}>
        Export Diagnostic PDF
      </button>
      <div ref={printRef}>
        {/* Radar Chart */}
        <DiagnosticRadarChart />

        {/* Diagnostic Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32
        }}>
          {diagnostics.map(diag => (
            <div key={diag.area} style={{
              background: 'rgba(255,255,255,0.07)',
              borderRadius: 20,
              padding: 24,
              border: '1px solid #FFD70022',
              minHeight: 250,
              boxShadow: '0 2px 12px 0 #0002',
              marginTop: 8
            }}>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                {diag.area}
                {badge(diag.score, diag.area)}
              </div>
              <div style={{
                fontSize: 26,
                fontWeight: 700,
                marginBottom: 5,
                color: diag.score >= 8.5 ? "#27ef7d" : diag.score >= 8 ? "#ffd700" : "#ff725c"
              }}>
                Score: {diag.score}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Insight:</strong>
                <ul style={{ fontSize: 16, marginLeft: 18, marginBottom: 0 }}>
                  {diag.insights.map(insight => (
                    <li key={insight}>{insight}</li>
                  ))}
                </ul>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>What CourtEvo Vero Recommends:</strong> <br />
                {diag.recommendation}
              </div>
              <div style={{ fontStyle: 'italic', color: '#FFD700', marginTop: 4 }}>
                {diag.story}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ clear: "both" }} />
    </section>
  );
};

export default DiagnosticToolkit;
