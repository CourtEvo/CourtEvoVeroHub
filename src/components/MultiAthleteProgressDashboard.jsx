import React, { useState } from "react";
import {
  FaUserTie, FaArrowUp, FaArrowDown, FaFileExport, FaHeartbeat, FaBolt, FaCheckCircle, FaExclamationTriangle, FaSearch, FaStar
} from "react-icons/fa";
import { ResponsiveRadar } from "@nivo/radar";
import "./MultiAthleteProgressDashboard.css";

// --- Boardroom Palette per skill ---
const DOMAIN_COLORS = {
  Offense: "#FFD700",
  Defense: "#1de682",
  Physical: "#9d72ff",
  Mental: "#ffac49",
  Team: "#f14f63",
  Coachability: "#1e7fdc"
};

// --- Mock data, scale as needed ---
const ATHLETES = [
  {
    id: 1,
    name: "Ivan Horvat",
    dob: "2008-03-21",
    squad: "U16 Elite",
    position: "Guard",
    club: "Zagreb Youth Basketball Club",
    lastAssessment: "2025-05-18",
    status: "Promotion Ready",
    readiness: 88,
    riskLevel: "Low",
    sensitivePeriod: true,
    sensitiveMessage: "Sensitive development phase – monitor load.",
    logo: "/logo.png",
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
    readinessBar: 88,
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
      { date: "2025-04-08", author: "Coach", text: "Work on mental composure.", type: "Coach" }
    ],
    actions: [
      { date: "2025-05-01", assigned: "Performance", text: "Add sleep/recovery tracking", done: true },
      { date: "2025-05-20", assigned: "Coach", text: "Start leadership training", done: false }
    ],
    wellnessTrend: [7, 7.5, 8, 7, 8, 7.5],
    moodTrend: [7, 6, 8, 8, 7.5, 8],
    injuryTrend: [2, 1, 0, 1, 0, 0]
  },
  {
    id: 2,
    name: "Luka Marković",
    dob: "2007-12-11",
    squad: "U18",
    position: "Forward",
    club: "Zagreb Youth Basketball Club",
    lastAssessment: "2025-05-10",
    status: "In Development",
    readiness: 69,
    riskLevel: "Medium",
    sensitivePeriod: false,
    logo: "/logo.png",
    radar: [
      { domain: "Offense", score: 76 },
      { domain: "Defense", score: 73 },
      { domain: "Physical", score: 85 },
      { domain: "Mental", score: 71 },
      { domain: "Team", score: 79 },
      { domain: "Coachability", score: 83 }
    ],
    radarTargets: [
      { domain: "Offense", target: 80 },
      { domain: "Defense", target: 80 },
      { domain: "Physical", target: 90 },
      { domain: "Mental", target: 80 },
      { domain: "Team", target: 85 },
      { domain: "Coachability", target: 85 }
    ],
    scoreTrend: [62, 64, 67, 70, 68, 71, 67, 69],
    readinessBar: 69,
    milestones: [
      { date: "2023-11-05", type: "promotion", text: "Promoted to U18" },
      { date: "2024-03-14", type: "award", text: "Defensive Player of the Year" }
    ],
    journey: [
      { year: "2021", event: "Joined Club" },
      { year: "2022", event: "U16 starter" },
      { year: "2023", event: "Promoted to U18" }
    ],
    notes: [
      { date: "2025-02-15", author: "Coach", text: "Needs to manage frustration after errors.", type: "Coach" }
    ],
    actions: [
      { date: "2025-05-10", assigned: "Coach", text: "One-on-one video review", done: false }
    ],
    wellnessTrend: [8, 7.5, 8.5, 7.7, 7.6, 7.8],
    moodTrend: [6, 6.5, 6, 7, 6.5, 6],
    injuryTrend: [1, 1, 0, 0, 1, 0]
  }
  // Add more athletes as needed
];

// Strength/risk chips from radar
function getRadarChips(radar) {
  const sorted = radar.slice().sort((a, b) => b.score - a.score);
  return {
    strengths: sorted.slice(0, 2),
    risk: sorted[sorted.length - 1]
  };
}

export default function MultiAthleteProgressDashboard() {
  const [athleteList, setAthleteList] = useState(ATHLETES);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState(athleteList[0].id);
  const [aiAdvice, setAIAdvice] = useState("");
  const [actionMap, setActionMap] = useState(Object.fromEntries(athleteList.map(a => [a.id, a.actions])));
  const [noteMap, setNoteMap] = useState(Object.fromEntries(athleteList.map(a => [a.id, a.notes])));
  const [newAction, setNewAction] = useState("");
  const [newAssigned, setNewAssigned] = useState("Coach");
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("Board");

  const athlete = athleteList.find(a => a.id === selectedId);

  // --- Filtering ---
  const filtered = athleteList.filter(a =>
    (!query || a.name.toLowerCase().includes(query.toLowerCase())) &&
    (!statusFilter || a.status === statusFilter)
  );

  // --- AI Boardroom Review ---
  function askAI() {
    const radar = athlete.radar;
    const strengths = getRadarChips(radar).strengths.map(s => s.domain).join(" & ");
    const risk = getRadarChips(radar).risk.domain;
    const trend = athlete.scoreTrend[athlete.scoreTrend.length - 1] - athlete.scoreTrend[athlete.scoreTrend.length - 2];
    setAIAdvice(
      `AI Review: ${athlete.name} excels at ${strengths}; main development area is ${risk}. Readiness: ${athlete.readinessBar}%. Progress delta: ${trend >= 0 ? "+" : ""}${trend}.` +
      (trend >= 2 ? " Accelerated growth." : trend < 0 ? " Recent stagnation." : " Steady improvement.") +
      (athlete.sensitivePeriod ? " Sensitive phase – monitor closely." : "") +
      (athlete.status === "Promotion Ready" ? " Ready for next squad." : " Continue pathway work.")
    );
  }

  // --- Actions ---
  function addAction() {
    if (!newAction.trim()) return;
    setActionMap(am => ({
      ...am,
      [athlete.id]: [
        ...(am[athlete.id] || []),
        {
          date: new Date().toLocaleDateString(),
          assigned: newAssigned,
          text: newAction,
          done: false
        }
      ]
    }));
    setNewAction("");
  }
  function toggleActionDone(i) {
    setActionMap(am => ({
      ...am,
      [athlete.id]: am[athlete.id].map((a, idx) =>
        idx === i ? { ...a, done: !a.done } : a
      )
    }));
  }

  // --- Notes ---
  function addNote() {
    if (!newNote.trim()) return;
    setNoteMap(nm => ({
      ...nm,
      [athlete.id]: [
        { date: new Date().toLocaleDateString(), author: noteType, text: newNote, type: noteType },
        ...(nm[athlete.id] || [])
      ]
    }));
    setNewNote("");
  }

  // --- List visuals ---
  function getListDelta(a) {
    const t = a.scoreTrend;
    return t[t.length - 1] - t[t.length - 2];
  }

  return (
    <div className="mapd-root">
      {/* Header */}
      <div className="mapd-header">
        <span className="mapd-title">ATHLETE PROGRESS BOARDROOM DASHBOARD</span>
        <span className="mapd-sub">Elite, multi-athlete, filterable, ready for audit/export</span>
        <button className="mapd-export-btn">
          <FaFileExport style={{ marginRight: 7 }} /> Export All
        </button>
      </div>
      {/* Athlete list & filter */}
      <div className="mapd-athlete-list-wrap">
        <div className="mapd-list-controls">
          <span className="mapd-list-search">
            <FaSearch style={{ color: "#FFD700", marginRight: 6 }} />
            <input
              className="mapd-list-input"
              placeholder="Search athlete..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </span>
          <select className="mapd-list-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Promotion Ready">Promotion Ready</option>
            <option value="In Development">In Development</option>
          </select>
        </div>
        <div className="mapd-athlete-list">
          {filtered.map(a =>
            <div
              key={a.id}
              className={`mapd-athlete-card${a.id === selectedId ? " selected" : ""}`}
              onClick={() => { setSelectedId(a.id); setAIAdvice(""); }}
            >
              <span className="mapd-athlete-name">{a.name}</span>
              <span className="mapd-athlete-squad">{a.squad}</span>
              <span className={`mapd-athlete-status ${a.status.replace(" ", "")}`}>{a.status}</span>
              <span className="mapd-athlete-readiness">
                {a.readinessBar}%
                <div className="mapd-athlete-readiness-bar">
                  <div style={{
                    width: a.readinessBar + "%",
                    background: a.readinessBar >= 85 ? "#1de682" : a.readinessBar >= 65 ? "#FFD700" : "#FF4444"
                  }} />
                </div>
              </span>
              <span className="mapd-athlete-delta"
                style={{ color: getListDelta(a) >= 0 ? "#1de682" : "#FF4444" }}>
                {getListDelta(a) > 0 ? "+" : ""}{getListDelta(a)}
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Athlete dashboard */}
      {athlete && (
        <div className="mapd-athlete-dash">
          <div className="mapd-main-split">
            {/* Left col: profile, wellness, notes */}
            <div className="mapd-profile-col">
              <div className="mapd-profile-card">
                <div className="mapd-profile-row"><span className="mapd-label">DOB:</span><span className="mapd-value">{athlete.dob}</span></div>
                <div className="mapd-profile-row"><span className="mapd-label">Squad:</span><span className="mapd-value">{athlete.squad}</span></div>
                <div className="mapd-profile-row"><span className="mapd-label">Position:</span><span className="mapd-value">{athlete.position}</span></div>
                <div className="mapd-profile-row"><span className="mapd-label">Status:</span>
                  <span className="mapd-status-chip"
                    style={{ background: athlete.status === "Promotion Ready" ? "#1de682" : "#FFD700", color: "#232a2e" }}>
                    {athlete.status}
                  </span>
                </div>
                <div className="mapd-profile-row"><span className="mapd-label">Risk Level:</span>
                  <span className="mapd-risk-chip"
                    style={{ background: athlete.riskLevel === "Low" ? "#1de682" : "#FFD700", color: "#232a2e" }}>
                    {athlete.riskLevel}
                  </span>
                </div>
                <div className="mapd-profile-row"><span className="mapd-label">Assessment:</span><span className="mapd-value">{athlete.lastAssessment}</span></div>
                {athlete.sensitivePeriod &&
                  <div className="mapd-sensitive-alert">
                    <FaExclamationTriangle style={{ color: "#FFD700", marginRight: 7 }} />
                    {athlete.sensitiveMessage}
                  </div>
                }
                <div className="mapd-profile-row mapd-score-row">
                  <span className="mapd-label">Score:</span>
                  <span className="mapd-score-main">{athlete.scoreTrend[athlete.scoreTrend.length - 1]}</span>
                  <span className="mapd-score-arrow"
                    style={{ color: getListDelta(athlete) === 0 ? "#FFD700" : getListDelta(athlete) > 0 ? "#1de682" : "#FF4444" }}>
                    {getListDelta(athlete) === 0 ? "=" : getListDelta(athlete) > 0 ? <FaArrowUp /> : <FaArrowDown />}
                  </span>
                  <span className="mapd-score-delta"
                    style={{
                      background: getListDelta(athlete) === 0 ? "#FFD70077" : getListDelta(athlete) > 0 ? "#1de682" : "#FF4444",
                      color: "#232a2e"
                    }}>
                    {getListDelta(athlete) > 0 ? "+" : ""}{getListDelta(athlete)}
                  </span>
                </div>
                {/* Strengths/risks chips */}
                <div className="mapd-profile-row">
                  <span className="mapd-chip strength" style={{ background: DOMAIN_COLORS[getRadarChips(athlete.radar).strengths[0].domain] + "55", color: DOMAIN_COLORS[getRadarChips(athlete.radar).strengths[0].domain] }}>
                    <FaStar style={{ marginRight: 2 }} />
                    {getRadarChips(athlete.radar).strengths[0].domain}
                  </span>
                  <span className="mapd-chip strength" style={{ background: DOMAIN_COLORS[getRadarChips(athlete.radar).strengths[1].domain] + "55", color: DOMAIN_COLORS[getRadarChips(athlete.radar).strengths[1].domain] }}>
                    <FaStar style={{ marginRight: 2 }} />
                    {getRadarChips(athlete.radar).strengths[1].domain}
                  </span>
                  <span className="mapd-chip risk" style={{ background: DOMAIN_COLORS[getRadarChips(athlete.radar).risk.domain], color: "#232a2e" }}>
                    <FaExclamationTriangle style={{ marginRight: 2 }} />
                    {getRadarChips(athlete.radar).risk.domain}
                  </span>
                </div>
              </div>
              {/* Wellness & mental trendlines */}
              <div className="mapd-trendlines-card">
                <div className="mapd-trendline-title">Physical Wellness</div>
                <div className="mapd-trendline-spark">
                  {athlete.wellnessTrend.map((v, i) =>
                    <span key={i}
                      style={{
                        display: "inline-block", width: 8, height: 22,
                        background: "#1de682", borderRadius: 2, marginRight: 2,
                        marginTop: 22 - v * 2
                      }}
                      title={`Wellness: ${v}/10`}
                    />
                  )}
                </div>
                <div className="mapd-trendline-title">Mental (Mood)</div>
                <div className="mapd-trendline-spark">
                  {athlete.moodTrend.map((v, i) =>
                    <span key={i}
                      style={{
                        display: "inline-block", width: 8, height: 22,
                        background: "#FFD700", borderRadius: 2, marginRight: 2,
                        marginTop: 22 - v * 2
                      }}
                      title={`Mood: ${v}/10`}
                    />
                  )}
                </div>
                <div className="mapd-trendline-title">Injury Risk</div>
                <div className="mapd-trendline-spark">
                  {athlete.injuryTrend.map((v, i) =>
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
              <div className="mapd-notes-section">
                <div className="mapd-notes-head">Feedback</div>
                <div className="mapd-notes-filters">
                  <select
                    className="mapd-notes-type"
                    value={noteType}
                    onChange={e => setNoteType(e.target.value)}
                  >
                    <option value="Board">Board</option>
                    <option value="Coach">Coach</option>
                    <option value="Performance">Performance</option>
                    <option value="">All</option>
                  </select>
                </div>
                <div className="mapd-notes-new">
                  <input
                    className="mapd-notes-input"
                    placeholder="Add feedback…"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addNote(); }}
                  />
                  <button className="mapd-notes-btn" onClick={addNote}>Add</button>
                </div>
                <ul>
                  {(noteMap[athlete.id] || [])
                    .filter(n => !noteType || n.type === noteType)
                    .map((n, i) =>
                      <li key={i}>
                        <span className="mapd-note-initials"
                          style={{ background: DOMAIN_COLORS[n.author] || "#FFD700", color: "#232a2e" }}>
                          {n.author[0]}
                        </span>
                        <span className="mapd-note-date">{n.date}:</span>
                        <span className="mapd-note-author">{n.author}:</span>
                        <span className="mapd-note-text">{n.text}</span>
                      </li>
                    )}
                </ul>
              </div>
            </div>
            {/* Center: Radar, trend, milestones */}
            <div className="mapd-center-col">
              <div className="mapd-radar-card">
                <div className="mapd-radar-label">Skill & Development Radar</div>
                <div className="mapd-radar-legend">
                  {athlete.radar.map(r =>
                    <span key={r.domain}
                      className="mapd-radar-legend-chip"
                      style={{ background: DOMAIN_COLORS[r.domain], color: "#232a2e" }}>
                      {r.domain}
                    </span>
                  )}
                  <span className="mapd-radar-legend-chip" style={{ background: "#FFD700", color: "#232a2e" }}>Target</span>
                </div>
                <div style={{ height: 210, width: 320 }}>
                  <ResponsiveRadar
                    data={athlete.radar.map((r, idx) => ({
                      ...r,
                      target: athlete.radarTargets[idx].target
                    }))}
                    keys={["score", "target"]}
                    indexBy="domain"
                    maxValue={100}
                    margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
                    curve="linearClosed"
                    borderWidth={2}
                    borderColor="#FFD700"
                    gridShape="linear"
                    colors={d => DOMAIN_COLORS[d.domain] || "#FFD700"}
                    dotSize={7}
                    dotColor="#FFD700"
                    theme={{
                      fontFamily: "Segoe UI, sans-serif",
                      fontSize: 15,
                      textColor: "#fff",
                      grid: { line: { stroke: "#FFD70066", strokeWidth: 1 } }
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
              <div className="mapd-sparkline-card">
                <div className="mapd-spark-label">Progress Trend</div>
                <div className="mapd-sparkline">
                  {athlete.scoreTrend.map((v, i) =>
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        width: 12,
                        height: 36,
                        background: i === athlete.scoreTrend.length - 1
                          ? (getListDelta(athlete) >= 0 ? "#1de682" : "#FF4444") : "#FFD700",
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
              <div className="mapd-milestone-section">
                <div className="mapd-milestone-head">Promotion & Event Timeline</div>
                <div className="mapd-timeline-vertical">
                  {athlete.milestones.map((m, i) =>
                    <div key={i} className={`mapd-timeline-event ${m.type}`}>
                      <span className="mapd-timeline-dot" />
                      <span className="mapd-timeline-date">{m.date}</span>
                      <span className="mapd-timeline-type">{m.type.toUpperCase()}</span>
                      <span className="mapd-timeline-text">{m.text}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Right: Boardroom insights, actions */}
            <div className="mapd-right-col">
              <div className="mapd-ai-panel">
                <button className="mapd-ai-btn" onClick={askAI}>
                  <FaBolt style={{ marginRight: 6 }} /> Boardroom: Promotion Insight
                </button>
                {aiAdvice && (
                  <div className="mapd-ai-output">{aiAdvice}</div>
                )}
              </div>
              <div className="mapd-action-section">
                <div className="mapd-action-head">Follow-Ups & Actions</div>
                <div className="mapd-action-list">
                  {(actionMap[athlete.id] || []).map((a, i) =>
                    <div key={i} className="mapd-action-item" style={{ opacity: a.done ? 0.5 : 1 }}>
                      <input type="checkbox" checked={a.done} onChange={() => toggleActionDone(i)} />
                      <span className="mapd-action-date">{a.date}</span>
                      <span className="mapd-action-text">{a.text}</span>
                      <span className="mapd-action-owner">{a.assigned}</span>
                      {a.done && <FaCheckCircle style={{ color: "#1de682", marginLeft: 8 }} />}
                    </div>
                  )}
                </div>
                <div className="mapd-action-new">
                  <input
                    className="mapd-action-input"
                    placeholder="Add action…"
                    value={newAction}
                    onChange={e => setNewAction(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addAction(); }}
                  />
                  <select
                    className="mapd-action-select"
                    value={newAssigned}
                    onChange={e => setNewAssigned(e.target.value)}
                  >
                    <option>Coach</option>
                    <option>Board</option>
                    <option>Performance</option>
                    <option>Medical</option>
                  </select>
                  <button className="mapd-action-btn" onClick={addAction}>Assign</button>
                </div>
              </div>
            </div>
          </div>
          {/* Player journey timeline */}
          <div className="mapd-journey-row">
            <div className="mapd-journey-title">Player Journey Timeline</div>
            <div className="mapd-journey-bar">
              {athlete.journey.map((j, i) =>
                <div key={i} className="mapd-journey-point">
                  <span className="mapd-journey-dot" />
                  <span className="mapd-journey-year">{j.year}</span>
                  <span className="mapd-journey-event">{j.event}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="mapd-footer">
        <b>Prepared for:</b> <span style={{ color: "#FFD700" }}>{athlete ? athlete.club : ""}</span>
        <span style={{ marginLeft: 14, color: "#FFD700" }}>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}
