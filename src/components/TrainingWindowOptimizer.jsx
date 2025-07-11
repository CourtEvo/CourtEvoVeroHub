import React, { useState } from "react";
import { FaCalendarAlt, FaBolt, FaLightbulb, FaRunning, FaChartLine, FaCheckCircle, FaSync, FaExclamationTriangle } from "react-icons/fa";

const athletes = [
  {
    name: "Petar Horvat",
    age: 13,
    bioAge: 12.6,
    currentPhase: "Skill Acceleration",
    windows: [
      { skill: "Speed", status: "active", weeksLeft: 4 },
      { skill: "Agility", status: "upcoming", startsIn: 2 },
      { skill: "Strength", status: "closed", missed: 5 }
    ]
  },
  {
    name: "Ivan Petrovic",
    age: 16,
    bioAge: 15.7,
    currentPhase: "Strength Consolidation",
    windows: [
      { skill: "Strength", status: "active", weeksLeft: 8 },
      { skill: "Stamina", status: "upcoming", startsIn: 1 },
      { skill: "Explosiveness", status: "closed", missed: 12 }
    ]
  },
  {
    name: "Luka Marinović",
    age: 14,
    bioAge: 14.2,
    currentPhase: "Stamina Peak",
    windows: [
      { skill: "Stamina", status: "active", weeksLeft: 6 },
      { skill: "Coordination", status: "upcoming", startsIn: 3 },
      { skill: "Speed", status: "closed", missed: 10 }
    ]
  }
];

function getNextSteps(athlete) {
  // Dynamic boardroom-style recommendations
  const missed = athlete.windows.filter(w => w.status === "closed");
  const active = athlete.windows.filter(w => w.status === "active");
  const upcoming = athlete.windows.filter(w => w.status === "upcoming");
  let lines = [];
  if (active.length > 0) {
    lines.push(
      `Focus training plan on: ${active.map(w => w.skill).join(", ")} (${active[0].weeksLeft} weeks left)`
    );
  }
  if (upcoming.length > 0) {
    lines.push(
      `Prep for next window: ${upcoming.map(w => w.skill).join(", ")} (starting in ${upcoming[0].startsIn} weeks)`
    );
  }
  if (missed.length > 0) {
    lines.push(
      `Schedule catch-up protocol for: ${missed.map(w => w.skill).join(", ")}`
    );
  }
  return lines;
}

export default function TrainingWindowOptimizer() {
  const [selected, setSelected] = useState(0);
  const athlete = athletes[selected];
  const missedCritical = athlete.windows.some(w => w.status === "closed" && (w.skill === "Strength" || w.skill === "Speed"));

  return (
    <div>
      <h2 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 10 }}>
        Training Window Optimizer
        <FaBolt style={{ marginLeft: 10, fontSize: 24, color: "#1de682", verticalAlign: -2 }} />
      </h2>
      <div style={{ marginBottom: 24 }}>
        <b>Select Athlete:</b>{" "}
        <select
          value={selected}
          onChange={e => setSelected(Number(e.target.value))}
          style={{
            background: "#232a2e",
            color: "#FFD700",
            border: "1.5px solid #FFD700",
            borderRadius: 7,
            fontWeight: 700,
            padding: "6px 16px"
          }}
        >
          {athletes.map((a, idx) => (
            <option value={idx} key={a.name}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Alert banner if risk */}
      {missedCritical && (
        <div style={{
          background: "#e82e2e",
          color: "#fff",
          borderRadius: 10,
          padding: "12px 22px",
          fontWeight: 700,
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 3px 18px #e82e2e55"
        }}>
          <FaExclamationTriangle style={{ fontSize: 22 }} />
          <span>
            <b>Action Required:</b> Athlete has missed a critical development window. Schedule a recovery protocol!
          </span>
        </div>
      )}

      <div style={{
        background: "#232a2e",
        borderRadius: 16,
        padding: "30px 40px",
        boxShadow: "0 2px 28px #FFD70018",
        marginBottom: 20,
        color: "#fff"
      }}>
        <div style={{ fontSize: 17, marginBottom: 8 }}>
          <FaChartLine color="#FFD700" style={{ marginRight: 9, fontSize: 20, verticalAlign: -3 }} />
          <b>Current Phase:</b> {athlete.currentPhase}
        </div>
        <div style={{ fontSize: 15, marginBottom: 6 }}>
          <b>Chronological Age:</b> <span style={{ color: "#FFD700" }}>{athlete.age}</span> &nbsp;|&nbsp;
          <b>Biological Age:</b> <span style={{ color: "#1de682" }}>{athlete.bioAge}</span>
          <span style={{
            marginLeft: 16,
            fontSize: 13,
            color: Math.abs(athlete.bioAge - athlete.age) > 0.6 ? "#e82e2e" : "#fff",
            fontWeight: 800
          }}>
            {Math.abs(athlete.bioAge - athlete.age) > 0.6 ? " (Attention: Gap Detected)" : ""}
          </span>
        </div>
        <div style={{ marginTop: 16 }}>
          <b>Sensitive Training Windows:</b>
          <ul style={{ margin: "12px 0 0 20px", fontSize: 15 }}>
            {athlete.windows.map((win, idx) => (
              <li key={idx} style={{
                marginBottom: 10,
                color:
                  win.status === "active" ? "#1de682"
                    : win.status === "upcoming" ? "#FFD700"
                    : "#e82e2e",
                fontWeight: win.status === "active" ? 800 : 500
              }}>
                {win.status === "active" && <FaCheckCircle style={{ marginRight: 6, color: "#1de682" }} />}
                {win.status === "upcoming" && <FaCalendarAlt style={{ marginRight: 6, color: "#FFD700" }} />}
                {win.status === "closed" && <FaSync style={{ marginRight: 6, color: "#e82e2e" }} />}
                <b>{win.skill}:</b>{" "}
                {win.status === "active" && `Window open (${win.weeksLeft} weeks left)`}
                {win.status === "upcoming" && `Opens in ${win.startsIn} weeks`}
                {win.status === "closed" && (
                  <span>
                    Missed window ({win.missed} weeks ago)
                    <span style={{
                      marginLeft: 14,
                      color: "#FFD700",
                      background: "#181e23",
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontSize: 13
                    }}>
                      Recovery Protocol Available
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{
        background: "#181e23",
        borderRadius: 14,
        padding: "18px 22px",
        marginTop: 8,
        color: "#FFD700"
      }}>
        <FaLightbulb style={{ marginRight: 7 }} />
        <b>Next Steps:</b>
        <ul style={{ marginLeft: 20, marginTop: 7, color: "#fff", fontSize: 15 }}>
          {getNextSteps(athlete).map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
