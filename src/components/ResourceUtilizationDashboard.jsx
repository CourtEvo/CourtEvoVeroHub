// src/components/ResourceUtilizationDashboard.jsx
import React, { useState } from 'react';
import {
  FaCogs, FaPlus, FaEdit, FaTrash, FaUsers, FaDumbbell, FaEuroSign, FaChartBar, FaBolt, FaUndo, FaRedo,
   FaFileExport, FaExclamationTriangle, FaChartPie, FaCalendarAlt, FaExchangeAlt,
    FaLightbulb, FaMapMarkedAlt, FaCheckCircle, FaSave
} from 'react-icons/fa';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';

const brand = { gold: "#FFD700", green: "#1de682", dark: "#232a2e", accent: "#283E51" };
const TYPES = [
  { key: "Staff", icon: <FaUsers />, color: "#FFD700" },
  { key: "Coach", icon: <FaUsers />, color: "#1de682" },
  { key: "Facility", icon: <FaDumbbell />, color: "#c2b280" },
  { key: "Equipment", icon: <FaBolt />, color: "#485563" },
  { key: "Finance", icon: <FaEuroSign />, color: "#FFD700" }
];

const demoResources = [
  { id: 1, name: "Main Gym", type: "Facility", department: "Senior", usage: 82, cost: 12000, booked: 38, capacity: 44 },
  { id: 2, name: "Assistant Coach A", type: "Coach", department: "Junior", usage: 95, cost: 3100, booked: 22, capacity: 22 },
  { id: 3, name: "Video Room", type: "Facility", department: "All", usage: 54, cost: 3200, booked: 11, capacity: 20 },
  { id: 4, name: "Team Van", type: "Equipment", department: "Senior", usage: 48, cost: 1900, booked: 7, capacity: 14 },
  { id: 5, name: "Admin Hours", type: "Staff", department: "All", usage: 70, cost: 7800, booked: 21, capacity: 30 },
  { id: 6, name: "Performance Analyst", type: "Staff", department: "Senior", usage: 100, cost: 4100, booked: 18, capacity: 18 }
];

// Helper
function getTypeColor(type) {
  return TYPES.find(t => t.key === type)?.color || "#FFD700";
}
function getTypeIcon(type) {
  return TYPES.find(t => t.key === type)?.icon || <FaCogs />;
}
function analyzeRisks(resources) {
  const overload = resources.filter(r => r.usage > 100);
  const underused = resources.filter(r => r.usage < 35);
  const full = resources.filter(r => r.usage === 100);
  let out = [];
  if (overload.length) out.push(`Overloaded: ${overload.map(r => r.name).join(", ")}`);
  if (underused.length) out.push(`Underutilized: ${underused.map(r => r.name).join(", ")}`);
  if (!out.length) out.push("Resource allocation healthy.");
  return out;
}
function suggestOptimization(resources) {
  // Simple logic for recommendations
  const highcost = resources.filter(r => r.cost > 6000);
  const actions = [];
  if (highcost.length) actions.push(`Review high-cost resources: ${highcost.map(r => r.name).join(", ")} for sharing or alternative scheduling.`);
  if (resources.some(r => r.usage < 40)) actions.push("Shift bookings to underutilized assets to optimize costs.");
  if (resources.some(r => r.usage > 100)) actions.push("Redistribute workloads to avoid overload and burnout.");
  if (actions.length === 0) actions.push("All resources optimized. Continue monitoring.");
  return actions;
}

const ResourceUtilizationDashboard = () => {
  const [resources, setResources] = useState(demoResources);
  const [history, setHistory] = useState([demoResources]);
  const [redoStack, setRedoStack] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [scenarioName, setScenarioName] = useState('');
  const [savedScenarios, setSavedScenarios] = useState([]);

  // CRUD
  const addResource = r => {
    const next = [...resources, { ...r, id: Date.now() }];
    setResources(next); setHistory([...history, next]); setRedoStack([]); setSelected(null);
  };
  const updateResource = r => {
    const next = resources.map(res => res.id === r.id ? r : res);
    setResources(next); setHistory([...history, next]); setRedoStack([]); setSelected(null);
  };
  const deleteResource = id => {
    const next = resources.filter(res => res.id !== id);
    setResources(next); setHistory([...history, next]); setRedoStack([]); setSelected(null);
  };

  // Undo/Redo
  const undo = () => {
    if (history.length <= 1) return;
    setRedoStack([resources, ...redoStack]);
    const prev = history[history.length - 2];
    setResources(prev);
    setHistory(history.slice(0, -1));
  };
  const redo = () => {
    if (redoStack.length === 0) return;
    setHistory([...history, redoStack[0]]);
    setResources(redoStack[0]);
    setRedoStack(redoStack.slice(1));
  };

  // Scenario Save/Load
  const saveScenario = () => {
    if (!scenarioName) return;
    setSavedScenarios([...savedScenarios, {
      name: scenarioName,
      resources: JSON.parse(JSON.stringify(resources))
    }]);
    setScenarioName('');
  };
  const loadScenario = idx => {
    setResources(savedScenarios[idx].resources);
    setHistory([...history, savedScenarios[idx].resources]);
    setRedoStack([]);
  };

  // Export
  const exportCSV = () => {
    const csv = [
      "Name,Type,Department,Usage,Cost,Booked,Capacity"
    ].concat(resources.map(r =>
      [r.name, r.type, r.department, r.usage, r.cost, r.booked, r.capacity].join(",")
    )).join('\n');
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "resource_utilization.csv";
    a.click(); URL.revokeObjectURL(url);
  };

  // Analytics
  const typeSummary = TYPES.map(t => ({
    type: t.key,
    count: resources.filter(r => r.type === t.key).length,
    avgUsage: (resources.filter(r => r.type === t.key).reduce((s, r) => s + r.usage, 0) / (resources.filter(r => r.type === t.key).length || 1)).toFixed(1)
  }));

  const risks = analyzeRisks(resources);
  const suggestions = suggestOptimization(resources);

  // UI
  return (
    <div style={{
      background: brand.dark, color: "#fff", fontFamily: "Segoe UI, sans-serif",
      borderRadius: 22, padding: 28, boxShadow: "0 8px 48px #232a2e44", maxWidth: 1400, margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 18 }}>
        <FaCogs size={28} color={brand.gold} />
        <h2 style={{
          fontWeight: 900, fontSize: 28, color: brand.gold, letterSpacing: 2, margin: 0
        }}>
          Resource Utilization & Optimization Dashboard
        </h2>
        <span style={{
          background: brand.gold, color: "#232a2e", fontWeight: 700, borderRadius: 8,
          padding: '3px 16px', fontSize: 14, marginLeft: 22, boxShadow: '0 2px 10px #FFD70022'
        }}>
          CourtEvo Vero Boardroom
        </span>
      </div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 18, margin: "18px 0 10px 0" }}>
        {[
          { key: "dashboard", label: <><FaChartBar style={{ marginRight: 8 }} /> Dashboard</> },
          { key: "heatmap", label: <><FaMapMarkedAlt style={{ marginRight: 8 }} /> Heatmap</> },
          { key: "timeline", label: <><FaCalendarAlt style={{ marginRight: 8 }} /> Flow Timeline</> },
          { key: "scenario", label: <><FaExchangeAlt style={{ marginRight: 8 }} /> Scenario</> }
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
      {/* Tab: Dashboard */}
      {tab === "dashboard" && (
        <div>
          <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
            {/* Analytics */}
            <div style={{ flex: 2, background: "#283E51", borderRadius: 14, padding: 18, minWidth: 410 }}>
              <h4 style={{ color: brand.gold, fontWeight: 700, fontSize: 18 }}>Utilization Summary</h4>
              <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", fontSize: 16 }}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Count</th>
                    <th>Avg Usage %</th>
                  </tr>
                </thead>
                <tbody>
                  {typeSummary.map(t => (
                    <tr key={t.type} style={{ borderBottom: "1px solid #FFD70022" }}>
                      <td style={{ color: getTypeColor(t.type), fontWeight: 700 }}>{t.type}</td>
                      <td>{t.count}</td>
                      <td style={{
                        color: t.avgUsage < 35 ? "#ff4848" : t.avgUsage > 100 ? "#FFD700" : "#1de682", fontWeight: 700
                      }}>{t.avgUsage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 15 }}>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={typeSummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" stroke="#FFD700" />
                    <YAxis stroke="#1de682" domain={[0, 120]} />
                    <Bar dataKey="avgUsage">
                      {typeSummary.map((t, idx) =>
                        <rect key={t.type} x={idx * 80} y={130 - t.avgUsage} width={56} height={t.avgUsage} fill={getTypeColor(t.type)} rx={9} />
                      )}
                    </Bar>
                    <ReTooltip />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Risks & Recommendations */}
            <div style={{ flex: 1, minWidth: 310, background: "#232a2e", borderRadius: 14, padding: 14 }}>
              <h4 style={{ color: brand.gold, fontWeight: 700 }}>Risks & Optimization</h4>
              <ul style={{ color: "#ff4848", fontWeight: 700 }}>
                {risks.map((r, i) =>
                  <li key={i}><FaExclamationTriangle style={{ marginRight: 7 }} />{r}</li>
                )}
              </ul>
              <h5 style={{ color: brand.gold, fontWeight: 700, margin: "16px 0 3px 0" }}>Recommendations</h5>
              <ul style={{ color: "#FFD700", fontWeight: 700 }}>
                {suggestions.map((s, i) =>
                  <li key={i}><FaLightbulb style={{ marginRight: 7 }} />{s}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
      {/* Tab: Heatmap */}
      {tab === "heatmap" && (
        <div style={{
          background: "#232a2e", borderRadius: 18, padding: 24, marginTop: 7
        }}>
          <h4 style={{ color: brand.gold, fontWeight: 700, marginBottom: 12 }}>Resource Efficiency Heatmap</h4>
          <ResponsiveContainer width="100%" height={210}>
            <RadarChart cx="50%" cy="50%" outerRadius={90} data={resources}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" stroke="#FFD700" />
              <PolarRadiusAxis angle={30} domain={[0, 120]} />
              <Radar name="Usage %" dataKey="usage" stroke="#FFD700" fill="#FFD700" fillOpacity={0.18} />
              <Legend />
              <ReTooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* Tab: Resource Flow Timeline (Demo Gantt/Calendar, simplified) */}
      {tab === "timeline" && (
        <div style={{
          background: "#283E51", borderRadius: 18, padding: 24, marginTop: 5
        }}>
          <h4 style={{ color: brand.gold, fontWeight: 700, marginBottom: 12 }}>Resource Booking Timeline</h4>
          <table style={{ width: "99%", borderCollapse: "collapse", color: "#fff", fontSize: 16 }}>
            <thead>
              <tr>
                <th>Resource</th>
                <th>Booked (Sessions)</th>
                <th>Capacity</th>
                <th>Usage %</th>
              </tr>
            </thead>
            <tbody>
              {resources.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid #FFD70022" }}>
                  <td style={{ color: getTypeColor(r.type), fontWeight: 700 }}>{r.name}</td>
                  <td>{r.booked}</td>
                  <td>{r.capacity}</td>
                  <td style={{
                    color: r.usage < 35 ? "#ff4848" : r.usage > 100 ? "#FFD700" : "#1de682", fontWeight: 700
                  }}>{r.usage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Tab: Scenario Engine (CRUD, Save, Compare) */}
      {tab === "scenario" && (
        <div style={{
          background: "#232a2e", borderRadius: 18, padding: 24, marginTop: 7
        }}>
          <h4 style={{ color: brand.gold, fontWeight: 700, marginBottom: 12 }}>Resource Scenario Engine</h4>
          {/* CRUD */}
          <form onSubmit={e => {
            e.preventDefault();
            const f = e.target;
            const r = {
              id: selected ? selected.id : undefined,
              name: f.name.value,
              type: f.type.value,
              department: f.department.value,
              usage: Number(f.usage.value),
              cost: Number(f.cost.value),
              booked: Number(f.booked.value),
              capacity: Number(f.capacity.value)
            };
            if (selected) updateResource(r);
            else addResource(r);
            f.reset();
          }}>
            <input name="name" placeholder="Resource Name" required defaultValue={selected?.name || ""} style={inputStyle} />
            <select name="type" defaultValue={selected?.type || "Staff"} style={inputStyle}>{TYPES.map(t => <option key={t.key}>{t.key}</option>)}</select>
            <input name="department" placeholder="Department" required defaultValue={selected?.department || ""} style={inputStyle} />
            <input name="usage" type="number" placeholder="Usage %" min={0} max={120} required defaultValue={selected?.usage || ""} style={inputStyle} />
            <input name="cost" type="number" placeholder="Cost (€)" min={0} required defaultValue={selected?.cost || ""} style={inputStyle} />
            <input name="booked" type="number" placeholder="Booked" min={0} required defaultValue={selected?.booked || ""} style={inputStyle} />
            <input name="capacity" type="number" placeholder="Capacity" min={1} required defaultValue={selected?.capacity || ""} style={inputStyle} />
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
          {/* List & Edit */}
          <table style={{ width: "100%", marginTop: 18, borderCollapse: "collapse", color: "#fff", fontSize: 16 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Dept</th>
                <th>Usage %</th>
                <th>Cost</th>
                <th>Booked</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid #FFD70022" }}>
                  <td style={{ fontWeight: 700 }}>{r.name}</td>
                  <td>{r.type}</td>
                  <td>{r.department}</td>
                  <td style={{
                    color: r.usage < 35 ? "#ff4848" : r.usage > 100 ? "#FFD700" : "#1de682", fontWeight: 700
                  }}>{r.usage}%</td>
                  <td>€{r.cost}</td>
                  <td>{r.booked}</td>
                  <td>{r.capacity}</td>
                  <td>
                    <button onClick={() => setSelected(r)} style={{
                      background: brand.green, color: "#232a2e", border: "none", borderRadius: 6,
                      padding: "2px 9px", fontWeight: 700, cursor: "pointer"
                    }}><FaEdit /></button>
                    <button onClick={() => deleteResource(r.id)} style={{
                      background: "#ff4848", color: "#fff", border: "none", borderRadius: 6,
                      padding: "2px 9px", fontWeight: 700, marginLeft: 7, cursor: "pointer"
                    }}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Scenario Save/Load/Export */}
          <div style={{ margin: "18px 0 8px 0", display: "flex", gap: 14, alignItems: "center" }}>
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
            <button onClick={undo} style={btnStyle}><FaUndo /> Undo</button>
            <button onClick={redo} style={btnStyle}><FaRedo /> Redo</button>
            <button onClick={exportCSV} style={{ ...btnStyle, background: brand.green, color: "#232a2e" }}><FaFileExport /> Export CSV</button>
          </div>
        </div>
      )}
      <div style={{ marginTop: 15, fontSize: 13, color: "#FFD70099", textAlign: "right" }}>
        Powered by CourtEvo Vero proprietary operational analytics.
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

export default ResourceUtilizationDashboard;
