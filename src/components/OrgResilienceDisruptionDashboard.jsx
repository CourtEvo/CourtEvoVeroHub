import React, { useState } from "react";
import {
  FaShieldAlt, FaUserTie, FaUsers, FaMoneyBillWave, FaBasketballBall, FaGavel, FaBullhorn, FaBuilding, FaExclamationTriangle, FaChartBar, FaPlus, FaEdit, FaTrash, FaClipboardCheck, FaLightbulb, FaDownload, FaFileExport, FaChevronRight, FaChevronDown
} from "react-icons/fa";

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e", accent: "#283E51" };

const CATEGORIES = [
  { key: "staff", label: "Key Staff", icon: <FaUserTie /> },
  { key: "squad", label: "Squad Depth", icon: <FaBasketballBall /> },
  { key: "finance", label: "Finances", icon: <FaMoneyBillWave /> },
  { key: "stakeholders", label: "Stakeholders", icon: <FaUsers /> },
  { key: "public", label: "Public/PR", icon: <FaBullhorn /> },
  { key: "facilities", label: "Facilities", icon: <FaBuilding /> },
  { key: "legal", label: "Legal/Compliance", icon: <FaGavel /> }
];

const BENCHMARKS = {
  staff: 9, squad: 9, finance: 9, stakeholders: 9, public: 8, facilities: 9, legal: 9
};

function catColor(score) {
  if (score >= 8) return "#1de682";
  if (score >= 6) return "#FFD700";
  return "#ff4848";
}

const demoTimeline = [
  { date: "2024-02-01", staff: 8, squad: 7, finance: 7, stakeholders: 7, public: 7, facilities: 8, legal: 9 },
  { date: "2024-05-01", staff: 7, squad: 6, finance: 7, stakeholders: 7, public: 6, facilities: 8, legal: 9 },
  { date: "2024-08-01", staff: 7, squad: 6, finance: 7, stakeholders: 8, public: 7, facilities: 8, legal: 8 },
  { date: "2024-11-01", staff: 6, squad: 5, finance: 6, stakeholders: 7, public: 6, facilities: 8, legal: 8 }
];

const demoDependencies = [
  { from: "staff", to: "squad" },
  { from: "squad", to: "finance" },
  { from: "finance", to: "stakeholders" },
  { from: "stakeholders", to: "public" },
  { from: "facilities", to: "squad" },
  { from: "public", to: "finance" }
];

const demoScenarios = [
  { name: "Star Player Injury", description: "Best player out for 4+ months.", impact: ["squad", "finance", "public"], action: "Promote youth, sign loan, PR campaign", owners: ["GM"], due: "2024-12-01", log: [{ by: "Board", txt: "Youth call-up planned", date: "2024-11-10" }], status: "active" },
  { name: "Sponsor Loss", description: "Lose main sponsor, 20% budget hit.", impact: ["finance", "stakeholders"], action: "Fundraising, new sponsor search", owners: ["CEO", "Board"], due: "2025-01-15", log: [], status: "active" }
];

const OrgResilienceDisruptionElite = () => {
  const [scores, setScores] = useState({
    staff: 7, squad: 6, finance: 7, stakeholders: 8, public: 7, facilities: 8, legal: 9
  });
  const [editCat, setEditCat] = useState(null);
  const [editVal, setEditVal] = useState(7);
  const [benchmarks] = useState(BENCHMARKS);
  const [timeline] = useState([...demoTimeline]);
  const [dependencies] = useState([...demoDependencies]);
  const [scenarios, setScenarios] = useState([...demoScenarios]);
  const [customScenario, setCustomScenario] = useState({ name: "", description: "", impact: [], action: "", owners: [], due: "" });
  const [expanded, setExpanded] = useState({});
  const [roleView, setRoleView] = useState("Board");

  // Timeline visual
  const timelineYears = timeline.map(t => t.date.split("-")[0]);
  // Dependency map (circular; simple SVG lines)
  function getNodePos(key) {
    const idx = CATEGORIES.findIndex(c => c.key === key);
    const angle = (2 * Math.PI * idx) / CATEGORIES.length - Math.PI / 2;
    return [180 + 100 * Math.cos(angle), 140 + 100 * Math.sin(angle)];
  }

  // CRUD scenario/action log
  const addScenario = () => {
    setScenarios([...scenarios, { ...customScenario, log: [], status: "active" }]);
    setCustomScenario({ name: "", description: "", impact: [], action: "", owners: [], due: "" });
  };
  const addActionLog = (sidx, txt) => {
    let newScenarios = scenarios.slice();
    newScenarios[sidx].log.push({ by: roleView, txt, date: new Date().toISOString().slice(0,10) });
    setScenarios(newScenarios);
  };
  const toggleStatus = idx => {
    setScenarios(scenarios.map((s, i) => i === idx ? { ...s, status: s.status === "active" ? "resolved" : "active" } : s));
  };

  // Boardroom/AI recos
  function recommendations() {
    let rec = [];
    CATEGORIES.forEach(c => {
      if (scores[c.key] < 6) rec.push(`Critical: ${c.label} at risk! Assign immediate owners, update action log, review dependencies.`);
      else if (scores[c.key] < 8) rec.push(`Gap to elite in ${c.label}: +${benchmarks[c.key] - scores[c.key]}. Run scenario drills and assign accountability.`);
      else rec.push(`Elite resilience in ${c.label}. Maintain succession and crisis plans.`);
    });
    if (Object.values(scores).filter(s => s < 6).length > 1) rec.push("Cascading risk: two or more areas at critical risk. Check dependency map.");
    return rec;
  }

  return (
    <div style={{ background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif", borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 10 }}>
        <FaShieldAlt size={32} color={brand.gold} />
        <h2 style={{ fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0 }}>Organizational Resilience & Disruption Cockpit</h2>
        <span style={{ background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 8, padding: '3px 18px', fontSize: 15, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022' }}>
          CourtEvo Vero | Boardroom-Grade
        </span>
        <select value={roleView} onChange={e => setRoleView(e.target.value)} style={{ ...btnStyle, marginLeft: 16 }}>
          <option>Board</option>
          <option>GM</option>
          <option>Staff</option>
        </select>
        <button onClick={() => window.print()} style={{ ...btnStyle, background: "#1de682", color: "#232a2e", marginLeft: 12 }}><FaFileExport style={{ marginRight: 5 }} /> Print</button>
      </div>
      {/* Radar */}
      <div style={{ display: "flex", gap: 35, marginBottom: 14 }}>
        {/* Resilience Radar & Bar */}
        <div style={{ flex: 2 }}>
          <div style={{ display: "flex", gap: 24 }}>
            {/* Radar */}
            <div style={{ background: "#232a2e", borderRadius: 14, boxShadow: "0 2px 18px #FFD70022", padding: 18, minWidth: 340 }}>
              <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 17, marginBottom: 6 }}>Resilience Radar</div>
              <svg width={360} height={280}>
                {/* Nodes */}
                {CATEGORIES.map(cat => {
                  const [x, y] = getNodePos(cat.key);
                  return (
                    <g key={cat.key}>
                      <circle cx={x} cy={y} r={24} fill={catColor(scores[cat.key])} stroke="#FFD700" strokeWidth={3} />
                      <text x={x} y={y+5} textAnchor="middle" fontWeight={700} fontSize={14} fill="#232a2e">{cat.label.split(" ")[0]}</text>
                      <text x={x} y={y+22} textAnchor="middle" fontWeight={600} fontSize={12} fill="#FFD700">{scores[cat.key]}</text>
                    </g>
                  );
                })}
                {/* Edges */}
                {demoDependencies.map(dep => {
                  const [x1, y1] = getNodePos(dep.from);
                  const [x2, y2] = getNodePos(dep.to);
                  return (
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFD70055" strokeWidth={5} markerEnd="url(#arrowhead)" key={dep.from + "-" + dep.to} />
                  );
                })}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto" markerUnits="strokeWidth">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#FFD70088" />
                  </marker>
                </defs>
              </svg>
              <div style={{ marginTop: 11, color: "#FFD700bb", fontWeight: 600, fontSize: 14 }}>Dependency lines: see where a single failure cascades risk.</div>
            </div>
            {/* Bar + Heatmap */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 17, marginBottom: 7 }}>Resilience Bar & Heatmap</div>
              {CATEGORIES.map(cat =>
                <div key={cat.key} style={{ margin: "8px 0" }}>
                  <div style={{ fontSize: 14, color: "#FFD700" }}>{cat.label}</div>
                  <div style={{ background: "#283E51", borderRadius: 7, height: 19, position: "relative", width: 130 }}>
                    <div style={{
                      width: `${scores[cat.key] * 10}%`,
                      background: catColor(scores[cat.key]),
                      height: "100%", borderRadius: 7, transition: "width 0.2s"
                    }} />
                    <div style={{ position: "absolute", left: 7, top: 2, color: "#232a2e", fontWeight: 700 }}>{scores[cat.key]}</div>
                  </div>
                  {/* Benchmark */}
                  <div style={{ fontSize: 11, color: "#FFD70099" }}>Best in class: {benchmarks[cat.key]}</div>
                  {/* Heatmap */}
                  <svg width={120} height={16} style={{ marginTop: 1 }}>
                    {timeline.map((t, i) => (
                      <rect key={i} x={i * 28} y={0} width={26} height={15} fill={catColor(t[cat.key])} />
                    ))}
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Score Table + Edit */}
        <div style={{ flex: 1, marginLeft: 17 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15, color: "#fff" }}>
            <thead>
              <tr>
                <th>Area</th>
                <th>Score</th>
                <th>Elite</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map(cat =>
                <tr key={cat.key} style={{ background: catColor(scores[cat.key]) + "22" }}>
                  <td style={{ fontWeight: 700, color: "#FFD700" }}>{cat.icon} {cat.label}</td>
                  <td style={{ color: catColor(scores[cat.key]), fontWeight: 900 }}>{scores[cat.key]}</td>
                  <td style={{ color: "#FFD70099", fontWeight: 700 }}>{benchmarks[cat.key]}</td>
                  <td>
                    <button onClick={() => { setEditCat(cat.key); setEditVal(scores[cat.key]); }} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}><FaEdit /></button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {editCat &&
            <div style={{ background: "#FFD70022", borderRadius: 8, padding: 9, margin: "11px 0" }}>
              <div style={{ fontWeight: 700, color: "#FFD700" }}>Edit Score for {CATEGORIES.find(c => c.key === editCat).label}</div>
              <input type="number" min={1} max={10} value={editVal} onChange={e => setEditVal(Number(e.target.value))} style={inputStyle} />
              <button onClick={() => { setScores({ ...scores, [editCat]: editVal }); setEditCat(null); }} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}>Save</button>
              <button onClick={() => setEditCat(null)} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}>Cancel</button>
            </div>
          }
        </div>
      </div>
      {/* Scenario Impact Analyzer */}
      <div style={{ background: "#283E51", borderRadius: 13, padding: 13, margin: "22px 0" }}>
        <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 16, marginBottom: 6, display: "flex", alignItems: "center" }}><FaExclamationTriangle style={{ marginRight: 7 }} />Disruption Scenario Analyzer</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15, color: "#fff", marginBottom: 7 }}>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Description</th>
              <th>Impact</th>
              <th>Action</th>
              <th>Owners</th>
              <th>Due</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s, i) =>
              <React.Fragment key={i}>
                <tr style={{ background: s.status === "resolved" ? "#1de68222" : "#FFD70022" }}>
                  <td>
                    <button onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))} style={{ background: "none", border: "none", color: "#FFD700", fontSize: 16 }}>{expanded[i] ? <FaChevronDown /> : <FaChevronRight />}</button>
                  </td>
                  <td style={{ fontWeight: 700, color: "#FFD700" }}>{s.name}</td>
                  <td>{s.description}</td>
                  <td>{s.impact.map(k => CATEGORIES.find(c => c.key === k)?.label).join(", ")}</td>
                  <td style={{ color: "#FFD700" }}>{s.action}</td>
                  <td>{(s.owners || []).join(", ")}</td>
                  <td>{s.due}</td>
                  <td style={{ color: s.status === "resolved" ? "#1de682" : "#FFD700", fontWeight: 800 }}>{s.status === "resolved" ? "RESOLVED" : "ACTIVE"}</td>
                  <td>
                    <button onClick={() => toggleStatus(i)} style={{ ...btnStyle, background: "#1de682", color: "#232a2e" }}><FaClipboardCheck /></button>
                  </td>
                </tr>
                {expanded[i] &&
                  <tr>
                    <td colSpan={9} style={{ background: "#181e23", color: "#FFD700", fontWeight: 600, padding: "7px 18px" }}>
                      <div style={{ marginBottom: 7, color: "#FFD700bb" }}>Action Log & Accountability:</div>
                      <ul>
                        {(s.log || []).length ? s.log.map((log, lidx) =>
                          <li key={lidx} style={{ color: "#1de682" }}>{log.by} | {log.date}: {log.txt}</li>
                        ) : <li style={{ color: "#FFD70099" }}>No actions yet.</li>}
                      </ul>
                      <input placeholder="Add action log..." style={inputStyleFull} onKeyDown={e => { if (e.key === "Enter" && e.target.value) { addActionLog(i, e.target.value); e.target.value = ""; } }} />
                    </td>
                  </tr>
                }
              </React.Fragment>
            )}
          </tbody>
        </table>
        {/* Add scenario */}
        <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 6 }}>
          <input value={customScenario.name} placeholder="Name" onChange={e => setCustomScenario({ ...customScenario, name: e.target.value })} style={inputStyle} />
          <input value={customScenario.description} placeholder="Description" onChange={e => setCustomScenario({ ...customScenario, description: e.target.value })} style={inputStyleFull} />
          <select multiple value={customScenario.impact} onChange={e => setCustomScenario({ ...customScenario, impact: Array.from(e.target.selectedOptions, opt => opt.value) })} style={{ ...inputStyle, width: 120 }}>
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <input value={customScenario.action} placeholder="Action Plan" onChange={e => setCustomScenario({ ...customScenario, action: e.target.value })} style={inputStyleFull} />
          <input value={customScenario.owners} placeholder="Owners (comma separated)" onChange={e => setCustomScenario({ ...customScenario, owners: e.target.value.split(",").map(x => x.trim()) })} style={inputStyle} />
          <input type="date" value={customScenario.due} onChange={e => setCustomScenario({ ...customScenario, due: e.target.value })} style={inputStyle} />
          <button onClick={addScenario} style={{ ...btnStyle, background: "#FFD700", color: "#232a2e" }}><FaPlus /> Add</button>
        </div>
      </div>
      {/* Boardroom summary */}
      <div style={{ background: "#232a2e", borderRadius: 13, padding: 13, marginTop: 10 }}>
        <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 16 }}><FaLightbulb style={{ marginRight: 7 }} /> AI Boardroom Recommendations</div>
        <ul>
          {recommendations().map((r, i) => <li key={i} style={{ color: r.startsWith("Critical") ? "#ff4848" : "#FFD700", fontWeight: 600 }}>{r}</li>)}
        </ul>
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
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default OrgResilienceDisruptionElite;
