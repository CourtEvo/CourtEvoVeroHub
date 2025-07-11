// src/components/ParticipationRetentionDropoutCockpit.jsx
import React, { useState } from 'react';
import {
  FaBasketballBall, FaUser, FaArrowRight, FaBolt, FaExclamationTriangle, FaCheckCircle, FaSyncAlt,
  FaUsers, FaChartLine, FaEdit, FaTrash, FaUndo, FaRedo, FaSave, FaFileExport, FaExchangeAlt, FaBullhorn, FaChevronRight, FaHistory, FaPlus
} from 'react-icons/fa';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, BarChart, Bar, Legend
} from 'recharts';

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e", accent: "#283E51" };

const STAGES = [
  { key: "u11", label: "U11", color: "#FFD700" },
  { key: "u13", label: "U13", color: "#1de682" },
  { key: "u15", label: "U15", color: "#283E51" },
  { key: "u17", label: "U17", color: "#FFD70099" },
  { key: "u19", label: "U19", color: "#c2b280" },
  { key: "senior", label: "SENIOR", color: "#FFD70055" },
  { key: "alumni", label: "ALUMNI", color: "#485563" }
];

const demoPipeline = [
  { id: 1, name: "Marko P.", stage: "u11", status: "active", coach: "Perković", joined: 2023, atRisk: false, history: [] },
  { id: 2, name: "Ivan G.", stage: "u13", status: "active", coach: "Perković", joined: 2022, atRisk: true, history: ["missed 2", "late"] },
  { id: 3, name: "Josip R.", stage: "u13", status: "at-risk", coach: "Milaković", joined: 2022, atRisk: true, history: ["missed 3", "coach flagged"] },
  { id: 4, name: "Filip M.", stage: "u15", status: "dropped", coach: "Milaković", joined: 2021, atRisk: false, history: ["left after school change", "academic"] },
  { id: 5, name: "Luka S.", stage: "u15", status: "active", coach: "Perković", joined: 2021, atRisk: false, history: [] },
  { id: 6, name: "Dominik T.", stage: "u17", status: "active", coach: "Šimunić", joined: 2020, atRisk: false, history: [] },
  { id: 7, name: "Tin K.", stage: "u17", status: "at-risk", coach: "Šimunić", joined: 2020, atRisk: true, history: ["injury", "discipline"] },
  { id: 8, name: "Mateo B.", stage: "u19", status: "active", coach: "Šimunić", joined: 2019, atRisk: false, history: [] },
  { id: 9, name: "Dario R.", stage: "senior", status: "active", coach: "Proleta", joined: 2017, atRisk: false, history: [] },
  { id: 10, name: "Tomo K.", stage: "alumni", status: "alumni", coach: "Proleta", joined: 2016, atRisk: false, history: ["pro contract"] }
];

const dropoutHeat = [
  { stage: "U11", dropouts: 1, main: "First year nerves" },
  { stage: "U13", dropouts: 2, main: "Scheduling conflicts" },
  { stage: "U15", dropouts: 3, main: "Academic pressure" },
  { stage: "U17", dropouts: 2, main: "Discipline/Injury" },
  { stage: "U19", dropouts: 0, main: "" }
];

const scenarioShocks = [
  { event: "Star Player Leaves", effect: "Risk spikes in U17, 3 athletes considered quitting.", action: "Hold player meeting, reinforce team identity." },
  { event: "Injury Wave", effect: "Short-term drop in U15 and U17 engagement.", action: "Ramp up physio support, communication." },
  { event: "Coach Fired", effect: "Dropout spike in U15, U17.", action: "Stabilize with interim coach, parent communication blitz." }
];

const ParticipationRetentionDropoutCockpit = () => {
  const [pipeline, setPipeline] = useState(demoPipeline);
  const [tab, setTab] = useState('pipeline');
  const [expandedStage, setExpandedStage] = useState(null);
  const [shocks, setShocks] = useState([]);
  const [history, setHistory] = useState([demoPipeline]);
  const [redoStack, setRedoStack] = useState([]);
  const [scenarioName, setScenarioName] = useState('');
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // --- CRUD: Add Athlete ---
  const addPlayer = player => {
    const next = [...pipeline, { ...player, id: Date.now() }];
    setHistory([...history, next]);
    setPipeline(next);
    setRedoStack([]);
    setSelectedPlayer(null);
    setShowForm(false);
  };

  // --- CRUD: Update Athlete ---
  const updatePlayer = player => {
    const next = pipeline.map(p => p.id === player.id ? { ...p, ...player } : p);
    setHistory([...history, next]);
    setPipeline(next);
    setRedoStack([]);
    setSelectedPlayer(null);
    setShowForm(false);
  };

  // --- CRUD: Delete Athlete ---
  const deletePlayer = id => {
    const next = pipeline.filter(p => p.id !== id);
    setHistory([...history, next]);
    setPipeline(next);
    setRedoStack([]);
    setSelectedPlayer(null);
    setShowForm(false);
  };

  // --- Undo ---
  const undo = () => {
    if (history.length <= 1) return;
    setRedoStack([pipeline, ...redoStack]);
    const prev = history[history.length - 2];
    setPipeline(prev);
    setHistory(history.slice(0, -1));
    setSelectedPlayer(null);
    setShowForm(false);
  };

  // --- Redo ---
  const redo = () => {
    if (redoStack.length === 0) return;
    setHistory([...history, redoStack[0]]);
    setPipeline(redoStack[0]);
    setRedoStack(redoStack.slice(1));
    setSelectedPlayer(null);
    setShowForm(false);
  };

  // --- Save Scenario ---
  const saveScenario = () => {
    if (!scenarioName) return;
    setSavedScenarios([...savedScenarios, { name: scenarioName, pipeline: JSON.parse(JSON.stringify(pipeline)) }]);
    setScenarioName('');
  };

  // --- Load Scenario ---
  const loadScenario = idx => {
    setPipeline(savedScenarios[idx].pipeline);
    setHistory([...history, savedScenarios[idx].pipeline]);
    setRedoStack([]);
    setSelectedPlayer(null);
    setShowForm(false);
  };

  // --- Shock Simulator ---
  const addShock = idx => {
    setShocks([...shocks, scenarioShocks[idx]]);
  };

  // --- Export ---
  const exportCSV = () => {
    const csv = [
      "Name,Stage,Status,Coach,Joined,AtRisk,History"
    ].concat(pipeline.map(p =>
      [p.name, p.stage, p.status, p.coach, p.joined, p.atRisk ? "Y" : "N", p.history.join("|")].join(",")
    )).join('\n');
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "pipeline.csv";
    a.click(); URL.revokeObjectURL(url);
  };

  // --- Boardroom Narrative Generator ---
  function boardroomAlert() {
    const getStage = s => STAGES.find(stage => stage.key === s);
    const u15Dropouts = pipeline.filter(p => p.stage === "u15" && p.status === "dropped").length;
    const u17AtRisk = pipeline.filter(p => p.stage === "u17" && p.atRisk).length;
    if (u15Dropouts >= 2) return {
      type: "ALERT", text: "U15 pipeline dropped 2+ athletes this season. Main driver: Academic overload after school change. Immediate: Launch study-support pilot."
    };
    if (u17AtRisk >= 2) return {
      type: "WARNING", text: "At-risk cohort: U17—multiple missed sessions, discipline issues. Boardroom Action: Coach-parent engagement session."
    };
    return { type: "HEALTHY", text: "Pipeline healthy. Monitor at-risk athletes weekly and maintain engagement." };
  }

  // --- Data for Boardroom Visuals ---
  const dropoutByStage = STAGES.map(s => ({
    stage: s.label,
    active: pipeline.filter(p => p.stage === s.key && p.status === "active").length,
    atRisk: pipeline.filter(p => p.stage === s.key && p.atRisk).length,
    dropped: pipeline.filter(p => p.stage === s.key && p.status === "dropped").length,
    alumni: pipeline.filter(p => p.stage === s.key && p.status === "alumni").length
  }));

  // --- UI ---
  return (
    <div style={{
      background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif",
      borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1400, margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
        <FaBasketballBall size={30} color={brand.gold} />
        <h2 style={{
          fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0
        }}>
          Participation, Retention & Dropout Cockpit
        </h2>
        <span style={{
          background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 8,
          padding: '3px 16px', fontSize: 14, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022'
        }}>
          Elite Male Basketball | CourtEvo Vero
        </span>
        <button
          style={{
            marginLeft: 'auto', background: brand.green, color: '#232a2e', border: 'none',
            borderRadius: 8, padding: '8px 17px', fontWeight: 800, fontSize: 17, cursor: 'pointer'
          }}
          onClick={() => {
            setSelectedPlayer(null);
            setShowForm(!showForm);
          }}>
          <FaPlus style={{ marginRight: 8 }} />
          {showForm ? "Cancel" : "Add Athlete"}
        </button>
      </div>
      {/* Alerts */}
      <div style={{
        background: "#283E51", borderRadius: 12, padding: 16, marginBottom: 20, fontWeight: 700,
        color: boardroomAlert().type === "ALERT" ? "#ff4848" : boardroomAlert().type === "WARNING" ? "#FFD700" : "#1de682"
      }}>
        <FaBullhorn style={{ marginRight: 8, color: boardroomAlert().type === "ALERT" ? "#ff4848" : boardroomAlert().type === "WARNING" ? "#FFD700" : "#1de682" }} />
        {boardroomAlert().text}
      </div>
      {/* Add/Edit Athlete Form */}
      {showForm && (
        <div style={{
          marginBottom: 30, background: "#232a2e", borderRadius: 16, padding: 20, maxWidth: 660
        }}>
          <form onSubmit={e => {
            e.preventDefault();
            const f = e.target;
            const player = {
              id: selectedPlayer ? selectedPlayer.id : undefined,
              name: f.name.value,
              stage: f.stage.value,
              status: f.status.value,
              coach: f.coach.value,
              joined: Number(f.joined.value),
              atRisk: f.atRisk.checked,
              history: f.history.value.split('|').map(s => s.trim()).filter(Boolean)
            };
            if (selectedPlayer) updatePlayer(player);
            else addPlayer(player);
            f.reset();
          }}>
            <input name="name" placeholder="Name" required defaultValue={selectedPlayer?.name || ""} style={inputStyle} />
            <select name="stage" defaultValue={selectedPlayer?.stage || "u11"} style={inputStyle}>
              {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <select name="status" defaultValue={selectedPlayer?.status || "active"} style={inputStyle}>
              <option value="active">Active</option>
              <option value="at-risk">At-Risk</option>
              <option value="dropped">Dropped</option>
              <option value="alumni">Alumni</option>
            </select>
            <input name="coach" placeholder="Coach" required defaultValue={selectedPlayer?.coach || ""} style={inputStyle} />
            <input name="joined" type="number" placeholder="Joined Year" required defaultValue={selectedPlayer?.joined || ""} style={inputStyle} />
            <label style={{ color: "#FFD700", marginRight: 15 }}>
              <input name="atRisk" type="checkbox" defaultChecked={selectedPlayer?.atRisk || false} />
              At Risk
            </label>
            <input name="history" placeholder="History (pipe-separated, e.g. 'missed 2|discipline')" defaultValue={selectedPlayer?.history?.join('|') || ""} style={inputStyle} />
            <button type="submit" style={{ ...btnStyle, marginRight: 12 }}>{selectedPlayer ? "Update" : "Add"}</button>
            {selectedPlayer &&
              <button type="button" onClick={() => { setSelectedPlayer(null); setShowForm(false); }} style={{ ...btnStyle, background: "#ff4848", color: "#fff" }}>Cancel</button>
            }
          </form>
        </div>
      )}
      {/* Main Conveyor Pipeline */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, justifyContent: "center", marginBottom: 10, flexWrap: "wrap" }}>
        {STAGES.map(s => (
          <div key={s.key} style={{ textAlign: "center", minWidth: 120 }}>
            <div style={{
              background: s.color, borderRadius: 20, width: 62, height: 62, display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 7px", boxShadow: "0 2px 20px #FFD70033", position: "relative"
            }}>
              <FaBasketballBall size={33} color="#232a2e" />
              <span style={{
                position: "absolute", top: 4, right: 8, background: "#232a2e", color: "#FFD700",
                borderRadius: 6, padding: "2px 6px", fontWeight: 700, fontSize: 13, boxShadow: "0 1px 7px #FFD70022"
              }}>
                {pipeline.filter(p => p.stage === s.key && p.status !== "alumni").length}
              </span>
            </div>
            <div style={{ color: s.color, fontWeight: 900, letterSpacing: 1, fontSize: 17 }}>{s.label}</div>
            <button style={{
              background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, marginTop: 6,
              padding: "2px 13px", cursor: "pointer", fontSize: 14
            }}
              onClick={() => setExpandedStage(expandedStage === s.key ? null : s.key)}>
              <FaChevronRight /> Details
            </button>
            {/* Drill-down */}
            {expandedStage === s.key && (
              <div style={{
                background: "#232a2e", borderRadius: 13, padding: 14, marginTop: 8, color: "#FFD700", fontWeight: 600, textAlign: "left", minWidth: 220
              }}>
                {pipeline.filter(p => p.stage === s.key).map(p =>
                  <div key={p.id} style={{
                    borderBottom: "1px solid #FFD70022", marginBottom: 8, paddingBottom: 4, position: "relative"
                  }}>
                    <FaUser style={{ marginRight: 6, color: "#FFD700" }} />
                    {p.name} — <span style={{
                      color: p.status === "at-risk" ? "#ff4848" : "#1de682", fontWeight: 700
                    }}>{p.status.toUpperCase()}</span>
                    {p.atRisk && <span style={{
                      color: "#ff4848", marginLeft: 7
                    }}>(At Risk)</span>}
                    <br />
                    <span style={{ fontSize: 13 }}>Coach: {p.coach}, Joined: {p.joined}</span>
                    {p.history.length > 0 && (
                      <div style={{ fontSize: 12, color: "#FFD70099" }}>
                        {p.history.map((h, i) => <div key={i}>- {h}</div>)}
                      </div>
                    )}
                    <div style={{ position: "absolute", top: 0, right: 0 }}>
                      <button onClick={() => { setSelectedPlayer(p); setShowForm(true); }} style={{ ...btnStyle, background: brand.green, color: "#232a2e", padding: "2px 7px", marginRight: 4 }}><FaEdit /></button>
                      <button onClick={() => deletePlayer(p.id)} style={{ ...btnStyle, background: "#ff4848", color: "#fff", padding: "2px 7px" }}><FaTrash /></button>
                    </div>
                  </div>
                )}
                {pipeline.filter(p => p.stage === s.key).length === 0 && <div style={{ color: "#fff" }}>No players.</div>}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Heat Cluster */}
      <div style={{ margin: "27px 0 14px 0" }}>
        <div style={{ color: brand.gold, fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
          Dropout Heat Clusters (Root Causes)
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={dropoutHeat}>
            <XAxis dataKey="stage" stroke="#FFD700" />
            <YAxis stroke="#1de682" />
            <Bar dataKey="dropouts" fill="#ff4848" />
            <ReTooltip formatter={(val, name, props) => [`${val} dropouts`, "Dropouts"]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ color: "#FFD700", fontWeight: 700, marginTop: 10 }}>
          {dropoutHeat.map(d =>
            d.dropouts > 0 && <div key={d.stage}>{d.stage}: <span style={{ color: "#ff4848" }}>{d.dropouts}</span> lost. Main: <b>{d.main}</b></div>
          )}
        </div>
      </div>
      {/* Shock Simulator */}
      <div style={{
        background: "#283E51", borderRadius: 15, padding: 17, margin: "23px 0 7px 0"
      }}>
        <div style={{ fontWeight: 700, color: brand.gold, fontSize: 17, marginBottom: 5 }}>
          Scenario Shock Simulator
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {scenarioShocks.map((s, i) =>
            <button key={i} style={{
              background: "#FFD700", color: "#232a2e", fontWeight: 700, border: "none",
              borderRadius: 8, padding: "9px 20px", marginRight: 12, fontSize: 16, boxShadow: "0 2px 12px #FFD70022"
            }}
              onClick={() => addShock(i)}>
              {s.event}
            </button>
          )}
        </div>
        <div style={{ marginTop: 10, color: brand.gold, fontWeight: 700 }}>
          {shocks.map((s, idx) =>
            <div key={idx} style={{ marginBottom: 5 }}>
              <FaExclamationTriangle style={{ marginRight: 7, color: "#ff4848" }} />
              <b>{s.event}:</b> <span style={{ color: "#FFD700" }}>{s.effect}</span>
              <br />
              <FaCheckCircle style={{ marginRight: 6, color: "#1de682" }} /> <span>{s.action}</span>
            </div>
          )}
        </div>
      </div>
      {/* Pulse Line Timeline (animated effect) */}
      <div style={{ margin: "24px 0" }}>
        <div style={{ color: brand.gold, fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
          Retention Pulse Timeline
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={[
            { month: "Jan", retained: 60, dropped: 3 }, { month: "Feb", retained: 59, dropped: 4 },
            { month: "Mar", retained: 56, dropped: 5 }, { month: "Apr", retained: 55, dropped: 3 }
          ]}>
            <XAxis dataKey="month" stroke="#FFD700" />
            <YAxis stroke="#1de682" />
            <CartesianGrid strokeDasharray="3 3" />
            <Area type="monotone" dataKey="retained" stroke="#1de682" fill="#1de68244" />
            <Area type="monotone" dataKey="dropped" stroke="#ff4848" fill="#ff484844" />
            <Legend />
            <ReTooltip />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Scenario & Controls */}
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
              }}><FaFileExport style={{ marginRight: 4 }} />{sc.name}</button>
            )}
          </span>
        )}
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
const btnStyle = {
  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, padding: "7px 14px", marginRight: 6, cursor: "pointer"
};

export default ParticipationRetentionDropoutCockpit;
