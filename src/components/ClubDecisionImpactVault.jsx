import React, { useState } from "react";
import {
  FaGavel, FaPlusCircle, FaEdit, FaTrash, FaCloudDownloadAlt, FaUserTie, FaShieldAlt,
  FaUsers, FaChartBar, FaDollarSign, FaStar, FaUserSecret, FaThumbtack, FaFire, FaExclamationTriangle
} from "react-icons/fa";

const types = [
  { key: "financial", label: "Financial", icon: <FaDollarSign /> },
  { key: "sporting", label: "Sporting", icon: <FaChartBar /> },
  { key: "governance", label: "Governance", icon: <FaShieldAlt /> },
  { key: "hr", label: "HR", icon: <FaUsers /> },
  { key: "commercial", label: "Commercial", icon: <FaStar /> },
  { key: "youth", label: "Youth", icon: <FaUsers /> }
];
const directors = ["Marko Proleta", "Tomislav Pavic", "Ivan Babic", "Luka Simic", "Ante Kovac"];

function nextDecisionId(arr) {
  return Math.max(0, ...arr.map(d => d.id)) + 1;
}

export default function ClubDecisionImpactVault() {
  const [decisions, setDecisions] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");
  const [filterDirector, setFilterDirector] = useState("");
  const [showHeatmap, setShowHeatmap] = useState(false);

  // CRUD
  function handleEdit(d) {
    setEditing(d);
    setForm({ ...d });
    setAdding(false);
  }
  function handleDelete(id) {
    setDecisions(ds => ds.filter(d => d.id !== id));
    setEditing(null);
  }
  function handleSaveEdit() {
    setDecisions(ds => ds.map(d => d.id === editing.id ? { ...form, id: editing.id } : d));
    setEditing(null);
  }
  function handleAddNew() {
    setDecisions(ds => [...ds, { ...form, id: Date.now() }]);
    setAdding(false);
  }
  function togglePin(id) {
    setDecisions(ds => ds.map(d => d.id === id ? { ...d, pinned: !d.pinned } : d));
  }

  // Export as CSV
  function exportCSV() {
    const header = "Type,Date,By,Decision,Predicted Impact,Actual Impact,Outcome Gap,Reflection,Confidential,Pinned\n";
    const body = decisions.map(d =>
      [
        d.type, d.date, d.by, d.decision, d.predictedImpact, d.actualImpact, d.actualImpact - d.predictedImpact,
        d.reflection, d.confidential ? "yes" : "no", d.pinned ? "yes" : "no"
      ].join(",")
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "decision_impact_vault.csv";
    link.click();
  }

  // Filter/search
  let filtered = decisions.filter(d =>
    (!filterType || d.type === filterType) &&
    (!filterDirector || d.by === filterDirector) &&
    (search === "" || d.decision.toLowerCase().includes(search.toLowerCase()) || d.by.toLowerCase().includes(search.toLowerCase()))
  );

  // Pinned to top
  filtered = [...filtered.filter(d => d.pinned), ...filtered.filter(d => !d.pinned)];

  // Impact Heatmap Data (for last 10)
  const impactHistory = decisions.slice(-10);
  const gaps = impactHistory.map(d => d.actualImpact - d.predictedImpact);

  // Accountability by director
  const accountability = {};
  directors.forEach(dir => {
    const their = decisions.filter(d => d.by === dir);
    const onTarget = their.filter(d => Math.abs((d.actualImpact || 0) - (d.predictedImpact || 0)) <= 1).length;
    accountability[dir] = {
      total: their.length,
      avgGap: their.length ? Math.round(their.reduce((a, d) => a + Math.abs((d.actualImpact || 0) - (d.predictedImpact || 0)), 0) / their.length * 10) / 10 : 0,
      onTarget,
      percent: their.length ? Math.round(100 * onTarget / their.length) : 0
    };
  });

  // Tag Cloud for Reflections
  const allTags = {};
  decisions.forEach(d => {
    if (d.reflection) {
      d.reflection.split(" ").forEach(word => {
        if (word.length > 4) allTags[word.toLowerCase()] = (allTags[word.toLowerCase()] || 0) + 1;
      });
    }
  });

  // Strategic Alerts
  const negGaps = {};
  types.forEach(t => {
    negGaps[t.key] = decisions.filter(d => d.type === t.key && (d.actualImpact - d.predictedImpact) < -2).length;
  });
  const alertArea = Object.entries(negGaps).find(([k, v]) => v >= 2);

  // Too many unreviewed (no actualImpact)
  const unreviewed = decisions.filter(d => !d.actualImpact).length;

  return (
    <div style={{
      background: "#232a2e", color: "#fff", fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh", borderRadius: "24px", padding: "38px 28px 18px 28px", boxShadow: "0 6px 32px 0 #1a1d20"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <FaGavel size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div style={{
            fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 4, color: "#FFD700",
          }}>
            CLUB DECISION IMPACT VAULT
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            Strategic boardroom memory, impact heatmap, and accountability—all in one place.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          style={{
            background: "#FFD700", color: "#232a2e", borderRadius: 10, fontWeight: 700,
            border: "none", padding: "10px 18px", marginRight: 10, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #2a2d31",
          }}
          onClick={exportCSV}
        >
          <FaCloudDownloadAlt style={{ marginRight: 7 }} /> Export CSV
        </button>
        <button
          style={{
            background: "#1de682", color: "#232a2e", borderRadius: 10, fontWeight: 700,
            border: "none", padding: "10px 18px", fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #2a2d31",
          }}
          onClick={() => { setAdding(true); setForm({ confidential: false, pinned: false }); setEditing(null); }}
        >
          <FaPlusCircle style={{ marginRight: 7 }} /> Add Decision
        </button>
      </div>
      {/* ALERTS */}
      {(alertArea || unreviewed > 3) && (
        <div style={{ background: "#FFD70022", color: "#FFD700", fontWeight: 700, borderRadius: 10, padding: "11px 19px", marginBottom: 17 }}>
          <FaExclamationTriangle /> Strategic Alert: {alertArea ? <>Multiple negative outcome gaps in <b>{types.find(t => t.key === alertArea[0])?.label}</b> decisions.</> : null}
          {unreviewed > 3 && <> &bull; <b>{unreviewed}</b> decisions missing actual impact. Review required.</>}
        </div>
      )}
      {/* FLEX ROW */}
      <div style={{ display: "flex", gap: 36, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* MAIN DECISION TABLE */}
        <div style={{
          minWidth: 390, maxWidth: 610, flex: "1 1 500px", background: "#283E51", borderRadius: 22, padding: 22, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, overflowX: "auto"
        }}>
          {/* Filters */}
          <div style={{ marginBottom: 10 }}>
            <b>Type:</b>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ marginLeft: 8, borderRadius: 6, padding: "4px 10px" }}>
              <option value="">All</option>
              {types.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
            <b style={{ marginLeft: 14 }}>Director:</b>
            <select value={filterDirector} onChange={e => setFilterDirector(e.target.value)} style={{ marginLeft: 8, borderRadius: 6, padding: "4px 10px" }}>
              <option value="">All</option>
              {directors.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <b style={{ marginLeft: 12 }}>Search:</b>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Decision/By"
              style={{ marginLeft: 8, borderRadius: 6, padding: "4px 10px", width: 120 }} />
            <button
              onClick={() => setShowHeatmap(h => !h)}
              style={{ marginLeft: 12, background: "#FFD700", color: "#232a2e", borderRadius: 7, padding: "4px 14px", fontWeight: 700, border: "none", cursor: "pointer" }}>
              {showHeatmap ? "Hide Heatmap" : "Impact Heatmap"}
            </button>
          </div>
          {(adding || editing) &&
            <div style={{ background: "#FFD70022", color: "#232a2e", borderRadius: 11, padding: "13px 11px", marginBottom: 13 }}>
              <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 7 }}>{adding ? "Add New Decision" : "Edit Decision"}</div>
              <form onSubmit={e => { e.preventDefault(); adding ? handleAddNew() : handleSaveEdit(); }}>
                <div>
                  <b>Type:</b>
                  <select value={form.type || ""} required
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }}>
                    <option value="">Select...</option>
                    {types.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <b>Date:</b>
                  <input type="date" value={form.date || ""} required
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }} />
                </div>
                <div>
                  <b>By:</b>
                  <input type="text" value={form.by || ""} required
                    onChange={e => setForm(f => ({ ...f, by: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }} />
                </div>
                <div>
                  <b>Decision:</b>
                  <input type="text" value={form.decision || ""} required
                    onChange={e => setForm(f => ({ ...f, decision: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 180 }} />
                </div>
                <div>
                  <b>Predicted Impact (1-10):</b>
                  <input type="number" min={1} max={10} value={form.predictedImpact || ""}
                    onChange={e => setForm(f => ({ ...f, predictedImpact: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 45 }} />
                </div>
                <div>
                  <b>Actual Impact (1-10):</b>
                  <input type="number" min={1} max={10} value={form.actualImpact || ""}
                    onChange={e => setForm(f => ({ ...f, actualImpact: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 45 }} />
                </div>
                <div>
                  <b>Reflection/Learning:</b>
                  <input type="text" value={form.reflection || ""}
                    onChange={e => setForm(f => ({ ...f, reflection: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 190 }} />
                </div>
                <div>
                  <b>Confidential:</b>
                  <input type="checkbox" checked={form.confidential || false}
                    onChange={e => setForm(f => ({ ...f, confidential: e.target.checked }))}
                    style={{ marginLeft: 8 }} />
                  <b style={{ marginLeft: 15 }}>Pinned:</b>
                  <input type="checkbox" checked={form.pinned || false}
                    onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
                    style={{ marginLeft: 7 }} />
                </div>
                <div style={{ marginTop: 9 }}>
                  <button type="submit" style={{
                    background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, padding: "5px 16px", marginRight: 8, cursor: "pointer"
                  }}>{adding ? "Add" : "Save"}</button>
                  <button type="button" style={{
                    background: "#ff6b6b", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, padding: "5px 16px", cursor: "pointer"
                  }} onClick={() => { setAdding(false); setEditing(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          }
          {showHeatmap &&
            <div style={{ background: "#232a2e", borderRadius: 10, padding: 8, marginBottom: 12 }}>
              <b style={{ color: "#FFD700" }}>Impact Heatmap (Last 10)</b>
              <div style={{ display: "flex", gap: 5, alignItems: "center", marginTop: 7 }}>
                {gaps.map((g, i) =>
                  <div key={i} style={{
                    width: 32, height: 36, borderRadius: 8, fontWeight: 700, fontSize: 15, display: "flex",
                    alignItems: "center", justifyContent: "center", background: g > 1 ? "#1de682" : g < -1 ? "#ff6b6b" : "#FFD700", color: "#232a2e"
                  }}>{g > 0 ? "+" : ""}{g}</div>
                )}
              </div>
              <div style={{ fontSize: 13, marginTop: 4, color: "#FFD700" }}>Green=outperformed, Gold=on target, Red=underperformed</div>
            </div>
          }
          <div style={{ overflowX: "auto", maxHeight: 380 }}>
            <table style={{ width: "100%", color: "#fff", fontSize: 15, borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th></th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>By</th>
                  <th>Decision</th>
                  <th>Pred.</th>
                  <th>Act.</th>
                  <th>Gap</th>
                  <th>Reflection</th>
                  <th>Conf.</th>
                  <th>Pin</th>
                  <th>Edit</th>
                  <th>Del</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id} style={d.pinned ? { background: "#FFD70022" } : {}}>
                    <td>{d.pinned ? <FaThumbtack color="#FFD700" title="Pinned" /> : ""}</td>
                    <td>{types.find(t => t.key === d.type)?.label || d.type}</td>
                    <td>{d.date}</td>
                    <td>{d.by}</td>
                    <td>{d.decision}</td>
                    <td>{d.predictedImpact}</td>
                    <td>{d.actualImpact}</td>
                    <td style={{
                      color: Math.abs((d.actualImpact || 0) - (d.predictedImpact || 0)) > 2 ? "#ff6b6b" : "#1de682",
                      fontWeight: 700
                    }}>
                      {d.actualImpact && d.predictedImpact ? d.actualImpact - d.predictedImpact : ""}
                    </td>
                    <td>{d.reflection}</td>
                    <td>{d.confidential ? <FaUserSecret /> : ""}</td>
                    <td>
                      <button onClick={() => togglePin(d.id)}
                        style={{ background: "#FFD700", color: "#232a2e", borderRadius: 6, fontWeight: 700, border: "none", padding: "2px 7px", cursor: "pointer" }}>
                        <FaThumbtack />
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleEdit(d)}
                        style={{ background: "#FFD700", color: "#232a2e", borderRadius: 6, fontWeight: 700, border: "none", padding: "2px 8px", cursor: "pointer" }}>
                        <FaEdit />
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(d.id)}
                        style={{ background: "#ff6b6b", color: "#fff", borderRadius: 6, fontWeight: 700, border: "none", padding: "2px 8px", cursor: "pointer" }}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* SIDEBAR: ACCOUNTABILITY, REFLECTIONS, TIMELINE */}
        <div style={{
          minWidth: 260, maxWidth: 320, background: "#232a2e", borderRadius: 22, padding: 19, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, height: "100%"
        }}>
          <b style={{ color: "#FFD700" }}>Accountability Dashboard</b>
          <ul style={{ margin: "10px 0 16px 0", fontSize: 14 }}>
            {directors.map(dir =>
              <li key={dir}><b>{dir}:</b> {accountability[dir].total} decisions, Avg Gap: {accountability[dir].avgGap}, On Target: {accountability[dir].percent}%</li>
            )}
          </ul>
          <b style={{ color: "#FFD700" }}>Reflection Tag Cloud</b>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, margin: "8px 0 14px 0" }}>
            {Object.entries(allTags).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([word, count]) =>
              <span key={word} style={{ fontSize: 13 + count * 1.5, color: "#FFD700" }}>{word}</span>
            )}
          </div>
          <b style={{ color: "#FFD700" }}>Timeline (latest first)</b>
          <ul style={{ fontSize: 13, marginTop: 8, maxHeight: 110, overflowY: "auto" }}>
            {decisions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((d, i) =>
              <li key={d.id} style={{ color: "#FFD700" }}>
                {types.find(t => t.key === d.type)?.icon} <b>{d.decision}</b>
                <span style={{ color: "#1de682" }}> {d.date}</span>
                <span style={{ color: Math.abs((d.actualImpact || 0) - (d.predictedImpact || 0)) > 2 ? "#ff6b6b" : "#FFD700" }}>
                  &nbsp;Gap: {d.actualImpact && d.predictedImpact ? d.actualImpact - d.predictedImpact : ""}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
      {/* Footer */}
      <div style={{
        marginTop: 36,
        fontSize: 14,
        opacity: 0.7,
        textAlign: "center",
      }}>
        Proprietary to CourtEvo Vero. Every decision. Every lesson. <span style={{ color: "#FFD700", fontWeight: 700 }}>MALE ONLY.</span>
      </div>
    </div>
  );
}
