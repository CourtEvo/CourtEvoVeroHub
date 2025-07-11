import React from 'react';

const getRecommendations = (club, market) => {
  let recs = [];

  if (club.retention < market.retention) {
    recs.push({
      title: "Improve Player Retention",
      why: "Retention is below market median, risking long-term development and brand loyalty.",
      action: "Focus on onboarding programs, exit interviews, and individual follow-up with departing athletes."
    });
  }

  if (club.costPerWin > market.costPerWin) {
    recs.push({
      title: "Boost Cost Efficiency",
      why: "Your cost per win is above market average, impacting financial sustainability.",
      action: "Review staff allocation and player bonuses; optimize roster depth for value."
    });
  }

  if (club.skillProgression < market.skillProgression) {
    recs.push({
      title: "Accelerate Skill Progression",
      why: "Skill progression rates are lagging, limiting elite athlete output.",
      action: "Invest in specialized individual skill sessions and integrate video analytics."
    });
  }

  // Add as many logic blocks as you want for more KPIs

  return recs;
};

const Recommendations = ({ club, market }) => {
  const recs = getRecommendations(club, market);
  return (
    <section style={{ marginTop: 24 }}>
      <h3 style={{ color: '#FFD700', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
        CourtEvo Vero Recommendations
      </h3>
      {recs.length === 0 ? (
        <div style={{ color: "#27ef7d" }}>No urgent actions. Maintain your elite status!</div>
      ) : (
        <ul style={{ color: "#FFD700", fontSize: 16, listStyleType: 'none', padding: 0 }}>
          {recs.map((rec, idx) => (
            <li key={idx} style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 8,
              padding: 14,
              marginBottom: 12,
              borderLeft: '5px solid #FFD700'
            }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{rec.title}</div>
              <div style={{ fontStyle: 'italic', color: '#ffd700bb', marginBottom: 5 }}>{rec.why}</div>
              <div><strong>Action:</strong> {rec.action}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Recommendations;
