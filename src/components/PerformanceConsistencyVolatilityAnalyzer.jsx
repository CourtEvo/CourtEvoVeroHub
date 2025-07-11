import React, { useState } from "react";
import {
  FaChartArea, FaArrowUp, FaArrowTrendDown, FaBolt, FaRegClock, FaExclamationTriangle,
  FaPlusCircle, FaEdit, FaTrash, FaFileExport, FaUndo, FaRedo, FaSearch, FaFilter, FaCheckCircle, FaRobot, FaStar, FaTrophy
} from "react-icons/fa";

// ---- DATA ----
const positions = ["PG", "SG", "SF", "PF", "C"];
const years = [2012, 2013, 2014, 2015];

const initialPlayers = [
  { id: 1, name: "Filip Simic", year: 2012, age: 12, position: "PG", role: "Core", volatility: 1.5, trend: [7, 8, 9, 8, 7], streak: [3, 2], alert: "Hot", note: "Peak form, reliable" },
  { id: 2, name: "Dino Ilic", year: 2013, age: 11, position: "SG", role: "Rotation", volatility: 3.1, trend: [9, 5, 8, 4, 9], streak: [1, 2, 2], alert: "Volatile", note: "Big swings, risk" },
  { id: 3, name: "Marko Kovačević", year: 2012, age: 12, position: "SF", role: "Prospect", volatility: 0.7, trend: [8, 8, 8, 7, 8], streak: [7], alert: "Gem", note: "Consistent, under radar" },
  { id: 4, name: "Ivan Peric", year: 2014, age: 10, position: "PF", role: "Core", volatility: 2.5, trend: [4, 7, 4, 7, 4], streak: [2, 1, 2], alert: "Fool's Gold", note: "Hot then cold" }
];

// ---- UTILS ----
function volColor(val) {
  if (val > 2.5) return "#ff6b6b";
  if (val > 1.2) return "#FFD700";
  return "#1de682";
}
function alertIcon(alert) {
  if (alert === "Hot") return <FaArrowUp color="#1de682" title="Hot Streak" />;
  if (alert === "Volatile") return <FaBolt color="#ff6b6b" title="Volatile" />;
  if (alert === "Fool's Gold") return <FaExclamationTriangle color="#FFD700" title="Fool's Gold" />;
  if (alert === "Gem") return <FaStar color="#FFD700" title="Gem" />;
  return null;
}
function AlertBadge({ alert }) {
  if (alert === "Hot") return <span style={{ background: "#1de682", color: "#232a2e", borderRadius: 7, padding: "2px 9px", fontWeight: 900 }}>🔥 HOT</span>;
  if (alert === "Volatile") return <span style={{ background: "#ff6b6b", color: "#232a2e", borderRadius: 7, padding: "2px 9px", fontWeight: 900 }}>⚡ VOLATILE</span>;
  if (alert === "Fool's Gold") return <span style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, padding: "2px 9px", fontWeight: 900 }}>⚠️ FOOL'S GOLD</span>;
  if (alert === "Gem") return <span style={{ background: "#FFD700", color: "#1de682", borderRadius: 7, padding: "2px 9px", fontWeight: 900 }}>💎 GEM</span>;
  return null;
}

// Mini sparkline for trend
function TrendMini({ trend }) {
  if (!trend?.length) return null;
  const max = Math.max(...trend, 10);
  return (
    <svg width={40} height={20}>
      <polyline
        fill="none"
        stroke="#FFD700"
        strokeWidth={2}
        points={trend.map((v, i) => `${i * 10},${20 - v / max * 18}`).join(" ")}
      />
      {trend.map((v, i) =>
        <circle key={i} cx={i * 10} cy={20 - v / max * 18} r={2.3} fill={volColor(Math.abs(v - (trend[i - 1] || v)))} />
      )}
    </svg>
  );
}

// Heatmap bar for trend
function TrendHeatmap({ trend }) {
  const max = Math.max(...trend, 10);
  return (
    <div style={{ display: "flex", gap: 1, alignItems: "center" }}>
      {trend.map((v, i) =>
        <span key={i}
          style={{
            width: 14, height: 11, borderRadius: 3,
            background: volColor(Math.abs(v - (trend[i - 1] || v))),
            display: "inline-block", marginRight: 1
          }}
          title={`Game ${i + 1}: ${v}`}
        />
      )}
    </div>
  );
}

// POLAR RADAR — enlarged, with tooltips and legend
function VolatilityRadar({ players, selected, setSelected }) {
  const r = 55;
  const cx = 90, cy = 90;
  const n = players.length;
  const angle = 2 * Math.PI / n;
  const pts = players.map((p, i) => {
    const a = angle * i - Math.PI / 2;
    const rad = r + p.volatility * 16;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  });
  return (
    <svg width={180} height={180} style={{ background: "#232a2e", borderRadius: 90 }}>
      <polygon
        points={pts.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="#FFD70033"
        stroke="#FFD700"
        strokeWidth={3}
      />
      {players.map((p, i) => {
        const [x, y] = pts[i];
        return (
          <g key={i}>
            <circle
              cx={x} cy={y} r={selected && selected.id === p.id ? 14 : 9}
              fill={volColor(p.volatility)}
              stroke={selected && selected.id === p.id ? "#FFD700" : "#232a2e"}
              strokeWidth={selected && selected.id === p.id ? 4 : 2}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setSelected(p)}
              onClick={() => setSelected(p)}
            />
            <text x={x} y={y - 18} fill="#fff" fontWeight={900} fontSize={14} textAnchor="middle">{p.name.split(" ")[0]}</text>
            <text x={x} y={y + 8} fill="#FFD700" fontWeight={900} fontSize={13} textAnchor="middle">{p.volatility.toFixed(1)}</text>
          </g>
        );
      })}
      {/* Legend */}
      <g>
        <rect x={10} y={148} width={18} height={8} fill="#1de682" />
        <text x={30} y={156} fontSize={12} fill="#fff">Low</text>
        <rect x={75} y={148} width={18} height={8} fill="#FFD700" />
        <text x={97} y={156} fontSize={12} fill="#fff">Mid</text>
        <rect x={140} y={148} width={18} height={8} fill="#ff6b6b" />
        <text x={162} y={156} fontSize={12} fill="#fff">High</text>
      </g>
    </svg>
  );
}

// --- Main component ---
export default function PerformanceConsistencyVolatilityAnalyzer() {
  const [players, setPlayers] = useState(initialPlayers);
  const [form, setForm] = useState({});
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ year: "", position: "", alert: "", role: "" });
  const [sidebar, setSidebar] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [radarSelect, setRadarSelect] = useState(null);

  // Undo/Redo
  function backup() { setHistory(h => [JSON.stringify(players), ...h].slice(0, 10)); setRedoStack([]); }
  function undo() { if (history.length) { setPlayers(JSON.parse(history[0])); setHistory(h => h.slice(1)); setRedoStack(rs => [JSON.stringify(players), ...rs]); } }
  function redo() { if (redoStack.length) { setPlayers(JSON.parse(redoStack[0])); setHistory(h => [JSON.stringify(players), ...h]); setRedoStack(rs => rs.slice(1)); } }

  // CRUD
  function handleEdit(p) { setEditing(p); setForm({ ...p }); setAdding(false); }
  function handleDelete(id) { backup(); setPlayers(list => list.filter(x => x.id !== id)); setEditing(null); setSidebar(null); }
  function handleSaveEdit() { backup(); setPlayers(list => list.map(x => x.id === editing.id ? { ...form, id: editing.id } : x)); setEditing(null); }
  function handleAddNew() { backup(); setPlayers(list => [...list, { ...form, id: Date.now() }]); setAdding(false); }
  function exportCSV() {
    const header = "Name,Year,Age,Position,Role,Volatility,Alert,Note\n";
    const body = players.map(p =>
      [p.name, p.year, p.age, p.position, p.role, p.volatility, p.alert, p.note].join("|")
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "volatility_analyzer.csv";
    link.click();
  }

  // Filtering
  const filtered = players.filter(p =>
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filter.year || p.year === Number(filter.year)) &&
    (!filter.position || p.position === filter.position) &&
    (!filter.alert || p.alert === filter.alert) &&
    (!filter.role || p.role === filter.role)
  );

  // Analytics: quartiles, averages
  const sorted = [...players].sort((a, b) => b.volatility - a.volatility);
  const avgVol = (players.reduce((a, b) => a + b.volatility, 0) / players.length).toFixed(2);
  const coreVol = players.filter(p => p.role === "Core").map(p => p.volatility);
  const coreAvg = coreVol.length ? (coreVol.reduce((a, b) => a + b, 0) / coreVol.length).toFixed(2) : "-";
  const mostVol = sorted[0];
  const leastVol = sorted[sorted.length - 1];

  // Alerts
  const riskyCores = players.filter(p => p.role === "Core" && p.volatility > 2);
  const gems = players.filter(p => p.alert === "Gem");
  const pipelineRed = players.filter(p => p.volatility > 2.5);

  // Scenario simulation (rest, cut, promote)
  function scenario(type, id) {
    backup();
    if (type === "rest") setPlayers(list => list.map(x => x.id === id ? { ...x, volatility: Math.max(0.5, x.volatility - 0.7), note: (x.note + " (rested)") } : x));
    if (type === "cut") setPlayers(list => list.filter(x => x.id !== id));
    if (type === "promote") setPlayers(list => list.map(x => x.id === id ? { ...x, role: "Core", note: (x.note + " (promoted)") } : x));
  }

  return (
    <div style={{
      background: "#232a2e", color: "#fff", fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh", borderRadius: "34px", padding: "32px 18px 18px 18px", boxShadow: "0 8px 34px 0 #15171a"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <FaChartArea size={44} color="#FFD700" style={{ marginRight: 16 }} />
        <div>
          <div style={{
            fontWeight: 900, fontSize: 28, letterSpacing: 1, marginBottom: 2, color: "#FFD700"
          }}>
            PERFORMANCE CONSISTENCY & VOLATILITY ANALYZER
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 16 }}>
            Elite-level risk. Instantly spot “streaks”, “gems”, and dangerous volatility.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button style={{
          background: "#FFD700", color: "#232a2e", borderRadius: 13, fontWeight: 900,
          border: "none", padding: "10px 21px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #FFD70055", marginLeft: 10
        }} onClick={exportCSV}>
          <FaFileExport style={{ marginRight: 8 }} /> Export CSV
        </button>
        <button style={{
          background: "#FFD700", color: "#232a2e", borderRadius: 13, fontWeight: 900,
          border: "none", padding: "10px 17px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #FFD70033", marginLeft: 7
        }} onClick={undo}><FaUndo /> Undo</button>
        <button style={{
          background: "#1de682", color: "#232a2e", borderRadius: 13, fontWeight: 900,
          border: "none", padding: "10px 17px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #1de68233", marginLeft: 7
        }} onClick={redo}><FaRedo /> Redo</button>
      </div>
      {/* PIPELINE ANALYTICS */}
      <div style={{ display: "flex", gap: 32, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{
          background: "#232a2e", borderRadius: 16, boxShadow: "0 2px 12px #FFD70022", padding: "13px 19px", fontWeight: 900, minWidth: 250
        }}>
          <div style={{ color: "#FFD700", fontSize: 19 }}>Pipeline Analytics</div>
          <div style={{ marginTop: 5 }}>
            <span style={{ color: "#FFD700" }}>Avg Volatility: </span>
            <span style={{ color: volColor(avgVol), fontWeight: 900 }}>{avgVol}</span>
            <span style={{ color: "#FFD700", marginLeft: 16 }}>Core Avg: </span>
            <span style={{ color: volColor(coreAvg), fontWeight: 900 }}>{coreAvg}</span>
          </div>
          <div style={{ marginTop: 7 }}>
            <span style={{ color: "#1de682" }}>Gems:</span> {gems.length}
            <span style={{ color: "#FFD700", marginLeft: 18 }}>Danger Zone:</span> {pipelineRed.length}
            <span style={{ color: "#ff6b6b", marginLeft: 18 }}>Risky Cores:</span> {riskyCores.length}
          </div>
        </div>
        <div style={{
          background: "#232a2e", borderRadius: 16, boxShadow: "0 2px 12px #FFD70022", padding: "13px 19px", fontWeight: 900, minWidth: 220
        }}>
          <div style={{ color: "#FFD700", fontSize: 19 }}>Boardroom Alerts</div>
          {riskyCores.length > 0 &&
            <div style={{ color: "#ff6b6b", fontWeight: 900, marginTop: 6 }}>
              <FaExclamationTriangle style={{ marginRight: 7 }} /> Core at risk: {riskyCores.map(p => p.name).join(", ")}
            </div>
          }
          {gems.length > 0 &&
            <div style={{ color: "#1de682", fontWeight: 900, marginTop: 6 }}>
              <FaTrophy style={{ marginRight: 7 }} /> Hidden gems: {gems.map(p => p.name).join(", ")}
            </div>
          }
          {pipelineRed.length > 1 &&
            <div style={{ color: "#FFD700", fontWeight: 900, marginTop: 6 }}>
              <FaExclamationTriangle style={{ marginRight: 7 }} /> Pipeline Danger: {pipelineRed.map(p => p.name).join(", ")}
            </div>
          }
          {riskyCores.length === 0 && gems.length === 0 && pipelineRed.length === 0 &&
            <div style={{ color: "#1de682", marginTop: 7 }}>No major risks detected</div>
          }
        </div>
        <div style={{
          background: "#232a2e", borderRadius: 18, boxShadow: "0 2px 12px #FFD70022", padding: "0px", fontWeight: 900
        }}>
          <VolatilityRadar players={players} selected={radarSelect} setSelected={setRadarSelect} />
        </div>
      </div>
      {/* FILTERS */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
        <FaSearch color="#FFD700" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Find athlete..." style={{ border: "none", outline: "none", background: "transparent", color: "#FFD700", fontWeight: 700, fontSize: 15, width: 120, marginLeft: 5 }} />
        <FaFilter color="#FFD700" />
        <select value={filter.year} onChange={e => setFilter(f => ({ ...f, year: e.target.value }))} style={{
          background: "#1a1d20", color: "#FFD700", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 15, padding: "5px 12px", cursor: "pointer"
        }}>
          <option value="">Year</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filter.position} onChange={e => setFilter(f => ({ ...f, position: e.target.value }))} style={{
          background: "#1a1d20", color: "#FFD700", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 15, padding: "5px 12px", cursor: "pointer"
        }}>
          <option value="">Position</option>
          {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
        </select>
        <select value={filter.role} onChange={e => setFilter(f => ({ ...f, role: e.target.value }))} style={{
          background: "#1a1d20", color: "#FFD700", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 15, padding: "5px 12px", cursor: "pointer"
        }}>
          <option value="">Role</option>
          <option value="Core">Core</option>
          <option value="Rotation">Rotation</option>
          <option value="Prospect">Prospect</option>
        </select>
        <select value={filter.alert} onChange={e => setFilter(f => ({ ...f, alert: e.target.value }))} style={{
          background: "#1a1d20", color: "#FFD700", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 15, padding: "5px 12px", cursor: "pointer"
        }}>
          <option value="">Alert</option>
          <option value="Hot">Hot</option>
          <option value="Volatile">Volatile</option>
          <option value="Fool's Gold">Fool's Gold</option>
          <option value="Gem">Gem</option>
        </select>
      </div>
      {/* PLAYER TABLE */}
      <div style={{
        minWidth: 410, maxWidth: 900, background: "#283E51", borderRadius: 20, padding: 16, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, overflowX: "auto"
      }}>
        <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 17, marginBottom: 8 }}>Consistency & Volatility Table</div>
        <button
          style={{
            background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 900,
            border: "none", padding: "8px 16px", fontSize: 16, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 8px 0 #1de68266",
            marginBottom: 12
          }}
          onClick={() => { setAdding(true); setForm({}); setEditing(null); }}>
          <FaPlusCircle style={{ marginRight: 8 }} /> Add Player
        </button>
        {(adding || editing) &&
          <div style={{ background: "#FFD70022", color: "#232a2e", borderRadius: 11, padding: "12px 10px", marginBottom: 12 }}>
            <form onSubmit={e => { e.preventDefault(); adding ? handleAddNew() : handleSaveEdit(); }}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <b>Name:</b>
                  <input type="text" value={form.name || ""} required
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700, width: 120 }} />
                </div>
                <div>
                  <b>Year:</b>
                  <select value={form.year || years[0]}
                    onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <b>Age:</b>
                  <input type="number" value={form.age || ""}
                    onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 45, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Position:</b>
                  <select value={form.position || "PG"}
                    onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <b>Role:</b>
                  <select value={form.role || "Core"}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    <option value="Core">Core</option>
                    <option value="Rotation">Rotation</option>
                    <option value="Prospect">Prospect</option>
                  </select>
                </div>
                <div>
                  <b>Volatility:</b>
                  <input type="number" step="0.1" value={form.volatility || ""}
                    onChange={e => setForm(f => ({ ...f, volatility: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 60, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Alert:</b>
                  <select value={form.alert || ""}
                    onChange={e => setForm(f => ({ ...f, alert: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    <option value="">None</option>
                    <option value="Hot">Hot</option>
                    <option value="Volatile">Volatile</option>
                    <option value="Fool's Gold">Fool's Gold</option>
                    <option value="Gem">Gem</option>
                  </select>
                </div>
                <div>
                  <b>Note:</b>
                  <input type="text" value={form.note || ""}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 120, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Trend (CSV):</b>
                  <input type="text" value={form.trend ? form.trend.join(",") : ""}
                    onChange={e => setForm(f => ({ ...f, trend: e.target.value.split(",").map(Number) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 95, fontWeight: 700 }} />
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <button type="submit" style={{
                  background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 9, fontWeight: 900, fontSize: 16,
                  padding: "7px 22px", marginRight: 12, cursor: "pointer", boxShadow: "0 2px 10px #FFD70022"
                }}>{adding ? "Add" : "Save"}</button>
                <button type="button" style={{
                  background: "#ff6b6b", color: "#fff", border: "none", borderRadius: 9, fontWeight: 900, fontSize: 16,
                  padding: "7px 22px", cursor: "pointer", boxShadow: "0 2px 10px #ff6b6b33"
                }} onClick={() => { setAdding(false); setEditing(null); setForm({}); }}>Cancel</button>
              </div>
            </form>
          </div>
        }
        <table style={{ width: "100%", color: "#fff", fontSize: 15, borderCollapse: "collapse", fontFamily: "Segoe UI" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Year</th>
              <th>Age</th>
              <th>Position</th>
              <th>Role</th>
              <th>Volatility</th>
              <th>Trend</th>
              <th>Heatmap</th>
              <th>Streaks</th>
              <th>Alert</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ background: volColor(p.volatility) + "19" }}>
                <td style={{ fontWeight: 900, color: "#FFD700", cursor: "pointer" }} onClick={() => setSidebar(p)}>{p.name}</td>
                <td>{p.year}</td>
                <td>{p.age}</td>
                <td>{p.position}</td>
                <td>{p.role}</td>
                <td style={{ color: volColor(p.volatility), fontWeight: 900 }}>{p.volatility}</td>
                <td><TrendMini trend={p.trend} /></td>
                <td><TrendHeatmap trend={p.trend} /></td>
                <td>{p.streak?.map((s, i) => <span key={i} style={{ color: "#FFD700", fontWeight: 900, marginRight: 4 }}>{s}g</span>)}</td>
                <td><AlertBadge alert={p.alert} /></td>
                <td>{p.note}</td>
                <td>
                  <button onClick={() => handleEdit(p)}
                    style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer", marginRight: 3 }}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    style={{ background: "#ff6b6b", color: "#fff", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer", marginRight: 3 }}>
                    <FaTrash />
                  </button>
                  <button title="Simulate rest" onClick={() => scenario("rest", p.id)}
                    style={{ background: "#1de682", color: "#232a2e", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer", marginRight: 3 }}>
                    Rest
                  </button>
                  <button title="Promote to Core" onClick={() => scenario("promote", p.id)}
                    style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer", marginRight: 3 }}>
                    Promote
                  </button>
                  <button title="Simulate cut" onClick={() => scenario("cut", p.id)}
                    style={{ background: "#232a2e", color: "#ff6b6b", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer" }}>
                    Cut
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* SIDEBAR: Consistency Profile & Leaderboard */}
      <div style={{
        minWidth: 340, maxWidth: 460, background: "#232a2e", borderRadius: 19, padding: 19, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 12
      }}>
        <b style={{ color: "#FFD700", fontWeight: 900, fontSize: 19 }}>Consistency Intelligence & Leaderboard</b>
        {sidebar || radarSelect ? (
          <>
            <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 21, margin: "8px 0 6px 0" }}>
              {(sidebar || radarSelect).name}
              {alertIcon((sidebar || radarSelect).alert)}
            </div>
            <div><b>Year:</b> {(sidebar || radarSelect).year}</div>
            <div><b>Age:</b> {(sidebar || radarSelect).age}</div>
            <div><b>Position:</b> {(sidebar || radarSelect).position}</div>
            <div><b>Role:</b> {(sidebar || radarSelect).role}</div>
            <div style={{ marginTop: 9, color: "#FFD700" }}>
              <b>Volatility:</b> <span style={{ color: volColor((sidebar || radarSelect).volatility), fontWeight: 900 }}>{(sidebar || radarSelect).volatility}</span>
            </div>
            <div><b>Trend:</b> <TrendMini trend={(sidebar || radarSelect).trend} /></div>
            <div><b>Heatmap:</b> <TrendHeatmap trend={(sidebar || radarSelect).trend} /></div>
            <div><b>Streaks:</b> {(sidebar || radarSelect).streak?.map((s, i) => <span key={i} style={{ color: "#FFD700", fontWeight: 900, marginRight: 4 }}>{s}g</span>)}</div>
            <div><b>Alert:</b> <AlertBadge alert={(sidebar || radarSelect).alert} /></div>
            <div><b>Note:</b> <span style={{ color: "#FFD700" }}>{(sidebar || radarSelect).note}</span></div>
          </>
        ) : (
          <div style={{ margin: "11px 0 10px 0", color: "#FFD700", fontSize: 16, fontWeight: 900 }}>
            Click player or radar for deep profile.
          </div>
        )}
        <div style={{ marginTop: 13, color: "#FFD700" }}>
          <b>Leaderboard:</b>
          <ol>
            {[...players].sort((a, b) => a.volatility - b.volatility).map((p, i) => (
              <li key={p.id} style={{ color: volColor(p.volatility), fontWeight: 900 }}>{p.name} ({p.volatility})</li>
            ))}
          </ol>
        </div>
        <div style={{ marginTop: 8 }}>
          <b>Recommended Action:</b>
          {riskyCores.length > 0 ? <span style={{ color: "#ff6b6b" }}>Review risky core player(s) immediately</span>
            : gems.length > 0 ? <span style={{ color: "#1de682" }}>Reward “Gem” with expanded role</span>
              : <span style={{ color: "#FFD700" }}>Maintain current pipeline</span>}
        </div>
      </div>
      {/* Footer */}
      <div style={{
        marginTop: 20,
        fontSize: 14,
        opacity: 0.8,
        textAlign: "center",
        color: "#FFD700",
        fontWeight: 900
      }}>
        Proprietary to CourtEvo Vero. Boardroom-level risk command for basketball.
      </div>
    </div>
  );
}
