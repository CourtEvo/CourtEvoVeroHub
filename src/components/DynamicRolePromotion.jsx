import React, { useState } from "react";
import {
  FaUserTie, FaArrowCircleUp, FaLightbulb, FaUserCheck, FaExclamationTriangle, FaFilePdf, FaClock, FaTrophy
} from "react-icons/fa";

// --- Demo Data ---
const athletes = [
  {
    name: "Petar Horvat",
    currentRole: "U15 - Combo Guard",
    performance: "Above Average",
    feedback: "Shows strong leadership, improving defense, high basketball IQ.",
    promotionReady: true,
    readinessScore: 88, // out of 100
    nextRole: "U16 - Starting Point Guard",
    promotionTrigger: "Demonstrated leadership in high-pressure games.",
    focus: "Refine pick-and-roll decision making, vocal team guidance.",
    timeInRole: 8, // months
    fastTrack: 6, // months typical for fastest path
    risk: "None",
    story: [
      { date: "2024-11", role: "U14 - Shooting Guard", note: "Top scorer, but struggled with ball-handling" },
      { date: "2025-01", role: "U15 - Combo Guard", note: "Adapted to primary ball-handler, improved assists" }
    ],
    coachNotes: "Petar is a natural leader; promotion could be accelerated if communication remains strong."
  },
  {
    name: "Ivan Petrovic",
    currentRole: "U16 - Center",
    performance: "Inconsistent",
    feedback: "Dominates physically but foul trouble and stamina issues persist.",
    promotionReady: false,
    readinessScore: 59,
    nextRole: "U17 - Stretch Big (if stamina improves)",
    promotionTrigger: "Stamina and discipline must improve.",
    focus: "Conditioning, foul management, recovery routines.",
    timeInRole: 14,
    fastTrack: 8,
    risk: "Stagnation",
    story: [
      { date: "2024-10", role: "U15 - Backup Center", note: "Improved rebounding, but low playing time" },
      { date: "2025-02", role: "U16 - Center", note: "Increased minutes, mixed performances" }
    ],
    coachNotes: "Ivan may need a micro-goal approach. Consider mentorship pairing."
  },
  {
    name: "Luka Marinović",
    currentRole: "U14 - Small Forward",
    performance: "Outstanding",
    feedback: "Elite work rate, strong transition play, needs shooting consistency.",
    promotionReady: true,
    readinessScore: 95,
    nextRole: "U15 - Wing/Defensive Stopper",
    promotionTrigger: "Consistently grades out as top in physical/mental tests.",
    focus: "Shooting reps, defensive rotations, peer leadership.",
    timeInRole: 4,
    fastTrack: 6,
    risk: "None",
    story: [
      { date: "2025-03", role: "U13 - Guard", note: "Led team in steals, energy player" },
      { date: "2025-08", role: "U14 - Small Forward", note: "Transitioned to larger role, embraced defense" }
    ],
    coachNotes: "Luka thrives on challenge. Can skip to advanced drills."
  }
];

// --- Progress Bar ---
function ReadinessBar({ score }) {
  const bg = score >= 85 ? "#1de682" : score >= 70 ? "#FFD700" : "#e82e2e";
  return (
    <div style={{ width: 220, background: "#181e23", borderRadius: 7, height: 16, marginTop: 2 }}>
      <div style={{
        width: `${score}%`,
        height: 16,
        background: bg,
        borderRadius: 7,
        textAlign: "right",
        fontWeight: 900,
        color: "#222",
        fontSize: 13,
        lineHeight: "16px"
      }}>
        <span style={{
          paddingRight: 7,
          color: "#222",
          fontWeight: 900
        }}>{score}</span>
      </div>
    </div>
  );
}

// --- PDF Export Dummy ---
function handleExport() {
  alert("PDF export coming soon! (Wire to backend/print for production)");
}

export default function DynamicRolePromotion() {
  const [selected, setSelected] = useState(0);
  const athlete = athletes[selected];
  const atRisk = athlete.risk !== "None";
  const tooLong = athlete.timeInRole > athlete.fastTrack + 3;

  return (
    <div>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 10 }}>
        Dynamic Role & Promotion Predictor <FaArrowCircleUp style={{ marginLeft: 8, color: "#1de682", verticalAlign: -2, fontSize: 28 }} />
        <button
          onClick={handleExport}
          style={{
            float: "right",
            background: "#FFD700",
            color: "#232a2e",
            border: "none",
            borderRadius: 8,
            padding: "8px 20px",
            fontWeight: 800,
            fontSize: 15,
            boxShadow: "0 2px 8px #FFD70044",
            marginTop: 3,
            cursor: "pointer",
            transition: "background 0.18s"
          }}
        >
          <FaFilePdf style={{ marginRight: 8 }} /> Export PDF
        </button>
      </h2>

      <div style={{
        background: "#232a2e",
        borderRadius: 16,
        padding: "32px 38px 28px 38px",
        boxShadow: "0 2px 22px #FFD70022",
        marginBottom: 18,
        color: "#fff"
      }}>
        <div style={{ fontSize: 17, marginBottom: 8 }}>
          <FaUserTie color="#FFD700" style={{ marginRight: 8, fontSize: 20, verticalAlign: -3 }} />
          <b>Current Role:</b> {athlete.currentRole}
        </div>
        <div style={{ fontSize: 15, marginBottom: 7 }}>
          <b>Performance Level:</b>{" "}
          <span style={{ color: "#1de682", fontWeight: 700 }}>{athlete.performance}</span>
        </div>
        <div style={{ fontSize: 15, marginBottom: 7 }}>
          <b>Coach Feedback:</b> <span style={{ color: "#FFD700" }}>{athlete.feedback}</span>
        </div>
        <div style={{ fontSize: 15, marginBottom: 10, display: "flex", alignItems: "center", gap: 18 }}>
          <b>Promotion Readiness:</b>
          <ReadinessBar score={athlete.readinessScore} />
          {athlete.promotionReady
            ? <span style={{ color: "#1de682", fontWeight: 800, marginLeft: 10 }}>
                <FaUserCheck style={{ marginRight: 7 }} /> Ready
              </span>
            : <span style={{ color: "#FFD700", fontWeight: 800, marginLeft: 10 }}>
                <FaExclamationTriangle style={{ marginRight: 7 }} /> Needs Improvement
              </span>
          }
        </div>
        <div style={{ fontSize: 15, marginBottom: 10 }}>
          <b>Predicted Next Role:</b>{" "}
          <span style={{ color: "#FFD700", fontWeight: 700 }}>{athlete.nextRole}</span>
        </div>
        <div style={{ fontSize: 15, marginBottom: 7 }}>
          <b>Promotion Trigger:</b> <span style={{ color: "#1de682" }}>{athlete.promotionTrigger}</span>
        </div>
        <div style={{ fontSize: 15, marginBottom: 7 }}>
          <b>Development Focus:</b> <span style={{ color: "#FFD700" }}>{athlete.focus}</span>
        </div>
        <div style={{ fontSize: 15, marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
          <b>Time in Current Role:</b> <span style={{
            color: tooLong ? "#e82e2e" : "#1de682",
            fontWeight: 700
          }}>{athlete.timeInRole} months</span>
          <span style={{
            color: "#fff",
            fontSize: 13,
            background: "#181e23",
            borderRadius: 6,
            padding: "2px 8px"
          }}>
            Fast Track: {athlete.fastTrack} months
          </span>
          {tooLong && (
            <span style={{
              color: "#e82e2e",
              fontWeight: 900,
              marginLeft: 6
            }}>
              (Attention: Slow Progress)
            </span>
          )}
        </div>
        {atRisk && (
          <div style={{
            background: "#e82e2e",
            color: "#fff",
            borderRadius: 8,
            padding: "9px 18px",
            marginTop: 6,
            fontWeight: 700,
            fontSize: 14,
            boxShadow: "0 1px 8px #e82e2e44"
          }}>
            <FaExclamationTriangle style={{ marginRight: 7 }} />
            <span>Risk: {athlete.risk}</span>
          </div>
        )}
      </div>

      <div style={{
        background: "#181e23",
        borderRadius: 14,
        padding: "17px 22px",
        marginBottom: 18,
        color: "#FFD700"
      }}>
        <FaLightbulb style={{ marginRight: 7 }} />
        <b>Actionable Suggestions:</b>
        <ul style={{ marginLeft: 20, color: "#fff", marginTop: 7 }}>
          {athlete.promotionReady
            ? <li>Initiate promotion process for next role in squad management system.</li>
            : <li>Assign targeted training plan and regular review to address barriers.</li>
          }
          {athlete.risk === "Stagnation" && (
            <li>Schedule parent-coach-athlete meeting to boost engagement and set micro-goals.</li>
          )}
          {tooLong && (
            <li>Consider alternative role or competitive environment to re-energize development.</li>
          )}
        </ul>
      </div>

      <div style={{
        background: "#232a2e",
        borderRadius: 16,
        padding: "18px 28px",
        boxShadow: "0 1px 12px #FFD70016"
      }}>
        <h3 style={{ color: "#FFD700", fontSize: 18, marginBottom: 10 }}>
          Career Role Journey <FaTrophy style={{ marginLeft: 7, color: "#FFD700" }} />
        </h3>
        <ol style={{ marginLeft: 20, color: "#fff", fontSize: 15 }}>
          {athlete.story.map((s, idx) => (
            <li key={idx} style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: "#1de682" }}>{s.date}</span>:&nbsp;
              <b>{s.role}</b>
              <span style={{
                marginLeft: 8,
                color: "#FFD700",
                background: "#181e23",
                borderRadius: 5,
                padding: "2px 8px",
                fontSize: 13
              }}>
                {s.note}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div style={{
        background: "#181e23",
        borderRadius: 10,
        color: "#FFD700",
        padding: "11px 21px",
        fontSize: 15,
        fontWeight: 600,
        marginTop: 18
      }}>
        <FaClock style={{ marginRight: 6, verticalAlign: -2 }} />
        <b>Coach's Private Notes:</b> <span style={{ color: "#fff" }}>{athlete.coachNotes}</span>
      </div>
    </div>
  );
}
