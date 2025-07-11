import React from 'react';

// You can further split this into subcomponents if you want finer control/expansion

const stages = [
  {
    name: "Active Start",
    ages: "0-6",
    focus: [
      "Fundamental movements",
      "Fun physical activity",
      "No structured basketball"
    ]
  },
  {
    name: "FUNdamentals",
    ages: "6-9",
    focus: [
      "Physical literacy",
      "Basic dribbling, passing, shooting",
      "Games for fun and inclusion"
    ]
  },
  {
    name: "Learn to Train",
    ages: "9-12",
    focus: [
      "Major skill acquisition",
      "Positionless concepts",
      "Psychological skills: goal setting, focus"
    ]
  },
  {
    name: "Train to Train",
    ages: "12-16",
    focus: [
      "Technical & tactical introduction",
      "Athletic development",
      "Emphasis on individual improvement"
    ]
  },
  {
    name: "Train to Compete",
    ages: "15-18+",
    focus: [
      "Position refinement",
      "Competition exposure",
      "Individualized plans"
    ]
  },
  {
    name: "Learn to Win / Train to Win",
    ages: "18+",
    focus: [
      "High performance specialization",
      "Advanced tactics, analytics",
      "Leadership & pro habits"
    ]
  },
  {
    name: "Active for Life",
    ages: "Any",
    focus: [
      "Lifelong basketball involvement",
      "Transition to coaching/admin",
      "Physical activity for health"
    ]
  }
];

const AthleteDevelopment = () => (
  <section>
    <h2 style={{
      fontSize: 32,
      fontWeight: 700,
      marginBottom: 24,
      color: '#FFD700'
    }}>Athlete Development Pathway</h2>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 28
    }}>
      {stages.map((stage) => (
        <div key={stage.name} style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 20,
          boxShadow: '0 4px 18px 0 #0002',
          padding: 24,
          border: '1px solid #FFD70022',
          minHeight: 220
        }}>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{stage.name}</div>
          <div style={{ fontSize: 16, color: '#FFD700', marginBottom: 12 }}>{stage.ages} years</div>
          <ul style={{ fontSize: 16, marginLeft: 18, marginBottom: 0 }}>
            {stage.focus.map(point => <li key={point}>{point}</li>)}
          </ul>
        </div>
      ))}
    </div>
  </section>
);

export default AthleteDevelopment;
