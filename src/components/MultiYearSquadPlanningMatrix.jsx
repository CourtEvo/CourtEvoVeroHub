import React, { useState } from "react";
import {
  FaUserTie, FaCalendarAlt, FaEdit, FaTrash, FaPlusCircle, FaExclamationTriangle, FaFlag,
  FaFileExport, FaSearch, FaFilter, FaUsers, FaRegClock, FaUndo, FaEye, FaUserPlus, FaChevronRight
} from "react-icons/fa";

const years = [2024, 2025, 2026, 2027];
const positions = ["PG", "SG", "SF", "PF", "C"];

// Role color code
const roles = [
  { key: "Core", color: "#FFD700" },
  { key: "Rotation", color: "#1de682" },
  { key: "Prospect", color: "#485563" },
  { key: "Open", color: "#ff6b6b" }
];

// Example squad data (with position/notes)
const initialSquad = [
  {
    id: 1, name: "Marko Simic", position: "PG", age: 24, role: "Core", nationality: "CRO", contract: { 2024: "✓", 2025: "✓", 2026: "opt", 2027: "" }, optionYear: 2026, expiry: 2026, status: "signed",
    priorRoles: ["Prospect", "Rotation"], perfNote: "2023-24 MVP; strong EuroCup showing"
  },
  {
    id: 2, name: "Ivan Petrovic", position: "SG", age: 21, role: "Rotation", nationality: "CRO", contract: { 2024: "✓", 2025: "✓", 2026: "", 2027: "" }, expiry: 2025, status: "signed",
    priorRoles: ["Prospect"], perfNote: "Elite defensive rating; must improve 3pt%"
  },
  {
    id: 3, name: "Jusuf Ilic", position: "SF", age: 18, role: "Prospect", nationality: "BIH", contract: { 2024: "✓", 2025: "opt", 2026: "", 2027: "" }, optionYear: 2025, expiry: 2025, status: "academy",
    priorRoles: [], perfNote: "Late bloomer, high ceiling"
  },
  {
    id: 4, name: "Open Slot", position: "PF", age: "", role: "Open", nationality: "", contract: { 2024: "", 2025: "", 2026: "", 2027: "" }, expiry: "", status: "open",
    priorRoles: [], perfNote: "Recruit for athletic/versatile PF"
  }
];

const quotaConfig = [
  { label: "Foreigners", check: p => p.nationality !== "CRO" && p.nationality, quota: 3 },
  { label: "Homegrowns", check: p => p.nationality === "CRO", quota: 6 },
  { label: "U18", check: p => p.age <= 18 && p.age !== "", quota: 2 }
];

function roleColor(role) {
  return roles.find(r => r.key === role)?.color || "#FFD700";
}

export default function MultiYearSquadPlanningMatrix() {
  const [squad, setSquad] = useState(initialSquad);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterPos, setFilterPos] = useState("");
  const [selected, setSelected] = useState(null);

  // Undo logic
  function backup() { setHistory(h => [JSON.stringify(squad), ...h].slice(0, 6)); }
  function undo() { if (history.length) setSquad(JSON.parse(history[0])); setHistory(h => h.slice(1)); }

  // CRUD
  function handleEdit(p) { setEditing(p); setForm({ ...p }); setAdding(false); }
  function handleDelete(id) { backup(); setSquad(ss => ss.filter(s => s.id !== id)); setEditing(null); setSelected(null); }
  function handleSaveEdit() { backup(); setSquad(ss => ss.map(s => s.id === editing.id ? { ...form, id: editing.id } : s)); setEditing(null); setSelected(null); }
  function handleAddNew() { backup(); setSquad(ss => [...ss, { ...form, id: Date.now(), contract: { ...form.contract } }]); setAdding(false); }
  function exportCSV() {
    const header = "Name,Pos,Age,Role,Nationality," + years.map(y => y).join(",") + "\n";
    const body = squad.map(p =>
      [
        p.name, p.position, p.age, p.role, p.nationality, ...years.map(y => p.contract[y] || "")
      ].join("|")
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "squad_matrix.csv";
    link.click();
  }

  // Visual contract bar
  function ContractBar({ contract, optionYear, expiry }) {
    return (
      <div style={{ display: "flex", gap: 3 }}>
        {years.map(y => (
          <span key={y}
            style={{
              width: 33, height: 22, borderRadius: 7, display: "inline-flex",
              background: contract[y] === "✓" ? "#FFD700" :
                contract[y] === "opt" ? "#1de682" : "#485563",
              color: contract[y] ? "#232a2e" : "#ccc",
              alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, boxShadow: "0 1px 4px #FFD70022"
            }}>
            {contract[y] || ""}
            {optionYear === y ? <FaRegClock color="#FFD700" style={{ marginLeft: 3, fontSize: 12 }} /> : ""}
            {expiry === y ? <FaExclamationTriangle color="#ff6b6b" style={{ marginLeft: 2, fontSize: 12 }} /> : ""}
          </span>
        ))}
      </div>
    );
  }

  // Expiring contracts alert
  function ExpiryAlert({ squad }) {
    const soonExpiring = squad.filter(p => p.expiry && p.expiry <= years[1] && p.role !== "Open");
    if (!soonExpiring.length) return null;
    return (
      <div style={{ background: "#ff6b6b22", color: "#ff6b6b", borderRadius: 13, padding: "10px 14px", marginBottom: 9, fontWeight: 900 }}>
        <FaExclamationTriangle style={{ marginRight: 7 }} /> Expiring soon:{" "}
        {soonExpiring.map(p => `${p.name} (${p.expiry})`).join(", ")}
      </div>
    );
  }

  // Succession Heatmap
  function SuccessionHeatmap({ squad }) {
    return (
      <div style={{ background: "#232a2e", borderRadius: 13, padding: "12px 16px", marginBottom: 10, boxShadow: "0 2px 10px #FFD70022" }}>
        <b style={{ color: "#FFD700" }}>Succession Heatmap</b>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 7 }}>
          {roles.filter(r => r.key !== "Open").map((r, i) =>
            <div key={r.key} style={{ display: "flex", alignItems: "center" }}>
              <span style={{ width: 64, color: r.color, fontWeight: 900 }}>{r.key}</span>
              {positions.map(pos => {
                const count = squad.filter(p => p.role === r.key && p.position === pos).length;
                return (
                  <span key={pos} style={{
                    width: 32, height: 24, borderRadius: 8,
                    background: count ? r.color : "#485563", color: "#232a2e",
                    fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center", marginRight: 2
                  }}>{count}</span>
                );
              })}
            </div>
          )}
        </div>
        <div style={{ marginLeft: 68, marginTop: 4, color: "#FFD700", fontWeight: 700, fontSize: 13 }}>
          {positions.map(pos => <span key={pos} style={{ marginRight: 25 }}>{pos}</span>)}
        </div>
      </div>
    );
  }

  // Quota tracker
  function QuotaAnalytics({ squad }) {
    return (
      <div style={{ display: "flex", gap: 18, alignItems: "center", background: "#232a2e", borderRadius: 12, padding: "12px 16px", marginBottom: 10, boxShadow: "0 2px 10px #FFD70022" }}>
        <FaUsers color="#FFD700" />
        {quotaConfig.map(q => {
          const cnt = squad.filter(q.check).length;
          const ok = cnt >= q.quota;
          return (
            <span key={q.label} style={{ color: ok ? "#1de682" : "#ff6b6b", fontWeight: 900, fontSize: 16 }}>
              {q.label}: {cnt}/{q.quota}
            </span>
          );
        })}
      </div>
    );
  }

  // Role composition column chart
  function RoleColumnChart({ squad }) {
    const roleCount = {};
    squad.forEach(p => { roleCount[p.role] = (roleCount[p.role] || 0) + 1; });
    const max = Math.max(...Object.values(roleCount));
    return (
      <svg width={125} height={58}>
        {roles.map((r, i) => {
          const val = roleCount[r.key] || 0;
          return (
            <g key={r.key}>
              <rect x={10 + i * 26} y={58 - (val / max) * 48} width={18} height={(val / max) * 48}
                fill={r.color} />
              <text x={19 + i * 26} y={54} fill="#fff" fontWeight="900" fontSize={10} textAnchor="middle">{r.key}</text>
              <text x={19 + i * 26} y={50 - (val / max) * 48} fill="#FFD700" fontWeight="900" fontSize={13} textAnchor="middle">{val}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  // Filtering
  const filtered = squad.filter(
    p =>
      (!filterRole || p.role === filterRole) &&
      (!filterPos || p.position === filterPos) &&
      (search === "" || (p.name && p.name.toLowerCase().includes(search.toLowerCase())))
  );

  // Scenario Simulator (advanced): Try contract extension, role promotion, slot open
  function simulateScenario(type) {
    backup();
    setSquad(squad.map(p => {
      if (type === "extend" && p.expiry === years[1]) return { ...p, contract: { ...p.contract, [years[2]]: "✓" }, expiry: years[2] };
      if (type === "promote" && p.role === "Prospect") return { ...p, role: "Rotation" };
      if (type === "open" && p.role !== "Open") return p;
      return p;
    }).concat(type === "open" ? [{
      id: Date.now(), name: "Open Slot", position: "SF", age: "", role: "Open", nationality: "", contract: { 2024: "", 2025: "", 2026: "", 2027: "" }, expiry: "", status: "open",
      priorRoles: [], perfNote: "Board scenario: create new slot"
    }] : []));
  }

  // --- Main ---
  return (
    <div style={{
      background: "#232a2e", color: "#fff", fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh", borderRadius: "34px", padding: "36px 26px 20px 26px", boxShadow: "0 8px 34px 0 #15171a"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 15, flexWrap: "wrap" }}>
        <FaCalendarAlt size={40} color="#FFD700" style={{ marginRight: 12 }} />
        <div>
          <div style={{
            fontWeight: 900, fontSize: 28, letterSpacing: 1, marginBottom: 2, color: "#FFD700"
          }}>
            MULTI-YEAR SQUAD PLANNING MATRIX
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Depth, contracts, succession, analytics, scenario. Pure boardroom.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button style={{
          background: "#FFD700", color: "#232a2e", borderRadius: 13, fontWeight: 900,
          border: "none", padding: "11px 22px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #FFD70055", marginLeft: 12
        }} onClick={exportCSV}>
          <FaFileExport style={{ marginRight: 9 }} /> Export CSV
        </button>
        <button style={{
          background: "#1de682", color: "#232a2e", borderRadius: 13, fontWeight: 900,
          border: "none", padding: "11px 18px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #1de68233", marginLeft: 8
        }} onClick={undo}>
          <FaUndo style={{ marginRight: 9 }} /> Undo
        </button>
      </div>
      <ExpiryAlert squad={squad} />
      <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <QuotaAnalytics squad={squad} />
        <SuccessionHeatmap squad={squad} />
        <RoleColumnChart squad={squad} />
        <button
          style={{
            background: "#FFD700", color: "#232a2e", borderRadius: 9, fontWeight: 900, border: "none", padding: "10px 17px",
            fontFamily: "Segoe UI", fontSize: 15, cursor: "pointer", boxShadow: "0 2px 10px 0 #FFD70055"
          }}
          onClick={() => simulateScenario("extend")}
        >
          <FaFlag style={{ marginRight: 7 }} /> Sim: Extend Contracts
        </button>
        <button
          style={{
            background: "#1de682", color: "#232a2e", borderRadius: 9, fontWeight: 900, border: "none", padding: "10px 17px",
            fontFamily: "Segoe UI", fontSize: 15, cursor: "pointer", boxShadow: "0 2px 10px 0 #1de68255"
          }}
          onClick={() => simulateScenario("promote")}
        >
          <FaChevronRight style={{ marginRight: 7 }} /> Sim: Promote Prospects
        </button>
        <button
          style={{
            background: "#ff6b6b", color: "#fff", borderRadius: 9, fontWeight: 900, border: "none", padding: "10px 17px",
            fontFamily: "Segoe UI", fontSize: 15, cursor: "pointer", boxShadow: "0 2px 10px 0 #ff6b6b33"
          }}
          onClick={() => simulateScenario("open")}
        >
          <FaUserPlus style={{ marginRight: 7 }} /> Sim: Open Slot
        </button>
      </div>
      {/* TABLE */}
      <div style={{
        minWidth: 470, maxWidth: 900, background: "#283E51", borderRadius: 22, padding: 18, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, overflowX: "auto"
      }}>
        <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 17, marginBottom: 9 }}>Squad Table (by Year)</div>
        <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 9 }}>
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
            {roles.map(r => <option key={r.key} value={r.key}>{r.key}</option>)}
          </select>
          <select
            value={filterPos}
            onChange={e => setFilterPos(e.target.value)}
            style={{
              background: "#1a1d20", color: "#FFD700", borderRadius: 8,
              border: "none", fontWeight: 700, fontSize: 15, padding: "5px 12px", boxShadow: "0 2px 8px #FFD70022", cursor: "pointer"
            }}
          >
            <option value="">All Pos</option>
            {positions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button
          style={{
            background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 900,
            border: "none", padding: "8px 16px", fontSize: 16, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 8px 0 #1de68266",
            marginBottom: 12
          }}
          onClick={() => { setAdding(true); setForm({ role: "Core", position: "PG", contract: {} }); setEditing(null); }}>
          <FaPlusCircle style={{ marginRight: 8 }} /> Add Player/Slot
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
                  <b>Pos:</b>
                  <select value={form.position || "PG"}
                    onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                    style={{ marginLeft: 7, borderRadius: 7, padding: "4px 9px", fontWeight: 700, width: 62 }}>
                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <b>Age:</b>
                  <input type="number" value={form.age || ""}
                    onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 45, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Role:</b>
                  <select value={form.role || "Core"}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    {roles.map(r => <option key={r.key} value={r.key}>{r.key}</option>)}
                  </select>
                </div>
                <div>
                  <b>Nationality:</b>
                  <input type="text" value={form.nationality || ""}
                    onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 60, fontWeight: 700 }} />
                </div>
                {years.map(y => (
                  <div key={y}>
                    <b>{y}:</b>
                    <select
                      value={form.contract?.[y] || ""}
                      onChange={e => setForm(f => ({
                        ...f,
                        contract: { ...f.contract, [y]: e.target.value }
                      }))}
                      style={{ marginLeft: 5, borderRadius: 7, padding: "4px 9px", fontWeight: 700 }}>
                      <option value=""></option>
                      <option value="✓">✓</option>
                      <option value="opt">opt</option>
                    </select>
                  </div>
                ))}
                <div>
                  <b>Option Year:</b>
                  <select value={form.optionYear || ""}
                    onChange={e => setForm(f => ({ ...f, optionYear: Number(e.target.value) }))}
                    style={{ marginLeft: 7, borderRadius: 7, padding: "4px 9px", fontWeight: 700, width: 62 }}>
                    <option value=""></option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <b>Expiry:</b>
                  <select value={form.expiry || ""}
                    onChange={e => setForm(f => ({ ...f, expiry: Number(e.target.value) }))}
                    style={{ marginLeft: 7, borderRadius: 7, padding: "4px 9px", fontWeight: 700, width: 62 }}>
                    <option value=""></option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <b>Note:</b>
                  <input type="text" value={form.perfNote || ""}
                    onChange={e => setForm(f => ({ ...f, perfNote: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 150, fontWeight: 700 }} />
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
              <th>Pos</th>
              <th>Age</th>
              <th>Role</th>
              <th>Nationality</th>
              {years.map(y => <th key={y}>{y}</th>)}
              <th>Expiry</th>
              <th>Edit</th>
              <th>Del</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{
                background: roleColor(p.role) + "15"
              }}>
                <td style={{ fontWeight: 900, color: "#FFD700", cursor: "pointer" }}
                  onClick={() => setSelected(p)}>{p.name}</td>
                <td>{p.position}</td>
                <td>{p.age}</td>
                <td>
                  <span style={{
                    background: roleColor(p.role), color: "#232a2e", borderRadius: 7, padding: "2px 11px", fontWeight: 900, fontSize: 14
                  }}>{p.role}</span>
                </td>
                <td>{p.nationality}</td>
                {years.map(y => (
                  <td key={y}>
                    <ContractBar contract={p.contract} optionYear={p.optionYear} expiry={p.expiry} />
                  </td>
                ))}
                <td>{p.expiry}</td>
                <td>
                  <button onClick={() => handleEdit(p)}
                    style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer" }}>
                    <FaEdit />
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDelete(p.id)}
                    style={{ background: "#ff6b6b", color: "#fff", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer" }}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* SIDEBAR: Player/Slot Profile */}
      <div style={{
        minWidth: 340, maxWidth: 480, background: "#232a2e", borderRadius: 22, padding: 22, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, height: "100%"
      }}>
        <b style={{ color: "#FFD700", fontWeight: 900, fontSize: 17 }}>Squad Profile & Analytics</b>
        {selected ? (
          <>
            <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 20, margin: "8px 0 6px 0" }}>{selected.name}</div>
            <div><b>Position:</b> {selected.position}</div>
            <div><b>Age:</b> {selected.age}</div>
            <div><b>Role:</b> {selected.role}</div>
            <div><b>Nationality:</b> {selected.nationality}</div>
            <div style={{ marginTop: 7 }}>
              <b>Contract Bar:</b> <ContractBar contract={selected.contract} optionYear={selected.optionYear} expiry={selected.expiry} />
            </div>
            <div><b>Status:</b> {selected.status}</div>
            <div style={{ marginTop: 7 }}>
              <b>Performance Note:</b> <span style={{ color: "#1de682" }}>{selected.perfNote}</span>
            </div>
            <div style={{ marginTop: 7 }}>
              <b>Prior Roles:</b> <span style={{ color: "#FFD700" }}>{selected.priorRoles?.join(", ")}</span>
            </div>
          </>
        ) : (
          <div style={{ margin: "12px 0 10px 0", color: "#FFD700", fontSize: 15, fontWeight: 900 }}>
            Select a player/slot for full analytics.
          </div>
        )}
      </div>
      <div style={{
        marginTop: 24,
        fontSize: 14,
        opacity: 0.8,
        textAlign: "center",
        color: "#FFD700",
        fontWeight: 900
      }}>
        Proprietary to CourtEvo Vero. The global benchmark in squad planning.
      </div>
    </div>
  );
}
