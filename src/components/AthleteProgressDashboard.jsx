import React, { useState } from "react";
import {
  FaUserTie, FaArrowUp, FaArrowDown, FaFileExport, FaHeartbeat, FaBolt, FaCheckCircle, FaExclamationTriangle, FaStar
} from "react-icons/fa";
import { ResponsiveRadar } from "@nivo/radar";
import "./AthleteProgressDashboard.css";

// Mock data — replace with real data/context as needed
const PLAYER = {
  name: "Ivan Horvat",
  dob: "2008-03-21",
  squad: "U16 Elite",
  position: "Guard",
  club: "Zagreb Youth Basketball Club",
  lastAssessment: "2025-05-18",
  status: "Promotion Ready",
  readiness: 88, // 0-100
  riskLevel: "Low",
  sensitivePeriod: true,
  sensitiveMessage: "Sensitive development phase – monitor physical/mental load.",
  logo: "/logo.png", // Replace with club logo path if needed
  radar: [
    { domain: "Offense", score: 84 },
    { domain: "Defense", score: 90 },
    { domain: "Physical", score: 80 },
    { domain: "Mental", score: 82 },
    { domain: "Team", score: 91 },
    { domain: "Coachability", score: 87 }
  ],
  radarTargets: [
    { domain: "Offense", target: 90 },
    { domain: "Defense", target: 92 },
    { domain: "Physical", target: 85 },
    { domain: "Mental", target: 88 },
    { domain: "Team", target: 95 },
    { domain: "Coachability", target: 90 }
  ],
  scoreTrend: [72, 74, 76, 79, 81, 84, 86, 88],
  wellnessTrend: [7, 7.5, 8, 7, 8, 7.5], // /10
  moodTrend: [7, 6, 8, 8, 7.5, 8], // /10
  injuryTrend: [2, 1, 0, 1, 0, 0], // 0 = healthy, higher = risk
  milestones: [
    { date: "2024-09-10", type: "promotion", text: "Promoted to U16 Elite" },
    { date: "2024-11-30", type: "award", text: "MVP at Regional Tournament" },
    { date: "2025-01-12", type: "injury", text: "Minor ankle sprain (recovered)" }
  ],
  journey: [
    { year: "2022", event: "Joined Club" },
    { year: "2023", event: "U14 All-Star" },
    { year: "2024", event: "Promoted to U16" },
    { year: "2025", event: "Shortlisted for U18 Trial" }
  ],
  notes: [
    { date: "2025-03-02", author: "Board", text: "Strong progress. Recommend U18 trial.", type: "Board" },
    { date: "2025-04-08", author: "Coach", text: "Work on mental composure.", type: "Coach" },
    { date: "2025-05-01", author: "Performance", text: "Recovery and sleep trending up.", type: "Performance" }
  ],
  actions: [
    { date: "2025-05-01", assigned: "Performance", text: "Add sleep/recovery tracking", done: true },
    { date: "2025-05-20", assigned: "Coach", text: "Start leadership training", done: false }
  ]
};

// Utility: strengths/risks from radar
function getRadarChips(radar) {
  const sorted = radar.slice().sort((a, b) => b.score - a.score);
  return {
    strengths: sorted.slice(0, 2),
    risk: sorted[sorted.length - 1]
  };
}

export default function AthleteProgressDashboard() {
  const [aiAdvice, setAIAdvice] = useState("");
  const [actions, setActions] = useState(PLAYER.actions);
  const [newAction, setNewAction] = useState("");
  const [newAssigned, setNewAssigned] = useState("Coach");
  const [noteStream, setNoteStream] = useState(PLAYER.notes);
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("Board");

  // AI Promotion readiness
  function askAI() {
    const { radar, scoreTrend, status, sensitivePeriod } = PLAYER;
    const strengths = getRadarChips(radar).strengths.map(s => s.domain).join(" & ");
    const risk = getRadarChips(radar).risk.domain;
    const trend = scoreTrend[scoreTrend.length - 1] - scoreTrend[scoreTrend.length - 2];
    setAIAdvice(
      `AI Review: ${PLAYER.name} shows ${strengths} as strengths and ${risk} as a development area. Readiness for promotion: ${PLAYER.readiness}%. Last progress delta: ${trend >= 0 ? "+" : ""}${trend}.` +
      (trend >= 2 ? " Rapid development." : trend < 0 ? " Recent stagnation – check support." : " Steady growth.") +
      (sensitivePeriod ? " Attention: sensitive phase, monitor closely." : "") +
      (status === "Promotion Ready" ? " Ready for next level challenge." : " Not yet ready for promotion.")
    );
  }

  // Action log
  function addAction() {
    if (!newAction.trim()) return;
    setActions([
      ...actions,
      {
        date: new Date().toLocaleDateString(),
        assigned: newAssigned,
        text: newAction,
        done: false
      }
    ]);
    setNewAction("");
  }
  function toggleActionDone(i) {
    setActions(actions.map((a, idx) =>
      idx === i ? { ...a, done: !a.done } : a
    ));
  }

  // Board/Coach notes stream
  function addNote() {
    if (!newNote.trim()) return;
    setNoteStream([
      { date: new Date().toLocaleDateString(), author: noteType, text: newNote, type: noteType },
      ...noteStream
    ]);
    setNewNote("");
  }

  // Promotion readiness bar
  const readinessBar = Math.min(Math.max(PLAYER.readiness, 0), 100);

  // Strength/risk chips
  const chips = getRadarChips(PLAYER.radar);

  // Progress arrow
  const last = PLAYER.scoreTrend[PLAYER.scoreTrend.length - 2];
  const curr = PLAYER.scoreTrend[PLAYER.scoreTrend.length - 1];
  const trend = curr - last;

  // Owner colors for feedback/notes
  const OWNER_COLORS = {
    "Board": "#FFD700",
    "Coach": "#1de682",
    "Performance": "#9d72ff",
    "Medical": "#f14f63"
  };

  return (
    <div className="apd-root">
      {/* Header */}
      <div className="apd-header">
        <img src={PLAYER.logo} alt="Club Logo" className="apd-club-logo" />
        <span className="apd-title">{PLAYER.name}</span>
        <span className="apd-status-chip"
          style={{ background: PLAYER.status === "Promotion Ready" ? "#1de682" : "#FFD700", color: "#232a2e" }}>
          {PLAYER.status}
        </span>
        <span className="apd-sub">Athlete Progress Dashboard</span>
        <button className="apd-export-btn">
          <FaFileExport style={{ marginRight: 7 }} /> Export Board Sheet
        </button>
      </div>
      {/* Promotion readiness bar */}
      <div className="apd-readiness-wrap">
        <span className="apd-readiness-label">Promotion Readiness</span>
        <div className="apd-readiness-bar-bg">
          <div className="apd-readiness-bar-fill" style={{
            width: readinessBar + "%",
            background: readinessBar >= 85 ? "#1de682" : readinessBar >= 65 ? "#FFD700" : "#FF4444"
          }} />
        </div>
        <span className="apd-readiness-pct">{readinessBar}%</span>
        <span className="apd-chip strength">
          <FaStar style={{ marginRight: 2 }} />
          {chips.strengths[0].domain}: {chips.strengths[0].score}
        </span>
        <span className="apd-chip strength">
          <FaStar style={{ marginRight: 2 }} />
          {chips.strengths[1].domain}: {chips.strengths[1].score}
        </span>
        <span className="apd-chip risk">
          <FaExclamationTriangle style={{ marginRight: 2 }} />
          {chips.risk.domain}: {chips.risk.score}
        </span>
      </div>
      {/* Sensitive period alert */}
      {PLAYER.sensitivePeriod &&
        <div className="apd-sensitive-alert" style={{ animation: "pulse 1.5s infinite alternate" }}>
          <FaExclamationTriangle style={{ color: "#FFD700", marginRight: 7 }} />
          {PLAYER.sensitiveMessage}
        </div>
      }
      {/* Main card layout */}
      <div className="apd-main-split">
        {/* Left: Profile and wellness */}
        <div className="apd-profile-col">
          <div className="apd-profile-card">
            <div className="apd-profile-row"><span className="apd-label">DOB:</span><span className="apd-value">{PLAYER.dob}</span></div>
            <div className="apd-profile-row"><span className="apd-label">Squad:</span><span className="apd-value">{PLAYER.squad}</span></div>
            <div className="apd-profile-row"><span className="apd-label">Position:</span><span className="apd-value">{PLAYER.position}</span></div>
            <div className="apd-profile-row"><span className="apd-label">Last Assessment:</span><span className="apd-value">{PLAYER.lastAssessment}</span></div>
            <div className="apd-profile-row"><span className="apd-label">Risk Level:</span>
              <span className="apd-risk-chip"
                style={{ background: PLAYER.riskLevel === "Low" ? "#1de682" : "#FFD700", color: "#232a2e" }}>
                {PLAYER.riskLevel}
              </span>
            </div>
            <div className="apd-profile-row apd-score-row">
              <span className="apd-label">Progress Score:</span>
              <span className="apd-score-main">{curr}</span>
              <span className="apd-score-arrow"
                style={{ color: trend === 0 ? "#FFD700" : trend > 0 ? "#1de682" : "#FF4444" }}>
                {trend === 0 ? "=" : trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
              </span>
              <span className="apd-score-delta"
                style={{
                  background: trend === 0 ? "#FFD70077" : trend > 0 ? "#1de682" : "#FF4444",
                  color: "#232a2e"
                }}>
                {trend > 0 ? "+" : ""}{trend}
              </span>
            </div>
          </div>
          {/* Wellness & mental trendlines */}
          <div className="apd-trendlines-card">
            <div className="apd-trendline-title">Physical Wellness</div>
            <div className="apd-trendline-spark">
              {PLAYER.wellnessTrend.map((v, i) =>
                <span key={i}
                  style={{
                    display: "inline-block", width: 8, height: 24,
                    background: "#1de682", borderRadius: 2, marginRight: 2,
                    marginTop: 24 - v * 2.2
                  }}
                  title={`Wellness: ${v}/10`}
                />
              )}
            </div>
            <div className="apd-trendline-title">Mental (Mood)</div>
            <div className="apd-trendline-spark">
              {PLAYER.moodTrend.map((v, i) =>
                <span key={i}
                  style={{
                    display: "inline-block", width: 8, height: 24,
                    background: "#FFD700", borderRadius: 2, marginRight: 2,
                    marginTop: 24 - v * 2.2
                  }}
                  title={`Mood: ${v}/10`}
                />
              )}
            </div>
            <div className="apd-trendline-title">Injury Risk</div>
            <div className="apd-trendline-spark">
              {PLAYER.injuryTrend.map((v, i) =>
                <span key={i}
                  style={{
                    display: "inline-block", width: 8, height: 18,
                    background: v > 0 ? "#FF4444" : "#1de682", borderRadius: 2, marginRight: 2,
                    marginTop: 18 - v * 7
                  }}
                  title={v > 0 ? "At risk" : "Healthy"}
                />
              )}
            </div>
          </div>
          {/* Feedback stream */}
          <div className="apd-notes-section">
            <div className="apd-notes-head">Board/Coach Feedback</div>
            <div className="apd-notes-filters">
              <select
                className="apd-notes-type"
                value={noteType}
                onChange={e => setNoteType(e.target.value)}
              >
                <option value="Board">Board</option>
                <option value="Coach">Coach</option>
                <option value="Performance">Performance</option>
                <option value="">All</option>
              </select>
            </div>
            <div className="apd-notes-new">
              <input
                className="apd-notes-input"
                placeholder="Add feedback…"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addNote(); }}
              />
              <button className="apd-notes-btn" onClick={addNote}>Add</button>
            </div>
            <ul>
              {noteStream
                .filter(n => !noteType || n.type === noteType)
                .map((n, i) =>
                  <li key={i}>
                    <span className="apd-note-initials"
                      style={{ background: OWNER_COLORS[n.type] }}>
                      {n.author[0]}
                    </span>
                    <span className="apd-note-date">{n.date}:</span>
                    <span className="apd-note-author">{n.author}:</span>
                    <span className="apd-note-text">{n.text}</span>
                  </li>
                )}
            </ul>
          </div>
        </div>
        {/* Center: Radar, progress, promotion log */}
        <div className="apd-center-col">
          <div className="apd-radar-card">
            <div className="apd-radar-label">Skill & Development Radar</div>
            <div style={{ height: 200, width: 310 }}>
              <ResponsiveRadar
                data={PLAYER.radar.map((r, idx) => ({
                  ...r,
                  target: PLAYER.radarTargets[idx].target
                }))}
                keys={["score", "target"]}
                indexBy="domain"
                maxValue={100}
                margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
                curve="linearClosed"
                borderWidth={2}
                borderColor="#FFD700"
                gridShape="linear"
                colors={["#1de682", "#FFD700"]}
                dotSize={7}
                dotColor="#FFD700"
                theme={{
                  fontFamily: "Segoe UI, sans-serif",
                  fontSize: 15,
                  textColor: "#fff"
                }}
                legends={[]}
                tooltip={({ datum, id }) => (
                  <div style={{
                    background: "#232a2e", color: "#FFD700", borderRadius: 7,
                    padding: 8, fontWeight: 700
                  }}>
                    {datum.domain} <br />
                    {id === "score" ? "Current" : "Target"}: {datum[id]}
                  </div>
                )}
              />
            </div>
          </div>
          <div className="apd-sparkline-card">
            <div className="apd-spark-label">Progress Trend</div>
            <div className="apd-sparkline">
              {PLAYER.scoreTrend.map((v, i) =>
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    width: 12,
                    height: 36,
                    background: i === PLAYER.scoreTrend.length - 1
                      ? (trend >= 0 ? "#1de682" : "#FF4444") : "#FFD700",
                    opacity: 0.85,
                    borderRadius: 2,
                    marginRight: 3,
                    marginTop: 36 - (v / 110) * 36
                  }}
                  title={`Score: ${v}`}
                />
              )}
            </div>
          </div>
          {/* Promotion/transition log */}
          <div className="apd-milestone-section">
            <div className="apd-milestone-head">Promotion & Event Timeline</div>
            <div className="apd-timeline-vertical">
              {PLAYER.milestones.map((m, i) =>
                <div key={i} className={`apd-timeline-event ${m.type}`}>
                  <span className="apd-timeline-dot" />
                  <span className="apd-timeline-date">{m.date}</span>
                  <span className="apd-timeline-type">{m.type.toUpperCase()}</span>
                  <span className="apd-timeline-text">{m.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Right: Boardroom insights, actions */}
        <div className="apd-right-col">
          <div className="apd-ai-panel">
            <button className="apd-ai-btn" onClick={askAI}>
              <FaBolt style={{ marginRight: 6 }} /> Boardroom: Promotion Readiness Insight
            </button>
            {aiAdvice && (
              <div className="apd-ai-output">{aiAdvice}</div>
            )}
          </div>
          <div className="apd-action-section">
            <div className="apd-action-head">Follow-Ups & Actions</div>
            <div className="apd-action-list">
              {actions.map((a, i) =>
                <div key={i} className="apd-action-item" style={{ opacity: a.done ? 0.5 : 1 }}>
                  <input type="checkbox" checked={a.done} onChange={() => toggleActionDone(i)} />
                  <span className="apd-action-date">{a.date}</span>
                  <span className="apd-action-text">{a.text}</span>
                  <span className="apd-action-owner">{a.assigned}</span>
                  {a.done && <FaCheckCircle style={{ color: "#1de682", marginLeft: 8 }} />}
                </div>
              )}
            </div>
            <div className="apd-action-new">
              <input
                className="apd-action-input"
                placeholder="Add action…"
                value={newAction}
                onChange={e => setNewAction(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addAction(); }}
              />
              <select
                className="apd-action-select"
                value={newAssigned}
                onChange={e => setNewAssigned(e.target.value)}
              >
                <option>Coach</option>
                <option>Board</option>
                <option>Performance</option>
                <option>Medical</option>
              </select>
              <button className="apd-action-btn" onClick={addAction}>Assign</button>
            </div>
          </div>
        </div>
      </div>
      {/* Player journey timeline */}
      <div className="apd-journey-row">
        <div className="apd-journey-title">Player Journey Timeline</div>
        <div className="apd-journey-bar">
          {PLAYER.journey.map((j, i) =>
            <div key={i} className="apd-journey-point">
              <span className="apd-journey-dot" />
              <span className="apd-journey-year">{j.year}</span>
              <span className="apd-journey-event">{j.event}</span>
            </div>
          )}
        </div>
      </div>
      {/* Footer/branding */}
      <div className="apd-footer">
        <b>Prepared for:</b> <span style={{ color: "#FFD700" }}>{PLAYER.club}</span>
        <span style={{ marginLeft: 14, color: "#FFD700" }}>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}
