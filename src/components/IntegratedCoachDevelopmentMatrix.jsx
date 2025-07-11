// src/components/IntegratedCoachDevelopmentMatrix.jsx
import React, { useState } from 'react';
import {
  FaUserTie, FaUserPlus, FaEdit, FaTrash, FaArrowRight, FaArrowUp, FaArrowDown,
  FaExchangeAlt, FaSave, FaFolderOpen, FaExclamationTriangle, FaUndo, FaRedo, FaFileExport,
  FaTrophy, FaBookOpen, FaStar, FaCheckCircle, FaLightbulb, FaBullhorn
} from 'react-icons/fa';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip as ReTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e", accent: "#283E51" };
const PATHWAY = ["Entry", "Junior", "Senior", "Elite", "Director"];
const SKILLS = ["Technical", "Tactical", "Leadership", "Communication", "Player Development", "Game Analytics"];
const CERTS = ["Level 1", "Level 2", "Level 3", "FIBA", "Custom"];

const demoCoaches = [
  {
    id: 1, name: "Ivan Perković", role: "Elite", stage: 3, cpd: 38, exp: 12, age: 39, cert: ["Level 3", "FIBA"],
    skills: { Technical: 9, Tactical: 9, Leadership: 8, Communication: 9, "Player Development": 8, "Game Analytics": 7 },
    impact: 8.8
  },
  {
    id: 2, name: "Mladen Grgić", role: "Senior", stage: 2, cpd: 23, exp: 8, age: 35, cert: ["Level 2"],
    skills: { Technical: 7, Tactical: 8, Leadership: 7, Communication: 7, "Player Development": 7, "Game Analytics": 6 },
    impact: 7.2
  },
  {
    id: 3, name: "Karlo Mikulić", role: "Junior", stage: 1, cpd: 13, exp: 3, age: 27, cert: ["Level 1"],
    skills: { Technical: 5, Tactical: 6, Leadership: 6, Communication: 6, "Player Development": 6, "Game Analytics": 4 },
    impact: 6.1
  },
  {
    id: 4, name: "Filip Lončar", role: "Entry", stage: 0, cpd: 6, exp: 1, age: 24, cert: [],
    skills: { Technical: 3, Tactical: 3, Leadership: 5, Communication: 5, "Player Development": 4, "Game Analytics": 2 },
    impact: 4.5
  },
  {
    id: 5, name: "Dario Brkić", role: "Director", stage: 4, cpd: 41, exp: 18, age: 50, cert: ["Level 3", "FIBA"],
    skills: { Technical: 8, Tactical: 8, Leadership: 10, Communication: 9, "Player Development": 9, "Game Analytics": 8 },
    impact: 9.5
  }
];

// --- HELPER FUNCTIONS ---
function colorStage(stage) {
  return ["#FFD700cc", "#1de682cc", "#c2b280cc", "#485563cc", "#FFD700"][stage];
}
function calcSuccession(coaches) {
  // Returns a warning if no ready successor for Elite/Director
  const elite = coaches.filter(c => c.stage >= 3);
  const senior = coaches.filter(c => c.stage === 2);
  if (elite.length < 2) return "Critical: Only 1 Elite/Director-level coach. No succession resilience.";
  if (senior.length < 1) return "Warning: No Senior coaches ready for promotion. Pipeline is thin.";
  return "Succession pipeline is healthy.";
}
function skillGapMatrix(coaches) {
  // Returns {skill, gap: req - avg} for each skill vs. required standard by role
  const out = [];
  SKILLS.forEach(skill => {
    const avg = coaches.reduce((sum, c) => sum + (c.skills[skill] || 0), 0) / coaches.length;
    out.push({ skill, avg: avg.toFixed(2) });
  });
  return out;
}
function pipelineHealth(coaches) {
  // Returns percentage at each stage
  const counts = PATHWAY.map((_, i) => coaches.filter(c => c.stage === i).length);
  const total = coaches.length || 1;
  return counts.map(cnt => (cnt / total) * 100);
}
function coachImpactColor(score) {
  return score >= 9 ? "#FFD700" : score >= 7 ? "#1de682" : score >= 5 ? "#FFD700cc" : "#ff4848";
}

// --- MAIN COMPONENT ---
const IntegratedCoachDevelopmentMatrix = () => {
  const [coaches, setCoaches] = useState(demoCoaches);
  const [history, setHistory] = useState([demoCoaches]);
  const [redoStack, setRedoStack] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('matrix');
  const [scenarioName, setScenarioName] = useState('');
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [compareIdx, setCompareIdx] = useState(null);

  // --- CRUD ---
  const addCoach = c => {
    const next = [...coaches, { ...c, id: Date.now() }];
    setCoaches(next); setHistory([...history, next]); setRedoStack([]); setSelected(null);
  };
  const updateCoach = c => {
    const next = coaches.map(coach => coach.id === c.id ? c : coach);
    setCoaches(next); setHistory([...history, next]); setRedoStack([]); setSelected(null);
  };
  const deleteCoach = id => {
    const next = coaches.filter(coach => coach.id !== id);
    setCoaches(next); setHistory([...history, next]); setRedoStack([]); setSelected(null);
  };

  // --- Undo/Redo ---
  const undo = () => {
    if (history.length <= 1) return;
    setRedoStack([coaches, ...redoStack]);
    const prev = history[history.length - 2];
    setCoaches(prev);
    setHistory(history.slice(0, -1));
  };
  const redo = () => {
    if (redoStack.length === 0) return;
    setHistory([...history, redoStack[0]]);
    setCoaches(redoStack[0]);
    setRedoStack(redoStack.slice(1));
  };

  // --- Scenario Save/Load ---
  const saveScenario = () => {
    if (!scenarioName) return;
    setSavedScenarios([...savedScenarios, {
      name: scenarioName,
      coaches: JSON.parse(JSON.stringify(coaches))
    }]);
    setScenarioName('');
  };
  const loadScenario = idx => {
    setCoaches(savedScenarios[idx].coaches);
    setHistory([...history, savedScenarios[idx].coaches]);
    setRedoStack([]);
    setCompareIdx(null);
  };

  // --- Export ---
  const exportCSV = () => {
    const csv = [
      "Name,Role,Stage,CPD,Exp,Age,Certifications,Technical,Tactical,Leadership,Communication,Player Development,Game Analytics,Impact"
    ].concat(coaches.map(c =>
      [
        c.name, c.role, PATHWAY[c.stage], c.cpd, c.exp, c.age, (c.cert || []).join("|"),
        ...SKILLS.map(skill => c.skills[skill] || 0), c.impact
      ].join(",")
    )).join('\n');
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "coach_development_matrix.csv";
    a.click(); URL.revokeObjectURL(url);
  };

  // --- Scenario Compare ---
  const scenarioDelta = (base, compare) => {
    return (base || []).map((c, idx) => {
      const other = (compare || [])[idx] || {};
      return {
        name: c.name,
        stage: PATHWAY[c.stage],
        baseImpact: c.impact,
        compareImpact: other.impact || 0,
        delta: (other.impact || 0) - c.impact
      };
    });
  };

  // --- Boardroom Analytics ---
  const pipeline = pipelineHealth(coaches);
  const skillGaps = skillGapMatrix(coaches);
  const succession = calcSuccession(coaches);
  const avgImpact = (coaches.reduce((s, c) => s + c.impact, 0) / (coaches.length || 1)).toFixed(2);

  // --- UI ---
  return (
    <div style={{
      background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif",
      borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1400, margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 18 }}>
        <FaUserTie size={28} color={brand.gold} />
        <h2 style={{
          fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0
        }}>
          Integrated Coach Development Matrix
        </h2>
        <span style={{
          background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 8,
          padding: '3px 16px', fontSize: 14, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022'
        }}>
          Coach Pathway Intelligence | CourtEvo Vero
        </span>
      </div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 18, margin: "18px 0 10px 0" }}>
        {[
          { key: "matrix", label: <><FaUserTie style={{ marginRight: 8 }} /> Coach Matrix</> },
          { key: "pathway", label: <><FaArrowRight style={{ marginRight: 8 }} /> Pathway Map</> },
          { key: "gaps", label: <><FaExclamationTriangle style={{ marginRight: 8 }} /> Skill Gaps</> },
          { key: "dashboard", label: <><FaTrophy style={{ marginRight: 8 }} /> Boardroom Dashboard</> },
          { key: "compare", label: <><FaExchangeAlt style={{ marginRight: 8 }} /> Scenario Compare</> }
        ].map(tabItem => (
          <button key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            style={{
              background: tab === tabItem.key ? brand.gold : brand.accent,
              color: tab === tabItem.key ? '#232a2e' : '#fff',
              fontWeight: 700, border: 'none', borderRadius: 13,
              fontSize: 15, padding: '8px 24px', cursor: 'pointer',
              boxShadow: tab === tabItem.key ? '0 2px 14px #FFD70033' : 'none'
            }}>
            {tabItem.label}
          </button>
        ))}
      </div>
      {/* Tab: Coach Matrix CRUD */}
      {tab === "matrix" && (
        <div>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            {/* Table */}
            <div style={{ flex: 2, background: "#283E51", borderRadius: 14, padding: 18, minWidth: 370 }}>
              <h4 style={{ color: brand.gold, fontWeight: 700, fontSize: 18 }}>Coach Database</h4>
              <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", fontSize: 16 }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Stage</th>
                    <th>CPD</th>
                    <th>Exp.</th>
                    <th>Age</th>
                    <th>Certs</th>
                    <th>Impact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coaches.map(coach => (
                    <tr key={coach.id} style={{ borderBottom: "1px solid #FFD70022" }}>
                      <td style={{ fontWeight: 700 }}>{coach.name}</td>
                      <td>{coach.role}</td>
                      <td style={{
                        fontWeight: 700, color: colorStage(coach.stage)
                      }}>{PATHWAY[coach.stage]}</td>
                      <td>{coach.cpd}h</td>
                      <td>{coach.exp}y</td>
                      <td>{coach.age}</td>
                      <td>{(coach.cert || []).join(", ")}</td>
                      <td style={{ color: coachImpactColor(coach.impact), fontWeight: 700 }}>{coach.impact}</td>
                      <td>
                        <button onClick={() => setSelected(coach)} style={{
                          background: brand.green, color: "#232a2e", border: "none", borderRadius: 6,
                          padding: "2px 9px", fontWeight: 700, cursor: "pointer"
                        }}><FaEdit /></button>
                        <button onClick={() => deleteCoach(coach.id)} style={{
                          background: "#ff4848", color: "#fff", border: "none", borderRadius: 6,
                          padding: "2px 9px", fontWeight: 700, marginLeft: 7, cursor: "pointer"
                        }}><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Add/Edit form */}
              <div style={{ marginTop: 10 }}>
                <form onSubmit={e => {
                  e.preventDefault();
                  const f = e.target;
                  const c = {
                    id: selected ? selected.id : undefined,
                    name: f.name.value,
                    role: f.role.value,
                    stage: Number(f.stage.value),
                    cpd: Number(f.cpd.value),
                    exp: Number(f.exp.value),
                    age: Number(f.age.value),
                    cert: Array.from(f.cert.selectedOptions).map(o => o.value),
                    impact: Number(f.impact.value),
                    skills: Object.fromEntries(SKILLS.map(skill => [skill, Number(f[skill].value)]))
                  };
                  if (selected) updateCoach(c);
                  else addCoach(c);
                  f.reset();
                }}>
                  <input name="name" placeholder="Name" required defaultValue={selected?.name || ""} style={inputStyle} />
                  <select name="role" defaultValue={selected?.role || "Entry"} style={inputStyle}>{PATHWAY.map(p => <option key={p}>{p}</option>)}</select>
                  <select name="stage" defaultValue={selected?.stage || 0} style={inputStyle}>{PATHWAY.map((p, i) => <option key={p} value={i}>{p}</option>)}</select>
                  <input name="cpd" type="number" placeholder="CPD Hours" required min={0} defaultValue={selected?.cpd || ""} style={inputStyle} />
                  <input name="exp" type="number" placeholder="Exp (years)" required min={0} defaultValue={selected?.exp || ""} style={inputStyle} />
                  <input name="age" type="number" placeholder="Age" required min={18} defaultValue={selected?.age || ""} style={inputStyle} />
                  <select name="cert" multiple style={{ ...inputStyle, height: 32 }}>{CERTS.map(c => <option key={c}>{c}</option>)}</select>
                  <input name="impact" type="number" placeholder="Impact Score" min={0} max={10} step={0.1} defaultValue={selected?.impact || 5} style={inputStyle} />
                  {SKILLS.map(skill =>
                    <input key={skill} name={skill} type="number" placeholder={skill} min={0} max={10} required defaultValue={selected?.skills?.[skill] || ""} style={inputStyle} />
                  )}
                  <button type="submit" style={{
                    background: brand.gold, color: "#232a2e", border: "none", borderRadius: 6,
                    padding: '7px 18px', fontWeight: 700, marginRight: 6
                  }}>{selected ? "Update" : "Add"}</button>
                  {selected &&
                    <button type="button" onClick={() => setSelected(null)} style={{
                      background: "#ff4848", color: "#fff", border: "none", borderRadius: 6,
                      padding: '7px 14px', fontWeight: 700
                    }}>Cancel</button>
                  }
                </form>
              </div>
            </div>
            {/* Succession & Pipeline */}
            <div style={{ flex: 1, minWidth: 220, background: "#232a2e", borderRadius: 14, padding: 14 }}>
              <h4 style={{ color: brand.gold, fontWeight: 700 }}>Succession Risk Radar</h4>
              <div style={{
                color: succession.includes("Critical") ? "#ff4848" : "#FFD700", fontWeight: 700, marginBottom: 8
              }}>{succession}</div>
              <h5 style={{ color: brand.gold, fontWeight: 700, margin: "17px 0 3px 0" }}>Pipeline Health</h5>
              {PATHWAY.map((p, i) => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 7, color: colorStage(i), fontWeight: 700 }}>
                  {p}: <span style={{ color: "#fff", fontWeight: 700, marginLeft: 8 }}>{pipeline[i].toFixed(1)}%</span>
                </div>
              ))}
              <div style={{ marginTop: 15, fontSize: 16, color: brand.gold, fontWeight: 700 }}>
                Avg. Coach Impact: <span style={{ color: "#1de682" }}>{avgImpact}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Tab: Pathway Map */}
      {tab === "pathway" && (
        <div style={{
          background: "#283E51", borderRadius: 18, padding: 24, marginTop: 5
        }}>
          <h4 style={{ color: brand.gold, fontWeight: 700, marginBottom: 12 }}>Coach Pathway Visualizer</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={coaches.map(c => ({
              name: c.name, stage: c.stage, Stage: PATHWAY[c.stage]
            }))}>
              <XAxis dataKey="name" stroke="#FFD700" />
              <YAxis dataKey="stage" domain={[0, 4]} tickFormatter={i => PATHWAY[i]} stroke="#1de682" />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="stage">
                {coaches.map((c, idx) =>
                  <rect key={c.id} x={idx * 50} y={200 - c.stage * 40} width={38} height={c.stage * 40}
                    fill={colorStage(c.stage)} rx={9} />
                )}
              </Bar>
              <Legend />
              <ReTooltip formatter={(v) => PATHWAY[v]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* Tab: Skill Gaps */}
      {tab === "gaps" && (
        <div style={{
          background: "#232a2e", borderRadius: 16, padding: 26, marginTop: 5
        }}>
          <h4 style={{ color: brand.gold, fontWeight: 700, marginBottom: 10 }}>Strengths & Gaps Matrix</h4>
          <table style={{ width: "99%", borderCollapse: "collapse", color: "#fff", fontSize: 16 }}>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Average</th>
                <th>Boardroom Action</th>
              </tr>
            </thead>
            <tbody>
              {skillGaps.map(row => (
                <tr key={row.skill} style={{ borderBottom: "1px solid #FFD70022" }}>
                  <td style={{ fontWeight: 700, color: brand.gold }}>{row.skill}</td>
                  <td style={{
                    fontWeight: 700, color: row.avg < 5 ? "#ff4848" : row.avg < 7 ? "#FFD700" : "#1de682"
                  }}>{row.avg}</td>
                  <td>
                    {row.avg < 5 && <span style={{ color: "#ff4848" }}>Immediate upskilling investment needed</span>}
                    {row.avg >= 5 && row.avg < 7 && <span style={{ color: "#FFD700" }}>Monitor & build in next cycle</span>}
                    {row.avg >= 7 && <span style={{ color: "#1de682" }}>Competency is healthy</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Tab: Boardroom Dashboard */}
      {tab === "dashboard" && (
        <div style={{
          background: "#283E51", borderRadius: 18, padding: 28, marginTop: 5
        }}>
          <h3 style={{ color: brand.gold, fontWeight: 700, fontSize: 20 }}>Coach Development KPIs</h3>
          <div style={{ fontSize: 17, color: "#FFD700", fontWeight: 700 }}>
            <FaCheckCircle style={{ color: "#1de682", marginRight: 7 }} /> Avg Impact Score: <span style={{ color: "#1de682" }}>{avgImpact}</span>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <RadarChart cx="50%" cy="50%" outerRadius={72} data={coaches}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" stroke="#FFD700" />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar name="Impact" dataKey="impact" stroke="#FFD700" fill="#FFD700" fillOpacity={0.18} />
              <Legend />
              <ReTooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 22, color: "#FFD700", fontWeight: 600 }}>
            <FaBullhorn style={{ color: "#FFD700", marginRight: 7 }} />
            Boardroom Next Actions:
          </div>
          <ul style={{ color: "#FFD700", fontWeight: 700, fontSize: 16, margin: "7px 0 0 20px" }}>
            <li>
              <FaStar style={{ color: "#1de682", marginRight: 7 }} />
              {succession}
            </li>
            {skillGaps.filter(g => g.avg < 5).map(g => (
              <li key={g.skill}>
                <FaExclamationTriangle style={{ color: "#ff4848", marginRight: 7 }} />
                Immediate attention: <b>{g.skill}</b> skill gap detected.
              </li>
            ))}
            <li>
              <FaBookOpen style={{ color: "#FFD700", marginRight: 7 }} />
              Average CPD hours: <b>{(coaches.reduce((s, c) => s + c.cpd, 0) / (coaches.length || 1)).toFixed(1)}</b>
            </li>
            <li>
              <FaLightbulb style={{ color: "#1de682", marginRight: 7 }} />
              Recommend: Focus upskilling on at-risk skills before next season.
            </li>
          </ul>
        </div>
      )}
      {/* Tab: Scenario Compare */}
      {tab === "compare" && savedScenarios.length > 1 && (
        <div style={{
          background: "#232a2e", borderRadius: 18, padding: 28, marginTop: 5
        }}>
          <h3 style={{ color: brand.gold, fontWeight: 700, fontSize: 20 }}>Scenario Compare</h3>
          <span style={{ color: "#FFD700", fontWeight: 600, marginRight: 9 }}>Base:</span>
          <select onChange={e => setCompareIdx(Number(e.target.value))} style={{
            background: "#FFD700", color: "#232a2e", fontWeight: 700, borderRadius: 6, padding: "4px 12px", fontSize: 15, marginRight: 14
          }}>
            <option value={-1}>-- Choose scenario --</option>
            {savedScenarios.map((sc, idx) =>
              <option key={idx} value={idx}>{sc.name}</option>
            )}
          </select>
          {compareIdx !== null && compareIdx > -1 &&
            <table style={{ width: "99%", fontSize: 16, color: "#fff", borderCollapse: "collapse", marginTop: 18 }}>
              <thead>
                <tr style={{ color: brand.gold, borderBottom: '2px solid #FFD70077' }}>
                  <th>Name</th>
                  <th>Stage</th>
                  <th>Prev Impact</th>
                  <th>Compare Impact</th>
                  <th>Delta</th>
                </tr>
              </thead>
              <tbody>
                {scenarioDelta(savedScenarios[0].coaches, savedScenarios[compareIdx].coaches).map((row, i) => (
                  <tr key={row.name} style={{ borderBottom: '1px solid #FFD70022' }}>
                    <td>{row.name}</td>
                    <td>{row.stage}</td>
                    <td>{row.baseImpact}</td>
                    <td>{row.compareImpact}</td>
                    <td style={{
                      color: row.delta < 0 ? "#ff4848" : row.delta > 0 ? "#1de682" : "#FFD700",
                      fontWeight: 700
                    }}>{row.delta > 0 ? "+" : ""}{row.delta.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
      )}
      {/* Bottom Controls */}
      <div style={{
        margin: "28px 0 5px 0", display: "flex", gap: 14, alignItems: "center"
      }}>
        <button onClick={undo} style={btnStyle}><FaUndo /> Undo</button>
        <button onClick={redo} style={btnStyle}><FaRedo /> Redo</button>
        <button onClick={exportCSV} style={{ ...btnStyle, background: brand.green, color: "#232a2e" }}><FaFileExport /> Export CSV</button>
        <input value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="Scenario Name"
          style={{ borderRadius: 6, padding: 5, border: "1px solid #FFD70077", fontWeight: 700, marginRight: 7, background: "#181e23", color: "#fff" }} />
        <button onClick={saveScenario} style={{ ...btnStyle, background: brand.gold, color: "#232a2e" }}><FaSave /> Save</button>
        {savedScenarios.length > 0 && (
          <span style={{ color: brand.gold, fontWeight: 600, fontSize: 14, marginLeft: 6 }}>
            Load:
            {savedScenarios.map((sc, idx) =>
              <button key={idx} onClick={() => loadScenario(idx)} style={{
                background: '#FFD700', color: '#232a2e', fontWeight: 700, border: 'none', borderRadius: 6, padding: '3px 8px', marginLeft: 5
              }}><FaFolderOpen style={{ marginRight: 4 }} />{sc.name}</button>
            )}
          </span>
        )}
      </div>
      <div style={{ marginTop: 15, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero proprietary consulting analytics.
      </div>
    </div>
  );
};

const inputStyle = {
  marginRight: 7, marginBottom: 5, padding: 4, borderRadius: 7, border: "1px solid #FFD70077", fontSize: 15, width: 106
};
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default IntegratedCoachDevelopmentMatrix;
