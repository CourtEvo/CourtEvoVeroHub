import React from 'react';

const kpis = [
  { name: "Active Athletes", value: 142 },
  { name: "Certified Coaches", value: 12 },
  { name: "Weekly Sessions", value: 21 },
  { name: "Annual Events", value: 5 },
  { name: "Retention Rate", value: "93%" },
  { name: "Operational Health", value: "Excellent" }
];

const orgStructure = [
  { role: "Director of Basketball Operations", reports: ["Lead Coach", "Development Coach", "Team Coaches"] },
  { role: "Lead Coach", reports: ["Youth Coaches", "Specialist Coaches"] },
  { role: "Development Coach", reports: ["Athlete Mentors", "Performance Analysts"] },
  { role: "Team Coaches", reports: ["Athletes"] }
];

const ClubDashboard = () => (
  <section>
    <h2 style={{
      fontSize: 32,
      fontWeight: 700,
      marginBottom: 24,
      color: '#FFD700'
    }}>Club Dashboard</h2>

    {/* Vision & Mission */}
    <div style={{
      marginBottom: 32,
      background: 'rgba(255,255,255,0.04)',
      padding: 24,
      borderRadius: 18,
      border: '1px solid #FFD70022'
    }}>
      <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 10 }}>Vision</div>
      <div style={{ fontSize: 17, marginBottom: 14 }}>
        To set the gold standard in athlete and coach development, empowering every member to reach their potential—on and off the court.
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 10 }}>Mission</div>
      <div style={{ fontSize: 17 }}>
        Delivering world-class training, operational excellence, and a supportive community, all powered by CourtEvo Vero’s proprietary frameworks.
      </div>
    </div>

    {/* KPIs */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 22,
      marginBottom: 38
    }}>
      {kpis.map(kpi => (
        <div key={kpi.name} style={{
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 16,
          padding: 18,
          border: '1px solid #FFD70022',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 15, color: '#FFD700', fontWeight: 600 }}>{kpi.name}</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 7 }}>{kpi.value}</div>
        </div>
      ))}
    </div>

    {/* Org Structure */}
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      padding: 24,
      borderRadius: 14,
      border: '1px solid #FFD70022'
    }}>
      <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 14 }}>Organizational Structure</div>
      <ul style={{ marginLeft: 22, fontSize: 16 }}>
        {orgStructure.map(level => (
          <li key={level.role}>
            <span style={{ fontWeight: 600 }}>{level.role}</span>
            {level.reports && (
              <span style={{ color: "#FFD700" }}> → {level.reports.join(", ")}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default ClubDashboard;
