import React, { useState } from "react";
import {
  FaTable, FaExclamationTriangle, FaUserTie, FaUserAlt, FaChartLine, FaPlus, FaEdit, FaTrash, FaFileExport, FaLightbulb, FaArrowRight, FaCheckCircle, FaComments, FaTag, FaHistory
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e" };

const DEFAULT_POSITIONS = [
  { pos: "PG", label: "Point Guard" }, { pos: "SG", label: "Shooting Guard" },
  { pos: "SF", label: "Small Forward" }, { pos: "PF", label: "Power Forward" },
  { pos: "C", label: "Center" }
];
const DEFAULT_TALENT = [
  {
    pos: "PG", starter: "Petar Jovanovic", backup: "Ivan Markovic", next: "Luka Horvat",
    contract: 2026, age: 25, status: "Healthy", intent: "Stay", atRisk: false,
    tags: ["import", "high potential"], history: [{ date: "2024-06-10", event: "Signed extension", risk: 2 }]
  },
  {
    pos: "SG", starter: "Marko Milic", backup: "Dario Pavic", next: "Ante Stipanovic",
    contract: 2025, age: 28, status: "Injured", intent: "Open", atRisk: true,
    tags: ["starter"], history: [{ date: "2024-04-02", event: "Injury (hamstring)", risk: 5 }]
  },
  {
    pos: "SF", starter: "Josip Peric", backup: "Toni Roso", next: "Niko Vulic",
    contract: 2025, age: 27, status: "Healthy", intent: "Stay", atRisk: false,
    tags: [], history: []
  },
  {
    pos: "PF", starter: "Luka Vukovic", backup: "Filip Jelavic", next: "",
    contract: 2024, age: 32, status: "Healthy", intent: "Leave", atRisk: true,
    tags: ["veteran"], history: [{ date: "2024-06-10", event: "Exit intent expressed", risk: 6 }]
  },
  {
    pos: "C", starter: "Ivan Radic", backup: "Karlo Klaric", next: "Domagoj Grgic",
    contract: 2027, age: 23, status: "Healthy", intent: "Stay", atRisk: false,
    tags: ["future core"], history: []
  }
];

function riskScore(t) {
  let risk = 0;
  if (t.contract < new Date().getFullYear() + 1) risk += 2;
  if (t.status !== "Healthy") risk += 2;
  if (t.intent === "Leave") risk += 2;
  if (!t.backup) risk += 3;
  if (!t.next) risk += 1;
  if (t.age > 31) risk += 1;
  return risk;
}

const statusColors = {
  "Healthy": "#1de682",
  "Injured": "#FFD700",
  "Suspended": "#ff4848"
};

const TalentRiskSuccessionMatrixElite = () => {
  const [positions, setPositions] = useState([...DEFAULT_POSITIONS]);
  const [talent, setTalent] = useState([...DEFAULT_TALENT]);
  const [addMode, setAddMode] = useState(false);
  const [newTalent, setNewTalent] = useState({
    pos: positions[0].pos, starter: "", backup: "", next: "",
    contract: 2025, age: 24, status: "Healthy", intent: "Stay", atRisk: false, tags: [], history: []
  });
  const [editMode, setEditMode] = useState(null);
  const [editData, setEditData] = useState({});
  const [scenarioIdx, setScenarioIdx] = useState(-1);
  const [scenarioStatus, setScenarioStatus] = useState("");
  const [scenarioStack, setScenarioStack] = useState([]);
  const [log, setLog] = useState([{ by: "Board", txt: "Reviewed depth at PF; immediate risk flagged.", date: "2024-06-10", tags: ["succession", "PF"] }]);
  const [logText, setLogText] = useState("");
  const [logTag, setLogTag] = useState("");

  // CRUD
  const addTalent = () => {
    setTalent([...talent, { ...newTalent, tags: (newTalent.tags || []).filter(Boolean), history: [] }]);
    setAddMode(false);
    setNewTalent({ pos: positions[0].pos, starter: "", backup: "", next: "", contract: 2025, age: 24, status: "Healthy", intent: "Stay", atRisk: false, tags: [], history: [] });
  };
  const startEdit = idx => { setEditMode(idx); setEditData({ ...talent[idx] }); };
  const saveEdit = () => {
    setTalent(talent.map((t, i) => i === editMode ? { ...editData, tags: (editData.tags || []).filter(Boolean) } : t));
    setEditMode(null); setEditData({});
  };
  const removeTalent = idx => setTalent(talent.filter((_, i) => i !== idx));

  // Add event to history
  const addHistory = (idx, event) => {
    setTalent(talent.map((t, i) =>
      i === idx ? { ...t, history: [...(t.history || []), event] } : t
    ));
  };

  // Scenario: lose starter (simulate)
  const runScenario = idx => {
    setScenarioIdx(idx);
    let t = talent[idx];
    let pipeline = t.backup
      ? t.next ? "Succession is possible, but quality may drop." : "Critical gap—no 3rd option."
      : "No backup—immediate risk!";
    setScenarioStatus(
      <>If <b>{t.starter}</b> leaves or is injured:<br />
      {pipeline}<br />
      Risk score rises to <b style={{ color: "#ff4848" }}>{riskScore(t) + 2}</b>.<br />
      Add to scenario stack for succession planning.</>
    );
    setScenarioStack([...scenarioStack, idx]);
  };
  const resetScenarios = () => { setScenarioIdx(-1); setScenarioStack([]); setScenarioStatus(""); };

  // Board log
  const addLog = () => {
    if (!logText.trim()) return;
    setLog([...log, { by: "Board", txt: logText, date: new Date().toISOString().slice(0, 10), tags: (logTag ? logTag.split(",").map(x => x.trim()) : []) }]);
    setLogText(""); setLogTag("");
  };

  // Export CSV
  function exportCSV() {
    let csv = ["Position,Starter,Backup,Next,Contract,Age,Status,Intent,AtRisk,Tags,History"];
    talent.forEach(t =>
      csv.push([
        t.pos, t.starter, t.backup, t.next, t.contract, t.age, t.status, t.intent, t.atRisk,
        (t.tags || []).join("|"),
        (t.history || []).map(h => `${h.date}: ${h.event} [risk:${h.risk}]`).join("|")
      ].join(","))
    );
    csv.push("\nLog:");
    log.forEach(l => csv.push([l.date, l.by, l.txt, (l.tags || []).join("|")].join(",")));
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "talent_risk_succession.csv";
    a.click(); URL.revokeObjectURL(url);
  }

  // Risk alerts
  function riskAlerts() {
    let out = [];
    talent.forEach(t => {
      if (!t.backup) out.push(`NO backup at ${t.pos}!`);
      if (!t.next) out.push(`No pipeline after backup for ${t.pos}.`);
      if (t.atRisk || riskScore(t) > 4) out.push(`Critical risk at ${t.pos} - ${t.starter}.`);
      if (t.status !== "Healthy") out.push(`Status alert at ${t.pos} - ${t.starter} (${t.status})`);
      if (t.intent === "Leave") out.push(`Exit intent for ${t.pos} - ${t.starter}.`);
      if (t.contract < new Date().getFullYear() + 1) out.push(`Contract expiring soon at ${t.pos} - ${t.starter}.`);
    });
    return out;
  }

  // --- UI ---
  return (
    <div style={{ background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif", borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1450, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 10 }}>
        <FaTable size={32} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Talent Risk & Succession Matrix
        </h2>
        <span style={{ background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 8, padding: '3px 18px', fontSize: 15, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022' }}>
          CourtEvo Vero | Elite Talent
        </span>
        <button onClick={exportCSV} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginLeft: 16 }}><FaFileExport style={{ marginRight: 5 }} /> Export CSV</button>
      </div>
      {/* Risk Alerts */}
      {riskAlerts().length > 0 &&
        <div style={{ background: "#ff484822", color: "#ff4848", fontWeight: 700, padding: 9, borderRadius: 10, marginBottom: 8 }}>
          {riskAlerts().map((a, i) => <div key={i}><FaExclamationTriangle /> {a}</div>)}
        </div>
      }
      {/* Add Row */}
      <div style={{ marginBottom: 9 }}>
        <button onClick={() => setAddMode(a => !a)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginBottom: 8 }}>
          <FaPlus /> {addMode ? "Cancel" : "Add Position"}
        </button>
        {addMode &&
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 9 }}>
            <select value={newTalent.pos} onChange={e => setNewTalent({ ...newTalent, pos: e.target.value })} style={inputStyleMini}>
              {positions.map(p => <option key={p.pos} value={p.pos}>{p.label}</option>)}
            </select>
            <input value={newTalent.starter} placeholder="Starter" onChange={e => setNewTalent({ ...newTalent, starter: e.target.value })} style={inputStyle} />
            <input value={newTalent.backup} placeholder="Backup" onChange={e => setNewTalent({ ...newTalent, backup: e.target.value })} style={inputStyle} />
            <input value={newTalent.next} placeholder="Next in Line" onChange={e => setNewTalent({ ...newTalent, next: e.target.value })} style={inputStyle} />
            <input value={newTalent.contract} type="number" min={2024} max={2030} placeholder="Contract Year" onChange={e => setNewTalent({ ...newTalent, contract: Number(e.target.value) })} style={inputStyleMini} />
            <input value={newTalent.age} type="number" min={16} max={40} placeholder="Age" onChange={e => setNewTalent({ ...newTalent, age: Number(e.target.value) })} style={inputStyleMini} />
            <select value={newTalent.status} onChange={e => setNewTalent({ ...newTalent, status: e.target.value })} style={inputStyleMini}>
              <option>Healthy</option>
              <option>Injured</option>
              <option>Suspended</option>
            </select>
            <select value={newTalent.intent} onChange={e => setNewTalent({ ...newTalent, intent: e.target.value })} style={inputStyleMini}>
              <option>Stay</option>
              <option>Open</option>
              <option>Leave</option>
            </select>
            <input value={newTalent.tags?.join(", ")} placeholder="Tags (comma separated)" onChange={e => setNewTalent({ ...newTalent, tags: e.target.value.split(",").map(x => x.trim()) })} style={inputStyleMini} />
            <select value={newTalent.atRisk} onChange={e => setNewTalent({ ...newTalent, atRisk: e.target.value === "true" })} style={inputStyleMini}>
              <option value="false">Not at risk</option>
              <option value="true">At risk</option>
            </select>
            <button onClick={addTalent} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaPlus /> Add</button>
          </div>
        }
      </div>
      {/* Succession Table & Drilldown */}
      <div style={{ marginBottom: 13 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15, color: "#fff" }}>
          <thead>
            <tr>
              <th>Position</th>
              <th>Starter</th>
              <th>Backup</th>
              <th>Next</th>
              <th>Contract</th>
              <th>Age</th>
              <th>Status</th>
              <th>Intent</th>
              <th>Tags</th>
              <th>Risk Score</th>
              <th>At Risk?</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {talent.map((t, i) => editMode === i ? (
              <tr key={i} style={{ background: "#FFD70022" }}>
                <td>
                  <select value={editData.pos} onChange={e => setEditData({ ...editData, pos: e.target.value })} style={inputStyleMini}>
                    {positions.map(p => <option key={p.pos} value={p.pos}>{p.label}</option>)}
                  </select>
                </td>
                <td><input value={editData.starter} onChange={e => setEditData({ ...editData, starter: e.target.value })} style={inputStyle} /></td>
                <td><input value={editData.backup} onChange={e => setEditData({ ...editData, backup: e.target.value })} style={inputStyle} /></td>
                <td><input value={editData.next} onChange={e => setEditData({ ...editData, next: e.target.value })} style={inputStyle} /></td>
                <td><input value={editData.contract} type="number" onChange={e => setEditData({ ...editData, contract: Number(e.target.value) })} style={inputStyleMini} /></td>
                <td><input value={editData.age} type="number" onChange={e => setEditData({ ...editData, age: Number(e.target.value) })} style={inputStyleMini} /></td>
                <td>
                  <select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })} style={inputStyleMini}>
                    <option>Healthy</option>
                    <option>Injured</option>
                    <option>Suspended</option>
                  </select>
                </td>
                <td>
                  <select value={editData.intent} onChange={e => setEditData({ ...editData, intent: e.target.value })} style={inputStyleMini}>
                    <option>Stay</option>
                    <option>Open</option>
                    <option>Leave</option>
                  </select>
                </td>
                <td>
                  <input value={editData.tags?.join(", ")} onChange={e => setEditData({ ...editData, tags: e.target.value.split(",").map(x => x.trim()) })} style={inputStyleMini} />
                </td>
                <td>{riskScore(editData)}</td>
                <td>
                  <select value={editData.atRisk} onChange={e => setEditData({ ...editData, atRisk: e.target.value === "true" })} style={inputStyleMini}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </td>
                <td>
                  <button onClick={saveEdit} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaCheckCircle /></button>
                  <button onClick={() => setEditMode(null)} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}><FaTrash /></button>
                </td>
              </tr>
            ) : (
              <tr key={i} style={{ background: t.atRisk || riskScore(t) > 4 ? "#ff484822" : t.status !== "Healthy" ? "#FFD70022" : "#1de68222" }}>
                <td style={{ color: "#FFD700", fontWeight: 700 }}>{t.pos}</td>
                <td>
                  {t.starter}
                  {t.tags?.length > 0 && t.tags.map((tag, j) => (
                    <span key={j} style={{ background: "#FFD700", color: "#232a2e", fontWeight: 700, fontSize: 12, borderRadius: 6, padding: "1px 8px", margin: "0 2px" }}>
                      <FaTag /> {tag}
                    </span>
                  ))}
                  <button title="Show history" onClick={() => alert((t.history || []).map(h => `${h.date}: ${h.event} (risk:${h.risk})`).join("\n") || "No history.")} style={{ ...btnStyle, fontSize: 12, padding: "3px 6px", background: "#FFD70066" }}><FaHistory /></button>
                </td>
                <td>{t.backup || <span style={{ color: "#FFD700" }}>—</span>}</td>
                <td>{t.next || <span style={{ color: "#FFD700" }}>—</span>}</td>
                <td>{t.contract}</td>
                <td>{t.age}</td>
                <td style={{ color: statusColors[t.status], fontWeight: 700 }}>{t.status}</td>
                <td>{t.intent}</td>
                <td>
                  {(t.tags || []).map((tag, j) =>
                    <span key={j} style={{ background: "#FFD700", color: "#232a2e", fontWeight: 700, fontSize: 12, borderRadius: 6, padding: "1px 8px", margin: "0 2px" }}>
                      <FaTag /> {tag}
                    </span>
                  )}
                </td>
                <td style={{ color: riskScore(t) > 4 ? "#ff4848" : "#FFD700", fontWeight: 700 }}>{riskScore(t)}</td>
                <td style={{ color: t.atRisk ? "#ff4848" : "#1de682", fontWeight: 700 }}>{t.atRisk ? "YES" : "NO"}</td>
                <td>
                  <button onClick={() => startEdit(i)} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginRight: 3 }}><FaEdit /></button>
                  <button onClick={() => removeTalent(i)} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}><FaTrash /></button>
                  <button onClick={() => runScenario(i)} style={{ ...btnStyle, background: "#FFD70066", color: "#232a2e" }}><FaLightbulb /></button>
                  <button title="Add history" onClick={() => {
                    const ev = prompt("Enter event description:");
                    if (ev) addHistory(i, { date: new Date().toISOString().slice(0, 10), event: ev, risk: riskScore(t) });
                  }} style={{ ...btnStyle, background: "#FFD70066", color: "#232a2e", marginLeft: 2, fontSize: 12, padding: "3px 6px" }}>
                    <FaPlus /> <FaHistory />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Scenario stack */}
        {scenarioIdx >= 0 &&
          <div style={{ background: "#181e23", color: "#FFD700", padding: 15, borderRadius: 12, marginTop: 10 }}>
            <b>Scenario Analysis for:</b> <span style={{ color: "#FFD700", fontWeight: 700 }}>{talent[scenarioIdx]?.starter}</span>
            <div style={{ marginTop: 5 }}>{scenarioStatus}</div>
            {scenarioStack.length > 1 && <div>Stacked scenario: {scenarioStack.map(si => talent[si]?.starter).join(", ")}</div>}
            <button onClick={resetScenarios} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e", marginTop: 7 }}><FaArrowRight /> Close</button>
          </div>
        }
      </div>
      {/* Boardroom Recommendations & Log */}
      <div style={{ display: "flex", gap: 22 }}>
        <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16 }}><FaLightbulb style={{ marginRight: 7 }} /> Boardroom Recommendations</div>
          <ul>
            {talent.filter(t => t.atRisk || riskScore(t) > 4).length > 0 &&
              <li style={{ color: "#ff4848", fontWeight: 700 }}>Critical talent/succession risks detected—urgent board action required.</li>
            }
            <li style={{ color: "#1de682", fontWeight: 600 }}>Maintain ongoing pipeline monitoring and scenario planning.</li>
          </ul>
        </div>
        <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16, marginBottom: 7 }}><FaComments style={{ marginRight: 7 }} /> Boardroom Log</div>
          <div style={{ maxHeight: 95, overflowY: "auto", fontSize: 14, marginBottom: 5 }}>
            {log.map((c, i) =>
              <div key={i}>
                <span style={{ color: "#FFD700", fontWeight: 700 }}>{c.by}:</span> {c.txt}
                {(c.tags || []).length > 0 && <span style={{ color: "#FFD70099", marginLeft: 6 }}>[{c.tags.join(", ")}]</span>}
                <span style={{ color: "#FFD70077", fontSize: 12, marginLeft: 6 }}>{c.date}</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={logText} placeholder="Add board note or action..." onChange={e => setLogText(e.target.value)} style={inputStyleFull} />
            <input value={logTag} placeholder="Tags (comma separated)" onChange={e => setLogTag(e.target.value)} style={inputStyleMini} />
            <button onClick={addLog} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>Send</button>
          </div>
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
  ...inputStyle, width: 60, fontSize: 14, marginRight: 0, marginBottom: 2
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default TalentRiskSuccessionMatrixElite;
