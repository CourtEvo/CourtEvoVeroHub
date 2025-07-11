import React, { useState } from "react";
import { FaChartLine, FaCheckCircle, FaTimesCircle, FaBookOpen, FaUserAlt, FaFlag, FaUserGraduate } from "react-icons/fa";
import { ResponsiveContainer, Tooltip, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadarChart } from "recharts";
// Brand colors
const gold = "#FFD700", green = "#1de682", red = "#e24242", dark = "#232a2e";

// --- Pillars ---
const pillars = [
  "Physical",
  "Technical",
  "Tactical",
  "Mental",
  "Social/Emotional",
  "Academic/Career"
];

// --- Data for all phases/pillars (as in your table) ---
const phases = [
  {
    key: "foundation",
    name: "Foundation",
    age: "6-9",
    rows: [
      {
        pillar: "Physical",
        milestone: "Fundamental movement: run, jump, coordination",
        recommendation: "Fundamental movement: run, jump, coordination"
      },
      {
        pillar: "Technical",
        milestone: "Basic ball handling, passing, layups",
        recommendation: "Basic ball handling, passing, layups"
      },
      {
        pillar: "Tactical",
        milestone: "Understanding of space, simple rules",
        recommendation: "Understanding of space, simple rules"
      },
      {
        pillar: "Mental",
        milestone: "Enjoyment, focus, attention span",
        recommendation: "Enjoyment, focus, attention span"
      },
      {
        pillar: "Social/Emotional",
        milestone: "Teamwork, basic communication",
        recommendation: "Teamwork, basic communication"
      },
      {
        pillar: "Academic/Career",
        milestone: "School attendance, basic organization",
        recommendation: "School attendance, basic organization"
      }
    ]
  },
  {
    key: "learning",
    name: "Learning & Fun",
    age: "10-12",
    rows: [
      {
        pillar: "Physical",
        milestone: "Improved agility, balance, body control",
        recommendation: "Improved agility, balance, body control"
      },
      {
        pillar: "Technical",
        milestone: "Introduction to shooting technique",
        recommendation: "Introduction to shooting technique"
      },
      {
        pillar: "Tactical",
        milestone: "Team offense/defense basics",
        recommendation: "Team offense/defense basics"
      },
      {
        pillar: "Mental",
        milestone: "Building confidence, following instructions",
        recommendation: "Building confidence, following instructions"
      },
      {
        pillar: "Social/Emotional",
        milestone: "Inclusion, positive feedback",
        recommendation: "Inclusion, positive feedback"
      },
      {
        pillar: "Academic/Career",
        milestone: "Positive attitude toward school",
        recommendation: "Positive attitude toward school"
      }
    ]
  },
  {
    key: "youth",
    name: "Youth Development",
    age: "13-15",
    rows: [
      {
        pillar: "Physical",
        milestone: "Strength, stamina, growth monitoring",
        recommendation: "Strength, stamina, growth monitoring"
      },
      {
        pillar: "Technical",
        milestone: "Ball protection, dribbling under pressure",
        recommendation: "Ball protection, dribbling under pressure"
      },
      {
        pillar: "Tactical",
        milestone: "Defensive principles, spacing, reads",
        recommendation: "Defensive principles, spacing, reads"
      },
      {
        pillar: "Mental",
        milestone: "Coping with setbacks, self-motivation",
        recommendation: "Coping with setbacks, self-motivation"
      },
      {
        pillar: "Social/Emotional",
        milestone: "Leadership in small groups",
        recommendation: "Leadership in small groups"
      },
      {
        pillar: "Academic/Career",
        milestone: "Academic tracking",
        recommendation: "Academic tracking"
      }
    ]
  },
  {
    key: "advanced",
    name: "Advanced/Transition",
    age: "16-18",
    rows: [
      {
        pillar: "Physical",
        milestone: "Strength & conditioning, injury prevention",
        recommendation: "Strength & conditioning, injury prevention"
      },
      {
        pillar: "Technical",
        milestone: "Position-specific skill refinement",
        recommendation: "Position-specific skill refinement"
      },
      {
        pillar: "Tactical",
        milestone: "Advanced reads, transition play",
        recommendation: "Advanced reads, transition play"
      },
      {
        pillar: "Mental",
        milestone: "Goal-setting, mental toughness",
        recommendation: "Goal-setting, mental toughness"
      },
      {
        pillar: "Social/Emotional",
        milestone: "Peer mentorship, team cohesion",
        recommendation: "Peer mentorship, team cohesion"
      },
      {
        pillar: "Academic/Career",
        milestone: "Career planning, university prep",
        recommendation: "Career planning, university prep"
      }
    ]
  },
  {
    key: "professional",
    name: "Professional Preparation",
    age: "19-22",
    rows: [
      {
        pillar: "Physical",
        milestone: "Peak athleticism, recovery routines",
        recommendation: "Peak athleticism, recovery routines"
      },
      {
        pillar: "Technical",
        milestone: "Elite skill set, situational mastery",
        recommendation: "Elite skill set, situational mastery"
      },
      {
        pillar: "Tactical",
        milestone: "Pro-level schemes, advanced IQ",
        recommendation: "Pro-level schemes, advanced IQ"
      },
      {
        pillar: "Mental",
        milestone: "Handling pressure, visualization",
        recommendation: "Handling pressure, visualization"
      },
      {
        pillar: "Social/Emotional",
        milestone: "Media, agent relations",
        recommendation: "Media, agent relations"
      },
      {
        pillar: "Academic/Career",
        milestone: "Plan for pro/dual career",
        recommendation: "Plan for pro/dual career"
      }
    ]
  },
  {
    key: "lifeafter",
    name: "Life After Basketball",
    age: "Post-career",
    rows: [
      {
        pillar: "Physical",
        milestone: "Healthy lifestyle maintenance",
        recommendation: "Healthy lifestyle maintenance"
      },
      {
        pillar: "Technical",
        milestone: "Skill transfer to coaching or rec play",
        recommendation: "Skill transfer to coaching or rec play"
      },
      {
        pillar: "Tactical",
        milestone: "Game understanding for mentoring",
        recommendation: "Game understanding for mentoring"
      },
      {
        pillar: "Mental",
        milestone: "Identity beyond basketball",
        recommendation: "Identity beyond basketball"
      },
      {
        pillar: "Social/Emotional",
        milestone: "Community involvement",
        recommendation: "Community involvement"
      },
      {
        pillar: "Academic/Career",
        milestone: "Ongoing education, career transition",
        recommendation: "Ongoing education, career transition"
      }
    ]
  }
];

// Demo progress for each pillar/phase
const demoProgress = {
  Foundation: {
    Physical: { notes: "Still needs better balance.", completed: false },
    Technical: { notes: "Passing much improved!", completed: true },
    Tactical: { notes: "", completed: false },
    Mental: { notes: "Focused, but short attention span.", completed: false },
    "Social/Emotional": { notes: "", completed: false },
    "Academic/Career": { notes: "Attends school regularly.", completed: true }
  },
  "Learning & Fun": {
    Physical: { notes: "", completed: false },
    Technical: { notes: "First three-pointer made.", completed: true },
    Tactical: { notes: "Understands team roles.", completed: false },
    Mental: { notes: "", completed: false },
    "Social/Emotional": { notes: "Getting along well.", completed: true },
    "Academic/Career": { notes: "", completed: false }
  },
  "Youth Development": {
    Physical: { notes: "Grew 8 cm, strong improvement.", completed: true },
    Technical: { notes: "", completed: false },
    Tactical: { notes: "Working on spacing.", completed: false },
    Mental: { notes: "Motivation up!", completed: true },
    "Social/Emotional": { notes: "", completed: false },
    "Academic/Career": { notes: "", completed: false }
  },
  "Advanced/Transition": {
    Physical: { notes: "", completed: false },
    Technical: { notes: "", completed: false },
    Tactical: { notes: "", completed: false },
    Mental: { notes: "Goal-setting worksheet completed.", completed: true },
    "Social/Emotional": { notes: "", completed: false },
    "Academic/Career": { notes: "", completed: false }
  },
  "Professional Preparation": {
    Physical: { notes: "", completed: false },
    Technical: { notes: "Mastered step-back jumper.", completed: true },
    Tactical: { notes: "", completed: false },
    Mental: { notes: "", completed: false },
    "Social/Emotional": { notes: "", completed: false },
    "Academic/Career": { notes: "", completed: false }
  },
  "Life After Basketball": {
    Physical: { notes: "", completed: false },
    Technical: { notes: "", completed: false },
    Tactical: { notes: "", completed: false },
    Mental: { notes: "", completed: false },
    "Social/Emotional": { notes: "", completed: false },
    "Academic/Career": { notes: "", completed: false }
  }
};
const sampleProfile = {
  name: "Ivan Marković",
  pillars: [
    // Foundation, Learning & Fun, Youth Dev, Advanced, Prof, LifeAfter
    { pillar: "Physical", phases: [true, true, true, true, true, true] },
    { pillar: "Technical", phases: [true, true, true, true, true, true] },
    { pillar: "Tactical", phases: [false, true, true, true, true, true] },
    { pillar: "Mental", phases: [false, false, true, true, true, true] },
    { pillar: "Social/Emotional", phases: [true, true, true, true, false, true] },
    { pillar: "Academic/Career", phases: [true, true, true, true, true, true] }
  ]
};

// --- Sample Summary Table/Chart Data (demo) ---
// (Removed duplicate summaryData declaration)

// --- Intro/Manifesto Page ---
const pathwayIntro = (
  <div style={{
    background: "linear-gradient(120deg, #232a2e 88%, #23292f 100%)",
    borderRadius: 24,
    padding: "48px 30px",
    marginBottom: 44,
    boxShadow: "0 6px 28px #FFD70022"
  }}>
    <div style={{ textAlign: "center", marginBottom: 22 }}>
      <FaFlag size={55} color={gold} style={{ marginBottom: 6 }} />
      <h1 style={{ color: gold, fontWeight: 900, fontSize: 38, letterSpacing: 3, marginBottom: 8, marginTop: 0 }}>
        DEVELOPMENT PATHWAY
      </h1>
      <div style={{ fontSize: 24, color: "#fff", fontWeight: 700, letterSpacing: 1, marginBottom: 13 }}>
        Elite, Holistic, Long-term Basketball Development
      </div>
      <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 19, margin: "12px auto", maxWidth: 700 }}>
        “A structured, multi-phase progression with clear milestones, personalized targets, and a focus on holistic athlete growth.”
      </div>
    </div>
    <div style={{
      color: "#fff", fontWeight: 500, fontSize: 17, maxWidth: 780, margin: "0 auto"
    }}>
      <ul style={{ marginLeft: 28, marginBottom: 14 }}>
        <li>
          <b>Holistic, Long-term Approach:</b> The pathway is designed to build complete athletes over time, not just short-term performers.
        </li>
        <li>
          <b>Six Core Pillars:</b> <span style={{ color: green }}>Physical</span>, <span style={{ color: gold }}>Technical</span>, <span style={{ color: gold }}>Tactical</span>, <span style={{ color: red }}>Mental</span>, <span style={{ color: "#FFD700" }}>Social/Emotional</span>, <span style={{ color: "#1de682" }}>Academic/Career</span>.
        </li>
        <li>
          <b>Phase-by-Phase Progression:</b> Each age group/phase is mapped to clear milestones, targets, and recommendations—no guesswork, no shortcuts.
        </li>
        <li>
          <b>Progress Reviews:</b> Regular review with coaches, club leadership, and the player ensures accountability and individual growth.
        </li>
        <li>
          <b>CourtEvo Vero Principle:</b> Every player matters. <span style={{ color: "#FFD700" }}>We do not believe in shortcuts. True success is built step by step.</span>
        </li>
      </ul>
    </div>
    <div style={{ textAlign: "center", color: gold, fontWeight: 800, marginTop: 26, fontSize: 20 }}>
      <FaFlag size={19} style={{ marginBottom: "-3px", marginRight: 6 }} />
      “BE REAL. BE VERO.”
    </div>
  </div>
);
// --------- NEW: Sample Profile Component ----------
const renderSampleProfile = () => (
  <div style={{
    background: "#181e23e9",
    borderRadius: 19,
    padding: 29,
    marginBottom: 34,
    boxShadow: "0 2px 20px #FFD70022"
  }}>
    <div style={{ color: gold, fontWeight: 900, fontSize: 23, marginBottom: 7, display: "flex", alignItems: "center", gap: 9 }}>
      <FaUserGraduate color={gold} size={25} /> Sample Athlete Profile: <span style={{ color: "#fff", fontWeight: 800 }}>Ivan Marković</span>
    </div>
    <table style={{
      width: "100%",
      marginTop: 8,
      background: "transparent",
      borderRadius: 13,
      fontSize: 16,
      fontWeight: 700
    }}>
      <thead>
        <tr style={{ color: gold }}>
          <th>Pillar</th>
          <th>Foundation</th>
          <th>Learning & Fun</th>
          <th>Youth Dev</th>
          <th>Advanced</th>
          <th>Professional</th>
          <th>Life After</th>
        </tr>
      </thead>
      <tbody>
        {sampleProfile.pillars.map((row, idx) => (
          <tr key={row.pillar} style={{ background: idx % 2 === 0 ? "#23292f" : "#181e23" }}>
            <td style={{ color: "#1de682", fontWeight: 800 }}>{row.pillar}</td>
            {row.phases.map((val, col) =>
              <td key={col} style={{ textAlign: "center" }}>
                {val
                  ? <FaCheckCircle color={green} />
                  : <FaTimesCircle color={red} />}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --------- NEW: Summary Dashboard Component ----------
const summaryData = [
  { pillar: "Physical", Foundation: 1, Learning: 1, Youth: 1, Advanced: 1, Professional: 1, LifeAfter: 1 },
  { pillar: "Technical", Foundation: 1, Learning: 1, Youth: 1, Advanced: 1, Professional: 1, LifeAfter: 1 },
  { pillar: "Tactical", Foundation: 0, Learning: 1, Youth: 1, Advanced: 1, Professional: 1, LifeAfter: 1 },
  { pillar: "Mental", Foundation: 0, Learning: 0, Youth: 1, Advanced: 1, Professional: 1, LifeAfter: 1 },
  { pillar: "Social/Emotional", Foundation: 1, Learning: 1, Youth: 1, Advanced: 1, Professional: 0, LifeAfter: 1 },
  { pillar: "Academic/Career", Foundation: 1, Learning: 1, Youth: 1, Advanced: 1, Professional: 1, LifeAfter: 1 }
];
const radarData = summaryData.map(row => ({
  pillar: row.pillar,
  value: ["Foundation", "Learning", "Youth", "Advanced", "Professional", "LifeAfter"]
    .reduce((acc, k) => acc + (row[k] || 0), 0)
}));
const renderSummaryDashboard = () => (
  <div style={{
    background: "#181e23e9",
    borderRadius: 19,
    padding: 29,
    marginBottom: 34,
    boxShadow: "0 2px 20px #FFD70022"
  }}>
    <div style={{ color: gold, fontWeight: 900, fontSize: 23, marginBottom: 10 }}>
      <FaChartLine color={gold} size={22} style={{ marginRight: 6 }} />
      Summary Dashboard
    </div>
    {/* Table */}
    <table style={{
      width: "100%",
      background: "transparent",
      borderRadius: 13,
      fontSize: 15,
      fontWeight: 700,
      marginBottom: 24
    }}>
      <thead>
        <tr style={{ color: gold }}>
          <th>Pillar</th>
          <th>Foundation</th>
          <th>Learning & Fun</th>
          <th>Youth Dev</th>
          <th>Advanced</th>
          <th>Professional</th>
          <th>Life After</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {summaryData.map((row, idx) => (
          <tr key={row.pillar} style={{ background: idx % 2 === 0 ? "#23292f" : "#181e23" }}>
            <td style={{ color: "#1de682", fontWeight: 800 }}>{row.pillar}</td>
            <td style={{ textAlign: "center" }}>{row.Foundation ? <FaCheckCircle color={green} /> : <FaTimesCircle color={red} />}</td>
            <td style={{ textAlign: "center" }}>{row.Learning ? <FaCheckCircle color={green} /> : <FaTimesCircle color={red} />}</td>
            <td style={{ textAlign: "center" }}>{row.Youth ? <FaCheckCircle color={green} /> : <FaTimesCircle color={red} />}</td>
            <td style={{ textAlign: "center" }}>{row.Advanced ? <FaCheckCircle color={green} /> : <FaTimesCircle color={red} />}</td>
            <td style={{ textAlign: "center" }}>{row.Professional ? <FaCheckCircle color={green} /> : <FaTimesCircle color={red} />}</td>
            <td style={{ textAlign: "center" }}>{row.LifeAfter ? <FaCheckCircle color={green} /> : <FaTimesCircle color={red} />}</td>
            <td style={{ textAlign: "center", fontWeight: 900, color: gold }}>
              {
                [row.Foundation, row.Learning, row.Youth, row.Advanced, row.Professional, row.LifeAfter]
                  .reduce((acc, v) => acc + (v ? 1 : 0), 0)
              }
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {/* Radar/Spider Chart */}
    <div style={{
      width: "100%",
      minHeight: 330,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{ color: "#FFD700", fontWeight: 800, marginBottom: 12, fontSize: 20 }}>
        <FaChartLine style={{ marginRight: 6 }} />
        Development Pillars – Progress Radar
      </div>
      <ResponsiveContainer width="99%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#FFD70044" />
          <PolarAngleAxis dataKey="pillar" stroke={gold} fontSize={15} />
          <PolarRadiusAxis angle={30} domain={[0, 6]} tick={{ fill: "#fff" }} />
          <Radar name="Total" dataKey="value" stroke={green} fill={green} fillOpacity={0.34} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// --- Main Component ---
export default function AthleteDevelopmentPathway() {
  const [selectedPhase, setSelectedPhase] = useState(-1); // -1 = intro, 0 = first phase, etc.
  // State: editable progress notes and completed for each cell
  const [progress, setProgress] = useState(() => JSON.parse(JSON.stringify(demoProgress)));

  // Helper for table
  const getCellData = (phaseName, pillar) =>
    (progress[phaseName] && progress[phaseName][pillar]) || { notes: "", completed: false };

  // Update handler for cell edits
  const handleProgressEdit = (phaseName, pillar, field, value) => {
    setProgress(prev => ({
      ...prev,
      [phaseName]: {
        ...prev[phaseName],
        [pillar]: {
          ...prev[phaseName]?.[pillar],
          [field]: value
        }
      }
    }));
  };

  // The active phase object
  const activePhase = phases[selectedPhase] || null;

  return (
    <div style={{
      background: "linear-gradient(120deg, #232a2e 75%, #23292f 100%)",
      borderRadius: 38,
      boxShadow: "0 8px 48px #23292f44",
      color: "#fff",
      padding: 36,
      margin: "0 auto",
      maxWidth: 1500,
      minHeight: 1050,
      fontFamily: "Segoe UI, sans-serif"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 38 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <FaChartLine size={40} color={gold} />
          <span style={{ color: gold, fontWeight: 900, fontSize: 34, letterSpacing: 2 }}>
            ATHLETE DEVELOPMENT PATHWAY
          </span>
        </div>
        <div style={{
          background: "#FFD70022",
          color: "#FFD700",
          fontWeight: 800,
          fontSize: 18,
          borderRadius: 13,
          padding: "9px 22px"
        }}>
          COURTEVO VERO
        </div>
      </div>

      {/* Phase Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 17, flexWrap: "wrap" }}>
        <button
          key="intro"
          onClick={() => setSelectedPhase(-1)}
          style={{
            background: selectedPhase === -1 ? gold : "#23292f",
            color: selectedPhase === -1 ? "#232a2e" : gold,
            fontWeight: 700,
            border: "none",
            padding: "8px 22px",
            borderRadius: 13,
            fontSize: 18,
            transition: "0.13s",
            cursor: "pointer",
            boxShadow: selectedPhase === -1 ? "0 2px 10px #FFD70044" : undefined
          }}>
          Introduction
        </button>
        {phases.map((p, idx) => (
          <button
            key={p.name}
            onClick={() => setSelectedPhase(idx)}
            style={{
              background: idx === selectedPhase ? gold : "#23292f",
              color: idx === selectedPhase ? "#232a2e" : gold,
              fontWeight: 700,
              border: "none",
              padding: "8px 22px",
              borderRadius: 13,
              fontSize: 18,
              transition: "0.13s",
              cursor: "pointer",
              boxShadow: idx === selectedPhase ? "0 2px 10px #FFD70044" : undefined
            }}>
            {p.name} <span style={{ fontSize: 15, fontWeight: 500, marginLeft: 6, color: idx === selectedPhase ? "#232a2e" : "#FFD700bb" }}>({p.age})</span>
          </button>
        ))}
      </div>

      {/* --- Main Table --- */}
      {selectedPhase === -1 ? (
        pathwayIntro
      ) : (
        <div style={{
          background: "#181e23e9",
          borderRadius: 19,
          padding: 29,
          marginBottom: 34,
          boxShadow: "0 2px 20px #1de68222"
        }}>
          <div style={{ color: gold, fontWeight: 900, fontSize: 23, marginBottom: 12 }}>
            {activePhase.name} <span style={{ color: "#1de682", fontWeight: 600, fontSize: 19 }}>({activePhase.age})</span>
          </div>
          <table style={{
            width: "100%",
            background: "transparent",
            borderRadius: 13,
            fontSize: 17,
            fontWeight: 700,
            boxShadow: "0 1px 8px #FFD70014"
          }}>
            <thead>
              <tr style={{ color: gold, fontWeight: 900 }}>
                <th>Development Pillar</th>
                <th>Milestone / Target</th>
                <th>Recommendation</th>
                <th>Progress Notes</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {pillars.map((pillar, i) => {
                const row = activePhase.rows.find(r => r.pillar === pillar);
                const cellData = getCellData(activePhase.name, pillar);
                return (
                  <tr key={pillar} style={{ background: i % 2 === 0 ? "#23292f" : "#181e23" }}>
                    <td style={{ color: "#1de682", fontWeight: 800 }}>{pillar}</td>
                    <td>{row ? row.milestone : ""}</td>
                    <td style={{ color: gold }}>{row ? row.recommendation : ""}</td>
                    <td>
                      <input
                        type="text"
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          borderRadius: 9,
                          border: `2px solid ${gold}`,
                          background: "#181e23",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: 16
                        }}
                        placeholder="Add note..."
                        value={cellData.notes}
                        onChange={e => handleProgressEdit(activePhase.name, pillar, "notes", e.target.value)}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          handleProgressEdit(
                            activePhase.name,
                            pillar,
                            "completed",
                            !cellData.completed
                          )
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer"
                        }}>
                        {cellData.completed ? (
                          <FaCheckCircle color={green} size={23} />
                        ) : (
                          <FaTimesCircle color={red} size={23} />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Demo Progress Card */}
      <div style={{
        background: "#232a2e",
        borderRadius: 17,
        padding: 22,
        boxShadow: "0 2px 12px #FFD70022",
        color: "#FFD700cc",
        fontWeight: 800,
        margin: "24px auto 0 auto",
        maxWidth: 440
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
          <FaBookOpen size={23} color={gold} />
          <span style={{ color: gold, fontWeight: 900, fontSize: 18 }}>Sample Progress Note Demo</span>
        </div>
        <ul style={{ color: "#fff", marginTop: 5, fontWeight: 600 }}>
          <li>• Click in “Progress Notes” to edit notes for any pillar/phase</li>
          <li>• Click the check/cross to toggle completion status</li>
          <li>• All data instantly saved to session (not yet cloud)</li>
        </ul>
      </div>

      {renderSampleProfile()}
      {renderSummaryDashboard()}

      {/* Footer */}
      <div style={{
        borderTop: "2px solid #FFD700", marginTop: 36, paddingTop: 18,
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 19 }}>COURTEVO VERO</div>
        <div style={{ color: "#1de682", fontWeight: 700, fontSize: 16, fontStyle: "italic" }}>BE REAL. BE VERO.</div>
      </div>
    </div>
  );
}
