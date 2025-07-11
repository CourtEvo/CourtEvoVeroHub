import React, { useState } from "react";
import { FaClipboardCheck, FaCheckCircle, FaExclamationTriangle, FaBolt, FaInfoCircle } from "react-icons/fa";

// Example benchmark data inspired by project PDFs & your Excel
const LTAD_PHASES = [
  {
    label: "U9 FUNdamentals",
    minSessions: 50,
    focus: "Physical literacy, basic movement, fun & enjoyment",
    minGames: 12,
    compliance: "auto",
  },
  {
    label: "U11 Learn to Train",
    minSessions: 70,
    focus: "Skill development, team play intro, motor learning",
    minGames: 16,
    compliance: "auto",
  },
  {
    label: "U13 Train to Train",
    minSessions: 90,
    focus: "Skill mix, role intro, fitness, mental growth",
    minGames: 20,
    compliance: "auto",
  },
  {
    label: "U15 Train to Compete",
    minSessions: 100,
    focus: "Role mastery, decision making, competitive play",
    minGames: 28,
    compliance: "auto",
  },
  {
    label: "U17+ Train to Win",
    minSessions: 110,
    focus: "Elite role, leadership, performance, high stakes",
    minGames: 32,
    compliance: "auto",
  }
];

// Example club self-reporting data (could be loaded from DB or Excel in production)
const exampleClub = {
  name: "BC Demo",
  stages: [
    { phase: "U9 FUNdamentals", sessions: 44, games: 10, notes: "No PE teacher in school." },
    { phase: "U11 Learn to Train", sessions: 60, games: 14, notes: "" },
    { phase: "U13 Train to Train", sessions: 80, games: 16, notes: "COVID impact on session count." },
    { phase: "U15 Train to Compete", sessions: 101, games: 29, notes: "" },
    { phase: "U17+ Train to Win", sessions: 112, games: 36, notes: "Top 8 in region." }
  ]
};

function flagStatus(val, required) {
  if (val >= required) return "ok";
  if (val >= required * 0.85) return "warn";
  return "risk";
}

function flagColor(status) {
  switch (status) {
    case "ok": return "#1de682";
    case "warn": return "#FFD700";
    case "risk": return "#e24242";
    default: return "#fff";
  }
}

function flagIcon(status) {
  switch (status) {
    case "ok": return <FaCheckCircle style={{ color: "#1de682", marginRight: 7 }} />;
    case "warn": return <FaExclamationTriangle style={{ color: "#FFD700", marginRight: 7 }} />;
    case "risk": return <FaBolt style={{ color: "#e24242", marginRight: 7 }} />;
    default: return null;
  }
}

export default function LTADComplianceEngine() {
  const [club, setClub] = useState(exampleClub);

  // In future: let user import or edit club data here

  return (
    <div style={{
      padding: 36,
      borderRadius: 36,
      background: "linear-gradient(120deg, #1d232a 70%, #232a2e 100%)",
      boxShadow: "0 8px 48px #181e2330",
      color: "#fff",
      minHeight: 640
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
        <FaClipboardCheck color="#FFD700" size={42} />
        <h1 style={{ fontWeight: 900, fontSize: 33, color: "#FFD700", letterSpacing: 1 }}>
          LTAD Compliance Engine
        </h1>
      </div>
      <div style={{ fontSize: 18, marginBottom: 18, color: "#FFD700" }}>
        Instantly benchmark your club's youth structure vs. world-best LTAD standards.<br />
        <span style={{ color: "#1de682", fontWeight: 700 }}>CourtEvo Vero | Compliance & Risk Live</span>
      </div>
      <div style={{ marginBottom: 28 }}>
        <span style={{ fontWeight: 700, fontSize: 22, color: "#FFD700" }}>{club.name}</span>
      </div>
      <table style={{
        width: "100%",
        background: "#23292f",
        borderRadius: 21,
        boxShadow: "0 2px 12px #FFD70011",
        marginBottom: 18,
        borderCollapse: "separate",
        borderSpacing: 0,
      }}>
        <thead>
          <tr style={{ background: "#FFD70011", color: "#FFD700", fontWeight: 900 }}>
            <th style={{ padding: 13, borderRadius: "21px 0 0 0" }}>LTAD Phase</th>
            <th style={{ padding: 13 }}>Sessions</th>
            <th style={{ padding: 13 }}>Min Req.</th>
            <th style={{ padding: 13 }}>Games</th>
            <th style={{ padding: 13 }}>Min Req.</th>
            <th style={{ padding: 13 }}>Focus</th>
            <th style={{ padding: 13 }}>Risk/Status</th>
            <th style={{ padding: 13, borderRadius: "0 21px 0 0" }}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {club.stages.map((stage, idx) => {
            const phase = LTAD_PHASES.find(p => p.label === stage.phase);
            const sessionStatus = flagStatus(stage.sessions, phase.minSessions);
            const gameStatus = flagStatus(stage.games, phase.minGames);
            const flag =
              sessionStatus === "risk" || gameStatus === "risk"
                ? "risk"
                : sessionStatus === "warn" || gameStatus === "warn"
                ? "warn"
                : "ok";
            return (
              <tr key={idx} style={{
                background: idx % 2 === 0 ? "#232a2e" : "#181e23",
                color: "#fff",
                fontWeight: 600
              }}>
                <td style={{ padding: 13, color: "#FFD700", fontWeight: 900 }}>{phase.label}</td>
                <td style={{ padding: 13, color: flagColor(sessionStatus) }}>{stage.sessions}</td>
                <td style={{ padding: 13, color: "#b8b8b8" }}>{phase.minSessions}</td>
                <td style={{ padding: 13, color: flagColor(gameStatus) }}>{stage.games}</td>
                <td style={{ padding: 13, color: "#b8b8b8" }}>{phase.minGames}</td>
                <td style={{ padding: 13, color: "#1de682" }}>{phase.focus}</td>
                <td style={{ padding: 13 }}>{flagIcon(flag)} <span style={{ color: flagColor(flag) }}>{flag.toUpperCase()}</span></td>
                <td style={{ padding: 13 }}>{stage.notes || <span style={{ color: "#888" }}>—</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{
        marginTop: 24,
        background: "#FFD70022",
        borderRadius: 13,
        padding: 18,
        color: "#FFD700",
        display: "flex",
        alignItems: "center",
        gap: 12
      }}>
        <FaInfoCircle color="#FFD700" />
        <span>
          <b>How to Use:</b> Review red and yellow flags, compare your pathway to world LTAD benchmarks.
          All data is editable and export-ready. Enrich this further with year-by-year upload and parent/coach feedback (see Stakeholder Scorecard).
        </span>
      </div>
    </div>
  );
}
