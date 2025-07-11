import React, { useState } from "react";
import { FaUserGraduate, FaChartLine, FaArrowRight, FaFileExport, FaRobot, FaBolt, FaBrain, FaHistory, FaClipboardCheck, FaStar, FaUserCheck, FaUsers, FaSlidersH, FaMedal, FaTrophy, FaChartBar, FaEye, FaExclamationTriangle, FaDotCircle, FaLayerGroup, FaCommentDots, FaFilter } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- DEMO DATA ---
const players = [
  { id: 1, name: "Luka Vuković", pos: "PG", learning: 93, type: "Cognitive", group: "U19", skills: { "PnR": 90, "Off-Ball": 87, "Switch D": 74, "3x3": 88 }, transfer: ["PnR", "Switch D"], rapid: true, notes: "Absorbs complex tactics instantly, struggles with new physical cues.", timeline: [81, 85, 87, 93], compliance: 97, feedback: ["Elite in pressure learning", "Needs kinetic drills"] },
  { id: 2, name: "Ivan Horvat", pos: "SG", learning: 74, type: "Kinetic", group: "U19", skills: { "PnR": 68, "Off-Ball": 72, "Switch D": 74, "3x3": 73 }, transfer: ["Off-Ball"], rapid: false, notes: "Quick with footwork, slower with new reads.", timeline: [55, 62, 66, 74], compliance: 82, feedback: ["Great with footwork", "Extra video works"] },
  { id: 3, name: "Tomislav Šarić", pos: "C", learning: 62, type: "Visual", group: "U17", skills: { "PnR": 44, "Off-Ball": 59, "Switch D": 62, "3x3": 58 }, transfer: [], rapid: false, notes: "Needs more rep volume, visual learning preference.", timeline: [29, 41, 56, 62], compliance: 70, feedback: ["Visual demos = faster progress"] },
  { id: 4, name: "Marko Jurić", pos: "SF", learning: 81, type: "Cognitive", group: "U19", skills: { "PnR": 73, "Off-Ball": 81, "Switch D": 71, "3x3": 77 }, transfer: ["Off-Ball", "PnR"], rapid: true, notes: "Can cross-transfer skill, fast if task is explained with context.", timeline: [68, 74, 78, 81], compliance: 90, feedback: ["Mentors well", "Needs challenge"] },
];
const skillList = ["PnR", "Off-Ball", "Switch D", "3x3"];
const interventions = ["Extra Session", "Video Review", "Peer Mentor", "Coach 1-on-1", "Scenario Sim"];
const squadBenchmarks = { learning: 76, league: 73, elite: 87, transfer: 65, league: 59, elite: 82, compliance: 85, league: 80, elite: 93 };
const transferFlows = [
  { from: "PnR", to: "3x3", value: 75 },
  { from: "Off-Ball", to: "Switch D", value: 61 },
  { from: "3x3", to: "PnR", value: 55 },
];
// Skill gaps by athlete (fake data for demo)
const skillGaps = {
  1: ["Switch D"],
  2: ["PnR"],
  3: ["PnR", "Off-Ball", "3x3"],
  4: []
};
// --- Learning Events Timeline (per player id) ---
const learningEvents = {
  1: [
    { date: "2025-02-01", type: "breakthrough", desc: "Mastered advanced PnR in 4 sessions", star: true },
    { date: "2025-02-10", type: "relapse", desc: "Short focus lapse—video review fixed it", star: false },
    { date: "2025-03-01", type: "cross-skill", desc: "Applied PnR reads in 3x3 games", star: true },
  ],
  2: [
    { date: "2025-02-02", type: "breakthrough", desc: "Rapid off-ball movement adaptation", star: true },
    { date: "2025-02-12", type: "stagnation", desc: "Struggled with new defensive calls", star: false },
  ],
  3: [
    { date: "2025-01-30", type: "relapse", desc: "Regressed in Switch D—extra rep needed", star: false },
    { date: "2025-02-13", type: "breakthrough", desc: "Visual cues = jump in 3x3 skill", star: true },
  ],
  4: [
    { date: "2025-02-05", type: "breakthrough", desc: "Mentored Ivan on Off-Ball, improved both", star: true },
    { date: "2025-02-21", type: "breakthrough", desc: "Context-based learning—quickest in group", star: true },
  ]
};

const colorByScore = s => s > 85 ? "#FFD700" : s > 70 ? "#1de682" : s > 55 ? "#3f8cfa" : "#FF4848";
const barBg = val => `linear-gradient(90deg,#FFD700 ${val}%,#232b39 ${val}%)`;

function Button({ children, ...props }) {
  return (
    <button style={{
      background: "linear-gradient(90deg,#FFD700 80%,#1de682 100%)",
      border: "none", borderRadius: 11, color: "#181e23", fontWeight: 900,
      fontSize: 17, padding: "12px 20px", margin: "0 8px 0 0", cursor: "pointer", boxShadow: "0 2px 10px #FFD70044"
    }} {...props}>{children}</button>
  );
}
const sparkline = arr => (
  <svg width={84} height={20}><polyline fill="none" stroke="#FFD700" strokeWidth={3} points={arr.map((v, ix) => `${ix * 21},${20 - v / 7}`).join(" ")} /></svg>
);

export default function LearningAgilityMatrix() {
  const [drawer, setDrawer] = useState(null);
  const [assign, setAssign] = useState({ player: 1, type: interventions[0] });
  const [interventionsLog, setInterventionsLog] = useState([]);
  const [showExport, setShowExport] = useState(false);
  const [showSim, setShowSim] = useState(false);
  const [simRes, setSimRes] = useState(null);
  const [filter, setFilter] = useState("");
  const [group, setGroup] = useState("All");
  const [view, setView] = useState("Position");
  const [timelineFilter, setTimelineFilter] = useState("");
  const [coachBroadcast, setCoachBroadcast] = useState("");
  const [feedback, setFeedback] = useState({ player: 1, text: "" });
  const [feedbackLog, setFeedbackLog] = useState([]);

  // Simulate adaptation scenario
  function runSimulation() {
    setSimRes({
      summary: "If Luka and Marko cross-train for Switch D, expected learning index: Luka +3, Marko +2, squad average +1.2. Rapid adapters push squad up league benchmarks.",
      delta: { Luka: +3, Marko: +2 }
    });
  }

  // AI Next Step Generator
  function recommendNextStep(playerId) {
    const p = players.find(x => x.id === playerId);
    return p.rapid
      ? "Assign new role challenge, rotate as peer mentor."
      : "Double session on transfer skill with AI scenario sim.";
  }

  // Coach Broadcast Handler
  function sendBroadcast() {
    alert("Coach broadcast sent to all players: " + coachBroadcast);
    setCoachBroadcast("");
  }

  // --- Individual Drawer
  function PlayerDrawer() {
    if (drawer == null) return null;
    const p = players.find(x => x.id === drawer);
    return (
      <motion.div initial={{ x: 420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 420, opacity: 0 }}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 440, zIndex: 99, background: "#181e23", boxShadow: "-6px 0 30px #FFD70099", padding: 35, overflowY: "auto", color: "#fff"
        }}>
        <div style={{ fontWeight: 900, fontSize: 22, color: "#FFD700" }}>{p.name} <span style={{ color: "#1de682", fontSize: 13, marginLeft: 6 }}>{p.pos}</span></div>
        <div><b style={{ color: "#FFD700" }}><FaMedal /> Group:</b> <span style={{ color: "#1de682" }}>{p.group}</span></div>
        <div style={{ margin: "10px 0 15px 0" }}>
          <b style={{ color: "#FFD700" }}><FaChartLine /> Learning Progress:</b>
          <div>{sparkline(p.timeline)}</div>
        </div>
        <div>
          <b style={{ color: "#FFD700" }}><FaBrain /> Profile:</b>
          <div>Type: <span style={{ color: "#1de682" }}>{p.type}</span></div>
          <div>Notes: <span style={{ color: "#FFD700" }}>{p.notes}</span></div>
        </div>
        <div style={{ margin: "10px 0" }}>
          <b style={{ color: "#FFD700" }}>Skill Portfolio:</b>
          <ul>{Object.entries(p.skills).map(([k, v]) =>
            <li key={k} style={{ color: colorByScore(v), fontWeight: 900 }}>{k}: {v}</li>
          )}</ul>
        </div>
        <div>
          <b style={{ color: "#FFD700" }}>Skill Gaps:</b>
          {skillGaps[p.id] && skillGaps[p.id].length ? skillGaps[p.id].map((g, i) =>
            <span key={i} style={{ background: "#FF4848", color: "#fff", borderRadius: 6, padding: "2px 7px", marginRight: 7, fontWeight: 900 }}>{g}</span>
          ) : <span style={{ color: "#1de682", marginLeft: 6 }}>None</span>}
        </div>
        <div>
          <b style={{ color: "#FFD700" }}>Transfer Links:</b>
          {p.transfer.length ? p.transfer.map((t, i) =>
            <span key={i} style={{ background: "#FFD700", color: "#232b39", borderRadius: 6, padding: "2px 7px", marginRight: 7, fontWeight: 900 }}>{t}</span>
          ) : <span style={{ color: "#FF4848", marginLeft: 6 }}>None</span>}
        </div>
        <div style={{ marginTop: 12, fontWeight: 800, color: "#FFD700" }}>
          <FaRobot style={{ marginRight: 5 }} />
          AI Recommendation: {recommendNextStep(p.id)}
          <Button size="sm" style={{ background: "#1de682", color: "#181e23", marginLeft: 9 }} onClick={() => alert(recommendNextStep(p.id))}>Prescribe Plan</Button>
        </div>
        <div style={{ marginTop: 7, color: "#FFD700", fontWeight: 900 }}>
          <FaStar /> Coach/Peer Feedback:
          <ul>
            {p.feedback.map((f, i) => (
              <li key={i} style={{ color: "#1de682", fontWeight: 700 }}>{f}</li>
            ))}
            {feedbackLog.filter(fb => fb.player === p.id).map((fb, i) => (
              <li key={"fb-" + i} style={{ color: "#FFD700", fontWeight: 700 }}>{fb.text} <span style={{ color: "#FFD700", fontWeight: 900, marginLeft: 5 }}>(Coach)</span></li>
            ))}
          </ul>
          <div style={{ marginTop: 5, display: "flex", alignItems: "center" }}>
            <input value={feedback.player === p.id ? feedback.text : ""} onChange={e => setFeedback({ player: p.id, text: e.target.value })} placeholder="Add feedback..." style={{ borderRadius: 7, padding: 6, marginRight: 5, width: 180 }} />
            <Button size="sm" style={{ background: "#FFD700", color: "#181e23" }} onClick={() => {
              setFeedbackLog([...feedbackLog, { player: p.id, text: feedback.text }]);
              setFeedback({ player: p.id, text: "" });
            }}><FaCommentDots /> Add</Button>
            <Button size="sm" style={{ background: "#1de682", color: "#181e23", marginLeft: 7 }} onClick={() => setFeedback({ player: p.id, text: "Great adjustment in scenario sim!" })}><FaRobot /> AI Coach</Button>
          </div>
        </div>
        <div style={{ marginTop: 5, fontWeight: 800, color: "#1de682" }}>Intervention Compliance: {p.compliance}%</div>
        <div style={{ marginTop: 17 }}>
          <b style={{ color: "#FFD700" }}><FaHistory /> Learning Events</b>
          <ul>
            {(learningEvents[p.id] || []).map((e, i) => (
              <li key={i} style={{ color: e.star ? "#FFD700" : "#fff", fontWeight: e.star ? 900 : 700 }}>
                {e.date}: {e.desc} {e.type === "breakthrough" && <FaMedal style={{ color: "#FFD700" }} />}
                {e.type === "relapse" && <FaExclamationTriangle style={{ color: "#FF4848" }} />}
              </li>
            ))}
          </ul>
        </div>
        <Button style={{ background: "#FFD700", color: "#181e23", marginTop: 14 }} onClick={() => setDrawer(null)}>Close</Button>
      </motion.div>
    );
  }

  // --- Skill Gap Radar SVG
  function SkillGapRadar() {
    // Create skill axis per skill, show missing/weak as red, strong as gold/green
    const angles = skillList.map((_, i, arr) => 2 * Math.PI * i / arr.length);
    return (
      <svg width={270} height={270} style={{ background: "#181e23", borderRadius: 20 }}>
        <g transform="translate(135,135)">
          {/* Axes */}
          {angles.map((a, i) =>
            <line key={i} x1={0} y1={0} x2={110 * Math.cos(a - Math.PI / 2)} y2={110 * Math.sin(a - Math.PI / 2)} stroke="#FFD700" strokeWidth={2} />
          )}
          {/* Skill points for each player */}
          {players.map((p, pi) =>
            <polyline
              key={pi}
              fill={["#FFD70099", "#1de68299", "#FF484899", "#3f8cfa99"][pi]}
              stroke={["#FFD700", "#1de682", "#FF4848", "#3f8cfa"][pi]}
              strokeWidth={3}
              points={
                skillList.map((s, i) => {
                  const r = ((p.skills[s] || 0) / 100) * 110;
                  const x = r * Math.cos(angles[i] - Math.PI / 2), y = r * Math.sin(angles[i] - Math.PI / 2);
                  return `${x},${y}`;
                }).join(" ")
              }
              opacity={0.55}
            />
          )}
        </g>
        {/* Skill labels */}
        {skillList.map((s, i) => (
          <text
            key={s}
            x={135 + 118 * Math.cos(angles[i] - Math.PI / 2)}
            y={135 + 118 * Math.sin(angles[i] - Math.PI / 2) + 7}
            textAnchor="middle"
            fontWeight={900}
            fontSize={16}
            fill="#FFD700"
          >{s}</text>
        ))}
      </svg>
    );
  }

  // --- Adaptability Heatmap
  function AdaptabilityHeatmap() {
    return (
      <table style={{ borderCollapse: "collapse", width: "100%", background: "#232b39", borderRadius: 13 }}>
        <thead>
          <tr>
            <th style={{ color: "#FFD700", fontWeight: 900, padding: 8 }}>Athlete</th>
            <th style={{ color: "#FFD700", fontWeight: 900, padding: 8 }}>Learning</th>
            <th style={{ color: "#FFD700", fontWeight: 900, padding: 8 }}>Compliance</th>
            <th style={{ color: "#FFD700", fontWeight: 900, padding: 8 }}>Transfer</th>
            <th style={{ color: "#FFD700", fontWeight: 900, padding: 8 }}>Risk</th>
          </tr>
        </thead>
        <tbody>
          {players.map(p =>
            <tr key={p.id}>
              <td style={{ color: "#FFD700", fontWeight: 900, padding: 8 }}>{p.name}</td>
              <td style={{ background: colorByScore(p.learning), color: "#181e23", fontWeight: 900, textAlign: "center", borderRadius: 5 }}>{p.learning}</td>
              <td style={{ background: colorByScore(p.compliance), color: "#181e23", fontWeight: 900, textAlign: "center", borderRadius: 5 }}>{p.compliance}</td>
              <td style={{ background: colorByScore((p.transfer.length / skillList.length) * 100), color: "#181e23", fontWeight: 900, textAlign: "center", borderRadius: 5 }}>{p.transfer.length}</td>
              <td style={{ background: skillGaps[p.id] && skillGaps[p.id].length ? "#FF4848" : "#1de682", color: "#181e23", fontWeight: 900, textAlign: "center", borderRadius: 5 }}>
                {skillGaps[p.id] && skillGaps[p.id].length ? "At Risk" : "On Track"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  // --- Timeline Filter/Export
  function TimelineFilterExport() {
    const flatEvents = Object.entries(learningEvents).flatMap(([pid, events]) =>
      events.map(e => ({ ...e, player: players.find(p => p.id == pid).name }))
    );
    const filteredEvents = flatEvents.filter(e =>
      (!timelineFilter || e.type.includes(timelineFilter) || e.player.includes(timelineFilter) || e.date.includes(timelineFilter))
    );
    return (
      <div style={{ background: "#232b39", borderRadius: 13, padding: "12px 18px", marginBottom: 14 }}>
        <b style={{ color: "#FFD700", fontSize: 15 }}><FaHistory /> Learning Events Timeline</b>
        <div style={{ display: "flex", alignItems: "center", marginTop: 6 }}>
          <FaFilter style={{ color: "#FFD700", marginRight: 7 }} />
          <input value={timelineFilter} onChange={e => setTimelineFilter(e.target.value)} placeholder="Type, player, date..." style={{ borderRadius: 7, padding: 6, marginRight: 5 }} />
          <Button size="sm" style={{ background: "#FFD700", color: "#181e23" }} onClick={() => alert("Exported! (PDF/Excel coming soon)")}>Export</Button>
        </div>
        <ul style={{ marginTop: 7 }}>
          {filteredEvents.map((e, i) =>
            <li key={i} style={{ color: e.star ? "#FFD700" : "#fff", fontWeight: e.star ? 900 : 700 }}>
              {e.date} - {e.player}: {e.desc} {e.type === "breakthrough" && <FaMedal style={{ color: "#FFD700" }} />}
              {e.type === "relapse" && <FaExclamationTriangle style={{ color: "#FF4848" }} />}
            </li>
          )}
        </ul>
      </div>
    );
  }

  // --- Main Render
  const filtered = players.filter(p =>
    (group === "All" || p.group === group) &&
    (!filter || p.name.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg,#0b3326 0%,#283E51 100%)", color: "#fff",
      fontFamily: "Segoe UI,sans-serif", padding: 0, overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "28px 0 18px 38px", background: "#181e23", boxShadow: "0 1px 16px #FFD70022" }}>
        <FaUserGraduate style={{ fontSize: 31, color: "#FFD700" }} />
        <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: 1 }}>Learning Agility & Skill Transfer Matrix</span>
        <span style={{ color: "#1de682", fontWeight: 900, marginLeft: 13 }}><FaChartLine style={{ marginRight: 8 }} />Agility & Transfer</span>
        <Button style={{ marginLeft: 13, background: "#FFD700", color: "#181e23" }} onClick={() => setShowExport(true)}><FaFileExport style={{ marginRight: 7 }} />Export</Button>
      </div>
      {/* Coach Panel */}
      <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "20px 38px 0 38px", flexWrap: "wrap" }}>
        <span style={{ color: "#FFD700", fontWeight: 900 }}>Squad:</span>
        <select value={group} onChange={e => setGroup(e.target.value)} style={{ fontWeight: 900, padding: "8px 18px", borderRadius: 10 }}>
          <option>All</option>
          {[...new Set(players.map(p => p.group))].map(g => <option key={g}>{g}</option>)}
        </select>
        <span style={{ color: "#FFD700", fontWeight: 900 }}>Search:</span>
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Name..." style={{ fontWeight: 700, borderRadius: 8, padding: 8, minWidth: 120 }} />
        <span style={{ color: "#FFD700", fontWeight: 900, marginLeft: 19 }}><FaChartBar /> Avg: {squadBenchmarks.learning} | Elite: {squadBenchmarks.elite} | League: {squadBenchmarks.league}</span>
        <textarea value={coachBroadcast} onChange={e => setCoachBroadcast(e.target.value)} placeholder="Coach broadcast to all..." style={{ borderRadius: 9, padding: 7, minWidth: 200, minHeight: 32, marginLeft: 18 }} />
        <Button size="sm" style={{ background: "#FFD700", color: "#181e23" }} onClick={sendBroadcast}><FaUsers /> Send</Button>
      </div>
      {/* Main Area: Heatmap, Skill Gap Radar, Matrix */}
      <div style={{ display: "flex", gap: 38, padding: "18px 38px 0 38px", flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 420 }}>
          <div style={{ marginBottom: 13 }}>
            <b style={{ color: "#FFD700", fontSize: 17 }}><FaDotCircle /> Squad Skill Gap Radar</b>
            <SkillGapRadar />
          </div>
          <div style={{ marginBottom: 13 }}>
            <b style={{ color: "#FFD700", fontSize: 17 }}><FaChartBar /> Adaptability Heatmap</b>
            <AdaptabilityHeatmap />
          </div>
          <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: 19 }}>
            <thead>
              <tr>
                <th style={{ color: "#FFD700", fontWeight: 900, fontSize: 16, padding: "9px 5px" }}>Athlete</th>
                <th style={{ color: "#FFD700", fontWeight: 900, fontSize: 16, padding: "9px 5px" }}>Learning</th>
                {skillList.map(s =>
                  <th key={s} style={{ color: "#FFD700", fontWeight: 900, fontSize: 16, padding: "9px 5px" }}>{s}</th>
                )}
                <th style={{ color: "#FFD700", fontWeight: 900, fontSize: 16, padding: "9px 5px" }}>Transfer</th>
                <th style={{ color: "#FFD700", fontWeight: 900, fontSize: 16, padding: "9px 5px" }}>Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p =>
                <tr key={p.id}>
                  <td style={{ color: "#FFD700", fontWeight: 900, padding: "9px 5px" }}>{p.name}</td>
                  <td style={{ color: colorByScore(p.learning), fontWeight: 900, padding: "9px 5px" }}>{p.learning} {p.rapid && <FaBolt style={{ color: "#FFD700", marginLeft: 6 }} />}</td>
                  {skillList.map(s =>
                    <td key={s}>
                      <div style={{ fontWeight: 900, color: colorByScore(p.skills[s]) }}>{p.skills[s]}</div>
                      <div style={{
                        background: barBg(p.skills[s]),
                        height: 5, borderRadius: 7, marginTop: 2
                      }} />
                    </td>
                  )}
                  <td>
                    {p.transfer.map((t, i) =>
                      <span key={i} style={{ background: "#FFD700", color: "#232b39", borderRadius: 6, padding: "2px 7px", marginRight: 7, fontWeight: 900 }}>{t} <FaArrowRight /></span>
                    )}
                  </td>
                  <td style={{ color: "#1de682", fontWeight: 900 }}>{p.type}</td>
                  <td><Button style={{ background: "#1de682", color: "#181e23" }} onClick={() => setDrawer(p.id)}><FaEye /> Details</Button></td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Squad Adaptability Simulation */}
          <div style={{ background: "#232b39", borderRadius: 13, padding: "12px 18px", marginBottom: 14 }}>
            <b style={{ color: "#FFD700", fontSize: 15 }}><FaSlidersH /> Squad Adaptability Simulation</b>
            <Button style={{ background: "#1de682", color: "#181e23", marginTop: 5 }} onClick={() => { setShowSim(true); runSimulation(); }}>Simulate Cross-Training Impact</Button>
            {showSim && simRes && (
              <div style={{ marginTop: 13 }}>
                <span style={{ color: "#FFD700", fontWeight: 900 }}>{simRes.summary}</span>
                <div style={{ display: "flex", gap: 9, marginTop: 7 }}>
                  {Object.entries(simRes.delta).map(([k, v]) =>
                    <span key={k} style={{ background: "#FFD700", color: "#232b39", borderRadius: 6, padding: "4px 12px", fontWeight: 900 }}>{k}: {v > 0 ? "+" : ""}{v}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Right panel: agility timelines, feedback, intervention, timeline filter/export */}
        <div style={{ flex: 1, minWidth: 340 }}>
          {/* Agility Timelines */}
          <div style={{ background: "#232b39", borderRadius: 13, padding: "12px 18px", marginBottom: 14 }}>
            <b style={{ color: "#FFD700", fontSize: 15 }}><FaHistory /> Agility Timelines</b>
            <div style={{ display: "flex", gap: 17, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
              {filtered.map(p =>
                <div key={p.id} style={{ color: colorByScore(p.learning), fontWeight: 900 }}>
                  {p.name.split(" ")[0]}<br />{sparkline(p.timeline)}
                </div>
              )}
            </div>
          </div>
          {/* Peer/Coach Feedback */}
          <div style={{ background: "#232b39", borderRadius: 13, padding: "12px 18px", marginBottom: 14 }}>
            <b style={{ color: "#FFD700" }}><FaStar /> Coach/Peer Feedback</b>
            <ul>
              {filtered.flatMap(p => p.feedback.map((f, i) =>
                <li key={p.id + "-" + i} style={{ color: "#1de682", fontWeight: 700 }}>{p.name.split(" ")[0]}: {f}</li>
              ))}
              {feedbackLog.map((fb, i) => (
                <li key={"fb-log-" + i} style={{ color: "#FFD700", fontWeight: 700 }}>{players.find(p => p.id === fb.player).name}: {fb.text} <span style={{ color: "#FFD700", fontWeight: 900, marginLeft: 5 }}>(Coach)</span></li>
              ))}
            </ul>
          </div>
          {/* Compliance/Intervention */}
          <div style={{ background: "#232b39", borderRadius: 13, padding: "12px 18px", marginBottom: 14 }}>
            <b style={{ color: "#FFD700" }}><FaClipboardCheck /> Assign/Track Intervention</b>
            <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 7, flexWrap: "wrap" }}>
              <select value={assign.player} onChange={e => setAssign({ ...assign, player: Number(e.target.value) })} style={{ fontWeight: 700, borderRadius: 7, padding: 6 }}>
                {players.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}
              </select>
              <select value={assign.type} onChange={e => setAssign({ ...assign, type: e.target.value })} style={{ fontWeight: 700, borderRadius: 7, padding: 6 }}>
                {interventions.map((t, i) => <option key={i}>{t}</option>)}
              </select>
              <Button size="sm" style={{ background: "#FFD700", color: "#181e23" }} onClick={() => {
                setInterventionsLog([...interventionsLog, { ...assign, status: "pending", when: new Date().toLocaleDateString() }]);
              }}><FaUserCheck /> Assign</Button>
            </div>
            <div style={{ marginTop: 8 }}>
              <b style={{ color: "#FFD700" }}>Log:</b>
              <ul>
                {interventionsLog.map((a, i) =>
                  <li key={i} style={{ color: "#1de682", fontWeight: 800 }}>
                    {players.find(p => p.id === a.player).name}: {a.type} ({a.status}) <span style={{ color: "#FFD700", marginLeft: 5 }}>{a.when}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          {/* Timeline Filter/Export */}
          <TimelineFilterExport />
        </div>
      </div>
      {/* Individual Detail Drawer */}
      <AnimatePresence>{drawer !== null && <PlayerDrawer />}</AnimatePresence>
      {/* Export notification */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed", top: 50, right: 50, zIndex: 120, background: "#232b39", color: "#FFD700", padding: 19, borderRadius: 12, boxShadow: "0 3px 18px #FFD70088", fontWeight: 900
            }}>
            <FaFileExport style={{ marginRight: 8 }} /> Exported! (PDF/Excel/PNG coming soon)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
