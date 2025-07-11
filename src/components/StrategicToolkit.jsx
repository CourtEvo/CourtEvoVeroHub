import React from 'react';

const goals = [
  {
    area: "Player Development",
    objectives: [
      "Implement updated development pathway for all age groups",
      "Increase skill assessment frequency",
      "Expand individualized training plans"
    ],
    status: "On Track"
  },
  {
    area: "Coach Education",
    objectives: [
      "Quarterly internal clinics",
      "All coaches certified in CourtEvo Vero methodology",
      "Launch mentorship program"
    ],
    status: "Needs Attention"
  },
  {
    area: "Operations",
    objectives: [
      "Automate practice planning",
      "Monthly review of resource allocation",
      "Optimize training-to-game ratio"
    ],
    status: "Ahead of Plan"
  },
  {
    area: "Community/Outreach",
    objectives: [
      "Host 2 community basketball days/year",
      "Partner with local schools for camps",
      "Launch parent education series"
    ],
    status: "On Track"
  }
];

const StrategicToolkit = () => (
  <section>
    <h2 style={{
      fontSize: 32,
      fontWeight: 700,
      marginBottom: 24,
      color: '#FFD700'
    }}>Strategic Planning Toolkit</h2>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 32
    }}>
      {goals.map((goal) => (
        <div key={goal.area} style={{
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 20,
          padding: 24,
          border: '1px solid #FFD70022',
          minHeight: 200,
          boxShadow: '0 2px 12px 0 #0002'
        }}>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>
            {goal.area}
          </div>
          <ul style={{ fontSize: 16, marginLeft: 18 }}>
            {goal.objectives.map(obj => (
              <li key={obj}>{obj}</li>
            ))}
          </ul>
          <div style={{
            marginTop: 16,
            fontWeight: 600,
            color:
              goal.status === "On Track"
                ? "#27ef7d"
                : goal.status === "Ahead of Plan"
                ? "#48b5ff"
                : "#ffd700"
          }}>
            Status: {goal.status}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default StrategicToolkit;
