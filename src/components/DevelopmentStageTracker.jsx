import React, { useState } from "react";
import {
  FaChartLine, FaCheckCircle, FaExclamationTriangle, FaUser, FaDownload, FaSearch,
  FaFlag, FaArrowUp, FaEye, FaAward, FaMedal, FaTimes, FaHistory, FaClipboardList, FaPlus
} from "react-icons/fa";

// --- Demo Stages (from your CSV, just more KPIs/logic for demo) ---
const STAGES = [
  {
    name: "Foundation",
    focus: "Fundamentals, movement, fun, participation",
    kpis: ["Basic motor skills", "Attendance", "Enjoyment"],
    risk: "Early specialization; injury if pushed too hard.",
    tips: "No position-locking. Prioritize movement. Joy first.",
    lessons: "Wembanyama: 'Multi-sport, late specialization.'",
    questions: [
      "Is any athlete showing early fatigue or injury?",
      "Are parents/coaches meeting regularly?"
    ],
    milestones: ["All-around skills demo", "No absences in 2 months"],
    readiness: 86
  },
  {
    name: "Development",
    focus: "Skill-building, game sense, basic competition",
    kpis: ["Skill tests", "Game IQ", "Practice/game balance"],
    risk: "Burnout, over-competition, academic neglect.",
    tips: "Monitor practice/game ratio. Check for stress signs.",
    lessons: "Wembanyama: 'Growth and stress tracked.'",
    questions: [
      "Are feedback meetings held monthly?",
      "Does every player have a coach mentor?"
    ],
    milestones: ["Skill test pass", "Positive coach review"],
    readiness: 73
  },
  {
    name: "Advanced Development",
    focus: "Position skills, team tactics, performance habits",
    kpis: ["Tactical understanding", "Coach eval", "Physical screening"],
    risk: "Overtraining, injury, selection drop-out risk.",
    tips: "Customize workloads. Use growth charts.",
    lessons: "Wembanyama: 'Individual load monitored.'",
    questions: [
      "Does each athlete have an individual plan?",
      "Any physical red flags in last check?"
    ],
    milestones: ["Team tactic demo", "All medicals cleared"],
    readiness: 60
  },
  {
    name: "Transition to Senior",
    focus: "Elite skills, competition, life management",
    kpis: ["Transition program", "Academic tracking", "Psych readiness"],
    risk: "Stress/injury, academic drop, loss of motivation.",
    tips: "Mentorship. Board/coach 1:1. Track academic progress.",
    lessons: "Wembanyama: 'Senior team exposure early.'",
    questions: [
      "Are transition meetings scheduled?",
      "Is there academic follow-up?"
    ],
    milestones: ["Transition program started", "Academic goals met"],
    readiness: 38
  },
  {
    name: "Senior/Pro",
    focus: "Performance, leadership, off-court life",
    kpis: ["Contract/placement", "Leadership roles", "Community impact"],
    risk: "Burnout, contract issues, mental health.",
    tips: "Life skills. Support for off-court. Family/agent meetings.",
    lessons: "Wembanyama: 'Support network vital.'",
    questions: [
      "Are all contracts reviewed by board?",
      "Exit/career paths clear?"
    ],
    milestones: ["Pro contract signed", "Leadership award"],
    readiness: 15
  }
];

// --- Badges (milestones for demo) ---
const BADGES = [
  { icon: <FaMedal />, label: "Milestone Reached", color: "#FFD700" },
  { icon: <FaAward />, label: "KPI Achieved", color: "#1de682" }
];

// --- Demo athlete log ---
const DEMO_ATHLETES = [
  {
    name: "Petar Horvat",
    stage: 2,
    notes: "Rapid technical improvement, monitor stress/fatigue",
    progress: 67,
    flagged: false,
    history: [
      { date: "2024-01-10", desc: "Promoted to Advanced Dev.", type: "stage" },
      { date: "2024-02-01", desc: "Passed tactical skill test", type: "milestone" }
    ],
    badges: [0, 1]
  },
  {
    name: "Ivan Peric",
    stage: 1,
    notes: "Motivated, needs broad skill base",
    progress: 42,
    flagged: true,
    history: [
      { date: "2024-02-10", desc: "Skill test failed", type: "risk" }
    ],
    badges: []
  },
  {
    name: "Marko Novak",
    stage: 3,
    notes: "Needs life/academic support, shows leadership",
    progress: 28,
    flagged: false,
    history: [
      { date: "2024-03-01", desc: "Started transition program", type: "milestone" }
    ],
    badges: [0]
  },
  {
    name: "Luka Pavlovic",
    stage: 0,
    notes: "New, energetic, needs foundation",
    progress: 10,
    flagged: false,
    history: [
      { date: "2024-03-21", desc: "Joined club", type: "milestone" }
    ],
    badges: []
  }
];

const readinessColor = score =>
  score > 80 ? "#1de682"
  : score > 60 ? "#FFD700"
  : score > 40 ? "#ff944d"
  : "#e82e2e";

function getStageCounts(athletes) {
  return STAGES.map((s, idx) => athletes.filter(a => a.stage === idx).length);
}
function getAvgReadiness(athletes) {
  if (athletes.length === 0) return 0;
  return Math.round(athletes.reduce((a, c) => a + STAGES[c.stage].readiness, 0) / athletes.length);
}

export default function DevelopmentStageTracker() {
  const [athletes, setAthletes] = useState(DEMO_ATHLETES);
  const [addMode, setAddMode] = useState(false);
  const [newAthlete, setNewAthlete] = useState({ name: "", stage: 0, notes: "", progress: 0, flagged: false, history: [], badges: [] });
  const [search, setSearch] = useState("");
  const [drillIdx, setDrillIdx] = useState(null);
  const [drillAthlete, setDrillAthlete] = useState(null);
  const [stageFilter, setStageFilter] = useState(-1);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [flagFilter, setFlagFilter] = useState(false);

  // Board summary insight (dynamic)
  const highRiskCount = athletes.filter(a => STAGES[a.stage].readiness < 40).length;
  const readyCount = athletes.filter(a => a.progress > 80).length;
  const promoteReady = athletes.filter(a => a.progress > 75 && a.stage < STAGES.length - 1).length;

  function exportCSV() {
    const filtered = filteredAthletes();
    const rows = [["Name", "Current Stage", "Progress (%)", "Notes", "Flagged"]];
    filtered.forEach(a =>
      rows.push([a.name, STAGES[a.stage].name, a.progress, a.notes, a.flagged ? "YES" : "NO"])
    );
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "athlete_development_stages.csv";
    a.click();
  }
  function bulkPromote(stage) {
    setAthletes(athletes =>
      athletes.map(a =>
        a.stage === stage && a.stage < STAGES.length - 1
          ? {
              ...a,
              stage: a.stage + 1,
              progress: 0,
              history: [...a.history, { date: new Date().toISOString().slice(0,10), desc: `Promoted to ${STAGES[a.stage+1].name}`, type: "stage" }]
            }
          : a
      )
    );
  }
  function filteredAthletes() {
    return athletes.filter(a =>
      (!search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.notes.toLowerCase().includes(search.toLowerCase())
      ) &&
      (!flagFilter || a.flagged) &&
      (stageFilter === -1 || a.stage === stageFilter)
    );
  }
  function setFlag(idx, value) {
    setAthletes(athletes => athletes.map((a, i) => i === idx ? { ...a, flagged: value } : a));
  }
  function addBadge(idx, badgeIdx) {
    setAthletes(athletes =>
      athletes.map((a, i) => i === idx && !a.badges.includes(badgeIdx)
        ? { ...a, badges: [...a.badges, badgeIdx] }
        : a
      )
    );
  }
  function openAthleteDrill(idx) { setDrillAthlete(idx); }
  function closeAthleteDrill() { setDrillAthlete(null); }

  // Stage heatmap
  function stageHeatmap() {
    return STAGES.map((stage, idx) => ({
      idx,
      count: athletes.filter(a => a.stage === idx && STAGES[idx].readiness < 40).length
    }));
  }

  // Board summary
  const summaryText = `${promoteReady} athletes are ready for promotion; ${highRiskCount} in high risk stage. Total: ${athletes.length}.`;

  return (
    <div style={{
      background: "linear-gradient(135deg,#232a2e 0%,#283E51 100%)",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 28,
      padding: 36,
      maxWidth: 1750,
      margin: "0 auto"
    }}>
      <div style={{ height: 7, borderRadius: 5, margin: "0 0 22px 0", background: "linear-gradient(90deg, #FFD700 40%, #1de682 100%)" }} />
      {/* Board Insights + Filter Bar */}
      <div style={{
        display: "flex", gap: 17, marginBottom: 18, flexWrap: "wrap", alignItems: "center"
      }}>
        <div style={{
          background: "#232a2e", color: "#FFD700", borderRadius: 13, padding: "17px 22px",
          minWidth: 370, fontWeight: 900, fontSize: 18, boxShadow: "0 1px 10px #FFD70019"
        }}>
          <FaClipboardList style={{ marginRight: 7, color: "#FFD700" }} />
          {summaryText}
        </div>
        <button style={btnStyle} onClick={exportCSV}><FaDownload style={{ marginRight: 8, fontSize: 15 }} /> Export Filtered</button>
        <button style={miniBtn} onClick={() => setShowHeatmap(h => !h)}>
          <FaFlag style={{ color: "#e82e2e" }} /> {showHeatmap ? "Hide Heatmap" : "Show Stage Risk Heatmap"}
        </button>
        <span style={{ marginLeft: 7, display: "flex", alignItems: "center", gap: 7 }}>
          <FaSearch />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search athletes..." style={inputStyle} />
        </span>
        <select value={stageFilter} onChange={e => setStageFilter(Number(e.target.value))} style={inputStyle}>
          <option value={-1}>All Stages</option>
          {STAGES.map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}
        </select>
        <button style={miniBtn} onClick={() => setFlagFilter(f => !f)}>
          <FaFlag /> {flagFilter ? "Show All" : "Flagged Only"}
        </button>
      </div>
      {/* Stage Risk Heatmap */}
      {showHeatmap && (
        <div style={{
          display: "flex", gap: 18, marginBottom: 20
        }}>
          {stageHeatmap().map(s => (
            <div key={s.idx} style={{
              background: "#232a2e",
              borderRadius: 14,
              padding: "12px 13px 8px 13px",
              border: `4px solid ${s.count > 0 ? "#e82e2e" : "#FFD700"}`,
              flex: "1 1 120px",
              minWidth: 160,
              position: "relative",
              color: "#FFD700",
              fontWeight: 900,
              fontSize: 17,
              textAlign: "center"
            }}>
              {STAGES[s.idx].name}
              <div style={{ fontSize: 26, color: s.count > 0 ? "#e82e2e" : "#1de682" }}>
                {s.count}
              </div>
              <div style={{ fontSize: 13, color: "#FFD700bb" }}>
                {s.count > 0 ? "HIGH RISK" : "No risk"}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Stage Gantt View */}
      <div style={{
        display: "flex", alignItems: "flex-end", gap: 18, marginBottom: 34, flexWrap: "wrap"
      }}>
        {STAGES.map((s, idx) => (
          <div key={s.name} style={{
            background: "#232a2e",
            borderRadius: 14,
            padding: "12px 13px 8px 13px",
            border: `4px solid ${readinessColor(s.readiness)}`,
            flex: "1 1 120px",
            minWidth: 160,
            position: "relative"
          }}>
            <div style={{
              fontWeight: 800, fontSize: 18, marginBottom: 3, color: "#FFD700"
            }}>
              {s.name}
            </div>
            <div style={{
              height: `${s.readiness / 1.5}px`,
              background: readinessColor(s.readiness),
              borderRadius: 8,
              margin: "7px 0",
              width: "70%",
              marginLeft: "auto", marginRight: "auto"
            }} />
            <div style={{ textAlign: "center", fontSize: 13, color: readinessColor(s.readiness), fontWeight: 900 }}>
              {s.readiness}% Ready
            </div>
            <button
              style={{ ...miniBtn, margin: "7px 0 0 0" }}
              onClick={() => setDrillIdx(drillIdx === idx ? null : idx)}
            >
              <FaEye style={{ marginRight: 4 }} />
              {drillIdx === idx ? "Hide" : "Stage Info"}
            </button>
            <button
              style={{ ...miniBtn, background: "#FFD700", color: "#232a2e", marginLeft: 8 }}
              onClick={() => bulkPromote(idx)}
              disabled={athletes.every(a => a.stage !== idx)}
              title="Promote all athletes in this stage"
            >
              <FaArrowUp style={{ marginRight: 4 }} /> Promote
            </button>
            {drillIdx === idx && (
              <div style={{
                background: "#181e23", borderRadius: 10, color: "#FFD700",
                fontSize: 14, margin: "12px 0 4px 0", padding: "10px 13px", boxShadow: "0 1px 7px #FFD70012"
              }}>
                <b>Focus:</b> {s.focus} <br />
                <span style={{ color: "#1de682" }}><b>KPIs:</b></span> {s.kpis.join(", ")} <br />
                <b>Risk:</b> <span style={{ color: "#e82e2e" }}>{s.risk}</span><br />
                <b>Best Practice:</b> {s.tips} <br />
                <b>Wembanyama Lesson:</b> <span style={{ color: "#7fa1ff" }}>{s.lessons}</span> <br />
                <b>Boardroom Questions:</b>
                <ul style={{ margin: "7px 0 0 19px", color: "#FFD700", fontWeight: 700 }}>
                  {s.questions.map((q, qi) => <li key={qi}>{q}</li>)}
                </ul>
                <b>Milestones:</b>
                <ul style={{ margin: "7px 0 0 19px", color: "#FFD700", fontWeight: 700 }}>
                  {s.milestones.map((m, mi) => <li key={mi}><FaAward style={{ color: "#FFD700", marginRight: 6 }} />{m}</li>)}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Athlete Progress Tracker */}
      <div style={{
        background: "#181e23",
        borderRadius: 14,
        padding: "22px 18px",
        marginBottom: 19
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 13 }}>
          <FaUser style={{ color: "#FFD700", fontSize: 24 }} />
          <b style={{ fontSize: 19, letterSpacing: 0.7 }}>Athlete Progress Tracker</b>
          <button style={btnStyle} onClick={() => setAddMode(a => !a)}>
            <FaPlus style={{ marginRight: 7 }} /> {addMode ? "Cancel" : "Add Athlete"}
          </button>
          <button style={miniBtn} onClick={() => setFlagFilter(f => !f)}>
            <FaFlag /> {flagFilter ? "Show All" : "Flagged Only"}
          </button>
        </div>
        {addMode && (
          <form onSubmit={e => {
            e.preventDefault();
            setAthletes([...athletes, { ...newAthlete }]);
            setAddMode(false);
            setNewAthlete({ name: "", stage: 0, notes: "", progress: 0, flagged: false, history: [], badges: [] });
          }} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <input
              required
              value={newAthlete.name}
              onChange={e => setNewAthlete(n => ({ ...n, name: e.target.value }))}
              placeholder="Name"
              style={inputStyle}
            />
            <select
              value={newAthlete.stage}
              onChange={e => setNewAthlete(n => ({ ...n, stage: Number(e.target.value) }))}
              style={inputStyle}
            >
              {STAGES.map((s, idx) => <option key={s.name} value={idx}>{s.name}</option>)}
            </select>
            <input
              type="number"
              min={0}
              max={100}
              value={newAthlete.progress}
              onChange={e => setNewAthlete(n => ({ ...n, progress: Number(e.target.value) }))}
              placeholder="Progress (%)"
              style={inputStyle}
            />
            <input
              value={newAthlete.notes}
              onChange={e => setNewAthlete(n => ({ ...n, notes: e.target.value }))}
              placeholder="Notes"
              style={inputStyle}
            />
            <button style={btnStyle}><FaCheckCircle style={{ marginRight: 5 }} />Add</button>
          </form>
        )}
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 16,
          background: "#232a2e",
          borderRadius: 12
        }}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Current Stage</th>
              <th style={thStyle}>Progress</th>
              <th style={thStyle}>Notes</th>
              <th style={thStyle}>Flag</th>
              <th style={thStyle}>Badges</th>
              <th style={thStyle}>Drilldown</th>
            </tr>
          </thead>
          <tbody>
            {filteredAthletes().map((a, idx) => (
              <tr key={idx}>
                <td style={tdStyle}>{a.name}</td>
                <td style={{
                  ...tdStyle,
                  fontWeight: 900,
                  color: readinessColor(STAGES[a.stage].readiness)
                }}>{STAGES[a.stage].name}</td>
                <td style={{ ...tdStyle, minWidth: 130 }}>
                  <div style={{
                    height: 18,
                    background: "#FFD70044",
                    borderRadius: 8,
                    overflow: "hidden",
                    position: "relative"
                  }}>
                    <div style={{
                      width: `${a.progress}%`,
                      height: 18,
                      background: readinessColor(a.progress),
                      borderRadius: 8,
                      fontWeight: 900,
                      color: "#232a2e",
                      textAlign: "center"
                    }}>
                      <span style={{ position: "absolute", left: 10, fontWeight: 800, fontSize: 15 }}>
                        {a.progress}%
                      </span>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>{a.notes}</td>
                <td style={tdStyle}>
                  <button
                    style={{ ...miniBtn, background: a.flagged ? "#e82e2e" : "#FFD700", color: "#232a2e" }}
                    onClick={() => setFlag(idx, !a.flagged)}
                  >
                    <FaFlag /> {a.flagged ? "Flagged" : "Flag"}
                  </button>
                </td>
                <td style={{ ...tdStyle, minWidth: 85 }}>
                  {a.badges && a.badges.length > 0
                    ? a.badges.map(bi => (
                        <span key={bi} style={{ color: BADGES[bi].color, fontSize: 20, marginRight: 6 }}>
                          {BADGES[bi].icon}
                        </span>
                      ))
                    : <span style={{ color: "#FFD70099" }}>—</span>
                  }
                  {/* Demo: Add a badge */}
                  <button style={miniBtn} onClick={() => addBadge(idx, 0)}>
                    <FaAward />+
                  </button>
                </td>
                <td style={tdStyle}>
                  <button style={miniBtn} onClick={() => openAthleteDrill(idx)}>
                    <FaEye /> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Athlete drilldown drawer (popover-style) */}
      {drillAthlete !== null && (
        <div style={{
          position: "fixed",
          top: 60,
          right: 70,
          zIndex: 500,
          width: 420,
          maxWidth: "94vw",
          background: "#232a2e",
          color: "#FFD700",
          border: "3px solid #FFD700",
          borderRadius: 18,
          padding: "28px 23px",
          boxShadow: "0 12px 44px #181e2333"
        }}>
          <button
            style={{
              position: "absolute",
              top: 16,
              right: 14,
              background: "transparent",
              color: "#FFD700",
              border: "none",
              fontSize: 22,
              cursor: "pointer"
            }}
            onClick={closeAthleteDrill}
            title="Close"
          >
            <FaTimes />
          </button>
          <div style={{ fontWeight: 900, fontSize: 25, marginBottom: 5 }}>
            {athletes[drillAthlete].name}
          </div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>
            <b>Stage:</b> <span style={{ color: readinessColor(STAGES[athletes[drillAthlete].stage].readiness) }}>{STAGES[athletes[drillAthlete].stage].name}</span>
          </div>
          <div style={{ fontSize: 15, marginBottom: 8 }}>
            <b>Progress:</b> {athletes[drillAthlete].progress}%
          </div>
          <div style={{ fontSize: 15, marginBottom: 8 }}>
            <b>Notes:</b> {athletes[drillAthlete].notes}
          </div>
          <div style={{ fontSize: 15, marginBottom: 8 }}>
            <b>Flagged:</b> {athletes[drillAthlete].flagged ? <span style={{ color: "#e82e2e" }}>Yes</span> : "No"}
          </div>
          <div style={{ fontSize: 15, marginBottom: 10 }}>
            <b>Badges:</b> {athletes[drillAthlete].badges.length > 0
              ? athletes[drillAthlete].badges.map(bi => (
                  <span key={bi} style={{ color: BADGES[bi].color, fontSize: 20, marginRight: 7 }}>{BADGES[bi].icon}</span>
                ))
              : <span style={{ color: "#FFD70099" }}>None</span>
            }
          </div>
          <div style={{
            background: "#181e23", color: "#FFD700", borderRadius: 12,
            padding: "10px 13px", marginBottom: 10, fontSize: 14
          }}>
            <FaHistory style={{ marginRight: 8 }} />
            <b>Development Log:</b>
            <ul style={{ margin: "7px 0 0 17px" }}>
              {athletes[drillAthlete].history.length === 0
                ? <li>No events logged yet.</li>
                : athletes[drillAthlete].history.map((h, i) =>
                    <li key={i}>
                      <span style={{ color: "#1de682" }}>{h.date}:</span> {h.desc}
                    </li>
                  )
              }
            </ul>
          </div>
        </div>
      )}
      {/* Export/Tip */}
      <div style={{
        background: "#181e23",
        color: "#FFD700",
        borderRadius: 10,
        padding: "12px 14px",
        fontWeight: 700,
        fontSize: 15,
        marginTop: 17
      }}>
        <FaFlag style={{ marginRight: 7, verticalAlign: -2 }} />
        <b>Tip:</b> Flag or badge athletes for board follow-up; drilldown for full log/history. Use heatmap for stage risk overview.
      </div>
    </div>
  );
}

// --- Styling ---
const thStyle = {
  color: "#FFD700",
  background: "#232a2e",
  fontWeight: 900,
  padding: "13px 12px",
  textAlign: "center",
  borderRadius: "10px 10px 0 0"
};
const tdStyle = {
  background: "#fff",
  color: "#232a2e",
  fontWeight: 700,
  padding: "11px 9px"
};
const btnStyle = {
  background: "#FFD700",
  color: "#232a2e",
  border: "none",
  borderRadius: 7,
  fontWeight: 900,
  fontSize: 14,
  padding: "5px 13px",
  marginRight: 5,
  cursor: "pointer"
};
const miniBtn = {
  background: "#1de682",
  color: "#232a2e",
  border: "none",
  borderRadius: 6,
  fontWeight: 900,
  fontSize: 13,
  padding: "4px 10px",
  marginTop: 4,
  cursor: "pointer"
};
const inputStyle = {
  background: "#fff",
  color: "#232a2e",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 14,
  padding: "6px 8px",
  marginRight: 7,
  marginBottom: 3
};
