import React from 'react';

function analyzeTrends({ seasonTrends, costEfficiency, playerStats, marketTrends }) {
  let insights = [];

  // Example “AI” rules—expand for your data!
  if (seasonTrends && seasonTrends.length > 2) {
    const diff = seasonTrends[seasonTrends.length-1].Retention - seasonTrends[seasonTrends.length-2].Retention;
    if (diff > 0) {
      insights.push({
        title: "Retention on the Rise",
        text: `Retention increased by ${diff}% last year. This positive trend, if continued, will increase player pipeline resilience.`
      });
    } else if (diff < 0) {
      insights.push({
        title: "Retention Declined",
        text: `Retention fell by ${Math.abs(diff)}%. Investigate causes (competition, scheduling, coaching) and launch retention review.`
      });
    }
  }

  if (costEfficiency && costEfficiency[0].costPerWin < costEfficiency[1].costPerWin) {
    insights.push({
      title: "Above-Average Cost Efficiency",
      text: `Your club's cost per win (€${costEfficiency[0].costPerWin}) is better than the league average (€${costEfficiency[1].costPerWin}). Consider promoting this for sponsorships.`
    });
  }

  if (playerStats && playerStats.some(p => p.PPG > 15)) {
    const topScorer = playerStats.find(p => p.PPG > 15);
    insights.push({
      title: "High Impact Scorer",
      text: `${topScorer.name} averages over 15 PPG—leverage this player for both results and club branding.`
    });
  }

  if (marketTrends && marketTrends[marketTrends.length-1].enrollments > marketTrends[0].enrollments * 1.3) {
    insights.push({
      title: "Booming Market",
      text: "Enrollments have grown over 30% since 2019. Expand recruitment and community events to capture this growth."
    });
  }

  // Always include at least one insight
  if (insights.length === 0) {
    insights.push({
      title: "Stable Performance",
      text: "No extreme positive or negative outliers detected. Stay proactive and keep monitoring key indicators."
    });
  }

  return insights;
}

const AIInsights = ({ seasonTrends, costEfficiency, playerStats, marketTrends }) => {
  const insights = analyzeTrends({ seasonTrends, costEfficiency, playerStats, marketTrends });

  return (
    <section style={{
      background: "rgba(255,255,255,0.10)",
      borderRadius: 18,
      padding: 24,
      margin: "30px 0"
    }}>
      <h3 style={{ color: '#FFD700', fontWeight: 700, fontSize: 24, marginBottom: 12 }}>
        AI-Driven Insights <span role="img" aria-label="lightbulb">🤖</span>
      </h3>
      <ul style={{ color: "#FFD700", fontSize: 17, listStyleType: 'none', padding: 0 }}>
        {insights.map((ins, idx) => (
          <li key={idx} style={{
            marginBottom: 18,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 8,
            padding: 16,
            borderLeft: '5px solid #27ef7d'
          }}>
            <div style={{ fontWeight: 700 }}>{ins.title}</div>
            <div style={{ color: '#ffd700cc', fontSize: 16 }}>{ins.text}</div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AIInsights;
