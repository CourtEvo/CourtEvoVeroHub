import React, { useState } from "react";
import {
  FaFileContract, FaExclamationTriangle, FaRegClock, FaHistory, FaPlusCircle, FaEdit, FaTrash,
  FaChevronRight, FaCheckCircle, FaSearch, FaFilter, FaFileExport, FaFlag, FaUndo, FaRedo, FaUsers
} from "react-icons/fa";

const roles = ["Core", "Rotation", "Prospect"];
const statuses = ["active", "expiring", "option", "extension", "expired"];
const years = [2024, 2025, 2026, 2027];

// Mock contract data
const initialContracts = [
  {
    id: 1,
    player: "Marko Simic",
    role: "Core",
    agent: "D. Pavic",
    start: 2022,
    end: 2025,
    optionYear: 2026,
    extension: 2027,
    status: "active",
    renewalHistory: [
      { year: 2023, action: "Extension to 2025", by: "Board" },
      { year: 2025, action: "Option (pending)", by: "Board" }
    ],
    audit: [
      { date: "2022-07-01", event: "Signed contract", by: "Board" },
      { date: "2023-07-01", event: "Renewed for 2025", by: "Board" }
    ],
    health: 9,
    notes: "Franchise player; agent tough in negotiations."
  },
  {
    id: 2,
    player: "Ivan Petrovic",
    role: "Rotation",
    agent: "J. Novak",
    start: 2023,
    end: 2024,
    optionYear: null,
    extension: null,
    status: "expiring",
    renewalHistory: [
      { year: 2024, action: "Negotiation failed", by: "Agent" }
    ],
    audit: [
      { date: "2023-07-01", event: "Signed contract", by: "Board" },
      { date: "2024-06-01", event: "Negotiation failed", by: "Agent" }
    ],
    health: 4,
    notes: "Likely to leave, U25 quota, risk."
  },
  {
    id: 3,
    player: "Jusuf Ilic",
    role: "Prospect",
    agent: "-",
    start: 2024,
    end: 2025,
    optionYear: 2026,
    extension: null,
    status: "option",
    renewalHistory: [],
    audit: [
      { date: "2024-06-01", event: "Promoted to senior", by: "Board" }
    ],
    health: 7,
    notes: "Academy product, late bloomer, option year possible."
  }
];

// Utility: Health Score
function contractHealthScore(c) {
  // Red zone: expiring, failed renewal, option not yet picked
  if (c.status === "expiring" || (c.renewalHistory || []).some(h => h.action.toLowerCase().includes("fail"))) return 3;
  if (c.status === "option") return 6;
  if (c.status === "extension") return 8;
  return 10;
}
function healthColor(score) {
  if (score >= 9) return "#1de682";
  if (score >= 6) return "#FFD700";
  return "#ff6b6b";
}

// Pipeline Timeline View
function PipelineTimeline({ contracts }) {
  // Stacks all contracts by year; color codes by status
  let stack = {};
  contracts.forEach(c => {
    for (let y = c.start; y <= (c.extension || c.optionYear || c.end); y++) {
      if (!stack[y]) stack[y] = [];
      stack[y].push({ ...c, year: y });
    }
  });
  return (
    <div style={{ background: "#232a2e", borderRadius: 13, padding: "13px 18px", marginBottom: 14, boxShadow: "0 2px 10px #FFD70022" }}>
      <b style={{ color: "#FFD700" }}>Pipeline Timeline</b>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: 7 }}>
        {years.map(y =>
          <div key={y} style={{ width: 58 }}>
            <div style={{ color: "#FFD700", fontWeight: 900, textAlign: "center" }}>{y}</div>
            {(stack[y] || []).map((c, i) =>
              <div key={i} style={{
                background: healthColor(contractHealthScore(c)), color: "#232a2e", borderRadius: 8,
                margin: "3px 0", padding: "2px 7px", fontWeight: 900, fontSize: 14, textAlign: "center"
              }}>{c.player}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Agent Pie Chart
function AgentPie({ contracts }) {
  const count = {};
  contracts.forEach(c => { count[c.agent] = (count[c.agent] || 0) + 1; });
  const total = contracts.length;
  const data = Object.entries(count);
  let acc = 0;
  return (
    <svg width={120} height={120} viewBox="0 0 42 42">
      {data.map(([agent, val], i) => {
        const start = acc;
        acc += val / total * 100;
        const x1 = 21 + 21 * Math.cos(2 * Math.PI * start / 100);
        const y1 = 21 + 21 * Math.sin(2 * Math.PI * start / 100);
        const x2 = 21 + 21 * Math.cos(2 * Math.PI * acc / 100);
        const y2 = 21 + 21 * Math.sin(2 * Math.PI * acc / 100);
        const large = val / total > 0.5 ? 1 : 0;
        return val ? (
          <path
            key={agent}
            d={`M21,21 L${x1},${y1} A21,21 0 ${large} 1 ${x2},${y2} Z`}
            fill={["#FFD700", "#1de682", "#ff6b6b", "#485563"][i % 4]}
            stroke="#232a2e"
            strokeWidth={0.7}
          />
        ) : null;
      })}
      <circle cx={21} cy={21} r={10} fill="#232a2e" />
      <text x={21} y={24} fontSize={8.2} textAnchor="middle" fill="#FFD700" fontWeight="900">{total} contracts</text>
    </svg>
  );
}

// Boardroom Alerts Panel
function BoardAlerts({ contracts }) {
  const expiring = contracts.filter(c => c.status === "expiring");
  const risky = contracts.filter(c => contractHealthScore(c) <= 4);
  const quotaMiss = roles.filter(r => contracts.filter(c => c.role === r && contractHealthScore(c) >= 6).length < 1);

  if (!expiring.length && !risky.length && !quotaMiss.length) return null;
  return (
    <div style={{ background: "#ff6b6b22", color: "#ff6b6b", borderRadius: 13, padding: "10px 14px", marginBottom: 10, fontWeight: 900 }}>
      {expiring.length > 0 && <span><FaExclamationTriangle style={{ marginRight: 7 }} /> Expiring: {expiring.map(c => c.player).join(", ")} </span>}
      {risky.length > 0 && <span style={{ marginLeft: 22 }}><FaExclamationTriangle style={{ marginRight: 7 }} /> Risk: {risky.map(c => c.player).join(", ")} </span>}
      {quotaMiss.length > 0 && <span style={{ marginLeft: 22 }}><FaUsers style={{ marginRight: 7 }} /> Quota: {quotaMiss.join(", ")} </span>}
    </div>
  );
}

// Audit Log
function AuditLog({ audit }) {
  if (!audit?.length) return <span style={{ color: "#FFD700" }}>No audit actions yet</span>;
  return (
    <ul style={{ margin: 0, fontSize: 14 }}>
      {audit.map((a, i) =>
        <li key={i}><FaHistory color="#FFD700" /> <b>{a.date}:</b> {a.event} <span style={{ color: "#FFD700" }}>({a.by})</span></li>
      )}
    </ul>
  );
}

// Renewal history log
function RenewalHistory({ history }) {
  if (!history?.length) return <span style={{ color: "#FFD700" }}>No renewals yet</span>;
  return (
    <ul style={{ margin: 0, fontSize: 14 }}>
      {history.map((h, i) =>
        <li key={i}><FaRegClock color="#FFD700" /> <b>{h.year}:</b> {h.action} <span style={{ color: "#FFD700" }}>({h.by})</span></li>
      )}
    </ul>
  );
}

export default function PlayerContractLifecycleAnalyzer() {
  const [contracts, setContracts] = useState(initialContracts);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Undo/Redo logic
  function backup() { setHistory(h => [JSON.stringify(contracts), ...h].slice(0, 10)); setRedoStack([]); }
  function undo() { if (history.length) { setRedoStack([JSON.stringify(contracts), ...redoStack]); setContracts(JSON.parse(history[0])); setHistory(h => h.slice(1)); } }
  function redo() { if (redoStack.length) { setHistory(h => [JSON.stringify(contracts), ...h]); setContracts(JSON.parse(redoStack[0])); setRedoStack(rs => rs.slice(1)); } }

  // CRUD
  function handleEdit(c) { setEditing(c); setForm({ ...c }); setAdding(false); }
  function handleDelete(id) { backup(); setContracts(cs => cs.filter(c => c.id !== id)); setEditing(null); setSelected(null); }
  function handleSaveEdit() { backup(); setContracts(cs => cs.map(c => c.id === editing.id ? { ...form, id: editing.id } : c)); setEditing(null); setSelected(null); }
  function handleAddNew() { backup(); setContracts(cs => [...cs, { ...form, id: Date.now(), renewalHistory: [], audit: [] }]); setAdding(false); }
  function exportCSV() {
    const header = "Player,Role,Agent,Start,End,OptionYear,Extension,Status,Health,Notes\n";
    const body = contracts.map(c =>
      [c.player, c.role, c.agent, c.start, c.end, c.optionYear, c.extension, c.status, contractHealthScore(c), c.notes].join("|")
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "contract_lifecycle.csv";
    link.click();
  }

  // Scenario simulator (multi)
  function simulateScenario(type) {
    backup();
    if (type === "renew") {
      setContracts(contracts.map(c =>
        c.status === "expiring"
          ? { ...c, status: "active", end: c.end + 1, health: 10, renewalHistory: [...(c.renewalHistory || []), { year: c.end, action: "Boardroom renewal", by: "Board" }], audit: [...(c.audit || []), { date: `${c.end}-07-01`, event: "Renewed by scenario", by: "Board" }] }
          : c
      ));
    } else if (type === "terminate") {
      setContracts(contracts.map(c =>
        c.status === "active"
          ? { ...c, status: "expired", health: 2, audit: [...(c.audit || []), { date: `${c.end}-07-01`, event: "Terminated by scenario", by: "Board" }] }
          : c
      ));
    } else if (type === "extend") {
      setContracts(contracts.map(c =>
        c.status === "option"
          ? { ...c, status: "extension", extension: (c.optionYear || c.end) + 1, health: 10, renewalHistory: [...(c.renewalHistory || []), { year: (c.optionYear || c.end), action: "Extension exercised", by: "Board" }], audit: [...(c.audit || []), { date: `${(c.optionYear || c.end)}-07-01`, event: "Extension scenario", by: "Board" }] }
          : c
      ));
    }
  }

  // Filtering
  const filtered = contracts.filter(
    c =>
      (!filterRole || c.role === filterRole) &&
      (!filterStatus || c.status === filterStatus) &&
      (search === "" || c.player.toLowerCase().includes(search.toLowerCase()))
  );

  // --- Main ---
  return (
    <div style={{
      background: "#232a2e", color: "#fff", fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh", borderRadius: "34px", padding: "34px 24px 20px 24px", boxShadow: "0 8px 34px 0 #15171a"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <FaFileContract size={39} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div style={{
            fontWeight: 900, fontSize: 27, letterSpacing: 1, marginBottom: 3, color: "#FFD700"
          }}>
            PLAYER CONTRACT LIFECYCLE ANALYZER
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Audit, risk, agent leverage, health—total contract command.
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
          background: "#1de682", color: "#232a2e", borderRadius: 13, fontWeight: 900,
          border: "none", padding: "10px 17px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #1de68233", marginLeft: 7
        }} onClick={undo}><FaUndo /> Undo</button>
        <button style={{
          background: "#FFD700", color: "#232a2e", borderRadius: 13, fontWeight: 900,
          border: "none", padding: "10px 17px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #FFD70033", marginLeft: 7
        }} onClick={redo}><FaRedo /> Redo</button>
      </div>
      <BoardAlerts contracts={contracts} />
      <PipelineTimeline contracts={contracts} />
      <div style={{ display: "flex", gap: 32, marginBottom: 10 }}>
        <AgentPie contracts={contracts} />
        <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
          <button style={{
            background: "#FFD700", color: "#232a2e", borderRadius: 9, fontWeight: 900, border: "none", padding: "10px 16px",
            fontFamily: "Segoe UI", fontSize: 15, cursor: "pointer", boxShadow: "0 2px 10px 0 #FFD70055"
          }} onClick={() => simulateScenario("renew")}>
            <FaFlag style={{ marginRight: 7 }} /> Sim: Renew Expiring
          </button>
          <button style={{
            background: "#1de682", color: "#232a2e", borderRadius: 9, fontWeight: 900, border: "none", padding: "10px 16px",
            fontFamily: "Segoe UI", fontSize: 15, cursor: "pointer", boxShadow: "0 2px 10px 0 #1de68255"
          }} onClick={() => simulateScenario("extend")}>
            <FaChevronRight style={{ marginRight: 7 }} /> Sim: Exercise Options
          </button>
          <button style={{
            background: "#ff6b6b", color: "#fff", borderRadius: 9, fontWeight: 900, border: "none", padding: "10px 16px",
            fontFamily: "Segoe UI", fontSize: 15, cursor: "pointer", boxShadow: "0 2px 10px 0 #ff6b6b33"
          }} onClick={() => simulateScenario("terminate")}>
            <FaExclamationTriangle style={{ marginRight: 7 }} /> Sim: Terminate Active
          </button>
        </div>
      </div>
      {/* FILTERS */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 9 }}>
        <FaSearch color="#FFD700" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Find player..." style={{ border: "none", outline: "none", background: "transparent", color: "#FFD700", fontWeight: 700, fontSize: 15, width: 120, marginLeft: 5 }} />
        <FaFilter color="#FFD700" />
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          style={{
            background: "#1a1d20", color: "#FFD700", borderRadius: 8,
            border: "none", fontWeight: 700, fontSize: 15, padding: "5px 12px", boxShadow: "0 2px 8px #FFD70022", cursor: "pointer"
          }}
        >
          <option value="">All Roles</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            background: "#1a1d20", color: "#FFD700", borderRadius: 8,
            border: "none", fontWeight: 700, fontSize: 15, padding: "5px 12px", boxShadow: "0 2px 8px #FFD70022", cursor: "pointer"
          }}
        >
          <option value="">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      {/* TABLE */}
      <div style={{
        minWidth: 480, maxWidth: 900, background: "#283E51", borderRadius: 22, padding: 17, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, overflowX: "auto"
      }}>
        <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 17, marginBottom: 9 }}>Contract Table</div>
        <button
          style={{
            background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 900,
            border: "none", padding: "8px 17px", fontSize: 16, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 8px 0 #1de68266",
            marginBottom: 12
          }}
          onClick={() => { setAdding(true); setForm({ status: "active" }); setEditing(null); }}>
          <FaPlusCircle style={{ marginRight: 8 }} /> Add Contract
        </button>
        {(adding || editing) &&
          <div style={{ background: "#FFD70022", color: "#232a2e", borderRadius: 11, padding: "12px 10px", marginBottom: 12 }}>
            <form onSubmit={e => { e.preventDefault(); adding ? handleAddNew() : handleSaveEdit(); }}>
              <div style={{ display: "flex", gap: 13, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <b>Player:</b>
                  <input type="text" value={form.player || ""} required
                    onChange={e => setForm(f => ({ ...f, player: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700, width: 110 }} />
                </div>
                <div>
                  <b>Role:</b>
                  <select value={form.role || "Core"}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <b>Agent:</b>
                  <input type="text" value={form.agent || ""}
                    onChange={e => setForm(f => ({ ...f, agent: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 100, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Start:</b>
                  <input type="number" value={form.start || ""}
                    onChange={e => setForm(f => ({ ...f, start: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 60, fontWeight: 700 }} />
                </div>
                <div>
                  <b>End:</b>
                  <input type="number" value={form.end || ""}
                    onChange={e => setForm(f => ({ ...f, end: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 60, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Option Year:</b>
                  <input type="number" value={form.optionYear || ""}
                    onChange={e => setForm(f => ({ ...f, optionYear: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 80, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Extension:</b>
                  <input type="number" value={form.extension || ""}
                    onChange={e => setForm(f => ({ ...f, extension: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 80, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Status:</b>
                  <select value={form.status || "active"}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <b>Notes:</b>
                  <input type="text" value={form.notes || ""}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 130, fontWeight: 700 }} />
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
              <th>Player</th>
              <th>Role</th>
              <th>Agent</th>
              <th>Lifecycle</th>
              <th>Status</th>
              <th>Health</th>
              <th>Notes</th>
              <th>Edit</th>
              <th>Del</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{
                background: healthColor(contractHealthScore(c)) + "19"
              }}>
                <td style={{ fontWeight: 900, color: "#FFD700", cursor: "pointer" }}
                  onClick={() => setSelected(c)}>{c.player}</td>
                <td>{c.role}</td>
                <td>{c.agent}</td>
                <td>
                  {/* Timeline: years, color code by status */}
                  <div style={{ display: "flex", gap: 3 }}>
                    {Array.from({ length: (c.extension || c.optionYear || c.end) - c.start + 1 }).map((_, i) => {
                      const y = c.start + i;
                      let typ = y === c.end && c.status === "expiring" ? "expiring" :
                        y === c.optionYear ? "option" :
                          y === c.extension ? "extension" :
                            y >= c.start && y <= c.end ? "active" : "future";
                      return (
                        <span key={y}
                          style={{
                            width: 27, height: 19, borderRadius: 6, marginRight: 2, fontWeight: 900, fontSize: 14,
                            background: typ === "expiring" ? "#ff6b6b" : typ === "option" ? "#FFD700" : typ === "extension" ? "#1de682" : "#485563",
                            color: typ === "future" ? "#FFD70055" : "#232a2e", textAlign: "center"
                          }}>
                          {y}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td>
                  
                
                  <span style={{
                    background: healthColor(contractHealthScore(c)), color: "#232a2e", borderRadius: 7, padding: "2px 10px", fontWeight: 900
                  }}>{contractHealthScore(c)}</span>
                </td>
                <td>{c.notes}</td>
                <td>
                  <button onClick={() => handleEdit(c)}
                    style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer" }}>
                    <FaEdit />
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDelete(c.id)}
                    style={{ background: "#ff6b6b", color: "#fff", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer" }}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* SIDEBAR: Contract Profile & Renewal Log */}
      <div style={{
        minWidth: 330, maxWidth: 470, background: "#232a2e", borderRadius: 22, padding: 22, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, height: "100%"
      }}>
        <b style={{ color: "#FFD700", fontWeight: 900, fontSize: 17 }}>Contract Profile & Analytics</b>
        {selected ? (
          <>
            <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 19, margin: "8px 0 6px 0" }}>{selected.player}</div>
            <div><b>Role:</b> {selected.role}</div>
            <div><b>Agent:</b> {selected.agent}</div>
            <div><b>Health Score:</b> <span style={{ background: healthColor(contractHealthScore(selected)), color: "#232a2e", borderRadius: 6, padding: "2px 10px", fontWeight: 900 }}>{contractHealthScore(selected)}</span></div>
            <div><b>Lifecycle:</b>
              <div style={{ display: "flex", gap: 3, marginTop: 3 }}>
                {Array.from({ length: (selected.extension || selected.optionYear || selected.end) - selected.start + 1 }).map((_, i) => {
                  const y = selected.start + i;
                  let typ = y === selected.end && selected.status === "expiring" ? "expiring" :
                    y === selected.optionYear ? "option" :
                      y === selected.extension ? "extension" :
                        y >= selected.start && y <= selected.end ? "active" : "future";
                  return (
                    <span key={y}
                      style={{
                        width: 23, height: 17, borderRadius: 6, marginRight: 2, fontWeight: 900, fontSize: 12,
                        background: typ === "expiring" ? "#ff6b6b" : typ === "option" ? "#FFD700" : typ === "extension" ? "#1de682" : "#485563",
                        color: typ === "future" ? "#FFD70055" : "#232a2e", textAlign: "center"
                      }}>
                      {y}
                    </span>
                  );
                })}
              </div>
            </div>
            <div><b>Status:</b> {selected.status}</div>
            <div style={{ marginTop: 7 }}><b>Notes:</b> <span style={{ color: "#1de682" }}>{selected.notes}</span></div>
            <div style={{ marginTop: 8 }}><b>Renewal Log:</b> <RenewalHistory history={selected.renewalHistory} /></div>
            <div style={{ marginTop: 8 }}><b>Audit Log:</b> <AuditLog audit={selected.audit} /></div>
          </>
        ) : (
          <div style={{ margin: "12px 0 10px 0", color: "#FFD700", fontSize: 15, fontWeight: 900 }}>
            Select a contract to see analytics and audit trail.
          </div>
        )}
      </div>
      {/* Footer */}
      <div style={{
        marginTop: 24,
        fontSize: 14,
        opacity: 0.8,
        textAlign: "center",
        color: "#FFD700",
        fontWeight: 900
      }}>
        Proprietary to CourtEvo Vero. The global standard for contract intelligence.
      </div>
    </div>
  );
}
