import React, { useState } from "react";
import {
  FaUserCircle, FaHeartbeat, FaChartPie, FaExclamationTriangle, FaFileExport, FaRobot, FaLightbulb, FaArrowUp, FaArrowDown, FaClipboardList, FaUserCheck, FaBolt, FaStethoscope
} from "react-icons/fa";

const BENCHMARKS = { skill: 80, physical: 77, cognitive: 74, academic: 82, wellness: 86, engagement: 90 };
const CLUB_BENCH = { skill: 76, physical: 74, cognitive: 70, academic: 80, wellness: 84, engagement: 87 };

const initPlayers = [
  {
    name: "Marko Proleta", squad: "U16", dob: "2010-07-24",
    data: {
      skill: [72, 75, 79, 82],
      physical: [69, 71, 75, 78],
      cognitive: [70, 71, 74, 77],
      academic: [75, 76, 80, 82],
      wellness: [88, 83, 79, 80],
      engagement: [91, 87, 85, 86]
    },
    notes: {
      skill: "Needs more left-hand work",
      wellness: "Low sleep last two months",
      engagement: ""
    },
    alerts: [
      { type: "wellness", severity: "high", msg: "Wellness dropping—flag for coach/parent" }
    ],
    interventions: [
      { date: "2024-05-07", by: "Coach Sesar", type: "wellness", msg: "Referred to club nutritionist, sleep log started" }
    ],
    medical: { status: "cleared", notes: "" },
    academics: { risk: false, notes: "" },
    engagementEvents: [
      { date: "2024-05-01", by: "Parent", type: "chat", msg: "Discussed motivation" }
    ],
    log: [
      { date: "2024-05-05", by: "Coach Sesar", msg: "Alerted parent on sleep routines" }
    ]
  },
  {
    name: "Ivan Radic", squad: "U14", dob: "2010-02-18",
    data: {
      skill: [66, 69, 75, 80],
      physical: [71, 74, 77, 79],
      cognitive: [66, 69, 72, 76],
      academic: [74, 77, 80, 81],
      wellness: [88, 86, 83, 85],
      engagement: [88, 89, 90, 91]
    },
    notes: {},
    alerts: [],
    interventions: [],
    medical: { status: "in-rehab", notes: "Ankle sprain—return 1 week" },
    academics: { risk: true, notes: "Late assignments last month" },
    engagementEvents: [
      { date: "2024-04-23", by: "Coach Jusup", type: "meeting", msg: "Extra school support recommended" }
    ],
    log: []
  }
];

// Utilities
function currentValue(arr) { return arr[arr.length - 1]; }
function trendIcon(arr) {
  if (arr.length < 2) return null;
  return arr[arr.length - 1] > arr[arr.length - 2]
    ? <FaArrowUp color="#1de682" />
    : arr[arr.length - 1] < arr[arr.length - 2]
      ? <FaArrowDown color="#ff4848" />
      : null;
}
function colorByScore(val) {
  if (val >= 85) return "#1de682";
  if (val >= 70) return "#FFD700";
  return "#ff4848";
}
function riskByCategory(cat, player) {
  const arr = player.data[cat];
  if (!arr || arr.length < 2) return false;
  return (arr[arr.length - 2] - arr[arr.length - 1] > 5) || currentValue(arr) < 70;
}
function getAlerts(player) {
  let out = [];
  for (let cat of ["skill", "physical", "cognitive", "wellness", "engagement"]) {
    if (riskByCategory(cat, player))
      out.push({ type: cat, severity: "high", msg: `${cat.charAt(0).toUpperCase() + cat.slice(1)} drop detected` });
  }
  // Burnout/overload risk (engagement + wellness both drop)
  const wellnessArr = player.data["wellness"];
  const engagementArr = player.data["engagement"];
  if (wellnessArr && engagementArr) {
    const wTrend = wellnessArr[wellnessArr.length - 1] < wellnessArr[wellnessArr.length - 2];
    const eTrend = engagementArr[engagementArr.length - 1] < engagementArr[engagementArr.length - 2];
    if (wTrend && eTrend) out.push({ type: "burnout", severity: "critical", msg: "Burnout/overload risk flagged—review schedule, rest, and parent/coach check-in" });
  }
  // Academics trigger
  if (player.academics?.risk) out.push({ type: "academic", severity: "med", msg: "Academic risk—engage with school and parent" });
  return [...player.alerts, ...out];
}
function average(arr) {
  if (!arr.length) return 0;
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
}
function squadAverages(players) {
  const cats = ["skill", "physical", "cognitive", "academic", "wellness", "engagement"];
  let out = {};
  cats.forEach(cat => {
    out[cat] = average(players.map(p => currentValue(p.data[cat])));
  });
  return out;
}

const HolisticPlayerDashboard = () => {
  const [players, setPlayers] = useState(initPlayers);
  const [selected, setSelected] = useState([0]);
  const [noteEdit, setNoteEdit] = useState({ idx: null, cat: "", val: "" });
  const [intervention, setIntervention] = useState("");
  const [parentSummary, setParentSummary] = useState("");
  const [exporting, setExporting] = useState(false);

  const showMulti = selected.length > 1;
  const cats = ["skill", "physical", "cognitive", "academic", "wellness", "engagement"];

  // Radar Chart (multi)
  function RadarChartMulti({ players, squadAvg, clubAvg, bench }) {
    // Each polygon is a player; overlays for squad/club/benchmark
    const center = 82, r = 61, N = 6;
    const angles = cats.map((_, i) => (2 * Math.PI * i) / N);
    function point(val, i) {
      const angle = angles[i];
      const rad = (val / 100) * r;
      return [
        center + rad * Math.cos(angle - Math.PI / 2),
        center + rad * Math.sin(angle - Math.PI / 2)
      ];
    }
    function polygon(values, color, opacity = 0.25, stroke = "#FFD700") {
      return <polygon
        points={values.map((v, i) => point(v, i)).map(([x, y]) => `${x},${y}`).join(" ")}
        fill={color} stroke={stroke} strokeWidth={2.4} opacity={opacity}
      />;
    }
    return (
      <svg width={170} height={170} style={{ background: "#232a2e" }}>
        {/* Axes */}
        {angles.map((angle, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + r * Math.cos(angle - Math.PI / 2)}
            y2={center + r * Math.sin(angle - Math.PI / 2)}
            stroke="#FFD70077"
            strokeWidth={1.7}
          />
        ))}
        {/* Squad avg polygon */}
        {squadAvg && polygon(cats.map(cat => squadAvg[cat]), "#1de68255", 0.19, "#1de682")}
        {/* Club avg polygon */}
        {clubAvg && polygon(cats.map(cat => clubAvg[cat]), "#FFD70033", 0.14, "#FFD700")}
        {/* Bench polygon */}
        {bench && polygon(cats.map(cat => bench[cat]), "#FFD70022", 0.10, "#FFD700")}
        {/* Player polygons */}
        {players.map((p, idx) =>
          polygon(cats.map(cat => currentValue(p.data[cat])), idx === 0 ? "#FFD700" : "#1de682", 0.31, idx === 0 ? "#FFD700" : "#1de682")
        )}
        {/* Cat labels */}
        {cats.map((cat, i) => {
          const [x, y] = point(108, i);
          return <text key={cat} x={x} y={y} fill="#FFD700" fontWeight={700} fontSize={15} textAnchor="middle" dy="0.3em">{cat.charAt(0).toUpperCase() + cat.slice(1)}</text>;
        })}
      </svg>
    );
  }

  // Parent summary (multi)
  function generateParentSummary(player) {
    const alerts = getAlerts(player);
    if (!alerts.length) return "Your athlete is progressing well across all areas. Keep up the routines!";
    return alerts.map(a => {
      if (a.type === "wellness") return "Wellness has dropped—prioritize sleep, nutrition, and stress management. Coach will follow up.";
      if (a.type === "engagement") return "Engagement drop detected—encourage positive conversations about goals.";
      if (a.type === "skill") return "Skill improvement has slowed. Extra individual sessions recommended.";
      if (a.type === "physical") return "Physical readiness down. Recovery and load management advised.";
      if (a.type === "cognitive") return "Cognitive engagement lower. Try new off-court challenges or tactical games.";
      if (a.type === "burnout") return "Burnout/overload risk. Urgent board/coach-family check-in and schedule adjustment.";
      if (a.type === "academic") return "Academic risk: ensure homework and school routines, support from club available.";
      return "";
    }).join(" ");
  }

  // Growth Zone AI
  function growthZoneAI(player) {
    const alerts = getAlerts(player);
    if (!alerts.length) return "Keep steady routines in all domains—growth is well balanced.";
    if (alerts.some(a => a.type === "burnout")) return "Prioritize rest, lower load, and increase positive off-court engagement. Club psychologist consult advised.";
    if (alerts.some(a => a.type === "academic")) return "Academics first: pause extra basketball, support school routines.";
    if (alerts.some(a => a.type === "wellness")) return "Address wellness: improve sleep/nutrition, add 1:1 coach check-ins.";
    if (alerts.some(a => a.type === "skill")) return "Focus on skill: increase reps in weak areas, assign peer mentor.";
    return "See detailed board/coach interventions for each flagged area.";
  }

  // PDF/CSV export
  function exportReport() {
    setExporting(true);
    setTimeout(() => {
      alert("Exported PDF/CSV: player(s) dashboard, visuals, risk, notes, growth zones, interventions, medical, all evidence.");
      setExporting(false);
    }, 1400);
  }

  // Save notes/intervention
  function saveNote(idx, cat) {
    setPlayers(players.map((p, j) => j !== idx ? p : {
      ...p,
      notes: { ...p.notes, [cat]: noteEdit.val }
    }));
    setNoteEdit({ idx: null, cat: "", val: "" });
  }
  function saveIntervention(idx) {
    setPlayers(players.map((p, j) => j !== idx ? p : {
      ...p,
      interventions: [{ date: new Date().toISOString().slice(0, 10), by: "Coach Sesar", type: "manual", msg: intervention }, ...(p.interventions || [])]
    }));
    setIntervention("");
  }

  // Select multiple for compare
  function toggleSelect(idx) {
    setSelected(selected.includes(idx)
      ? selected.filter(i => i !== idx)
      : [...selected, idx].slice(0, 4)); // max 4
  }

  // Outlier/highlight
  function outlierStyle(player, cat, avg) {
    const val = currentValue(player.data[cat]);
    if (val >= avg + 7) return { border: "2px solid #1de682", background: "#1de68222" };
    if (val <= avg - 7) return { border: "2px solid #ff4848", background: "#ff484822" };
    return {};
  }

  // Medical/return-to-play
  function medicalStatus(player) {
    if (player.medical?.status === "in-rehab") return <span style={{ color: "#FFD700" }}><FaStethoscope /> Rehab</span>;
    if (player.medical?.status === "cleared") return <span style={{ color: "#1de682" }}><FaUserCheck /> Cleared</span>;
    return null;
  }

  // Squad averages for overlay
  const squadAvg = squadAverages(players);
  const clubAvg = CLUB_BENCH;
  const bench = BENCHMARKS;

  // Compare only selected
  const selectedPlayers = selected.map(idx => players[idx]);

  return (
    <div style={{
      background: "#232a2e", color: "#fff", borderRadius: 22, padding: 36, maxWidth: 1840, margin: "0 auto", boxShadow: "0 4px 32px #FFD70055"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 17 }}>
        <FaUserCircle size={32} color="#FFD700" />
        <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 28, letterSpacing: 1 }}>Holistic Player 360 Dashboard <span style={{ color: "#FFD70088", fontWeight: 600, fontSize: 17 }}>WORLD'S BEST</span></h2>
        <span style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 800, borderRadius: 10, padding: '8px 25px',
          fontSize: 17, marginLeft: 17
        }}>CourtEvo Vero</span>
        <button onClick={exportReport} disabled={exporting} style={{
          background: "#1de682", color: "#232a2e", border: "none", borderRadius: 10, fontWeight: 900,
          fontSize: 17, padding: "9px 23px", marginLeft: 20
        }}>
          <FaFileExport style={{ marginRight: 7 }} /> {exporting ? "Exporting..." : "Export Report"}
        </button>
      </div>
      {/* Multi select */}
      <div style={{ margin: "18px 0 20px 0" }}>
        <b style={{ color: "#FFD700", fontSize: 17 }}>Select up to 4 Athletes for Compare: </b>
        {players.map((p, idx) =>
          <button key={p.name} onClick={() => toggleSelect(idx)}
            style={{
              background: selected.includes(idx) ? "#FFD700" : "#232a2e",
              color: selected.includes(idx) ? "#232a2e" : "#FFD700",
              fontWeight: 800, border: "none", borderRadius: 8, padding: "7px 13px", margin: 2, cursor: "pointer"
            }}>{p.name}</button>
        )}
      </div>
      {/* 360 Overview: Radar and comparison */}
      <div style={{ display: "flex", gap: 44, alignItems: "flex-start" }}>
        <div>
          <RadarChartMulti players={selectedPlayers} squadAvg={squadAvg} clubAvg={clubAvg} bench={bench} />
          <div style={{ color: "#FFD70099", fontSize: 15, fontWeight: 800, marginTop: 12 }}>
            <FaChartPie style={{ marginRight: 6 }} /> Gold = Player, Green = Squad, Light Gold = Club, Dashed = National
          </div>
        </div>
        {/* Per-player details */}
        {selectedPlayers.map((player, idx) => (
          <div key={player.name} style={{ flex: 1, minWidth: 300, marginLeft: idx === 0 ? 0 : 14, ...outlierStyle(player, "skill", squadAvg.skill) }}>
            <table style={{ width: "100%", background: "#232a2e", color: "#FFD700", borderRadius: 9, fontWeight: 700, fontSize: 17 }}>
              <thead>
                <tr>
                  <th colSpan={5} style={{ color: "#FFD700", fontSize: 20 }}>{player.name} ({player.squad})</th>
                </tr>
                <tr>
                  <th>Category</th><th>Now</th><th>Trend</th><th>Note</th><th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {cats.map(cat => (
                  <tr key={cat} style={outlierStyle(player, cat, squadAvg[cat])}>
                    <td>{cat.charAt(0).toUpperCase() + cat.slice(1)}</td>
                    <td style={{ color: colorByScore(currentValue(player.data[cat] || [0])) }}>{currentValue(player.data[cat] || [0])}</td>
                    <td>{trendIcon(player.data[cat] || [0])}</td>
                    <td>
                      <input value={player.notes?.[cat] || ""}
                        onChange={e => setNoteEdit({ idx, cat, val: e.target.value })}
                        onBlur={() => saveNote(idx, cat)}
                        placeholder="Note" style={{
                          borderRadius: 6, border: "1.2px solid #FFD70077", fontSize: 13, padding: 2,
                          background: "#fff", color: "#232a2e", width: 120
                        }} />
                    </td>
                    <td>
                      {riskByCategory(cat, player) &&
                        <span style={{ color: "#ff4848", fontWeight: 900 }}>
                          <FaExclamationTriangle style={{ marginRight: 4 }} />Risk
                        </span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Medical, Academic, Engagement */}
            <div style={{ marginTop: 7, color: "#FFD70099" }}>
              <b>Medical:</b> {medicalStatus(player)} {player.medical?.notes}
              <br /><b>Academics:</b> {player.academics?.risk ? <span style={{ color: "#ff4848" }}>At Risk</span> : <span style={{ color: "#1de682" }}>OK</span>} {player.academics?.notes}
            </div>
            <div style={{ marginTop: 8 }}>
              <b style={{ color: "#FFD700", fontSize: 16 }}>Alerts & Interventions:</b>
              <ul style={{ color: "#FFD700", fontSize: 15, fontWeight: 700 }}>
                {getAlerts(player).map((a, i) => (
                  <li key={i}>
                    [{a.type.toUpperCase()}] {a.msg}
                  </li>
                ))}
              </ul>
              <b style={{ color: "#FFD700", fontSize: 16 }}>Coach/Board Interventions:</b>
              <ul style={{ color: "#FFD700", fontSize: 15 }}>
                {(player.interventions || []).map((int, i) => (
                  <li key={i}><FaClipboardList style={{ marginRight: 5 }} /> [{int.date}] {int.by}: {int.msg}</li>
                ))}
              </ul>
              <textarea value={intervention} onChange={e => setIntervention(e.target.value)} placeholder="Add intervention (coach/board)" style={{
                borderRadius: 6, border: "1.2px solid #FFD70077", fontSize: 15, padding: 6, background: "#fff", color: "#232a2e", width: "100%", marginTop: 7
              }} />
              <button onClick={() => saveIntervention(idx)} style={{
                background: "#FFD700", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 800, padding: "5px 14px", marginTop: 6
              }}>Add Intervention</button>
            </div>
            {/* Engagement/parent touchpoints */}
            <div style={{ marginTop: 8, color: "#FFD700" }}>
              <b><FaHeartbeat style={{ marginRight: 7 }} /> Touchpoints:</b>
              <ul style={{ color: "#FFD700", fontSize: 15 }}>
                {(player.engagementEvents || []).map((ev, i) => (
                  <li key={i}>[{ev.date}] {ev.by}: {ev.type} – {ev.msg}</li>
                ))}
              </ul>
            </div>
            {/* Parent/boardroom summary */}
            <div style={{
              marginTop: 11, background: "#FFD70022", color: "#FFD700", borderRadius: 10, padding: 11, fontWeight: 800, fontSize: 15
            }}>
              <b><FaLightbulb style={{ marginRight: 6 }} /> Growth Zone (AI):</b> {growthZoneAI(player)}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        margin: "28px 0 0 0", background: "#FFD70022", color: "#FFD700", borderRadius: 15, padding: 17, fontWeight: 800, fontSize: 17
      }}>
        <b><FaLightbulb style={{ marginRight: 6 }} /> Parent/Board Summary:</b> {selectedPlayers.map(p => `${p.name}: ${generateParentSummary(p)}`).join(" | ")}
      </div>
      <div style={{ marginTop: 19, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.” | Holistic Player Dashboard – World’s Best Edition
      </div>
    </div>
  );
};

export default HolisticPlayerDashboard;
