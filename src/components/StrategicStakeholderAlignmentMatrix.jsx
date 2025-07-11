import React, { useState } from "react";
import {
  FaUsers, FaPlusCircle, FaEdit, FaTrash, FaCloudDownloadAlt, FaFire, FaHandshake, FaChartBar,
  FaEnvelope, FaBullhorn, FaArrowUp, FaArrowDown, FaCheckCircle, FaExclamationTriangle,
  FaFilter, FaUser, FaFlag, FaCrown, FaUserShield, FaSearch, FaStar, FaHeart, FaStickyNote, FaArrowRight
} from "react-icons/fa";

// --- DEMO DATA & COLOR LOGIC ---
const initialStakeholders = [
  {
    id: 1,
    name: "City Sports Director",
    type: "City",
    owner: "Marko Proleta",
    power: 9, alignment: 8, buyIn: "champion",
    lastContact: "2024-06-10", channel: "In person",
    keyMessage: "Facility upgrade proposal", openTasks: 0,
    engagementRating: ["excellent", "good"], movement: [7, 8, 8, 9],
    notes: "Critical for access/funding", actions: [{ desc: "Set Q3 facility review", complete: false }],
    timeline: [{ date: "2024-04", event: "champion" }, { date: "2024-05", event: "champion" }]
  },
  {
    id: 2,
    name: "Sponsor: GoldBet",
    type: "Sponsor",
    owner: "Ivan Babic",
    power: 8, alignment: 6, buyIn: "supporter",
    lastContact: "2024-05-28", channel: "Email",
    keyMessage: "Renew contract", openTasks: 1,
    engagementRating: ["good", "fair"], movement: [6, 5, 7, 6],
    notes: "Wants more exposure", actions: [{ desc: "Share next home game proposal", complete: false }],
    timeline: [{ date: "2024-04", event: "supporter" }, { date: "2024-05", event: "supporter" }]
  },
  {
    id: 3,
    name: "School Partners",
    type: "School",
    owner: "Luka Simic",
    power: 7, alignment: 5, buyIn: "neutral",
    lastContact: "2024-06-01", channel: "Call",
    keyMessage: "Invite to summer camp", openTasks: 2,
    engagementRating: ["fair", "poor"], movement: [6, 4, 5, 5],
    notes: "Variable influence", actions: [{ desc: "Send summer camp info", complete: false }],
    timeline: [{ date: "2024-04", event: "neutral" }, { date: "2024-05", event: "skeptic" }]
  }
];
const buyInLevels = [
  { key: "champion", label: "Champion", color: "#1de682", icon: <FaCrown /> },
  { key: "supporter", label: "Supporter", color: "#FFD700", icon: <FaHandshake /> },
  { key: "neutral", label: "Neutral", color: "#d0d6db", icon: <FaUser /> },
  { key: "skeptic", label: "Skeptic", color: "#f6a700", icon: <FaFlag /> },
  { key: "blocker", label: "Blocker", color: "#ff6b6b", icon: <FaUserShield /> }
];
const types = ["Sponsor", "City", "Parent Group", "School", "Media", "Board", "Academy", "Federation"];
const engagementMap = { excellent: "#1de682", good: "#FFD700", fair: "#f6a700", poor: "#ff6b6b" };

function getQuadrant(s) {
  if (s.power >= 6 && s.alignment >= 6) return "champion";
  if (s.power >= 6 && s.alignment < 6) return "risk";
  if (s.power < 6 && s.alignment >= 6) return "potential";
  if (s.power < 6 && s.alignment < 6) return "blocker";
  return "";
}

export default function StrategicStakeholderCommandCenter() {
  const [stakeholders, setStakeholders] = useState(initialStakeholders);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [filterQuadrant, setFilterQuadrant] = useState("");

  // --- CRUD, buy-in, actions, etc (same as before) ---
  function handleEdit(s) {
    setEditing(s);
    setForm({ ...s });
    setAdding(false);
  }
  function handleDelete(id) {
    setStakeholders(ss => ss.filter(s => s.id !== id));
    setEditing(null); setSelected(null);
  }
  function handleSaveEdit() {
    setStakeholders(ss => ss.map(s => s.id === editing.id ? { ...form, id: editing.id } : s));
    setEditing(null); setSelected(null);
  }
  function handleAddNew() {
    setStakeholders(ss => [...ss, { ...form, id: Date.now(), movement: [form.alignment], openTasks: 0, engagementRating: [], actions: [] }]);
    setAdding(false);
  }
  function updateBuyIn(s, up) {
    const idx = buyInLevels.findIndex(b => b.key === s.buyIn);
    const nextIdx = Math.min(buyInLevels.length - 1, Math.max(0, idx + (up ? 1 : -1)));
    setStakeholders(ss => ss.map(st => st.id === s.id
      ? { ...st, buyIn: buyInLevels[nextIdx].key, movement: [...(st.movement || []), st.alignment + (up ? 1 : -1)] }
      : st));
  }
  function addAction(stake, desc) {
    setStakeholders(ss => ss.map(s => s.id === stake.id
      ? { ...s, actions: [...(s.actions || []), { desc, complete: false }] }
      : s));
  }
  function toggleAction(stake, idx) {
    setStakeholders(ss => ss.map(s => s.id === stake.id
      ? {
        ...s,
        actions: s.actions.map((a, i) => i === idx ? { ...a, complete: !a.complete } : a)
      } : s));
  }
  function removeAction(stake, idx) {
    setStakeholders(ss => ss.map(s => s.id === stake.id
      ? { ...s, actions: s.actions.filter((_, i) => i !== idx) }
      : s));
  }
  function addEngagement(stake, level) {
    setStakeholders(ss => ss.map(s => s.id === stake.id
      ? { ...s, engagementRating: [...(s.engagementRating || []), level] }
      : s));
  }

  // --- FILTERS ---
  let filtered = stakeholders.filter(s =>
    (!filterType || s.type === filterType) &&
    (search === "" || s.name.toLowerCase().includes(search.toLowerCase()) || s.owner.toLowerCase().includes(search.toLowerCase())) &&
    (!filterQuadrant || getQuadrant(s) === filterQuadrant)
  );

  // --- ALERTS, BOARD PULSE PANEL ---
  const overdue = stakeholders.filter(s => new Date(s.lastContact) < new Date(Date.now() - 18 * 24 * 3600 * 1000));
  const openTasks = stakeholders.filter(s => s.openTasks > 0);
  const champions = stakeholders.filter(s => s.buyIn === "champion");
  const blockers = stakeholders.filter(s => s.buyIn === "blocker");
  const focus = [...champions.slice(0, 3), ...blockers.slice(0, 3)];
  const aiReco = champions.length === 0
    ? "No champions! Activate support with high alignment."
    : blockers.length > 2
      ? "Board: Too many blockers! Direct high-level engagement."
      : overdue.length > 2
        ? "Board: Fix overdue key contacts first." : "Health stable. Keep monitoring top sponsors.";

  // --- CLUSTERING LOGIC ---
  const clusterStats = {};
  types.forEach(t => {
    clusterStats[t] = stakeholders.filter(s => s.type === t).reduce((acc, s) => {
      const quad = getQuadrant(s);
      acc[quad] = (acc[quad] || 0) + 1;
      return acc;
    }, {});
  });

  // --- POWER MAP 2.0 ---
  function InfluenceMap() {
    const W = 690, H = 530, pad = 75;
    return (
      <svg width={W} height={H} style={{ background: "linear-gradient(135deg, #232a2e, #1d2227 120%)", borderRadius: 32, boxShadow: "0 6px 28px #111" }}>
        {/* Quadrant gradient overlays */}
        <rect x={pad} y={pad} width={(W - 2 * pad) / 2} height={(H - 2 * pad) / 2}
          fill="url(#champion)" />
        <rect x={pad + (W - 2 * pad) / 2} y={pad} width={(W - 2 * pad) / 2} height={(H - 2 * pad) / 2}
          fill="url(#highpotential)" />
        <rect x={pad} y={pad + (H - 2 * pad) / 2} width={(W - 2 * pad) / 2} height={(H - 2 * pad) / 2}
          fill="url(#blocker)" />
        <rect x={pad + (W - 2 * pad) / 2} y={pad + (H - 2 * pad) / 2} width={(W - 2 * pad) / 2} height={(H - 2 * pad) / 2}
          fill="url(#risk)" />
        {/* SVG gradients */}
        <defs>
          <linearGradient id="champion" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FFD70044" /><stop offset="1" stopColor="#232a2e00" /></linearGradient>
          <linearGradient id="highpotential" x1="1" y1="0" x2="0" y2="1"><stop stopColor="#1de68244" /><stop offset="1" stopColor="#232a2e00" /></linearGradient>
          <linearGradient id="blocker" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#ff6b6b44" /><stop offset="1" stopColor="#232a2e00" /></linearGradient>
          <linearGradient id="risk" x1="1" y1="1" x2="0" y2="0"><stop stopColor="#f6a70044" /><stop offset="1" stopColor="#232a2e00" /></linearGradient>
        </defs>
        {/* Axes */}
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#FFD700" strokeWidth={3} />
        <line x1={pad} y1={H - pad} x2={pad} y2={pad} stroke="#FFD700" strokeWidth={3} />
        {/* Quadrant Labels */}
        <text x={W / 4} y={pad - 21} fill="#1de682" fontWeight={900} fontSize={19} textAnchor="middle">High Potential</text>
        <text x={3 * W / 4} y={pad - 21} fill="#FFD700" fontWeight={900} fontSize={19} textAnchor="middle">Champion</text>
        <text x={W / 4} y={H - pad + 45} fill="#ff6b6b" fontWeight={900} fontSize={19} textAnchor="middle">Blocker</text>
        <text x={3 * W / 4} y={H - pad + 45} fill="#f6a700" fontWeight={900} fontSize={19} textAnchor="middle">Critical Risk</text>
        <text x={W - pad} y={H - 19} fill="#FFD700" fontWeight={700} fontSize={17} textAnchor="end">Power/Influence</text>
        <text x={17} y={pad - 18} fill="#FFD700" fontWeight={700} fontSize={17} transform={`rotate(-90 18,${pad - 18})`}>Alignment</text>
        {/* Stakeholder Nodes */}
        {stakeholders.map((s, i) => {
          const x = pad + ((W - 2 * pad) * (s.power - 1) / 9);
          const y = H - pad - ((H - 2 * pad) * (s.alignment - 1) / 9);
          const b = buyInLevels.find(bi => bi.key === s.buyIn);
          return (
            <g key={s.id} onMouseOver={() => setSelected(s)} onClick={() => setSelected(s)} style={{ cursor: "pointer" }}>
              <circle cx={x} cy={y} r={34} fill="#232a2e" stroke={b.color} strokeWidth={selected?.id === s.id ? 9 : 5}
                style={{ filter: `drop-shadow(0 0 15px ${b.color}77)` }} />
              <text x={x} y={y + 12} fontSize={26} fontWeight={900} fill={b.color} textAnchor="middle">
                {s.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </text>
              {/* Buy-in icon */}
              <g transform={`translate(${x - 17},${y - 35})`}>
                {b.icon}
              </g>
              {/* Mini sparkline for alignment */}
              <polyline
                fill="none" stroke="#FFD700" strokeWidth={4}
                points={(s.movement || []).slice(-6).map((val, j) =>
                  `${x - 16 + j * 6},${y + 38 - (val - 1) * 3.2}`).join(" ")}
              />
              {/* Tooltip */}
              {selected?.id === s.id && (
                <g>
                  <rect x={x + 38} y={y - 56} rx={11} width="220" height="110" fill="#232a2e" stroke="#FFD700" strokeWidth={3} />
                  <text x={x + 50} y={y - 38} fill="#FFD700" fontWeight={900} fontSize={17}>{s.name}</text>
                  <text x={x + 50} y={y - 20} fill="#1de682" fontWeight={700} fontSize={15}>Type: {s.type}</text>
                  <text x={x + 50} y={y} fill="#fff" fontWeight={700} fontSize={14}>Buy-in: {b.label}</text>
                  <text x={x + 50} y={y + 20} fill="#fff" fontSize={14}>Owner: {s.owner}</text>
                  <text x={x + 50} y={y + 38} fill="#FFD700" fontSize={13}>Power: {s.power} Align: {s.alignment}</text>
                  <text x={x + 50} y={y + 55} fill="#FFD700" fontSize={12}>Last Contact: {s.lastContact}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  {/* TABLE + CRUD + BOARDROOM VISUALS */}
<div style={{
  minWidth: 440, maxWidth: 780, flex: "1 1 600px", background: "#232a2e",
  borderRadius: 22, padding: 22, boxShadow: "0 2px 18px 0 #15171a",
  marginBottom: 18, overflowX: "auto"
}}>
  <div style={{
    marginBottom: 15, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap"
  }}>
    <button
      style={{
        background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 800,
        border: "none", padding: "9px 20px", fontSize: 17, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 10px 0 #1de68266",
      }}
      onClick={() => { setAdding(true); setForm({ power: 5, alignment: 5, buyIn: "neutral" }); setEditing(null); }}
    >
      <FaPlusCircle style={{ marginRight: 10, fontSize: 18 }} /> Add Stakeholder
    </button>
    <div style={{
      color: "#FFD700", background: "#232a2e", borderRadius: 9, padding: "7px 15px",
      fontWeight: 800, boxShadow: "0 2px 10px #FFD70022", fontSize: 15
    }}>
      Total: <span style={{ color: "#1de682" }}>{stakeholders.length}</span>
      {"  |  "}
      Champions: <span style={{ color: "#1de682" }}>{stakeholders.filter(s => s.buyIn === "champion").length}</span>
      {"  |  "}
      Blockers: <span style={{ color: "#ff6b6b" }}>{stakeholders.filter(s => s.buyIn === "blocker").length}</span>
      {"  |  "}
      Overdue: <span style={{ color: "#FFD700" }}>{stakeholders.filter(s => new Date(s.lastContact) < new Date(Date.now() - 18 * 24 * 3600 * 1000)).length}</span>
    </div>
  </div>
  {(adding || editing) &&
    <div style={{
      background: "#FFD70022", color: "#232a2e", borderRadius: 14,
      padding: "17px 17px", marginBottom: 15
    }}>
      <div style={{ fontWeight: 900, color: "#FFD700", marginBottom: 8, fontSize: 17 }}>
        {adding ? "Add Stakeholder" : "Edit Stakeholder"}
      </div>
      <form onSubmit={e => { e.preventDefault(); adding ? handleAddNew() : handleSaveEdit(); }}>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <b>Name:</b>
            <input type="text" value={form.name || ""} required
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700, width: 150 }} />
          </div>
          <div>
            <b>Type:</b>
            <select value={form.type || ""} required
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
              <option value="">Select</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <b>Owner:</b>
            <input type="text" value={form.owner || ""} required
              onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
              style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700, width: 110 }} />
          </div>
          <div>
            <b>Power:</b>
            <input type="number" min={1} max={10} value={form.power || 5}
              onChange={e => setForm(f => ({ ...f, power: Number(e.target.value) }))}
              style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 50, fontWeight: 700 }} />
          </div>
          <div>
            <b>Alignment:</b>
            <input type="number" min={1} max={10} value={form.alignment || 5}
              onChange={e => setForm(f => ({ ...f, alignment: Number(e.target.value) }))}
              style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 50, fontWeight: 700 }} />
          </div>
          <div>
            <b>Buy-in:</b>
            <select value={form.buyIn || "neutral"}
              onChange={e => setForm(f => ({ ...f, buyIn: e.target.value }))}
              style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
              {buyInLevels.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "center", marginTop: 9 }}>
          <div>
            <b>Last Contact:</b>
            <input type="date" value={form.lastContact || ""}
              onChange={e => setForm(f => ({ ...f, lastContact: e.target.value }))}
              style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }} />
          </div>
          <div>
            <b>Key Msg:</b>
            <input type="text" value={form.keyMessage || ""}
              onChange={e => setForm(f => ({ ...f, keyMessage: e.target.value }))}
              style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 140, fontWeight: 700 }} />
          </div>
          <div>
            <b>Open Tasks:</b>
            <input type="number" min={0} value={form.openTasks || 0}
              onChange={e => setForm(f => ({ ...f, openTasks: Number(e.target.value) }))}
              style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 60, fontWeight: 700 }} />
          </div>
          <div>
            <b>Notes:</b>
            <input type="text" value={form.notes || ""}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 150, fontWeight: 700 }} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" style={{
            background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 9, fontWeight: 900, fontSize: 16,
            padding: "7px 24px", marginRight: 12, cursor: "pointer", boxShadow: "0 2px 10px #FFD70022"
          }}>{adding ? "Add" : "Save"}</button>
          <button type="button" style={{
            background: "#ff6b6b", color: "#fff", border: "none", borderRadius: 9, fontWeight: 900, fontSize: 16,
            padding: "7px 24px", cursor: "pointer", boxShadow: "0 2px 10px #ff6b6b33"
          }} onClick={() => { setAdding(false); setEditing(null); setForm({}); }}>Cancel</button>
        </div>
      </form>
    </div>
  }
  <div style={{ overflowX: "auto", maxHeight: 350 }}>
    <table style={{ width: "100%", color: "#fff", fontSize: 16, borderCollapse: "collapse", fontFamily: "Segoe UI" }}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Owner</th>
          <th>Power</th>
          <th>Alignment</th>
          <th>Buy-in</th>
          <th>Key Msg</th>
          <th>Last Contact</th>
          <th>Open Tasks</th>
          <th>Edit</th>
          <th>Del</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map(s => (
          <tr key={s.id} style={{
            background: s.buyIn === "blocker" ? "#ff6b6b33"
              : s.buyIn === "champion" ? "#1de68222"
                : s.openTasks > 0 ? "#FFD70022"
                  : new Date(s.lastContact) < new Date(Date.now() - 18 * 24 * 3600 * 1000) ? "#FFD70022"
                    : "transparent"
          }}>
            <td style={{ fontWeight: 900, color: "#FFD700", cursor: "pointer" }}
              onClick={() => setSelected(s)}>{s.name}</td>
            <td>{s.type}</td>
            <td>{s.owner}</td>
            <td style={{ fontWeight: 700 }}>{s.power}</td>
            <td style={{ fontWeight: 700 }}>{s.alignment}</td>
            <td>
              <span style={{
                color: buyInLevels.find(b => b.key === s.buyIn)?.color,
                fontWeight: 900, fontSize: 17, marginRight: 7
              }}>
                {buyInLevels.find(b => b.key === s.buyIn)?.label}
              </span>
              <button style={{
                marginLeft: 2, border: "none", borderRadius: 5, background: "#1de682", color: "#232a2e", fontWeight: 900, cursor: "pointer", padding: "1px 7px"
              }} title="Increase buy-in"
                onClick={() => updateBuyIn(s, true)}><FaArrowUp /></button>
              <button style={{
                marginLeft: 2, border: "none", borderRadius: 5, background: "#ff6b6b", color: "#fff", fontWeight: 900, cursor: "pointer", padding: "1px 7px"
              }} title="Decrease buy-in"
                onClick={() => updateBuyIn(s, false)}><FaArrowDown /></button>
            </td>
            <td style={{ fontSize: 15 }}>{s.keyMessage}</td>
            <td>{s.lastContact}</td>
            <td style={{ color: s.openTasks > 0 ? "#FFD700" : "#1de682", fontWeight: 800 }}>{s.openTasks}</td>
            <td>
              <button onClick={() => handleEdit(s)}
                style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 16, cursor: "pointer" }}>
                <FaEdit />
              </button>
            </td>
            <td>
              <button onClick={() => handleDelete(s.id)}
                style={{ background: "#ff6b6b", color: "#fff", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 16, cursor: "pointer" }}>
                <FaTrash />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #232a2e, #1d2227 110%)",
      fontFamily: 'Segoe UI, sans-serif', color: '#fff', borderRadius: "36px", boxShadow: "0 8px 42px #1a1d20"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20, padding: 10, borderBottom: "2px solid #FFD700" }}>
        <FaUsers size={46} color="#FFD700" style={{ marginRight: 17, filter: "drop-shadow(0 3px 10px #FFD70033)" }} />
        <div>
          <div style={{
            fontWeight: 900, fontSize: 34, letterSpacing: 2, marginBottom: 3, color: "#FFD700", textShadow: "0 3px 14px #FFD70044"
          }}>
            STAKEHOLDER INTELLIGENCE COMMAND CENTER
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>
            CourtEvo Vero: Boardroom power, stakeholder mastery, scenario-ready.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
  display: "flex", alignItems: "center", gap: 13,
  background: "#232a2e", borderRadius: 12, padding: "10px 14px",
  boxShadow: "0 1px 8px #FFD70055"
}}>
  <FaSearch color="#FFD700" style={{ marginRight: 4 }} />
  <input
    type="text"
    value={search}
    onChange={e => setSearch(e.target.value)}
    placeholder="Find stakeholder..."
    style={{
      border: "none", outline: "none", background: "transparent",
      color: "#FFD700", fontWeight: 700, fontSize: 16, width: 170
    }}
  />
  <select
    value={filterType}
    onChange={e => setFilterType(e.target.value)}
    style={{
      marginLeft: 9, background: "#1a1d20", color: "#FFD700", borderRadius: 8,
      border: "none", fontWeight: 700, fontSize: 16, padding: "6px 14px", boxShadow: "0 2px 8px #FFD70022", cursor: "pointer"
    }}
  >
    <option value="">All Types</option>
    {types.map(t => <option key={t} value={t}>{t}</option>)}
  </select>
</div>

      </div>
      {/* BOARDROOM PULSE PANEL */}
      <div style={{ background: "#232a2e", borderRadius: 18, margin: "10px 0 19px 0", padding: 18, display: "flex", alignItems: "center", gap: 38, boxShadow: "0 1px 10px #FFD70022" }}>
        <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 17 }}><FaBullhorn /> Boardroom Pulse:</div>
        <div>
          <b>Champions:</b> {champions.slice(0, 3).map(s => <span style={{ color: "#1de682", fontWeight: 800, margin: "0 8px" }} key={s.id}>{s.name}</span>)}
        </div>
        <div>
          <b>Blockers:</b> {blockers.slice(0, 3).map(s => <span style={{ color: "#ff6b6b", fontWeight: 800, margin: "0 8px" }} key={s.id}>{s.name}</span>)}
        </div>
        <div>
          <b>Overdue Contacts:</b> <span style={{ color: "#FFD700", fontWeight: 800 }}>{overdue.length}</span>
        </div>
        <div style={{ color: "#1de682", fontWeight: 800, marginLeft: 22 }}>AI Reco: {aiReco}</div>
      </div>
      {/* CLUSTER ANALYSIS */}
      <div style={{ display: "flex", gap: 44, marginBottom: 13 }}>
        {Object.entries(clusterStats).map(([type, stats]) => (
          <div key={type} style={{
            background: "#232a2e", borderRadius: 16, padding: "13px 18px",
            boxShadow: "0 2px 12px #FFD70022", minWidth: 130
          }}>
            <b style={{ color: "#FFD700", fontSize: 15 }}>{type}</b>
            <div><span style={{ color: "#1de682" }}>Champions:</span> {stats.champion || 0}</div>
            <div><span style={{ color: "#FFD700" }}>Potential:</span> {stats.potential || 0}</div>
            <div><span style={{ color: "#ff6b6b" }}>Blockers:</span> {stats.blocker || 0}</div>
            <div><span style={{ color: "#f6a700" }}>Risk:</span> {stats.risk || 0}</div>
          </div>
        ))}
      </div>
      {/* MAIN ROW */}
      <div style={{ display: "flex", gap: 38, marginBottom: 26 }}>
        {/* POWER MAP */}
        <div style={{
          background: "#232a2e", borderRadius: 26, padding: 18, boxShadow: "0 6px 28px #1a1d20", minWidth: 700, maxWidth: 760
        }}>
          <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 22, marginBottom: 13 }}>Influence/Alignment Power Map</div>
          <InfluenceMap />
        </div>
        {/* RIGHT SIDEBAR – PROFILE CARD */}
        <div style={{
          background: "linear-gradient(135deg, #232a2e, #FFD70022 70%)", borderRadius: 24, padding: 22, minWidth: 340, maxWidth: 400,
          boxShadow: "0 1px 18px #FFD70044", display: "flex", flexDirection: "column", alignItems: "center"
        }}>
          {selected ? (
            <>
              <div style={{
                background: "#FFD700", borderRadius: "50%", width: 70, height: 70, display: "flex",
                alignItems: "center", justifyContent: "center", marginBottom: 13, boxShadow: "0 0 18px #FFD70055"
              }}>
                <span style={{ fontWeight: 900, fontSize: 32, color: "#232a2e" }}>
                  {selected.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div style={{ fontWeight: 900, fontSize: 22, color: "#FFD700" }}>{selected.name}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#1de682", margin: "6px 0" }}>{selected.type}</div>
              <div style={{ color: "#FFD700", fontSize: 15, margin: "3px 0" }}><FaUser /> {selected.owner}</div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Power: {selected.power} / Align: {selected.alignment}</div>
              <div style={{ margin: "9px 0", fontWeight: 700 }}>
                Buy-in: <span style={{
                  color: buyInLevels.find(b => b.key === selected.buyIn)?.color,
                  fontWeight: 800, marginLeft: 5
                }}>{buyInLevels.find(b => b.key === selected.buyIn)?.label}</span>
              </div>
              <div style={{ margin: "7px 0", fontSize: 14 }}>
                <FaEnvelope /> Last Contact: <b>{selected.lastContact}</b>
              </div>
              <div style={{ margin: "7px 0", fontSize: 14 }}>
                <FaBullhorn /> Key Msg: <b>{selected.keyMessage}</b>
              </div>
              <div style={{ margin: "7px 0", fontSize: 14 }}>
                <FaStickyNote /> Notes: <b>{selected.notes}</b>
              </div>
              <div style={{ margin: "7px 0" }}>
                <b>Actions:</b>
                <ul style={{ margin: "3px 0", fontSize: 13 }}>
                  {(selected.actions || []).map((a, i) =>
                    <li key={i} style={{ textDecoration: a.complete ? "line-through" : "none" }}>
                      <input type="checkbox" checked={a.complete} onChange={() => toggleAction(selected, i)} />
                      {a.desc}
                      <button style={{
                        marginLeft: 5, background: "#ff6b6b", color: "#fff", borderRadius: 5, border: "none", fontWeight: 700, padding: "1px 6px", cursor: "pointer"
                      }} onClick={() => removeAction(selected, i)}><FaTrash size={12} /></button>
                    </li>
                  )}
                </ul>
              </div>
              <div style={{ margin: "9px 0" }}>
                <b>Engagement:</b>{" "}
                {["excellent", "good", "fair", "poor"].map(lvl =>
                  <button key={lvl} style={{
                    background: engagementMap[lvl], color: "#232a2e", borderRadius: 5, border: "none", fontWeight: 700, margin: "0 4px", padding: "2px 8px", cursor: "pointer"
                  }} onClick={() => addEngagement(selected, lvl)}>{lvl}</button>
                )}
              </div>
              <div style={{ margin: "8px 0" }}>
                <b>Timeline:</b>
                <ul style={{ margin: 0, fontSize: 13 }}>
                  {(selected.timeline || []).map((t, i) =>
                    <li key={i}><FaArrowRight /> {t.date}: <b>{t.event}</b></li>
                  )}
                </ul>
              </div>
              <div style={{ marginTop: 18 }}>
                <button style={{
                  background: "#FFD700", color: "#232a2e", borderRadius: 10, fontWeight: 700, border: "none", padding: "7px 22px", boxShadow: "0 2px 12px 0 #FFD70055", marginRight: 7
                }}>
                  Export Profile PDF
                </button>
                <button style={{
                  background: "#1de682", color: "#232a2e", borderRadius: 10, fontWeight: 700, border: "none", padding: "7px 22px", boxShadow: "0 2px 12px 0 #1de68255"
                }}>
                  Add Note
                </button>
              </div>
            </>
          ) : (
            <div style={{ margin: "25px 0 0 0", color: "#FFD700", fontSize: 18, fontWeight: 800 }}>
              Select a stakeholder<br />to see full profile.
            </div>
          )}
        </div>
      </div>
      {/* TABLE, CRUD, FILTERS, ETC—ADD FROM EARLIER IMPLEMENTATION AS NEEDED */}
      {/* Footer */}
      <div style={{
        marginTop: 38,
        fontSize: 16,
        opacity: 0.8,
        textAlign: "center",
        fontWeight: 700,
        color: "#FFD700",
        letterSpacing: 1
      }}>
        Proprietary to CourtEvo Vero. This is what true stakeholder mastery looks like. <span style={{ color: "#1de682", fontWeight: 900 }}></span>
      </div>
    </div>
  );
}
