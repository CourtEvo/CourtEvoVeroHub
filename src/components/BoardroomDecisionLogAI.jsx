import React, { useState } from "react";
import {
  FaClipboardList, FaCheckCircle, FaTimes, FaChartPie, FaBolt, FaUserTie, FaComments, FaRobot, FaFileExport,
  FaArrowUp, FaArrowDown, FaBalanceScale, FaExclamationTriangle, FaLightbulb, FaSearch, FaSync, FaBullseye, FaUserCheck, FaPlus
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e" };

const ROLES = ["Board", "GM", "Head Coach", "Legal", "Sport Director"];

const DEFAULT_DECISIONS = [
  {
    id: 1, title: "Promote Ivan Radic to U18", owner: "Board", date: "2023-09-01", status: "Implemented",
    impact: "Squad Depth, Sponsor", outcome: "Success", result: "Boosted squad depth, attracted new sponsor interest.",
    notes: "Monitor next 6m for further promotion.", drift: 0, aiNarr: "Direct positive impact; strategic alignment achieved.",
    scenario: "What if we promote 2 U18s this season?"
  },
  {
    id: 2, title: "Academic Probation for M. Proleta", owner: "Head Coach", date: "2024-05-18", status: "Implemented",
    impact: "Compliance", outcome: "Mixed", result: "Academic compliance increased, but team rotation disrupted.",
    notes: "Need backup PG ready.", drift: -12, aiNarr: "Compliance success, but operational drift. Adjust squad plan.",
    scenario: "What if top PG is benched for academic reasons?"
  },
  {
    id: 3, title: "Switch sponsor to Erste Bank", owner: "GM", date: "2024-03-22", status: "Implemented",
    impact: "Commercial", outcome: "Pending", result: "Negotiation ongoing.", notes: "Finalize legal review.", drift: 0, aiNarr: "No major misalignment yet. Monitor.",
    scenario: "What if we bring in a banking sponsor instead of telecom?"
  }
];

const OUTCOMES = ["Success", "Mixed", "Failed", "Pending"];

function driftColor(drift) {
  if (drift > 0) return "#1de682";
  if (drift < 0) return "#ff4848";
  return "#FFD700";
}

// Drift Radar SVG
function DriftRadar({ decisions }) {
  const mapped = ROLES.map(role =>
    decisions.filter(d => d.owner === role && d.drift).reduce((sum, d) => sum + d.drift, 0)
  );
  return (
    <svg width={240} height={240}>
      <circle cx={120} cy={120} r={80} fill="#FFD70011" />
      {mapped.map((val, i) => {
        const angle = (2 * Math.PI / mapped.length) * i - Math.PI / 2;
        const r = 50 + Math.abs(val) * 1.7;
        const x = 120 + r * Math.cos(angle);
        const y = 120 + r * Math.sin(angle);
        return (
          <g key={i}>
            <line x1={120} y1={120} x2={x} y2={y} stroke={driftColor(val)} strokeWidth={3} />
            <circle cx={x} cy={y} r={10 + Math.abs(val) / 3} fill={driftColor(val)} />
            <text x={x} y={y - 15} fill="#FFD700" fontWeight={700} fontSize={14} textAnchor="middle">{ROLES[i]}</text>
            <text x={x} y={y + 19} fill="#FFD70099" fontWeight={500} fontSize={13} textAnchor="middle">{val}</text>
          </g>
        );
      })}
      <text x={120} y={120} fill="#FFD700" fontWeight={900} fontSize={16} textAnchor="middle">Drift</text>
    </svg>
  );
}

// Success/Failure Pie
function OutcomePie({ decisions }) {
  const data = { Success: 0, Mixed: 0, Failed: 0, Pending: 0 };
  decisions.forEach(d => data[d.outcome] = (data[d.outcome] || 0) + 1);
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const PIE_COLORS = { Success: "#1de682", Mixed: "#FFD700", Failed: "#ff4848", Pending: "#FFD70066" };
  let start = 0;
  const radii = 60;
  return (
    <svg width={170} height={170}>
      {Object.entries(data).map(([outcome, count], i) => {
        if (count === 0) return null;
        const angle = (count / total) * 2 * Math.PI;
        const x1 = 85 + radii * Math.cos(start - Math.PI / 2);
        const y1 = 85 + radii * Math.sin(start - Math.PI / 2);
        const x2 = 85 + radii * Math.cos(start + angle - Math.PI / 2);
        const y2 = 85 + radii * Math.sin(start + angle - Math.PI / 2);
        const largeArc = angle > Math.PI ? 1 : 0;
        const d = `M85,85 L${x1},${y1} A${radii},${radii} 0 ${largeArc} 1 ${x2},${y2} Z`;
        const piece = (
          <path key={outcome} d={d} fill={PIE_COLORS[outcome]} stroke="#232a2e" strokeWidth={2} />
        );
        start += angle;
        return piece;
      })}
      <text x={85} y={90} fill="#FFD700" fontWeight={900} fontSize={18} textAnchor="middle">{total}</text>
      {Object.entries(data).map(([outcome, count], i) =>
        <text key={outcome} x={25} y={30 + i * 22} fill={PIE_COLORS[outcome]} fontWeight={700} fontSize={14}>
          {outcome}: {count}
        </text>
      )}
    </svg>
  );
}

const BoardroomDecisionLogAI = () => {
  const [decisions, setDecisions] = useState([...DEFAULT_DECISIONS]);
  const [log, setLog] = useState([{ txt: "Decision review: Compliance drift detected in PG squad.", by: "AI", date: "2024-06-13" }]);
  const [logText, setLogText] = useState("");
  const [exporting, setExporting] = useState(false);
  const [newDecision, setNewDecision] = useState({
    title: "", owner: ROLES[0], date: new Date().toISOString().slice(0, 10), status: "Pending", impact: "", outcome: "Pending", result: "", notes: "", drift: 0, aiNarr: "", scenario: ""
  });
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("");

  // CRUD
  const addDecision = () => {
    setDecisions([
      ...decisions,
      { ...newDecision, id: decisions.length ? Math.max(...decisions.map(a => a.id)) + 1 : 1 }
    ]);
    setNewDecision({ title: "", owner: ROLES[0], date: new Date().toISOString().slice(0, 10), status: "Pending", impact: "", outcome: "Pending", result: "", notes: "", drift: 0, aiNarr: "", scenario: "" });
  };
  const removeDecision = id => setDecisions(decisions.filter(d => d.id !== id));
  const setOutcome = (id, outcome) => setDecisions(decisions.map(d => d.id === id ? { ...d, outcome } : d));
  const setDrift = (id, drift) => setDecisions(decisions.map(d => d.id === id ? { ...d, drift } : d));
  const setStatus = (id, status) => setDecisions(decisions.map(d => d.id === id ? { ...d, status } : d));

  // Export
  const exportLog = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 2100);
  };

  // Filtered decisions
  const filtered = decisions.filter(d =>
    d.title.toLowerCase().includes(filter.toLowerCase()) ||
    d.owner.toLowerCase().includes(filter.toLowerCase()) ||
    d.impact.toLowerCase().includes(filter.toLowerCase()) ||
    d.result.toLowerCase().includes(filter.toLowerCase())
  );

  // --- UI ---
  return (
    <div style={{
      background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif", borderRadius: 29,
      padding: 33, boxShadow: "0 8px 64px #FFD70055", maxWidth: 1750, margin: "0 auto"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 16 }}>
        <FaClipboardList size={38} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 32, color: brand.gold, letterSpacing: 2, margin: 0 }}>
          Boardroom Decision Log & AI Insights
        </h2>
        <span style={{
          background: brand.gold, color: "#232a2e", fontWeight: 800, borderRadius: 17,
          padding: '8px 28px', fontSize: 17, marginLeft: 18, boxShadow: '0 2px 10px #FFD70044'
        }}>
          CourtEvo Vero | Boardroom Cockpit
        </span>
        <button onClick={exportLog} style={{
          background: "#1de682", color: "#232a2e", border: "none", borderRadius: 10,
          fontWeight: 900, fontSize: 17, padding: "11px 26px", marginLeft: 13
        }}>
          <FaFileExport style={{ marginRight: 8 }} /> Export PDF/CSV
        </button>
      </div>
      {exporting &&
        <div style={{
          background: "#FFD700", color: "#232a2e", fontWeight: 900, borderRadius: 15,
          padding: 15, marginBottom: 13, fontSize: 18, textAlign: "center"
        }}>
          Export in progress... Boardroom audit deck will include heatmaps, drift radar, AI log, full outcomes.
        </div>
      }
      {/* Analytics header */}
      <div style={{ display: "flex", gap: 40, margin: "10px 0 23px 0" }}>
        <div>
          <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 19, marginBottom: 7 }}><FaBullseye /> Drift & Accountability Radar</div>
          <DriftRadar decisions={filtered} />
        </div>
        <div>
          <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 19, marginBottom: 7 }}><FaChartPie /> Outcome Distribution</div>
          <OutcomePie decisions={filtered} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 19, marginBottom: 7 }}><FaSearch /> Filter Log</div>
          <input value={filter} placeholder="Filter by decision, owner, impact..." onChange={e => setFilter(e.target.value)} style={inputStyleFull} />
        </div>
      </div>
      {/* Decision log table */}
      <table style={{ width: "100%", marginBottom: 24, borderCollapse: "collapse", fontSize: 16, boxShadow: "0 2px 18px #FFD70022" }}>
        <thead>
          <tr style={{ color: "#FFD700", fontWeight: 900, fontSize: 18 }}>
            <th>Decision</th>
            <th>Owner</th>
            <th>Date</th>
            <th>Status</th>
            <th>Impact</th>
            <th>Outcome</th>
            <th>Result</th>
            <th>Drift</th>
            <th>Scenario</th>
            <th>AI Narrative</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((d, idx) =>
            <tr key={d.id} style={{ background: "#232a2e" }}>
              <td style={{ fontWeight: 900 }}>{d.title}</td>
              <td style={{ color: "#FFD700" }}>{d.owner}</td>
              <td>{d.date}</td>
              <td>
                <select value={d.status} onChange={e => setStatus(d.id, e.target.value)} style={{ background: "#FFD70022", color: "#FFD700", fontWeight: 800 }}>
                  <option>Pending</option><option>Implemented</option><option>Drifted</option>
                </select>
              </td>
              <td>{d.impact}</td>
              <td>
                <select value={d.outcome} onChange={e => setOutcome(d.id, e.target.value)} style={{ background: "#FFD70022", color: "#FFD700", fontWeight: 800 }}>
                  {OUTCOMES.map(o => <option key={o}>{o}</option>)}
                </select>
              </td>
              <td style={{ color: d.outcome === "Success" ? "#1de682" : d.outcome === "Failed" ? "#ff4848" : "#FFD700" }}>{d.result}</td>
              <td>
                <input type="number" value={d.drift} onChange={e => setDrift(d.id, Number(e.target.value))} style={{ width: 50, background: "#232a2e", color: driftColor(d.drift), fontWeight: 900, border: "1px solid #FFD70055" }} />
                <span style={{ color: driftColor(d.drift), marginLeft: 5 }}>{d.drift > 0 ? <FaArrowUp /> : d.drift < 0 ? <FaArrowDown /> : <FaBalanceScale />}</span>
              </td>
              <td style={{ fontSize: 14, color: "#1de682", fontWeight: 800 }}>{d.scenario}</td>
              <td style={{ fontSize: 14, color: "#FFD700", fontWeight: 800 }}>{d.aiNarr}</td>
              <td>
                <button onClick={() => setExpanded(d.id)} style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 700, padding: "3px 10px", marginRight: 6 }}>
                  <FaComments />
                </button>
                <button onClick={() => removeDecision(d.id)} style={{ background: "#ff4848", color: "#fff", borderRadius: 7, border: "none", fontWeight: 700, padding: "3px 10px" }}>
                  <FaTimes />
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Expanded decision */}
      {expanded && (() => {
        const d = decisions.find(x => x.id === expanded);
        if (!d) return null;
        return (
          <div style={{ background: "#232a2e", borderRadius: 22, boxShadow: "0 4px 48px #FFD70033", padding: 33, marginBottom: 25, marginTop: 23 }}>
            <h3 style={{ color: "#FFD700", fontWeight: 800, fontSize: 25 }}>{d.title}</h3>
            <div style={{ fontSize: 17, color: "#FFD700" }}>
              <b>Owner:</b> {d.owner} &nbsp; | &nbsp; <b>Date:</b> {d.date} &nbsp; | &nbsp; <b>Status:</b> {d.status}
            </div>
            <div style={{ marginTop: 7, color: "#1de682", fontWeight: 700 }}><FaLightbulb /> {d.aiNarr}</div>
            <div style={{ marginTop: 13 }}>
              <b>Impact:</b> <span style={{ color: "#FFD700" }}>{d.impact}</span>
            </div>
            <div style={{ marginTop: 7 }}>
              <b>Result:</b> <span style={{ color: d.outcome === "Success" ? "#1de682" : d.outcome === "Failed" ? "#ff4848" : "#FFD700" }}>{d.result}</span>
            </div>
            <div style={{ marginTop: 7 }}>
              <b>Outcome:</b> {d.outcome}
            </div>
            <div style={{ marginTop: 7 }}>
              <b>Drift:</b> <span style={{ color: driftColor(d.drift), fontWeight: 800 }}>{d.drift}</span>
            </div>
            <div style={{ marginTop: 13, color: "#FFD700" }}><b>Scenario:</b> {d.scenario}</div>
            <div style={{ marginTop: 13, color: "#FFD700" }}><b>Notes:</b> {d.notes}</div>
            <button onClick={() => setExpanded(null)} style={{
              background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "8px 15px", marginTop: 12
            }}>
              Close
            </button>
          </div>
        );
      })()}
      {/* Add new decision */}
      <div style={{ marginTop: 28, background: "#232a2e", borderRadius: 18, padding: 19 }}>
        <h3 style={{ color: "#FFD700" }}>Add Board Decision</h3>
        <input value={newDecision.title} placeholder="Decision Title" onChange={e => setNewDecision({ ...newDecision, title: e.target.value })} style={inputStyle} />
        <select value={newDecision.owner} onChange={e => setNewDecision({ ...newDecision, owner: e.target.value })} style={inputStyleMini}>
          {ROLES.map(role => <option key={role}>{role}</option>)}
        </select>
        <input value={newDecision.date} type="date" onChange={e => setNewDecision({ ...newDecision, date: e.target.value })} style={inputStyleMini} />
        <select value={newDecision.status} onChange={e => setNewDecision({ ...newDecision, status: e.target.value })} style={inputStyleMini}>
          <option>Pending</option><option>Implemented</option><option>Drifted</option>
        </select>
        <input value={newDecision.impact} placeholder="Impact (e.g. Squad, Compliance, Sponsor)" onChange={e => setNewDecision({ ...newDecision, impact: e.target.value })} style={inputStyleMini} />
        <select value={newDecision.outcome} onChange={e => setNewDecision({ ...newDecision, outcome: e.target.value })} style={inputStyleMini}>
          {OUTCOMES.map(o => <option key={o}>{o}</option>)}
        </select>
        <input value={newDecision.result} placeholder="Result/Outcome" onChange={e => setNewDecision({ ...newDecision, result: e.target.value })} style={inputStyle} />
        <input value={newDecision.drift} type="number" placeholder="Drift Score" onChange={e => setNewDecision({ ...newDecision, drift: Number(e.target.value) })} style={inputStyleMini} />
        <input value={newDecision.scenario} placeholder="Scenario Tested" onChange={e => setNewDecision({ ...newDecision, scenario: e.target.value })} style={inputStyle} />
        <input value={newDecision.aiNarr} placeholder="AI Narrative/Insight" onChange={e => setNewDecision({ ...newDecision, aiNarr: e.target.value })} style={inputStyle} />
        <input value={newDecision.notes} placeholder="Notes" onChange={e => setNewDecision({ ...newDecision, notes: e.target.value })} style={inputStyle} />
        <button onClick={addDecision} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginLeft: 13 }}>
          <FaPlus /> Add
        </button>
      </div>
      {/* Boardroom AI/Log */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: 13, margin: "24px 0 0 0"
      }}>
        <b style={{ color: "#FFD700", fontSize: 17 }}><FaRobot style={{ marginRight: 7 }} /> Boardroom AI & Audit Log</b>
        <div style={{ maxHeight: 95, overflowY: "auto", fontSize: 15, marginBottom: 8 }}>
          {log.map((c, i) =>
            <div key={i}><span style={{ color: "#FFD700", fontWeight: 700 }}>{c.by}:</span> {c.txt} <span style={{ color: "#FFD70077", fontSize: 12, marginLeft: 6 }}>{c.date}</span></div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={logText} placeholder="Add log or note..." onChange={e => setLogText(e.target.value)} style={inputStyleFull} />
          <button onClick={() => {
            setLog([...log, { by: "Board", txt: logText, date: new Date().toISOString().slice(0, 10) }]); setLogText("");
          }} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}>Send</button>
        </div>
      </div>
      <div style={{ marginTop: 13, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero | “BE REAL. BE VERO.”
      </div>
    </div>
  );
};

const inputStyle = {
  marginRight: 7, marginBottom: 5, padding: 4, borderRadius: 7, border: "1.5px solid #FFD70077", fontSize: 15, width: 135
};
const inputStyleMini = {
  ...inputStyle, width: 105, fontSize: 14
};
const inputStyleFull = {
  ...inputStyle, width: 210
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 15, padding: "8px 15px", marginRight: 6, cursor: "pointer"
};

export default BoardroomDecisionLogAI;
