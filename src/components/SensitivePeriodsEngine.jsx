import React, { useState } from "react";
import {
  FaBolt, FaUserClock, FaCheck, FaExclamationTriangle, FaCalendarAlt, FaUserTie, FaClipboardList, FaArrowRight, FaFileExport, FaUsersCog, FaPlus, FaBell, FaUsers, FaUser, FaTasks, FaChartPie, FaRobot, FaComments, FaLightbulb
} from "react-icons/fa";

const defaultWindows = [
  { key: "speed1", label: "Speed 1", min: 7, max: 9, specialty: "speed", bench: { world: 89, nat: 83 } },
  { key: "agility", label: "Agility", min: 8, max: 10, specialty: "agility", bench: { world: 88, nat: 82 } },
  { key: "aerobic", label: "Aerobic", min: 11, max: 13, specialty: "conditioning", bench: { world: 93, nat: 87 } },
  { key: "speed2", label: "Speed 2", min: 13, max: 15, specialty: "speed", bench: { world: 81, nat: 75 } },
  { key: "strength", label: "Strength", min: 13, max: 17, specialty: "strength", bench: { world: 91, nat: 83 } },
  { key: "skills", label: "Skills", min: 9, max: 12, specialty: "skills", bench: { world: 94, nat: 86 } }
];

const SQUADS = ["U14", "U16", "U18", "Senior"];
const COACHES = [
  { name: "Coach Johnson", specialties: ["speed", "agility", "skills"], workload: 2, success: { speed1: 0.92, skills: 0.85 } },
  { name: "Coach Perkovic", specialties: ["conditioning", "agility"], workload: 3, success: { aerobic: 0.88, agility: 0.8 } },
  { name: "Coach White", specialties: ["strength", "skills"], workload: 1, success: { strength: 0.91, skills: 0.82 } },
  { name: "Coach Proleta", specialties: ["speed", "skills", "conditioning"], workload: 1, success: { speed2: 0.9, skills: 0.9 } }
];

// For demo: simulated CSV benchmarking data import
const benchImported = {
  speed1: { world: 90, nat: 84 },
  agility: { world: 87, nat: 83 },
  aerobic: { world: 94, nat: 89 },
  speed2: { world: 82, nat: 74 },
  strength: { world: 90, nat: 85 },
  skills: { world: 95, nat: 88 }
};

const initAthletes = [
  {
    id: 1, name: "Ivan Radic", squad: "U14", dob: "2010-02-18", phv: 13.5,
    windows: { speed1: "hit", agility: "hit", aerobic: "open", speed2: "not-yet", strength: "not-yet", skills: "hit" },
    windowOwners: { speed1: "Coach Sesar", agility: "Coach Sesar", aerobic: "Coach Perasovic", speed2: "", strength: "", skills: "Coach Sesar" },
    injuries: [],
    windowHistory: {
      speed1: ["hit", "hit", "open"], agility: ["open", "hit", "hit"], aerobic: ["not-yet", "open", "open"]
    },
    comments: { speed1: [], skills: [] }
  },
  {
    id: 2, name: "Marko Proleta", squad: "U16", dob: "2010-07-24", phv: 14.2,
    windows: { speed1: "missed", agility: "hit", aerobic: "hit", speed2: "open", strength: "open", skills: "missed" },
    windowOwners: { speed1: "Coach Perasovic", agility: "Coach Jusup", aerobic: "Coach Perasovic", speed2: "Coach Jusup", strength: "Coach Jusup", skills: "Coach Perasovic" },
    injuries: [{ window: "speed1", date: "2024-05-01", diagnosis: "Hamstring strain" }],
    windowHistory: {
      speed1: ["open", "open", "missed"], agility: ["hit", "hit", "hit"], aerobic: ["open", "hit", "hit"]
    },
    comments: { speed1: [], skills: [] }
  },
  {
    id: 3, name: "Bruno Sesar", squad: "U16", dob: "2010-09-12", phv: 13.7,
    windows: { speed1: "hit", agility: "open", aerobic: "open", speed2: "open", strength: "not-yet", skills: "open" },
    windowOwners: { speed1: "Coach Sesar", agility: "Coach Jusup", aerobic: "Coach Perasovic", speed2: "Coach Jusup", strength: "Coach Jusup", skills: "Coach Proleta" },
    injuries: [],
    windowHistory: { speed1: ["not-yet", "open", "hit"], agility: ["not-yet", "open", "open"], aerobic: ["not-yet", "open", "open"] },
    comments: { speed1: [], skills: [] }
  }
];

function ageYears(dob) {
  const dobDate = new Date(dob);
  const now = new Date();
  return (now - dobDate) / (365.25 * 24 * 3600 * 1000);
}
function windowStatus(win, athlete) {
  const age = ageYears(athlete.dob);
  if (athlete.windows[win.key]) return athlete.windows[win.key];
  if (age >= win.min && age <= win.max) return "open";
  if (age < win.min) return "not-yet";
  if (age > win.max && !athlete.windows[win.key]) return "missed";
  return "-";
}
function readinessIndex(athletes, windows) {
  let total = 0, hit = 0;
  athletes.forEach(a => {
    windows.forEach(w => {
      const v = windowStatus(w, a);
      total += 1;
      if (v === "hit" || v === "open") hit += 1;
    });
  });
  return total === 0 ? 0 : Math.round((hit / total) * 100);
}
// Predictive AI: flag if at risk of missing in next 6 months
function atRiskPrediction(win, athlete) {
  const age = ageYears(athlete.dob);
  if (windowStatus(win, athlete) === "not-yet" && age + 0.5 > win.max) return true;
  if (windowStatus(win, athlete) === "open" && win.max - age <= 0.5) return true;
  return false;
}

const SensitivePeriodsEngine = () => {
  const [athletes, setAthletes] = useState(initAthletes);
  const [windows, setWindows] = useState(defaultWindows);
  const [selected, setSelected] = useState(athletes[0].id);
  const [actionLog, setActionLog] = useState([
    { date: "2024-04-05", actor: "Coach", target: "Marko Proleta", window: "Skills", action: "Added daily ballhandling after missed window", parent: false }
  ]);
  const [adding, setAdding] = useState(false);
  const [notifyParent, setNotifyParent] = useState(null);
  const [commentBox, setCommentBox] = useState({ athlete: null, window: null, text: "" });

  // Squad readiness
  const squadIdx = SQUADS.map(sq => {
    const filtered = athletes.filter(a => a.squad === sq);
    return { squad: sq, idx: readinessIndex(filtered, windows), count: filtered.length };
  });

  // Window benchmarking
  function benchmark(w) {
    const bench = benchImported[w.key] || w.bench;
    return <span style={{ color: "#FFD70088", fontSize: 13 }}>
      World: {bench.world}%, Nat: {bench.nat}%
    </span>;
  }
  // Window historical sparkline
  function sparkline(history) {
    if (!history || history.length < 2) return null;
    const colors = { hit: "#1de682", open: "#FFD700", missed: "#ff4848", "not-yet": "#FFD70066" };
    return (
      <svg width={36} height={17} style={{ marginLeft: 4 }}>
        {history.map((v, i) =>
          <rect key={i} x={i * 10} y={5} width={7} height={7} fill={colors[v] || "#fff"} rx={2} />
        )}
      </svg>
    );
  }
  // Comment box logic
  function handleCommentSubmit(athId, wKey) {
    setAthletes(athletes.map(a =>
      a.id === athId
        ? {
            ...a,
            comments: {
              ...a.comments,
              [wKey]: [...(a.comments[wKey] || []), { who: "Coach", date: new Date().toISOString().slice(0, 10), txt: commentBox.text }]
            }
          }
        : a
    ));
    setCommentBox({ athlete: null, window: null, text: "" });
  }
  // Group session planner
  function bestGroupWeeks(w) {
    // For demo: week numbers where most athletes are "open"
    const now = new Date();
    const weeks = Array(8).fill(0);
    athletes.forEach(a => {
      if (windowStatus(w, a) === "open") {
        const thisWeek = Math.floor((now - new Date(a.dob)) / (7 * 24 * 3600 * 1000));
        for (let i = 0; i < 3; ++i) weeks[(thisWeek + i) % 8] += 1;
      }
    });
    const max = Math.max(...weeks);
    const best = weeks.map((v, i) => v === max ? i + 1 : null).filter(Boolean);
    return best.length ? `Week(s): ${best.join(", ")}` : "Anytime";
  }
  // Next best intervention (AI, evidence)
  function aiIntervention(w) {
    // For demo: custom text + evidence link
    if (w.key === "skills") return { text: "Intensive small-group skills session, focus on 1v1/decision-making.", link: "https://fiba.basketball/skills-evidence" };
    if (w.key === "speed1") return { text: "Sprint/plyometrics in warmup, partner chase drills.", link: "https://nba.com/speed-windows" };
    if (w.key === "strength") return { text: "Progressive resistance with movement screen. Coordinate with S&C staff.", link: "https://usab.com/strength-guides" };
    return { text: "Maximize reps in game-like, high-challenge environments.", link: "https://canadabasketball.ca/ltad" };
  }
  // PDF/email generator (demo)
  function exportPDF(a) {
    alert("Exporting personalized PDF/email for parent/coach: includes window status, actions, evidence links, and next interventions.");
  }
  // At-risk overlay
  function atRiskColor(win, a) {
    if (atRiskPrediction(win, a) && windowStatus(win, a) !== "hit") return "#ff4848";
    return undefined;
  }
  // Export full window journey
  function exportJourney(a) {
    alert(`Exporting full window journey for ${a.name}: timelines, interventions, outcomes.`);
  }

  const athlete = athletes.find(a => a.id === selected);

  return (
    <div style={{
      background: "#232a2e", color: "#fff", borderRadius: 22, padding: 36, maxWidth: 1740, margin: "0 auto", boxShadow: "0 4px 32px #FFD70055"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <FaBolt size={28} color="#FFD700" />
        <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 27, letterSpacing: 1 }}>
          Sensitive Periods Engine – Golden Window Navigator (ULTIMATE)
        </h2>
        <span style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 800, borderRadius: 10, padding: '7px 18px',
          fontSize: 15, marginLeft: 15
        }}>CourtEvo Vero</span>
      </div>
      {/* Export/AI tools */}
      <div style={{ display: "flex", gap: 15, margin: "16px 0 16px 0" }}>
        <button onClick={() => window.open("https://canadabasketball.ca/ltad", "_blank")} style={btnStyle}><FaLightbulb /> Best Practice</button>
        <button onClick={() => alert("Import benchmarking data CSV (world/nat). [Demo only]")} style={btnStyle}><FaFileExport /> Import Benchmark CSV</button>
        <button onClick={() => exportJourney(athlete)} style={btnStyle}><FaFileExport /> Export Athlete Journey</button>
        <button onClick={() => exportPDF(athlete)} style={btnStyle}><FaFileExport /> Export Parent/Coach PDF/Email</button>
      </div>
      {/* Squad readiness index */}
      <div style={{ margin: "18px 0 19px 0", display: "flex", gap: 32, alignItems: "center" }}>
        <div>
          <b style={{ color: "#FFD700", fontSize: 19 }}>Squad Readiness Index</b>
          <div style={{ display: "flex", gap: 18, marginTop: 8 }}>
            {squadIdx.map((sq, idx) =>
              <div key={sq.squad} style={{
                background: "#FFD70011", borderRadius: 10, padding: "13px 22px", fontWeight: 900, fontSize: 17,
                color: sq.idx >= 85 ? "#1de682" : sq.idx >= 75 ? "#FFD700" : "#ff4848",
                border: sq.idx >= 85 ? "2.5px solid #1de682" : sq.idx >= 75 ? "2.5px solid #FFD700" : "2.5px solid #ff4848"
              }}>
                {sq.squad}<br /><span style={{ fontSize: 22 }}>{sq.idx}%</span>
                <br /><span style={{ color: "#FFD70099", fontWeight: 700 }}>{sq.count} athletes</span>
              </div>
            )}
          </div>
        </div>
        <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 16 }}>
          <FaBell style={{ marginRight: 7 }} />
          <span>Main Benchmark: Skills ({defaultWindows[5].bench.world}% world, {defaultWindows[5].bench.nat}% nat)</span>
        </div>
      </div>
      {/* Athlete selection */}
      <div style={{ margin: "10px 0 18px 0" }}>
        <b style={{ color: "#FFD700" }}>Select Athlete: </b>
        {athletes.map(a =>
          <button key={a.id} onClick={() => setSelected(a.id)}
            style={{
              background: selected === a.id ? "#FFD700" : "#232a2e",
              color: selected === a.id ? "#232a2e" : "#FFD700",
              fontWeight: 800, border: "none", borderRadius: 8, padding: "7px 13px", margin: 2, cursor: "pointer"
            }}>{a.name}</button>
        )}
        <button onClick={() => setAdding(true)}
          style={{
            background: "#1de682", color: "#232a2e", fontWeight: 900,
            borderRadius: 8, padding: "7px 13px", margin: "0 0 0 5px"
          }}>+ Add Athlete</button>
        {adding && (
          <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 9 }}>
            <input placeholder="Name" style={inputStyleMini} />
            <input type="date" style={inputStyleMini} />
            <select style={inputStyleMini}>{SQUADS.map(s => <option key={s}>{s}</option>)}</select>
            <input type="number" placeholder="PHV" style={inputStyleMini} />
            <button onClick={() => setAdding(false)} style={btnStyle}>Cancel</button>
          </div>
        )}
      </div>
      {/* Timeline per athlete */}
      {athlete && (
        <div style={{ margin: "18px 0 0 0" }}>
          <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 21, marginBottom: 8 }}>
            <FaUserClock style={{ marginRight: 9 }} /> Sensitive Window Timeline: {athlete.name}
          </div>
          <svg width={680} height={80} style={{ marginBottom: 9 }}>
            {/* X axis: Age from 6 to 18 */}
            <line x1={30} y1={55} x2={630} y2={55} stroke="#FFD70066" strokeWidth={2.5} />
            {/* Ticks and labels */}
            {Array.from({ length: 13 }, (_, i) => 6 + i).map(age => (
              <g key={age}>
                <line x1={30 + (age - 6) * 50} y1={47} x2={30 + (age - 6) * 50} y2={63} stroke="#FFD70066" />
                <text x={30 + (age - 6) * 50} y={72} fill="#FFD70099" fontSize={13} textAnchor="middle">{age}</text>
              </g>
            ))}
            {/* Windows as bars */}
            {defaultWindows.map((w, idx) => (
              <rect
                key={w.key}
                x={30 + (w.min - 6) * 50}
                y={7 + idx * 8}
                width={(w.max - w.min) * 50}
                height={6}
                fill={
                  atRiskPrediction(w, athlete) && windowStatus(w, athlete) !== "hit"
                    ? "#ff4848"
                    : windowStatus(w, athlete) === "hit" ? "#1de682"
                    : windowStatus(w, athlete) === "open" ? "#FFD700"
                    : windowStatus(w, athlete) === "missed" ? "#ff4848"
                    : "#232a2e"
                }
                opacity={0.88}
                rx={4}
              />
            ))}
            {/* Current age marker */}
            <line x1={30 + (ageYears(athlete.dob)) * 50} y1={0} x2={30 + (ageYears(athlete.dob)) * 50} y2={77} stroke="#FFD700" strokeDasharray="6,3" strokeWidth={3} />
          </svg>
          <div style={{ display: "flex", gap: 22 }}>
            <div>
              <table style={{ background: "#232a2e", color: "#FFD700", borderRadius: 10, padding: 0, fontWeight: 700, fontSize: 15 }}>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Benchmark</th>
                    <th>History</th>
                    <th>Interventions</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {defaultWindows.map(w => (
                    <tr key={w.key} style={{ background: atRiskPrediction(w, athlete) && windowStatus(w, athlete) !== "hit" ? "#ff484811" : undefined }}>
                      <td>{w.label}</td>
                      <td style={{
                        color: windowStatus(w, athlete) === "hit" ? "#1de682"
                          : atRiskPrediction(w, athlete) && windowStatus(w, athlete) !== "hit" ? "#ff4848"
                          : windowStatus(w, athlete) === "open" ? "#FFD700"
                          : windowStatus(w, athlete) === "missed" ? "#ff4848"
                          : "#fff"
                      }}>
                        {windowStatus(w, athlete)?.toUpperCase() || "-"}
                        {atRiskPrediction(w, athlete) && windowStatus(w, athlete) !== "hit" && <FaExclamationTriangle style={{ color: "#ff4848", marginLeft: 6 }} title="AT RISK of missing window soon" />}
                      </td>
                      <td>
                        <select value={athlete.windowOwners?.[w.key] || COACHES[0].name}
                          style={inputStyleMini}>
                          {COACHES.map(c => <option key={c.name}>{c.name}</option>)}
                        </select>
                      </td>
                      <td>
                        {benchmark(w)}
                      </td>
                      <td>
                        {sparkline(athlete.windowHistory?.[w.key] || [])}
                      </td>
                      <td>
                        <button style={{ ...btnStyle, padding: "2px 7px", fontSize: 12 }}
                          onClick={() => alert(`Intervention: ${aiIntervention(w).text}\nEvidence: ${aiIntervention(w).link}`)}
                        ><FaRobot /> Next Best</button>
                      </td>
                      <td>
                        <button style={{ ...btnStyle, padding: "2px 7px", fontSize: 12 }}
                          onClick={() => setCommentBox({ athlete: athlete.id, window: w.key, text: "" })}
                        ><FaComments /> Comment</button>
                        {athlete.comments?.[w.key]?.map((c, i) => (
                          <div key={i} style={{ color: "#FFD700", fontSize: 12 }}>{c.who}: {c.txt} <span style={{ color: "#FFD70055" }}>({c.date})</span></div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 11, color: "#FFD70099" }}>
                <b>AI: </b>Next 6 months, flagging at-risk windows in RED.
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 340 }}>
              <div style={{ color: "#FFD700", fontWeight: 900, marginBottom: 6 }}>Coach/Board/Parent Intervention Log</div>
              <ul style={{ color: "#FFD700", fontSize: 15, fontWeight: 700 }}>
                {actionLog.filter(log => log.target === athlete.name).map((log, i) => (
                  <li key={i}>
                    <FaClipboardList style={{ marginRight: 5 }} /> [{log.date}] {log.actor}: {log.action} {log.parent && <span style={{ color: "#FFD70088" }}>(Parent notified)</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {/* Live comment box */}
      {commentBox.athlete && (
        <div style={{
          position: "fixed", top: 180, left: 280, background: "#232a2e", color: "#FFD700",
          border: "2px solid #FFD70077", borderRadius: 14, padding: 21, zIndex: 1200, minWidth: 320
        }}>
          <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 7 }}>
            <FaComments style={{ marginRight: 9 }} /> Comment for {athlete.name} / {defaultWindows.find(w => w.key === commentBox.window).label}
          </div>
          <textarea
            value={commentBox.text}
            onChange={e => setCommentBox({ ...commentBox, text: e.target.value })}
            style={{ width: "100%", borderRadius: 7, minHeight: 50, fontSize: 15, border: "1.5px solid #FFD70077", padding: 5 }}
          />
          <div style={{ marginTop: 10 }}>
            <button onClick={() => handleCommentSubmit(commentBox.athlete, commentBox.window)} style={btnStyle}><FaCheck /> Save</button>
            <button onClick={() => setCommentBox({ athlete: null, window: null, text: "" })} style={btnStyle}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{ marginTop: 13, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.” | Ultimate Sensitive Periods Engine
      </div>
    </div>
  );
};

const inputStyleMini = {
  marginRight: 7, marginBottom: 5, padding: 4, borderRadius: 7, border: "1.5px solid #FFD70077", fontSize: 15, width: 135
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "6px 14px", marginRight: 6, cursor: "pointer"
};

export default SensitivePeriodsEngine;
