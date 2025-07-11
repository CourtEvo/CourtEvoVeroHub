import React, { useState } from "react";
import {
  FaChartPie, FaExclamationTriangle, FaCheckCircle, FaRobot, FaFileExport, FaLightbulb, FaClipboardList, FaArrowUp, FaArrowDown, FaUsers
} from "react-icons/fa";

// Demo data
const squads = ["U14", "U16", "U18", "Senior"];
const phases = ["Foundation", "Development", "Performance", "Elite"];
const months = ["Jan", "Feb", "Mar", "Apr", "May"];
const years = ["2022", "2023", "2024"];

const initHeatmap = [
  [95, 90, 92, 94, 91],   // U14
  [85, 81, 80, 79, 80],   // U16
  [76, 77, 72, 70, 69],   // U18
  [91, 90, 89, 88, 87]    // Senior
];
const multiYearTrends = [
  [93, 94, 92], // U14 (2022, 2023, 2024)
  [87, 85, 81], // U16
  [80, 78, 70], // U18
  [92, 91, 89]  // Senior
];
const coaches = [
  { name: "Coach Johnson", squads: ["U14", "U16"], retention: 92 },
  { name: "Coach White", squads: ["U18"], retention: 72 },
  { name: "Coach Bell", squads: ["Senior"], retention: 89 }
];
const dropouts = [
  { squad: "U18", date: "2024-04-07", name: "Niko S.", reason: "Lost motivation", cohort: "2010", coach: "Coach Jusup" },
  { squad: "U16", date: "2024-05-01", name: "Josip K.", reason: "School pressure", cohort: "2010", coach: "Coach Sesar" },
  { squad: "U14", date: "2023-12-11", name: "Toni P.", reason: "Family move", cohort: "2010", coach: "Coach Sesar" }
];
const interventionsInit = [
  { squad: "U16", date: "2024-05-10", action: "Parent meeting; academic support", outcome: "retention up +6%" },
  { squad: "U18", date: "2024-04-20", action: "Motivation workshop", outcome: "no impact" }
];
const boardLogInit = [
  { date: "2024-04-20", event: "AI flagged U18 high risk", action: "Workshop approved", outcome: "2 athletes improved engagement" }
];
const commsLogInit = [
  { date: "2024-05-12", by: "Coach Jusup", type: "Call", target: "Parent", msg: "Discussed engagement risk" }
];

// Helper: risk color
function riskColor(val) {
  if (val >= 90) return "#1de682";
  if (val >= 80) return "#FFD700";
  if (val >= 70) return "#FFA500";
  return "#ff4848";
}
// Trend arrow
function trendArrow(arr) {
  if (arr[arr.length - 1] > arr[arr.length - 2]) return <FaArrowUp style={{ color: "#1de682" }} />;
  if (arr[arr.length - 1] < arr[arr.length - 2]) return <FaArrowDown style={{ color: "#ff4848" }} />;
  return null;
}
// Coach overlay
function coachColor(val) {
  if (val >= 90) return "#1de682";
  if (val >= 80) return "#FFD700";
  return "#ff4848";
}

// At-risk AI
function atRiskList(dropouts, heatmap) {
  // Fake demo: U18 is highest risk
  return [
    { name: "Niko S.", squad: "U18", risk: "Burnout", coach: "Coach White", history: [74, 72, 69] },
    { name: "Josip K.", squad: "U16", risk: "Academics", coach: "Coach Johnson", history: [84, 80, 80] }
  ];
}
// Dropout reason bubble chart (demo as list)
function reasonStats(dropouts) {
  const out = {};
  dropouts.forEach(d => {
    out[d.reason] = (out[d.reason] || 0) + 1;
  });
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
}

const RetentionDropoutHeatmap = () => {
  const [heatmap, setHeatmap] = useState(initHeatmap);
  const [interventions, setInterventions] = useState(interventionsInit);
  const [selected, setSelected] = useState(0);
  const [newInterv, setNewInterv] = useState("");
  const [exporting, setExporting] = useState(false);
  const [boardLog, setBoardLog] = useState(boardLogInit);
  const [commsLog, setCommsLog] = useState(commsLogInit);

  function exportReport() {
    setExporting(true);
    setTimeout(() => {
      alert("Exported PDF/CSV: phase risk, heatmaps, coach overlay, at-risk list, trend, dropout analytics, logs, AI.");
      setExporting(false);
    }, 1200);
  }
  function addIntervention() {
    if (!newInterv.trim()) return;
    setInterventions([{ squad: squads[selected], date: new Date().toISOString().slice(0, 10), action: newInterv, outcome: "" }, ...interventions]);
    setNewInterv("");
  }

  // At-risk forecast
  const riskAthletes = atRiskList(dropouts, heatmap);

  // Dropout reason analytics
  const reasonBubbles = reasonStats(dropouts);

  return (
    <div style={{
      background: "#232a2e", color: "#fff", borderRadius: 22, padding: 36, maxWidth: 1870, margin: "0 auto", boxShadow: "0 4px 32px #FFD70055"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 17 }}>
        <FaChartPie size={32} color="#FFD700" />
        <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 28, letterSpacing: 1 }}>Retention & Dropout Heatmap <span style={{ color: "#FFD70088", fontWeight: 600, fontSize: 17 }}>ULTIMATE CONSULTING</span></h2>
        <span style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 800, borderRadius: 10, padding: '8px 25px',
          fontSize: 17, marginLeft: 17
        }}>CourtEvo Vero</span>
        <button onClick={exportReport} disabled={exporting} style={{
          background: "#1de682", color: "#232a2e", border: "none", borderRadius: 10, fontWeight: 900,
          fontSize: 17, padding: "9px 23px", marginLeft: 20
        }}>
          <FaFileExport style={{ marginRight: 7 }} /> {exporting ? "Exporting..." : "Export PDF/CSV"}
        </button>
      </div>
      {/* Phase Risk Matrix */}
      <div style={{ margin: "21px 0 11px 0" }}>
        <b style={{ color: "#FFD700", fontSize: 19 }}><FaUsers style={{ marginRight: 8 }} /> Phase Risk Matrix</b>
        <table style={{ width: "100%", background: "#232a2e", color: "#FFD700", borderRadius: 9, fontWeight: 700, fontSize: 16, marginTop: 6 }}>
          <thead>
            <tr>
              <th>Squad</th>
              {phases.map(p => <th key={p}>{p}</th>)}
            </tr>
          </thead>
          <tbody>
            {squads.map((sq, i) =>
              <tr key={sq}>
                <td>{sq}</td>
                {phases.map((ph, j) => (
                  <td key={ph} style={{
                    background: (i === selected && j === selected) ? "#FFD700" : riskColor(heatmap[i][Math.min(j, heatmap[i].length - 1)]),
                    color: "#232a2e", fontWeight: 900, borderRadius: 6, padding: "7px 0"
                  }}>
                    {heatmap[i][Math.min(j, heatmap[i].length - 1)]}%
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Multi-year trends */}
      <div style={{ margin: "14px 0 14px 0" }}>
        <b style={{ color: "#FFD700", fontSize: 19 }}>Multi-Year Retention Trends</b>
        <table style={{ width: "100%", background: "#232a2e", color: "#FFD700", borderRadius: 9, fontWeight: 700, fontSize: 15, marginTop: 6 }}>
          <thead>
            <tr>
              <th>Squad</th>
              {years.map(y => <th key={y}>{y}</th>)}
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {squads.map((sq, idx) =>
              <tr key={sq}>
                <td>{sq}</td>
                {multiYearTrends[idx].map((val, j) => (
                  <td key={j} style={{
                    background: riskColor(val), color: "#232a2e", fontWeight: 900, borderRadius: 6, padding: "7px 0"
                  }}>{val}%</td>
                ))}
                <td>{trendArrow(multiYearTrends[idx])}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Coach impact overlay */}
      <div style={{ margin: "13px 0 16px 0" }}>
        <b style={{ color: "#FFD700", fontSize: 19 }}>Coach Impact Overlay</b>
        <table style={{ width: 440, background: "#232a2e", color: "#FFD700", borderRadius: 8, fontWeight: 700, fontSize: 16 }}>
          <thead>
            <tr>
              <th>Coach</th><th>Squads</th><th>Avg. Retention</th>
            </tr>
          </thead>
          <tbody>
            {coaches.map(c => (
              <tr key={c.name}>
                <td>{c.name}</td>
                <td>{c.squads.join(", ")}</td>
                <td style={{
                  color: coachColor(c.retention), fontWeight: 800
                }}>{c.retention}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ color: "#FFD70099" }}>Assign “high impact” coaches to risk squads/phases to boost retention.</div>
      </div>
      {/* Heatmap by squad/month */}
      <div style={{ margin: "24px 0 19px 0" }}>
        <b style={{ color: "#FFD700", fontSize: 19 }}>Squad/Month Retention Heatmap</b>
        <table style={{ width: "100%", background: "#232a2e", color: "#FFD700", borderRadius: 9, fontWeight: 700, fontSize: 16 }}>
          <thead>
            <tr>
              <th>Squad</th>
              {months.map(m => <th key={m}>{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {squads.map((sq, idx) =>
              <tr key={sq} style={{ background: selected === idx ? "#FFD70022" : undefined }}>
                <td style={{ fontWeight: 800 }}>{sq}</td>
                {heatmap[idx].map((val, j) => (
                  <td key={j} style={{
                    background: riskColor(val), color: "#232a2e", fontWeight: 900, borderRadius: 6, padding: "7px 0"
                  }}>{val}%</td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* At-risk athletes */}
      <div style={{ margin: "17px 0 17px 0" }}>
        <b style={{ color: "#FFD700", fontSize: 19 }}><FaRobot style={{ marginRight: 7 }} /> AI: At-Risk Athlete Forecast</b>
        <table style={{ background: "#232a2e", color: "#FFD700", borderRadius: 8, fontWeight: 700, fontSize: 15, width: 650 }}>
          <thead>
            <tr>
              <th>Athlete</th><th>Squad</th><th>Coach</th><th>Risk</th><th>History</th>
            </tr>
          </thead>
          <tbody>
            {riskAthletes.map((r, i) =>
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.squad}</td>
                <td>{r.coach}</td>
                <td>{r.risk}</td>
                <td>{r.history.map((h, j) =>
                  <span key={j} style={{ marginRight: 3 }}>{h}</span>
                )}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Dropout reason analytics */}
      <div style={{ margin: "17px 0 15px 0" }}>
        <b style={{ color: "#FFD700", fontSize: 19 }}>Dropout Reason Analytics</b>
        <table style={{ background: "#232a2e", color: "#FFD700", borderRadius: 8, fontWeight: 700, fontSize: 15, width: 420 }}>
          <thead>
            <tr>
              <th>Reason</th><th>Count</th>
            </tr>
          </thead>
          <tbody>
            {reasonBubbles.map(([reason, count]) =>
              <tr key={reason}>
                <td>{reason}</td>
                <td>{count}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Select squad for interventions */}
      <div style={{ margin: "12px 0 12px 0" }}>
        <b style={{ color: "#FFD700", fontSize: 17 }}>Select Squad: </b>
        {squads.map((s, idx) =>
          <button key={s} onClick={() => setSelected(idx)}
            style={{
              background: selected === idx ? "#FFD700" : "#232a2e",
              color: selected === idx ? "#232a2e" : "#FFD700",
              fontWeight: 800, border: "none", borderRadius: 8, padding: "7px 13px", margin: 2, cursor: "pointer"
            }}>{s}</button>
        )}
      </div>
      {/* Dropouts/interventions */}
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        <div>
          <b style={{ color: "#FFD700", fontSize: 17 }}><FaClipboardList style={{ marginRight: 7 }} /> Dropout Log</b>
          <ul style={{ color: "#FFD700", fontSize: 15 }}>
            {dropouts.filter(d => d.squad === squads[selected]).map((d, i) =>
              <li key={i}>[{d.date}] {d.name}: {d.reason} ({d.cohort})</li>
            )}
          </ul>
        </div>
        <div>
          <b style={{ color: "#FFD700", fontSize: 17 }}><FaClipboardList style={{ marginRight: 7 }} /> Intervention Tracker</b>
          <ul style={{ color: "#FFD700", fontSize: 15 }}>
            {interventions.filter(i => i.squad === squads[selected]).map((iv, i) =>
              <li key={i}>[{iv.date}]: {iv.action} <b style={{ color: "#1de682" }}>{iv.outcome && ("→ " + iv.outcome)}</b></li>
            )}
          </ul>
          <textarea value={newInterv} onChange={e => setNewInterv(e.target.value)} placeholder="Add new intervention" style={{
            borderRadius: 7, border: "1.2px solid #FFD70077", fontSize: 15, padding: 6, background: "#fff", color: "#232a2e", width: 190, marginTop: 7
          }} />
          <button onClick={addIntervention} style={{
            background: "#FFD700", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 800, padding: "5px 14px", marginTop: 6
          }}>Add Intervention</button>
        </div>
        {/* Boardroom log */}
        <div>
          <b style={{ color: "#FFD700", fontSize: 17 }}><FaClipboardList style={{ marginRight: 7 }} /> Boardroom Action Log</b>
          <ul style={{ color: "#FFD700", fontSize: 15 }}>
            {boardLog.map((b, i) =>
              <li key={i}>[{b.date}]: {b.event} | {b.action} → {b.outcome}</li>
            )}
          </ul>
        </div>
        {/* Coach/parent comms log */}
        <div>
          <b style={{ color: "#FFD700", fontSize: 17 }}><FaClipboardList style={{ marginRight: 7 }} /> Coach/Parent Comms Log</b>
          <ul style={{ color: "#FFD700", fontSize: 15 }}>
            {commsLog.filter(c => squads[selected] === "All" || c.squad === squads[selected]).map((c, i) =>
              <li key={i}>[{c.date}] {c.by} ({c.type}) – {c.msg}</li>
            )}
          </ul>
        </div>
      </div>
      {/* Parent summary */}
      <div style={{
        margin: "29px 0 0 0", background: "#FFD70022", color: "#FFD700", borderRadius: 12, padding: 14, fontWeight: 800, fontSize: 17
      }}>
        <b>Parent/Coach Communication:</b>  
        <span style={{ color: "#FFD700", marginLeft: 9 }}>
          {squads.map((sq, idx) =>
            <span key={sq}>
              {sq}:&nbsp;
              {heatmap[idx][4] >= 90 ? "Great retention—club is healthy!" :
                heatmap[idx][4] >= 80 ? "Yellow zone—monitor engagement, run family check-ins." :
                  heatmap[idx][4] >= 70 ? "Orange zone—club/coach action needed." :
                    "RED zone: Club/coach/parent urgent support required."
              }&nbsp; | &nbsp;
            </span>
          )}
        </span>
      </div>
      <div style={{ marginTop: 19, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.” | Retention & Dropout Heatmap – Ultimate Consulting Edition
      </div>
    </div>
  );
};

export default RetentionDropoutHeatmap;
