import React, { useState } from "react";
import {
  FaChartLine, FaUser, FaExclamationTriangle, FaFileExport, FaRobot, FaClipboardCheck, FaArrowRight, FaUsers, FaLightbulb, FaEdit, FaSyncAlt
} from "react-icons/fa";

// Benchmarks (can import for more)
const BENCHMARKS = {
  local: { U14: 3, U16: 3, U18: 2.5, Senior: 2 },
  national: { U14: 3, U16: 3, U18: 2.8, Senior: 2.2 },
  fiba: { U14: 3.5, U16: 3, U18: 3, Senior: 2.5 }
};

const SQUADS = ["U14", "U16", "U18", "Senior"];
const initData = [
  { squad: "U14", coach: "Coach White", practice: 72, games: 21, history: [3.5, 3.1, 2.9, 3.2], note: "", athletes: [
    { name: "Ivan Radic", practice: 68, games: 19, history: [3.6, 3.2, 2.8, 3.1], note: "" },
    { name: "Bruno Sesar", practice: 72, games: 21, history: [3.5, 3.1, 2.9, 3.2], note: "" }
  ] },
  { squad: "U16", coach: "Coach Luke", practice: 78, games: 24, history: [3.2, 3.0, 2.7, 2.9], note: "", athletes: [
    { name: "Marko Proleta", practice: 77, games: 22, history: [3.2, 2.9, 2.6, 2.8], note: "" }
  ] },
  { squad: "U18", coach: "Coach Johnson", practice: 66, games: 26, history: [2.8, 2.5, 2.1, 2.0], note: "", athletes: [
    { name: "Luka Loncar", practice: 62, games: 27, history: [2.7, 2.3, 2.0, 1.8], note: "" }
  ] },
  { squad: "Senior", coach: "Coach Perkovic", practice: 59, games: 34, history: [1.7, 2.0, 2.1, 2.0], note: "", athletes: [
    { name: "Ante Kovac", practice: 56, games: 32, history: [1.8, 2.1, 2.2, 2.0], note: "" }
  ] }
];

function calcRatio(prac, games) {
  return games === 0 ? 0 : (prac / games).toFixed(2);
}
function colorByRatio(ratio, target) {
  if (ratio >= target) return "#1de682";
  if (ratio >= target - 0.5) return "#FFD700";
  return "#ff4848";
}
// Compliance: 0=red, 1=yellow, 2=green
function complianceLevel(ratio, target) {
  if (ratio >= target) return 2;
  if (ratio >= target - 0.5) return 1;
  return 0;
}

const RatioAnalyzer = () => {
  const [data, setData] = useState(initData);
  const [editIdx, setEditIdx] = useState(null); // which squad for scenario edit
  const [editPrac, setEditPrac] = useState(0);
  const [editGames, setEditGames] = useState(0);
  const [boardComment, setBoardComment] = useState("");
  const [exportType, setExportType] = useState(""); // "squad" or "athlete"

  // AI risk forecast (simple version: if current trend dropping, warn)
  function aiRiskForecast(squadIdx) {
    const hist = data[squadIdx].history;
    if (hist[hist.length - 1] < hist[hist.length - 2]) return "Risk: Ratio dropping, review schedule immediately.";
    if (hist[hist.length - 1] < BENCHMARKS.local[data[squadIdx].squad]) return "Under target—board/coach action required.";
    return "Stable.";
  }
  // What-if scenario engine: apply edit, update scenario
  function applyScenario(idx) {
    setData(data.map((d, i) => i === idx ? { ...d, practice: editPrac, games: editGames } : d));
    setEditIdx(null);
  }
  // Compliance matrix by month and season
  function buildComplianceMatrix() {
    // For demo: last 4 months, squad and athletes
    return data.map((d, idx) => ({
      squad: d.squad,
      coach: d.coach,
      season: calcRatio(d.practice, d.games),
      monthly: d.history,
      seasonLevel: complianceLevel(calcRatio(d.practice, d.games), BENCHMARKS.local[d.squad]),
      monthlyLevels: d.history.map(r => complianceLevel(r, BENCHMARKS.local[d.squad])),
      athletes: d.athletes.map(a => ({
        name: a.name,
        season: calcRatio(a.practice, a.games),
        monthly: a.history,
        seasonLevel: complianceLevel(calcRatio(a.practice, a.games), BENCHMARKS.local[d.squad]),
        monthlyLevels: a.history.map(r => complianceLevel(r, BENCHMARKS.local[d.squad]))
      }))
    }));
  }
  // Export Health Card (PDF/CSV)
  function exportHealthCard(type, squadIdx, athleteIdx) {
    if (type === "squad") {
      const d = data[squadIdx];
      alert(`[PDF/CSV] Ratio Health Card: Squad ${d.squad}, Coach: ${d.coach}, Ratio: ${calcRatio(d.practice, d.games)}:1, Target: ${BENCHMARKS.local[d.squad]}, Board Comment: ${d.note}`);
    } else if (type === "athlete") {
      const d = data[squadIdx].athletes[athleteIdx];
      alert(`[PDF/CSV] Ratio Health Card: Athlete ${d.name}, Ratio: ${calcRatio(d.practice, d.games)}:1, Target: ${BENCHMARKS.local[data[squadIdx].squad]}, Note: ${d.note}`);
    }
  }

  // Board/coach note
  function updateSquadNote(idx, note) {
    setData(data.map((d, i) => i === idx ? { ...d, note } : d));
  }
  function updateAthleteNote(sqIdx, athIdx, note) {
    setData(data.map((d, i) => i !== sqIdx ? d : {
      ...d,
      athletes: d.athletes.map((a, j) => j !== athIdx ? a : { ...a, note })
    }));
  }
  // Overlay: FIBA/national/local
  function ratioOverlay(squad, type) {
    return BENCHMARKS[type][squad];
  }
  // Variance/consistency: stddev of ratios (trend line)
  function calcVariance(history) {
    if (history.length < 2) return 0;
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const sq = history.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (history.length - 1);
    return Math.sqrt(sq).toFixed(2);
  }

  const matrix = buildComplianceMatrix();

  return (
    <div style={{
      background: "#232a2e", color: "#fff", borderRadius: 22, padding: 36, maxWidth: 1700, margin: "0 auto", boxShadow: "0 4px 32px #FFD70055"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 17 }}>
        <FaChartLine size={32} color="#FFD700" />
        <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 28, letterSpacing: 1 }}>Practice/Game Ratio Analyzer <span style={{ fontSize: 18, color: "#FFD70077" }}>ELITE+</span></h2>
        <span style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 800, borderRadius: 10, padding: '8px 25px',
          fontSize: 17, marginLeft: 17
        }}>CourtEvo Vero</span>
        <button onClick={() => setExportType("squad")} style={{
          background: "#1de682", color: "#232a2e", border: "none", borderRadius: 10, fontWeight: 900,
          fontSize: 17, padding: "9px 23px", marginLeft: 20
        }}>
          <FaFileExport style={{ marginRight: 7 }} /> Export Squad Cards
        </button>
        <button onClick={() => setExportType("athlete")} style={{
          background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 10, fontWeight: 900,
          fontSize: 17, padding: "9px 23px", marginLeft: 20
        }}>
          <FaFileExport style={{ marginRight: 7 }} /> Export Athlete Cards
        </button>
      </div>
      {/* Compliance Matrix */}
      <div style={{ margin: "28px 0 18px 0" }}>
        <b style={{ color: "#FFD700", fontSize: 19 }}>Board Compliance Matrix (Red/Yellow/Green)</b>
        <table style={{ width: "100%", background: "#232a2e", color: "#FFD700", borderRadius: 9, fontWeight: 700, fontSize: 17 }}>
          <thead>
            <tr>
              <th>Squad</th>
              <th>Coach</th>
              <th>Season Ratio</th>
              <th>Variance</th>
              <th>Monthly</th>
              <th>Compliance</th>
              <th>Board/Coach Comment</th>
              <th>AI Risk</th>
              <th>LTAD</th>
              <th>National</th>
              <th>FIBA</th>
              <th>What-If</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((m, idx) => (
              <tr key={m.squad}>
                <td style={{ fontWeight: 800 }}>{m.squad}</td>
                <td>{m.coach}</td>
                <td style={{ color: colorByRatio(m.season, BENCHMARKS.local[m.squad]) }}>{m.season}:1</td>
                <td>{calcVariance(data[idx].history)}</td>
                <td>
                  {m.monthly.map((r, i) => (
                    <span key={i} style={{
                      background: colorByRatio(r, BENCHMARKS.local[m.squad]), color: "#232a2e", fontWeight: 800, borderRadius: 5, padding: "1.5px 7px", marginRight: 4, fontSize: 15
                    }}>{r}</span>
                  ))}
                </td>
                <td>
                  <span style={{ color: m.seasonLevel === 2 ? "#1de682" : m.seasonLevel === 1 ? "#FFD700" : "#ff4848", fontWeight: 800 }}>
                    {["Red", "Yellow", "Green"][m.seasonLevel]}
                  </span>
                </td>
                <td>
                  <input value={data[idx].note} onChange={e => updateSquadNote(idx, e.target.value)}
                    placeholder="Add board/coach comment" style={{
                      borderRadius: 6, border: "1.2px solid #FFD70077", fontSize: 13, padding: 2,
                      background: "#fff", color: "#232a2e", width: 140
                    }} />
                </td>
                <td>
                  <button style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 800, padding: "4px 13px" }}
                    onClick={() => alert(aiRiskForecast(idx))}
                  ><FaRobot style={{ marginRight: 5 }} />AI</button>
                </td>
                <td>{ratioOverlay(m.squad, "local")}:1</td>
                <td>{ratioOverlay(m.squad, "national")}:1</td>
                <td>{ratioOverlay(m.squad, "fiba")}:1</td>
                <td>
                  <button style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 800, padding: "4px 13px" }}
                    onClick={() => { setEditIdx(idx); setEditPrac(data[idx].practice); setEditGames(data[idx].games); }}
                  ><FaEdit />What-If</button>
                </td>
                <td>
                  <button style={{ background: "#1de682", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 800, padding: "4px 13px" }}
                    onClick={() => exportHealthCard("squad", idx)}
                  ><FaFileExport style={{ marginRight: 4 }} />PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Scenario What-If */}
      {editIdx !== null && (
        <div style={{
          background: "#232a2e", color: "#FFD700", border: "2px solid #FFD70077", borderRadius: 14, padding: 19, margin: "24px 0", zIndex: 10
        }}>
          <b>Scenario Engine – Edit Practice & Games ({data[editIdx].squad})</b><br />
          <span style={{ marginRight: 6 }}>Practice:</span>
          <input type="number" value={editPrac} onChange={e => setEditPrac(+e.target.value)} style={{ width: 50, borderRadius: 6, marginRight: 10 }} />
          <span style={{ marginRight: 6 }}>Games:</span>
          <input type="number" value={editGames} onChange={e => setEditGames(+e.target.value)} style={{ width: 50, borderRadius: 6, marginRight: 12 }} />
          <button onClick={() => applyScenario(editIdx)} style={{
            background: "#1de682", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 900, padding: "4px 17px"
          }}><FaSyncAlt style={{ marginRight: 5 }} />Apply</button>
          <button onClick={() => setEditIdx(null)} style={{
            background: "#FFD700", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 900, padding: "4px 17px", marginLeft: 7
          }}>Cancel</button>
          <div style={{ marginTop: 11, color: "#FFD70099" }}>
            <FaLightbulb style={{ marginRight: 7 }} /> <b>AI Comment:</b> {aiRiskForecast(editIdx)}
          </div>
        </div>
      )}
      {/* Athlete analysis */}
      <div style={{ margin: "30px 0 23px 0" }}>
        <b style={{ color: "#FFD700", fontSize: 18 }}>Athlete Analytics & Health Cards</b>
        <table style={{ width: "100%", background: "#232a2e", color: "#FFD700", borderRadius: 9, fontWeight: 700, fontSize: 15 }}>
          <thead>
            <tr>
              <th>Squad</th><th>Athlete</th><th>Season Ratio</th><th>Variance</th><th>Monthly</th><th>Compliance</th><th>Parent/Athlete Card</th><th>Note</th>
            </tr>
          </thead>
          <tbody>
            {matrix.flatMap((m, sqIdx) =>
              m.athletes.map((a, athIdx) => (
                <tr key={a.name}>
                  <td style={{ fontWeight: 800 }}>{m.squad}</td>
                  <td>{a.name}</td>
                  <td style={{ color: colorByRatio(a.season, BENCHMARKS.local[m.squad]) }}>{a.season}:1</td>
                  <td>{calcVariance(data[sqIdx].athletes[athIdx].history)}</td>
                  <td>
                    {a.monthly.map((r, i) => (
                      <span key={i} style={{
                        background: colorByRatio(r, BENCHMARKS.local[m.squad]), color: "#232a2e", fontWeight: 800, borderRadius: 5, padding: "1.5px 7px", marginRight: 4, fontSize: 15
                      }}>{r}</span>
                    ))}
                  </td>
                  <td>
                    <span style={{ color: a.seasonLevel === 2 ? "#1de682" : a.seasonLevel === 1 ? "#FFD700" : "#ff4848", fontWeight: 800 }}>
                      {["Red", "Yellow", "Green"][a.seasonLevel]}
                    </span>
                  </td>
                  <td>
                    <button style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 800, padding: "4px 13px" }}
                      onClick={() => exportHealthCard("athlete", sqIdx, athIdx)}
                    ><FaFileExport style={{ marginRight: 4 }} />PDF</button>
                  </td>
                  <td>
                    <input value={data[sqIdx].athletes[athIdx].note} onChange={e => updateAthleteNote(sqIdx, athIdx, e.target.value)}
                      placeholder="Coach/board note" style={{
                        borderRadius: 6, border: "1.2px solid #FFD70077", fontSize: 13, padding: 2,
                        background: "#fff", color: "#232a2e", width: 100
                      }} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Export modal */}
      {exportType && (
        <div style={{
          position: "fixed", top: 140, left: 320, zIndex: 1200, background: "#232a2e", border: "2.5px solid #FFD700", borderRadius: 18, padding: 21, minWidth: 300, color: "#FFD700"
        }}>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}><FaFileExport style={{ marginRight: 7 }} /> Export {exportType === "squad" ? "Squad" : "Athlete"} Health Cards</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Choose format:</div>
          <button onClick={() => { setExportType(""); alert("Exported as PDF."); }} style={{ ...btnStyle, background: "#1de682" }}>PDF</button>
          <button onClick={() => { setExportType(""); alert("Exported as CSV."); }} style={btnStyle}>CSV</button>
          <button onClick={() => setExportType("")} style={btnStyle}>Cancel</button>
        </div>
      )}
      <div style={{ marginTop: 19, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.” | Ratio Analyzer ELITE+
      </div>
    </div>
  );
};

const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "6px 14px", marginRight: 6, cursor: "pointer"
};

export default RatioAnalyzer;
