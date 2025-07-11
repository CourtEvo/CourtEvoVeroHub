import React, { useState } from "react";
import {
  FaHandshake, FaFire, FaChartBar, FaUserTie, FaBullhorn, FaPlusCircle, FaEdit, FaTrash,
  FaRegClock, FaArrowUp, FaCloudDownloadAlt, FaSearch, FaFilter, FaRegLightbulb, FaRegStar,
  FaCheckCircle, FaTimesCircle, FaFolderOpen, FaFileAlt, FaRegCommentDots
} from "react-icons/fa";

const pipelineStages = ["lead", "negotiation", "contracted", "active", "renewal", "lost"];
const statusLabels = {
  lead: "Lead", negotiation: "Negotiation", contracted: "Contracted",
  active: "Active", renewal: "Renewal", lost: "Lost"
};
const statusColors = {
  lead: "#FFD700", negotiation: "#1de682", contracted: "#283E51",
  active: "#FFD700", renewal: "#1de682", lost: "#ff6b6b"
};
const tiers = ["Main", "Premium", "Official", "Partner", "Supplier"];
const types = ["Local", "National", "Global", "Media", "Apparel", "Event"];
const initialSponsors = [
  {
    id: 1,
    name: "GoldBet",
    tier: "Main",
    type: "Global",
    status: "active",
    value: 180000,
    owner: "Ivan Babic",
    lastContact: "2024-06-14",
    dealEnds: "2025-06-30",
    activation: [
      { desc: "Logo on center court", done: true, staff: "Marketing" },
      { desc: "Season launch event", done: false, staff: "Events" },
      { desc: "Player social post", done: true, staff: "Media" }
    ],
    engagement: 7,
    health: 8,
    notes: "VIP engagement high, at-risk for renewal (CEO leaving)",
    scenario: "Sponsor exits mid-season",
    timeline: [
      { date: "2024-05-05", event: "Deal signed", icon: <FaCheckCircle color="#1de682" /> },
      { date: "2024-06-01", event: "Activation: Center court logo", icon: <FaBullhorn color="#FFD700" /> }
    ],
    attachments: ["2024-Contract.pdf"]
  },
  {
    id: 2,
    name: "TechNova",
    tier: "Official",
    type: "Apparel",
    status: "negotiation",
    value: 40000,
    owner: "Luka Simic",
    lastContact: "2024-05-22",
    dealEnds: "2024-12-31",
    activation: [
      { desc: "Youth clinic event", done: false, staff: "Academy" }
    ],
    engagement: 4,
    health: 5,
    notes: "",
    scenario: "",
    timeline: [
      { date: "2024-05-18", event: "Proposal received", icon: <FaRegLightbulb color="#FFD700" /> }
    ],
    attachments: []
  }
];

// Calculate sponsor "health": (engagement + activation % + time left + value scaling)
function getSponsorHealth(s) {
  let engagement = s.engagement || 5;
  let activation = s.activation && s.activation.length
    ? s.activation.filter(a => a.done).length / s.activation.length * 10 : 5;
  let monthsLeft = s.dealEnds ? Math.max(0, (new Date(s.dealEnds) - new Date()) / (1000 * 3600 * 24 * 30)) : 6;
  let time = Math.min(10, monthsLeft);
  let valueScore = Math.min(10, s.value / 10000);
  let base = (engagement + activation + time + valueScore) / 4;
  if (s.status === "lost") base -= 4;
  if (s.status === "renewal") base += 1;
  return Math.round(Math.max(1, Math.min(10, base)));
}

// Pipeline forecast: value by stage
function getPipelineForecast(sponsors) {
  let data = {};
  pipelineStages.forEach(stg => data[stg] = 0);
  sponsors.forEach(s => data[s.status] += s.value || 0);
  return data;
}

// Boardroom Sponsor Alert
function getSponsorAlerts(sponsors) {
  return sponsors.filter(
    s => s.status === "active" && (new Date(s.dealEnds) < new Date(Date.now() + 90 * 24 * 3600 * 1000) || s.engagement < 5)
  );
}

// Forecast visual
function PipelineForecastChart({ sponsors }) {
  const data = getPipelineForecast(sponsors);
  const max = Math.max(...Object.values(data));
  return (
    <div style={{ background: "#232a2e", borderRadius: 12, padding: "10px 18px", margin: "14px 0", boxShadow: "0 2px 8px #FFD70022" }}>
      <b style={{ color: "#FFD700" }}><FaChartBar /> Pipeline Value Forecast</b>
      <div style={{ marginTop: 10, display: "flex", gap: 18 }}>
        {pipelineStages.map(stg => (
          <div key={stg} style={{
            background: statusColors[stg], color: "#232a2e", borderRadius: 7, fontWeight: 900,
            width: 40, height: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
            boxShadow: "0 2px 8px #FFD70033", position: "relative"
          }} title={statusLabels[stg]}>
            <span style={{
              position: "absolute", top: 2, left: 0, right: 0, textAlign: "center", color: "#1a1d20", fontWeight: 700, fontSize: 14
            }}>{Math.round(data[stg] / 1000)}k</span>
            <div style={{
              background: "#232a2e", width: "90%", height: `${Math.max(15, (data[stg] / (max || 1)) * 40)}%`, borderRadius: 5, margin: "0 auto 6px auto"
            }}></div>
            <span style={{ fontSize: 14 }}>{statusLabels[stg].charAt(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Kanban Board: Sponsors by stage
function PipelineKanban({ sponsors, onMove }) {
  return (
    <div style={{
      display: "flex", gap: 15, background: "#232a2e", borderRadius: 18, padding: "15px 12px", boxShadow: "0 2px 8px #FFD70022", marginBottom: 17
    }}>
      {pipelineStages.map(stg => (
        <div key={stg} style={{
          background: "#283E51", borderRadius: 14, minWidth: 140, maxWidth: 220, flex: "1 1 150px", padding: "6px 6px 8px 6px",
          boxShadow: `0 1px 10px ${statusColors[stg]}22`
        }}>
          <div style={{
            color: statusColors[stg], fontWeight: 900, fontSize: 16, textAlign: "center", marginBottom: 6, letterSpacing: 1
          }}>{statusLabels[stg]}</div>
          {(sponsors.filter(s => s.status === stg)).map(s => (
            <div key={s.id}
              style={{
                background: "#232a2e", border: `2.5px solid ${statusColors[stg]}`,
                borderRadius: 11, padding: "8px 6px", marginBottom: 7, fontWeight: 700,
                cursor: "pointer", color: "#FFD700", transition: "all 0.16s"
              }}
              title={s.name}
              onClick={() => onMove && onMove(s, stg)}
            >
              {s.name}
              <span style={{ float: "right", color: "#1de682", fontWeight: 900 }}>{getSponsorHealth(s)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function StrategicSponsorshipEngine() {
  const [sponsors, setSponsors] = useState(initialSponsors);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState(null);

  // CRUD
  function handleEdit(s) { setEditing(s); setForm({ ...s }); setAdding(false); }
  function handleDelete(id) { setSponsors(ss => ss.filter(s => s.id !== id)); setEditing(null); setSelected(null); }
  function handleSaveEdit() {
    setSponsors(ss => ss.map(s => s.id === editing.id ? { ...form, id: editing.id } : s));
    setEditing(null); setSelected(null);
  }
  function handleAddNew() {
    setSponsors(ss => [...ss, { ...form, id: Date.now(), activation: [], engagement: 5, health: 5, timeline: [], attachments: [] }]);
    setAdding(false);
  }
  function toggleActivation(s, i) {
    setSponsors(ss => ss.map(sp =>
      sp.id === s.id
        ? { ...sp, activation: sp.activation.map((a, idx) => idx === i ? { ...a, done: !a.done } : a) }
        : sp
    ));
  }
  function addActivation(s, desc) {
    setSponsors(ss => ss.map(sp =>
      sp.id === s.id
        ? { ...sp, activation: [...sp.activation, { desc, done: false, staff: "—" }] }
        : sp
    ));
  }
  function moveSponsorStage(s, toStage) {
    // Click-move: next status in pipeline (or reset if already at the stage)
    const current = pipelineStages.indexOf(s.status);
    const next = (current + 1) % pipelineStages.length;
    setSponsors(ss => ss.map(sp =>
      sp.id === s.id
        ? { ...sp, status: pipelineStages[next], timeline: [...(sp.timeline || []), { date: new Date().toISOString().slice(0, 10), event: "Stage: " + statusLabels[pipelineStages[next]], icon: <FaArrowUp color="#FFD700" /> }] }
        : sp
    ));
  }
  function exportCSV() {
    const header = "Name,Tier,Type,Status,Value,Owner,LastContact,DealEnds,Engagement,Health,Notes,Scenario\n";
    const body = sponsors.map(s =>
      [
        s.name, s.tier, s.type, s.status, s.value, s.owner, s.lastContact, s.dealEnds, s.engagement, getSponsorHealth(s), s.notes, s.scenario
      ].join("|")
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sponsor_engine.csv";
    link.click();
  }

  // Filtering
  const filtered = sponsors.filter(s =>
    (!filterTier || s.tier === filterTier) &&
    (!filterType || s.type === filterType) &&
    (!filterStatus || s.status === filterStatus) &&
    (search === "" || s.name.toLowerCase().includes(search.toLowerCase()) || s.owner.toLowerCase().includes(search.toLowerCase()))
  );

  const alerts = getSponsorAlerts(sponsors);

  // --- Main ---
  return (
    <div style={{
      background: "#232a2e", color: "#fff", fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh", borderRadius: "34px", padding: "38px 26px 20px 26px", boxShadow: "0 8px 34px 0 #15171a"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 15, flexWrap: "wrap" }}>
        <FaHandshake size={44} color="#FFD700" style={{ marginRight: 17 }} />
        <div>
          <div style={{
            fontWeight: 900, fontSize: 33, letterSpacing: 1, marginBottom: 4, color: "#FFD700"
          }}>
            STRATEGIC PARTNERSHIP & SPONSORSHIP COMMAND CENTER
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 17 }}>
            Pipeline. Health. Activation. Boardroom-grade commercial control.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <FaSearch color="#FFD700" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Find sponsor..." style={{ border: "none", outline: "none", background: "transparent", color: "#FFD700", fontWeight: 700, fontSize: 17, width: 160, marginLeft: 7 }} />
          <FaFilter color="#FFD700" />
          <select
            value={filterTier}
            onChange={e => setFilterTier(e.target.value)}
            style={{
              background: "#1a1d20", color: "#FFD700", borderRadius: 8,
              border: "none", fontWeight: 700, fontSize: 16, padding: "6px 12px", boxShadow: "0 2px 8px #FFD70022", cursor: "pointer"
            }}
          >
            <option value="">All Tiers</option>
            {tiers.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{
              background: "#1a1d20", color: "#FFD700", borderRadius: 8,
              border: "none", fontWeight: 700, fontSize: 16, padding: "6px 12px", boxShadow: "0 2px 8px #FFD70022", cursor: "pointer"
            }}
          >
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              background: "#1a1d20", color: "#FFD700", borderRadius: 8,
              border: "none", fontWeight: 700, fontSize: 16, padding: "6px 12px", boxShadow: "0 2px 8px #FFD70022", cursor: "pointer"
            }}
          >
            <option value="">All Status</option>
            {pipelineStages.map(stg => (
              <option key={stg} value={stg}>{statusLabels[stg]}</option>
            ))}
          </select>
        </div>
        <button
          style={{
            background: "#FFD700", color: "#232a2e", borderRadius: 13, fontWeight: 900,
            border: "none", padding: "11px 23px", marginLeft: 24, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #FFD70055"
          }}
          onClick={exportCSV}
        >
          <FaCloudDownloadAlt style={{ marginRight: 9 }} /> Export CSV
        </button>
      </div>
      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{
          background: "#ff6b6b22", color: "#ff6b6b", fontWeight: 900, borderRadius: 12,
          padding: "13px 18px", marginBottom: 12, fontSize: 16, display: "flex", alignItems: "center", gap: 18
        }}>
          <FaFire color="#ff6b6b" size={20} /> At-Risk: {alerts.map(a => a.name).join(", ")}
        </div>
      )}
      <PipelineForecastChart sponsors={sponsors} />
      {/* KANBAN PIPELINE */}
      <PipelineKanban sponsors={sponsors} onMove={moveSponsorStage} />
      {/* PIPELINE TABLE */}
      <div style={{
        minWidth: 470, maxWidth: 900, flex: "1 1 800px", background: "#283E51", borderRadius: 22, padding: 18, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, overflowX: "auto"
      }}>
        <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 18, marginBottom: 9 }}>All Sponsors/Partners</div>
        <button
          style={{
            background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 900,
            border: "none", padding: "8px 20px", fontSize: 16, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 10px 0 #1de68266",
            marginBottom: 11
          }}
          onClick={() => { setAdding(true); setForm({ status: "lead", activation: [], engagement: 5, health: 5 }); setEditing(null); }}>
          <FaPlusCircle style={{ marginRight: 8 }} /> Add Sponsor/Partner
        </button>
        {(adding || editing) &&
          <div style={{ background: "#FFD70022", color: "#232a2e", borderRadius: 10, padding: "14px 12px", marginBottom: 13 }}>
            <form onSubmit={e => { e.preventDefault(); adding ? handleAddNew() : handleSaveEdit(); }}>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <b>Name:</b>
                  <input type="text" value={form.name || ""} required
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700, width: 110 }} />
                </div>
                <div>
                  <b>Tier:</b>
                  <select value={form.tier || ""}
                    onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    <option value="">Select</option>
                    {tiers.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <b>Type:</b>
                  <select value={form.type || ""}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    <option value="">Select</option>
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <b>Status:</b>
                  <select value={form.status || "lead"}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    {pipelineStages.map(stg => (
                      <option key={stg} value={stg}>{statusLabels[stg]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <b>Owner:</b>
                  <input type="text" value={form.owner || ""} required
                    onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700, width: 80 }} />
                </div>
                <div>
                  <b>Value (€):</b>
                  <input type="number" min={0} value={form.value || 0}
                    onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 80, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Engage (1-10):</b>
                  <input type="number" min={1} max={10} value={form.engagement || 5}
                    onChange={e => setForm(f => ({ ...f, engagement: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 55, fontWeight: 700 }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", marginTop: 9 }}>
                <div>
                  <b>Last Contact:</b>
                  <input type="date" value={form.lastContact || ""}
                    onChange={e => setForm(f => ({ ...f, lastContact: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }} />
                </div>
                <div>
                  <b>Deal Ends:</b>
                  <input type="date" value={form.dealEnds || ""}
                    onChange={e => setForm(f => ({ ...f, dealEnds: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }} />
                </div>
                <div>
                  <b>Scenario Link:</b>
                  <input type="text" value={form.scenario || ""}
                    onChange={e => setForm(f => ({ ...f, scenario: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 90, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Notes:</b>
                  <input type="text" value={form.notes || ""}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 90, fontWeight: 700 }} />
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
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
        <table style={{ width: "100%", color: "#fff", fontSize: 15, borderCollapse: "collapse", fontFamily: "Segoe UI" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Tier</th>
              <th>Type</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Value</th>
              <th>Engage</th>
              <th>Ends</th>
              <th>Health</th>
              <th>Edit</th>
              <th>Del</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{
                background: s.status === "lost" ? "#ff6b6b22"
                  : s.status === "renewal" ? "#FFD70022"
                    : getSponsorHealth(s) >= 8 ? "#FFD70044"
                      : "transparent"
              }}>
                <td style={{ fontWeight: 900, color: "#FFD700", cursor: "pointer" }}
                  onClick={() => setSelected(s)}>{s.name}</td>
                <td>{s.tier}</td>
                <td>{s.type}</td>
                <td>
                  <span style={{
                    background: statusColors[s.status], color: "#232a2e", borderRadius: 7, padding: "2px 11px", fontWeight: 900, fontSize: 15
                  }}>{statusLabels[s.status].toUpperCase()}</span>
                </td>
                <td>{s.owner}</td>
                <td>€{s.value}</td>
                <td style={{ color: s.engagement >= 8 ? "#1de682" : "#FFD700", fontWeight: 900 }}>{s.engagement}</td>
                <td>{s.dealEnds}</td>
                <td>
                  <span style={{
                    background: getSponsorHealth(s) >= 8 ? "#1de682" : getSponsorHealth(s) >= 6 ? "#FFD700" : "#ff6b6b",
                    color: "#232a2e", borderRadius: 7, padding: "2px 10px", fontWeight: 900
                  }}>
                    {getSponsorHealth(s)}
                  </span>
                </td>
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
      {/* SIDEBAR: Sponsor Profile & Activation */}
      <div style={{
        minWidth: 355, maxWidth: 475, background: "#232a2e", borderRadius: 22, padding: 26, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, height: "100%"
      }}>
        <b style={{ color: "#FFD700", fontWeight: 900, fontSize: 19 }}>Sponsor/Partner Profile</b>
        {selected ? (
          <>
            <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 21, margin: "10px 0 8px 0" }}>{selected.name}</div>
            <div><b>Tier:</b> {selected.tier}</div>
            <div><b>Type:</b> {selected.type}</div>
            <div><b>Status:</b> <span style={{
              background: statusColors[selected.status], color: "#232a2e", borderRadius: 7, padding: "2px 11px", fontWeight: 900, fontSize: 15
            }}>{statusLabels[selected.status].toUpperCase()}</span></div>
            <div><b>Owner:</b> {selected.owner}</div>
            <div><b>Value:</b> €{selected.value}</div>
            <div><b>Engagement:</b> {selected.engagement}</div>
            <div><b>Health:</b> <span style={{
              background: getSponsorHealth(selected) >= 8 ? "#1de682" : getSponsorHealth(selected) >= 6 ? "#FFD700" : "#ff6b6b",
              color: "#232a2e", borderRadius: 7, padding: "2px 9px", fontWeight: 900
            }}>{getSponsorHealth(selected)}</span></div>
            <div><b>Deal Ends:</b> {selected.dealEnds}</div>
            <div><b>Scenario:</b> {selected.scenario || <span style={{ color: "#1de682" }}>None</span>}</div>
            <div><b>Notes:</b> {selected.notes || <span style={{ color: "#1de682" }}>None</span>}</div>
            {/* Attachments */}
            <div style={{ marginTop: 7 }}>
              <b>Attachments:</b>{" "}
              {selected.attachments?.length > 0
                ? selected.attachments.map((att, i) =>
                  <span key={i} style={{ color: "#FFD700", marginRight: 9 }}><FaFileAlt style={{ marginRight: 3 }} />{att}</span>)
                : <span style={{ color: "#1de682" }}>None</span>}
              {/* (File upload UI could go here) */}
            </div>
            {/* Timeline */}
            <div style={{ marginTop: 11 }}>
              <b>Timeline:</b>
              <ul style={{ margin: 0, fontSize: 15 }}>
                {(selected.timeline || []).map((t, i) =>
                  <li key={i} style={{ color: "#FFD700" }}>
                    <span>{t.icon}</span> <b>{t.date}:</b> {t.event}
                  </li>
                )}
              </ul>
            </div>
            {/* Activation Tracker */}
            <div style={{ marginTop: 11 }}>
              <b>Activation Board:</b>
              <ul style={{ margin: 0, fontSize: 15 }}>
                {(selected.activation || []).map((a, i) =>
                  <li key={i}
                    style={{
                      textDecoration: a.done ? "line-through" : "none", color: a.done ? "#1de682" : "#FFD700", fontWeight: 800, cursor: "pointer"
                    }}
                    onClick={() => toggleActivation(selected, i)}
                  >
                    {a.desc} ({a.staff}) {a.done ? <FaCheckCircle /> : <FaRegClock />}
                  </li>
                )}
              </ul>
              {/* Add activation */}
              <div style={{ marginTop: 7 }}>
                <input
                  type="text"
                  placeholder="Add activation..."
                  style={{ borderRadius: 7, padding: "5px 12px", width: 160, marginRight: 6 }}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      addActivation(selected, e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div style={{ margin: "15px 0 11px 0", color: "#FFD700", fontSize: 17, fontWeight: 900 }}>
            Select a sponsor to see full profile.
          </div>
        )}
      </div>
      {/* Footer */}
      <div style={{
        marginTop: 34,
        fontSize: 15,
        opacity: 0.8,
        textAlign: "center",
        color: "#FFD700",
        fontWeight: 900
      }}>
        Proprietary to CourtEvo Vero. True commercial command.
      </div>
    </div>
  );
}
