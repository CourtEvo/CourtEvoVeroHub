import React from 'react';

const stages = [
  {
    role: "Intro Coach",
    focus: [
      "Basic basketball rules",
      "Fundamental movement instruction",
      "Positive communication"
    ]
  },
  {
    role: "Youth Coach",
    focus: [
      "Skill development for children",
      "Organizing fun, inclusive practices",
      "Teaching physical literacy"
    ]
  },
  {
    role: "Development Coach",
    focus: [
      "Individual skill improvement",
      "Introduction to tactics",
      "Monitoring athlete growth and engagement"
    ]
  },
  {
    role: "Team Coach",
    focus: [
      "Implementing advanced drills",
      "Game preparation and in-game decisions",
      "Building team culture and accountability"
    ]
  },
  {
    role: "Elite Coach",
    focus: [
      "High-performance training design",
      "Data-driven player development",
      "Leadership & mentorship"
    ]
  },
  {
    role: "Director of Basketball Operations",
    focus: [
      "Strategic planning and oversight",
      "Coach mentoring and evaluation",
      "Club/academy-wide philosophy implementation"
    ]
  }
];

const CoachDevelopment = () => (
  <section>
    <h2 style={{
      fontSize: 32,
      fontWeight: 700,
      marginBottom: 24,
      color: '#FFD700'
    }}>Coach Development Pathway</h2>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 28
    }}>
      {stages.map((stage) => (
        <div key={stage.role} style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 20,
          boxShadow: '0 4px 18px 0 #0002',
          padding: 24,
          border: '1px solid #FFD70022',
          minHeight: 180
        }}>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{stage.role}</div>
          <ul style={{ fontSize: 16, marginLeft: 18, marginBottom: 0 }}>
            {stage.focus.map(point => <li key={point}>{point}</li>)}
          </ul>
        </div>
      ))}
    </div>
  </section>
);

export default CoachDevelopment;
