import React, { useState } from 'react';

// Example initiatives
const INITIATIVES = [
  { id: 1, name: "Launch New U12 Program" },
  { id: 2, name: "Upgrade Video Analytics Tools" },
  { id: 3, name: "Hire Sports Psychologist" },
  { id: 4, name: "Increase Community Events" }
];

const ActionPrioritizer = () => {
  const [ratings, setRatings] = useState({});

  const handleRating = (id, type, value) => {
    setRatings(prev => ({
      ...prev,
      [id]: { ...prev[id], [type]: Number(value) }
    }));
  };

  // Calculate a simple priority score (urgency * impact)
  const prioritized = INITIATIVES.map(i => ({
    ...i,
    urgency: ratings[i.id]?.urgency || 1,
    impact: ratings[i.id]?.impact || 1,
    score: ((ratings[i.id]?.urgency || 1) * (ratings[i.id]?.impact || 1))
  })).sort((a, b) => b.score - a.score);

  // Example next steps and ROI (could be expanded or data-driven)
  const getStepAndROI = name => {
    switch (name) {
      case "Launch New U12 Program":
        return { step: "Develop curriculum, assign coaches", roi: "Medium ROI (next season)" };
      case "Upgrade Video Analytics Tools":
        return { step: "Research vendors, run 1-month trial", roi: "High ROI (immediate)" };
      case "Hire Sports Psychologist":
        return { step: "Post job, interview, pilot sessions", roi: "Long-term ROI" };
      case "Increase Community Events":
        return { step: "Partner with schools, schedule first event", roi: "Medium ROI (community engagement)" };
      default:
        return { step: "Define next step", roi: "ROI TBD" };
    }
  };

  return (
    <section style={{ marginTop: 30 }}>
      <h2 style={{ color: "#FFD700", fontSize: 28, fontWeight: 700, marginBottom: 18 }}>
        Executive Action Prioritizer
      </h2>
      <table style={{ width: "100%", color: "#fff", borderSpacing: 0, marginBottom: 18 }}>
        <thead>
          <tr style={{ background: "#FFD70022" }}>
            <th style={{ padding: 10, textAlign: "left" }}>Initiative</th>
            <th style={{ padding: 10 }}>Urgency<br/>(1–5)</th>
            <th style={{ padding: 10 }}>Impact<br/>(1–5)</th>
            <th style={{ padding: 10 }}>Next Step</th>
            <th style={{ padding: 10 }}>ROI</th>
          </tr>
        </thead>
        <tbody>
          {prioritized.map(i => {
            const { step, roi } = getStepAndROI(i.name);
            return (
              <tr key={i.id} style={{
                background: i.score >= 20 ? "#27ef7d22" : i.score >= 9 ? "#FFD70022" : "rgba(255,255,255,0.04)",
                transition: 'background 0.3s'
              }}>
                <td style={{ padding: 10 }}>{i.name}</td>
                <td style={{ padding: 10 }}>
                  <input type="range" min={1} max={5} value={i.urgency}
                         onChange={e => handleRating(i.id, "urgency", e.target.value)} />
                  <span style={{ marginLeft: 8, fontWeight: 600 }}>{i.urgency}</span>
                </td>
                <td style={{ padding: 10 }}>
                  <input type="range" min={1} max={5} value={i.impact}
                         onChange={e => handleRating(i.id, "impact", e.target.value)} />
                  <span style={{ marginLeft: 8, fontWeight: 600 }}>{i.impact}</span>
                </td>
                <td style={{ padding: 10 }}>{step}</td>
                <td style={{ padding: 10, color: "#FFD700", fontWeight: 600 }}>{roi}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ fontSize: 15, color: "#FFD700cc" }}>
        Initiatives are ranked by priority (urgency × impact). Start with the highest score for fastest results!
      </div>
    </section>
  );
};

export default ActionPrioritizer;
