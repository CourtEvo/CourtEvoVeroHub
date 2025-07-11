import React, { useState } from "react";
import {
  FaHeartbeat, FaExclamationTriangle, FaCheckCircle, FaUserAlt, FaChartLine, FaGraduationCap, FaUsers, FaPlus, FaArrowRight, FaLightbulb, FaCalendarAlt, FaComments, FaUserTie, FaRobot
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e" };

const DEFAULT_ATHLETES = [
  {
    id: 1, name: "Petar Jovanovic", team: "U18", engagement: 8, wellbeing: 8, academic: 9, social: 7, lastRisk: "None",
    riskScore: 2, pulse: [8, 8, 9, 7], streak: 5, timeline: [
      { date: "2024-04-12", type: "Coach Talk", details: "Reviewed season plan" },
      { date: "2024-04-22", type: "Competition", details: "Scored 17 pts vs. Zadar" },
      { date: "2024-05-05", type: "Evaluation", details: "Annual review, no issues" }
    ], lastChange: "Improved well-being", ai: ""
  },
  {
    id: 2, name: "Ivan Radic", team: "U18", engagement: 6, wellbeing: 4, academic: 7, social: 3, lastRisk: "Burnout",
    riskScore: 7, pulse: [7, 5, 7, 3], streak: 2, timeline: [
      { date: "2024-03-21", type: "Medical", details: "Minor injury" },
      { date: "2024-04-18", type: "Coach Talk", details: "Fatigue flagged" },
      { date: "2024-05-05", type: "Evaluation", details: "Well-being plan started" }
    ], lastChange: "Increased risk: social drop", ai: ""
  },
  {
    id: 3, name: "Niko Vulic", team: "U16", engagement: 9, wellbeing: 9, academic: 9, social: 8, lastRisk: "None",
    riskScore: 1, pulse: [8, 9, 8, 9], streak: 7, timeline: [
      { date: "2024-03-28", type: "Parent Meeting", details: "Discussed progress" },
      { date: "2024-04-21", type: "Competition", details: "Team win, high morale" }
    ], lastChange: "Stable", ai: ""
  }
];

// Risk logic
function calcRisk(a) {
  let arr = [a.engagement, a.wellbeing, a.academic, a.social];
  let minPulse = Math.min(...arr);
  if (minPulse <= 3) return { color: "#ff4848", label: "High Risk", level: "Red", score: 8 };
  if (minPulse <= 6) return { color: "#FFD700", label: "Moderate", level: "Yellow", score: 5 };
  return { color: "#1de682", label: "Healthy", level: "Green", score: 2 };
}
// AI narrative
function aiNarrative(a) {
  let risk = calcRisk(a);
  if (risk.level === "Red") return `🚨 Alert: ${a.name} is in high risk zone (last: ${a.lastChange}). Immediate intervention recommended.`;
  if (risk.level === "Yellow") return `⚠️ ${a.name} showing early warning signs (${a.lastChange}). Review and coach follow-up.`;
  return `✔️ ${a.name} is stable (${a.lastChange}). Maintain engagement and pulse checks.`;
}
// Gantt + event streaks
function TimelineGantt({ timeline }) {
  const types = ["Coach Talk", "Competition", "Evaluation", "Medical", "Parent Meeting"];
  return (
    <svg width={240} height={34}>
      {timeline.map((e, i) => {
        let idx = types.indexOf(e.type);
        return (
          <rect
            key={i}
            x={i * 35 + 8}
            y={6 + idx * 4}
            width={24}
            height={7}
            fill={["#FFD700", "#1de682", "#283E51", "#ff4848", "#62d6ff"][idx]}
            rx={3}
          />
        );
      })}
      {timeline.map((e, i) => (
        <text key={i} x={i * 35 + 13} y={28} fontSize={9} fill="#fff">{e.type[0]}</text>
      ))}
    </svg>
  );
}

const AthleteExperienceEngagementSuite = () => {
  const [athletes, setAthletes] = useState([...DEFAULT_ATHLETES]);
  const [expanded, setExpanded] = useState(null);
  const [addMode, setAddMode] = useState(false);
  const [filter, setFilter] = useState("All");
  const [newAthlete, setNewAthlete] = useState({
    name: "", team: "U18", engagement: 7, wellbeing: 7, academic: 7, social: 7, lastRisk: "None", streak: 1, timeline: [], lastChange: "Stable", ai: ""
  });
  const [log, setLog] = useState([{ txt: "No critical risk this week. All flagged athletes reviewed.", by: "Board", date: "2024-06-13" }]);
  const [logText, setLogText] = useState("");
  const [summary, setSummary] = useState(null);

  // Filtering
  let filteredAthletes = athletes;
  if (filter === "At Risk") filteredAthletes = athletes.filter(a => calcRisk(a).level !== "Green");
  if (filter === "Healthy") filteredAthletes = athletes.filter(a => calcRisk(a).level === "Green");
  if (filter === "U18" || filter === "U16" || filter === "Senior") filteredAthletes = athletes.filter(a => a.team === filter);

  // Analytics
  let total = athletes.length;
  let atRisk = athletes.filter(a => calcRisk(a).level !== "Green").length;
  let burnout = athletes.filter(a => a.lastRisk === "Burnout").length;
  let improved = athletes.filter(a => a.lastChange.toLowerCase().includes("improved")).length;
  let deteriorated = athletes.filter(a => a.lastChange.toLowerCase().includes("drop") || a.lastChange.toLowerCase().includes("risk")).length;
  let stable = athletes.filter(a => a.lastChange === "Stable").length;

  // CRUD
  const addAthlete = () => {
    setAthletes([
      ...athletes,
      { ...newAthlete, id: athletes.length ? Math.max(...athletes.map(a => a.id)) + 1 : 1, pulse: [newAthlete.engagement, newAthlete.wellbeing, newAthlete.academic, newAthlete.social] }
    ]);
    setAddMode(false);
    setNewAthlete({ name: "", team: "U18", engagement: 7, wellbeing: 7, academic: 7, social: 7, lastRisk: "None", streak: 1, timeline: [], lastChange: "Stable", ai: "" });
  };
  const removeAthlete = id => setAthletes(athletes.filter(a => a.id !== id));

  // Timeline
  const addTimelineEvent = (id, event) => {
    setAthletes(athletes.map(a =>
      a.id === id
        ? {
            ...a,
            timeline: [...a.timeline, event],
            lastChange: `Added event: ${event.type}`,
            streak: a.streak + 1
          }
        : a
    ));
  };

  // Scenario: Board action/intervene
  const intervene = (id) => {
    setAthletes(athletes.map(a =>
      a.id === id ? { ...a, lastChange: "Board Intervention", ai: aiNarrative(a) } : a
    ));
    setLog([...log, { by: "Board", txt: `Intervened with athlete ID ${id}`, date: new Date().toISOString().slice(0, 10) }]);
  };

  // Export summary
  const exportSummary = () => {
    let txt = `Total: ${total}, At risk: ${atRisk}, Burnout: ${burnout}, Improved: ${improved}, Deteriorated: ${deteriorated}, Stable: ${stable}`;
    setSummary(txt);
    setTimeout(() => setSummary(null), 5000);
  };

  // Log
  const addLog = () => {
    if (!logText.trim()) return;
    setLog([...log, { by: "Board", txt: logText, date: new Date().toISOString().slice(0, 10) }]);
    setLogText("");
  };

  // --- UI ---
  return (
    <div style={{
      background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif",
      borderRadius: 30, padding: 32, boxShadow: "0 8px 64px #232a2e66", maxWidth: 1900, margin: "0 auto"
    }}>
      {/* Analytics header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18
      }}>
        <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
          <FaHeartbeat size={38} color={brand.gold} />
          <h2 style={{ fontWeight: 900, fontSize: 33, color: brand.gold, letterSpacing: 2, margin: 0 }}>
            Athlete Experience & Engagement Suite
          </h2>
          <span style={{
            background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 18,
            padding: '7px 30px', fontSize: 18, marginLeft: 20, boxShadow: '0 2px 10px #FFD70044'
          }}>
            CourtEvo Vero | Pulse Wall
          </span>
        </div>
        <button onClick={exportSummary} style={{
          background: "#1de682", color: "#232a2e", border: "none", borderRadius: 10,
          fontWeight: 900, fontSize: 18, padding: "11px 28px"
        }}>
          <FaRobot style={{ marginRight: 9 }} /> AI Weekly Summary
        </button>
      </div>
      {/* Summary popup */}
      {summary &&
        <div style={{ background: "#FFD700", color: "#232a2e", fontWeight: 900, borderRadius: 17, padding: 16, marginBottom: 13, fontSize: 18 }}>
          <FaLightbulb style={{ color: "#FFD700", marginRight: 8 }} /> {summary}
        </div>
      }
      {/* Filters */}
      <div style={{ display: "flex", gap: 13, marginBottom: 19 }}>
        {["All", "At Risk", "Healthy", "U16", "U18", "Senior"].map(f =>
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? "#FFD700" : "#232a2e", color: filter === f ? "#232a2e" : "#FFD700",
            fontWeight: 700, border: "none", borderRadius: 10, padding: "7px 18px", fontSize: 16, boxShadow: "0 2px 8px #FFD70033"
          }}>{f}</button>
        )}
      </div>
      {/* Pulse wall grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 24, marginBottom: 27
      }}>
        {filteredAthletes.map((a, i) => {
          let risk = calcRisk(a);
          return (
            <div key={a.id}
              style={{
                background: risk.color + "33", borderRadius: 18, boxShadow: "0 2px 18px " + risk.color + "22",
                padding: 22, position: "relative", cursor: "pointer", transition: "transform 0.18s", border: "2px solid " + risk.color,
                minHeight: 190, display: "flex", flexDirection: "column", alignItems: "flex-start"
              }}
              onClick={() => setExpanded(a.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaUserAlt style={{ fontSize: 23, color: risk.color }} />
                <div style={{ fontWeight: 800, fontSize: 21, color: "#fff" }}>{a.name}</div>
                <span style={{
                  background: "#232a2e", color: risk.color, fontWeight: 700,
                  borderRadius: 7, padding: "2px 13px", fontSize: 13, marginLeft: 7
                }}>{a.team}</span>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 13, marginTop: 11, marginBottom: 7
              }}>
                <FaHeartbeat /> {a.engagement}
                <FaCheckCircle /> {a.wellbeing}
                <FaGraduationCap /> {a.academic}
                <FaComments /> {a.social}
              </div>
              <div style={{ fontWeight: 700, color: risk.color, fontSize: 15, marginTop: 5 }}>
                {risk.label}
              </div>
              <div style={{ fontWeight: 500, color: "#FFD700", fontSize: 12, marginTop: 2 }}>{a.lastChange}</div>
              {/* Heatwave meter */}
              <div style={{ marginTop: 8, marginBottom: 3, width: "100%", display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{
                  background: "#232a2e", height: 7, borderRadius: 6, width: 90, overflow: "hidden"
                }}>
                  <div style={{
                    background: risk.color, height: "100%", width: `${a.streak * 12}%`, borderRadius: 5, transition: "width 0.3s"
                  }} />
                </div>
                <span style={{
                  color: risk.color, fontWeight: 800, fontSize: 12
                }}>Streak: {a.streak}</span>
              </div>
              <div style={{ fontWeight: 500, color: "#fff", fontSize: 13 }}>
                {aiNarrative(a)}
              </div>
            </div>
          );
        })}
      </div>
      {/* Athlete storyboard */}
      {expanded &&
        (() => {
          const a = athletes.find(x => x.id === expanded);
          if (!a) return null;
          let risk = calcRisk(a);
          return (
            <div style={{
              background: "#232a2e", borderRadius: 24, boxShadow: "0 4px 48px #FFD70022",
              padding: 33, marginBottom: 25, display: "flex", gap: 28
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <FaUserTie style={{ fontSize: 36, color: risk.color }} />
                  <span style={{ fontWeight: 900, fontSize: 28, color: "#fff" }}>{a.name}</span>
                  <span style={{ background: risk.color, color: "#232a2e", fontWeight: 700, borderRadius: 8, padding: '5px 13px', fontSize: 17, marginLeft: 12 }}>
                    {a.team}
                  </span>
                </div>
                <div style={{ marginTop: 19, fontWeight: 700, color: risk.color, fontSize: 19 }}>
                  {risk.label} ({risk.level}) – Last Risk: {a.lastRisk}
                </div>
                <div style={{ marginTop: 8, fontWeight: 500, color: "#FFD700", fontSize: 15 }}>
                  {aiNarrative(a)}
                </div>
                <div style={{ marginTop: 11 }}>
                  <b>PULSE (E/W/A/S):</b> {a.engagement}/{a.wellbeing}/{a.academic}/{a.social}
                </div>
                <div style={{ marginTop: 13 }}>
                  <TimelineGantt timeline={a.timeline} />
                </div>
                <div style={{ marginTop: 16 }}>
                  <b>Event Timeline:</b>
                  <ul>
                    {a.timeline.map((e, j) =>
                      <li key={j} style={{ color: "#FFD700", fontWeight: 700 }}>
                        <FaCalendarAlt /> {e.date}: <span style={{ color: "#fff" }}>{e.type} – {e.details}</span>
                      </li>
                    )}
                  </ul>
                  <button
                    onClick={() => {
                      let date = prompt("Event date (YYYY-MM-DD):");
                      let type = prompt("Type (Coach Talk, Competition, Evaluation, Medical, Parent Meeting):");
                      let details = prompt("Details:");
                      if (date && type && details) addTimelineEvent(a.id, { date, type, details });
                    }}
                    style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginTop: 3, fontSize: 15 }}>
                    <FaPlus /> Add Event
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, marginLeft: 12, display: "flex", flexDirection: "column", gap: 17 }}>
                <button onClick={() => intervene(a.id)} style={{
                  background: "#ff4848", color: "#fff", fontWeight: 900, fontSize: 19,
                  border: "none", borderRadius: 11, padding: "13px 22px", boxShadow: "0 2px 9px #ff484844"
                }}>
                  <FaExclamationTriangle style={{ marginRight: 8 }} /> INTERVENE & FLAG
                </button>
                <button onClick={() => setExpanded(null)} style={{
                  background: "#FFD700", color: "#232a2e", fontWeight: 900, fontSize: 18,
                  border: "none", borderRadius: 11, padding: "13px 22px"
                }}>
                  <FaArrowRight style={{ marginRight: 8 }} /> CLOSE STORYBOARD
                </button>
                <div style={{
                  background: "#FFD70022", borderRadius: 9, padding: 18, color: "#FFD700", fontWeight: 800, fontSize: 17
                }}>
                  <FaLightbulb style={{ marginRight: 7 }} /> Last Boardroom Action: {a.lastChange}
                </div>
                <div style={{
                  background: "#1de68222", borderRadius: 9, padding: 14, color: "#1de682", fontWeight: 700, fontSize: 15
                }}>
                  <FaRobot style={{ marginRight: 6 }} /> AI Suggestion: {aiNarrative(a)}
                </div>
                <button onClick={() => removeAthlete(a.id)} style={{
                  background: "#232a2e", color: "#ff4848", fontWeight: 900, fontSize: 18,
                  border: "2px solid #ff4848", borderRadius: 11, padding: "11px 22px"
                }}>
                  REMOVE ATHLETE
                </button>
              </div>
            </div>
          );
        })()
      }
      {/* Add Athlete FAB */}
      <button onClick={() => setAddMode(m => !m)} style={{
        position: "fixed", bottom: 39, right: 39, background: "#FFD700", color: "#232a2e",
        border: "none", borderRadius: 35, width: 64, height: 64, fontWeight: 900, fontSize: 35, boxShadow: "0 2px 22px #FFD70044", zIndex: 40
      }}>
        <FaPlus />
      </button>
      {addMode &&
        <div style={{
          position: "fixed", bottom: 120, right: 42, background: "#232a2e", borderRadius: 17,
          boxShadow: "0 8px 36px #FFD70044", padding: 28, zIndex: 1000
        }}>
          <h3 style={{ color: "#FFD700", marginTop: 0 }}>Add Athlete</h3>
          <input value={newAthlete.name} placeholder="Name" onChange={e => setNewAthlete({ ...newAthlete, name: e.target.value })} style={inputStyle} />
          <select value={newAthlete.team} onChange={e => setNewAthlete({ ...newAthlete, team: e.target.value })} style={inputStyleMini}>
            <option>U16</option><option>U18</option><option>Senior</option>
          </select>
          <input value={newAthlete.engagement} type="number" min={1} max={10} placeholder="Engagement" onChange={e => setNewAthlete({ ...newAthlete, engagement: Number(e.target.value) })} style={inputStyleMini} />
          <input value={newAthlete.wellbeing} type="number" min={1} max={10} placeholder="Well-being" onChange={e => setNewAthlete({ ...newAthlete, wellbeing: Number(e.target.value) })} style={inputStyleMini} />
          <input value={newAthlete.academic} type="number" min={1} max={10} placeholder="Academic" onChange={e => setNewAthlete({ ...newAthlete, academic: Number(e.target.value) })} style={inputStyleMini} />
          <input value={newAthlete.social} type="number" min={1} max={10} placeholder="Social" onChange={e => setNewAthlete({ ...newAthlete, social: Number(e.target.value) })} style={inputStyleMini} />
          <button onClick={addAthlete} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginLeft: 11 }}><FaPlus /> Add</button>
        </div>
      }
      {/* Boardroom Log */}
      <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, marginBottom: 5 }}>
        <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 7 }}><FaComments style={{ marginRight: 7 }} /> Athlete Pulse Log</div>
        <div style={{ maxHeight: 95, overflowY: "auto", fontSize: 14, marginBottom: 5 }}>
          {log.map((c, i) =>
            <div key={i}>
              <span style={{ color: "#FFD700", fontWeight: 700 }}>{c.by}:</span> {c.txt}
              <span style={{ color: "#FFD70077", fontSize: 12, marginLeft: 6 }}>{c.date}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={logText} placeholder="Add note or action..." onChange={e => setLogText(e.target.value)} style={inputStyleFull} />
          <button onClick={addLog} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>Send</button>
        </div>
      </div>
      <div style={{ marginTop: 13, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.”
      </div>
    </div>
  );
};

const inputStyle = {
  marginRight: 7, marginBottom: 5, padding: 4, borderRadius: 7, border: "1px solid #FFD70077", fontSize: 15, width: 110
};
const inputStyleFull = {
  ...inputStyle, width: 220
};
const inputStyleMini = {
  ...inputStyle, width: 70, fontSize: 14, marginRight: 0, marginBottom: 2
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default AthleteExperienceEngagementSuite;
