import React, { useState } from "react";
import {
  FaExclamationTriangle, FaCheckCircle, FaRegClock, FaPlusCircle, FaEdit, FaTrash, FaFileExport,
  FaUndo, FaRedo, FaSearch, FaFilter, FaMapMarkedAlt, FaWrench, FaUserTie, FaBolt, FaChartLine, FaPieChart, FaLink, FaComments, FaUserPlus, FaClipboardCheck
} from "react-icons/fa";

// --- DATA
const auditAreas = [
  { key: "Facility", icon: <FaMapMarkedAlt />, color: "#FFD700" },
  { key: "Medical", icon: <FaWrench />, color: "#1de682" },
  { key: "Coach:Athlete Ratio", icon: <FaUserTie />, color: "#34a0ff" },
  { key: "Welfare/Safeguard", icon: <FaBolt />, color: "#ff6b6b" },
  { key: "Education", icon: <FaChartLine />, color: "#e86be6" }
];
const statusList = [
  { label: "Elite", color: "#1de682" },
  { label: "Compliant", color: "#FFD700" },
  { label: "At Risk", color: "#ff6b6b" },
  { label: "Fail", color: "#485563" }
];

const initialFactors = [
  { id: 1, area: "Facility", item: "Main Gym", status: "Compliant", evidence: "Meets FIBA", owner: "Ops Manager", lastAudit: 2024, note: "Needs new lights", actions: [], history: [{ year: 2022, status: "At Risk" }, { year: 2023, status: "Compliant" }, { year: 2024, status: "Compliant" }] },
  { id: 2, area: "Facility", item: "Recovery Room", status: "At Risk", evidence: "Not enough beds", owner: "Medical Lead", lastAudit: 2024, note: "Upgrade planned", actions: [{ text: "Upgrade beds", owner: "Board", resolved: false }], history: [{ year: 2022, status: "Fail" }, { year: 2023, status: "At Risk" }, { year: 2024, status: "At Risk" }] },
  { id: 3, area: "Medical", item: "Physio Staff", status: "Elite", evidence: "Fulltime, certified", owner: "Med Dir", lastAudit: 2024, note: "", actions: [], history: [{ year: 2022, status: "Compliant" }, { year: 2023, status: "Elite" }, { year: 2024, status: "Elite" }] },
  { id: 4, area: "Coach:Athlete Ratio", item: "U14", status: "At Risk", evidence: "1:21 ratio", owner: "TD", lastAudit: 2024, note: "Must go to 1:14", actions: [{ text: "Hire assistant", owner: "TD", resolved: false }], history: [{ year: 2022, status: "At Risk" }, { year: 2023, status: "At Risk" }, { year: 2024, status: "At Risk" }] },
  { id: 5, area: "Welfare/Safeguard", item: "Travel Policy", status: "Compliant", evidence: "Parental signoff", owner: "Sec.", lastAudit: 2024, note: "", actions: [], history: [{ year: 2022, status: "At Risk" }, { year: 2023, status: "Compliant" }, { year: 2024, status: "Compliant" }] }
];

// --- UTILS
function statusColor(status) {
  if (status === "Elite") return "#1de682";
  if (status === "Compliant") return "#FFD700";
  if (status === "At Risk") return "#ff6b6b";
  return "#485563";
}

// --- CLUSTER PIE
function AreaPie({ factors, area }) {
  const counts = statusList.map(s => factors.filter(f => f.area === area && f.status === s.label).length);
  const total = counts.reduce((a, b) => a + b, 0);
  let acc = 0;
  return (
    <svg width={38} height={38} viewBox="0 0 38 38">
      {statusList.map((s, i) => {
        const val = counts[i];
        const angle = (val / total) * 360;
        const start = acc;
        const end = acc + angle;
        acc = end;
        if (!val) return null;
        const r = 16, cx = 19, cy = 19;
        const x1 = cx + r * Math.cos(Math.PI * start / 180);
        const y1 = cy + r * Math.sin(Math.PI * start / 180);
        const x2 = cx + r * Math.cos(Math.PI * end / 180);
        const y2 = cy + r * Math.sin(Math.PI * end / 180);
        const largeArc = angle > 180 ? 1 : 0;
        const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
        return <path key={s.label} d={d} fill={s.color} />;
      })}
    </svg>
  );
}

// --- TIMELINE
function AuditTimeline({ history }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      {history.map((h, i) => (
        <div key={i} style={{
          background: statusColor(h.status), color: "#232a2e", borderRadius: 5,
          fontWeight: 900, fontSize: 13, padding: "2px 7px"
        }}>{h.year}: {h.status}</div>
      ))}
    </div>
  );
}

// --- PROGRESS BAR
function ProgressBar({ factors }) {
  const total = factors.length;
  const resolved = factors.filter(f => f.status === "Elite" || f.status === "Compliant").length;
  const pct = Math.round((resolved / total) * 100);
  return (
    <div style={{ background: "#FFD70022", borderRadius: 9, height: 15, margin: "5px 0", width: 240 }}>
      <div style={{
        width: `${pct}%`, height: 15, background: "#FFD700", borderRadius: 9,
        display: "flex", alignItems: "center", fontWeight: 900, color: "#232a2e", fontSize: 13, justifyContent: "center"
      }}>
        {pct}% Resolved
      </div>
    </div>
  );
}

// --- MAIN
export default function DevelopmentEnvironmentAuditRiskMap() {
  const [factors, setFactors] = useState(initialFactors);
  const [form, setForm] = useState({});
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ area: "", status: "" });
  const [sidebar, setSidebar] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Undo/Redo
  function backup() { setHistory(h => [JSON.stringify(factors), ...h].slice(0, 10)); setRedoStack([]); }
  function undo() { if (history.length) { setFactors(JSON.parse(history[0])); setHistory(h => h.slice(1)); setRedoStack(rs => [JSON.stringify(factors), ...rs]); } }
  function redo() { if (redoStack.length) { setFactors(JSON.parse(redoStack[0])); setHistory(h => [JSON.stringify(factors), ...h]); setRedoStack(rs => rs.slice(1)); } }

  // CRUD
  function handleEdit(f) { setEditing(f); setForm({ ...f }); setAdding(false); }
  function handleDelete(id) { backup(); setFactors(list => list.filter(x => x.id !== id)); setEditing(null); setSidebar(null); }
  function handleSaveEdit() { backup(); setFactors(list => list.map(x => x.id === editing.id ? { ...form, id: editing.id } : x)); setEditing(null); }
  function handleAddNew() { backup(); setFactors(list => [...list, { ...form, id: Date.now() }]); setAdding(false); }

  // Actions (assign/resolve)
  function addAction(factorId, text, owner) {
    backup();
    setFactors(fs => fs.map(f => f.id === factorId ? {
      ...f,
      actions: [...(f.actions || []), { text, owner, resolved: false }]
    } : f));
  }
  function resolveAction(factorId, idx) {
    backup();
    setFactors(fs => fs.map(f => f.id === factorId ? {
      ...f,
      actions: f.actions.map((a, i) => i === idx ? { ...a, resolved: true } : a)
    } : f));
  }

  // Scenario simulation: upgrade/downgrade
  function simulateScenario(factorId, newStatus) {
    backup();
    setFactors(fs => fs.map(f => f.id === factorId ? { ...f, status: newStatus } : f));
  }

  // Filtering
  const filtered = factors.filter(f =>
    (search === "" || f.item.toLowerCase().includes(search.toLowerCase())) &&
    (!filter.area || f.area === filter.area) &&
    (!filter.status || f.status === filter.status)
  );

  // KPIs
  const nElite = factors.filter(f => f.status === "Elite").length;
  const nRisk = factors.filter(f => f.status === "At Risk").length;
  const nFail = factors.filter(f => f.status === "Fail").length;
  const nActions = factors.reduce((a, f) => a + (f.actions?.filter(x => !x.resolved).length || 0), 0);
  const nextAuditIn = 12 - (new Date().getMonth() + 1); // simulate months
  const pctResolved = Math.round(factors.filter(f => f.status === "Elite" || f.status === "Compliant").length / factors.length * 100);

  // Overall score
  const scores = { Elite: 4, Compliant: 3, "At Risk": 2, Fail: 1 };
  const avgScore = (factors.reduce((a, b) => a + (scores[b.status] || 0), 0) / factors.length).toFixed(2);
  const overallStatus = avgScore >= 3.7 ? "Elite" : avgScore >= 2.8 ? "Compliant" : avgScore >= 2 ? "At Risk" : "Fail";
  const overallColor = statusColor(overallStatus);

  return (
    <div style={{
      background: "#232a2e", color: "#fff", fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh", borderRadius: "34px", padding: "32px 18px 18px 18px", boxShadow: "0 8px 34px 0 #15171a"
    }}>
      {/* KPI BAR */}
      <div style={{
        display: "flex", gap: 24, marginBottom: 14, flexWrap: "wrap", alignItems: "center"
      }}>
        <div style={{ background: "#FFD70022", borderRadius: 12, padding: "10px 22px", color: "#FFD700", fontWeight: 900, fontSize: 19 }}>
          <FaCheckCircle color="#1de682" /> {nElite} Elite
        </div>
        <div style={{ background: "#ff6b6b22", borderRadius: 12, padding: "10px 22px", color: "#ff6b6b", fontWeight: 900, fontSize: 19 }}>
          <FaExclamationTriangle /> {nRisk} At Risk
        </div>
        <div style={{ background: "#48556322", borderRadius: 12, padding: "10px 22px", color: "#485563", fontWeight: 900, fontSize: 19 }}>
          <FaExclamationTriangle /> {nFail} Fail
        </div>
        <div style={{ background: "#1de68222", borderRadius: 12, padding: "10px 22px", color: "#1de682", fontWeight: 900, fontSize: 19 }}>
          <FaClipboardCheck /> {nActions} Open Actions
        </div>
        <div style={{ background: "#FFD70022", borderRadius: 12, padding: "10px 22px", color: "#FFD700", fontWeight: 900, fontSize: 19 }}>
          <FaRegClock /> Next Audit: {nextAuditIn} mo
        </div>
        <ProgressBar factors={factors} />
      </div>

      {/* SCORECARD, HEATMAP, CLUSTER */}
      <div style={{
        display: "flex", gap: 28, marginBottom: 22, alignItems: "flex-start", flexWrap: "wrap"
      }}>
        <div style={{
          background: "#232a2e", borderRadius: 17, boxShadow: "0 2px 12px #FFD70022", padding: "15px 21px", fontWeight: 900, minWidth: 220, maxWidth: 290
        }}>
          <div style={{ color: "#FFD700", fontSize: 19, marginBottom: 2 }}>Boardroom Scorecard</div>
          <div style={{ marginTop: 5, fontSize: 21, color: overallColor, fontWeight: 900 }}>
            {overallStatus}
          </div>
          <div style={{ color: "#FFD700", marginTop: 6, fontWeight: 700 }}>
            Avg. Score: <span style={{ color: overallColor }}>{avgScore}</span>
          </div>
        </div>
        <div style={{
          background: "#232a2e", borderRadius: 17, boxShadow: "0 2px 12px #FFD70022", padding: "7px 5px", fontWeight: 900
        }}>
          <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 17, textAlign: "center" }}>Risk Heatmap</div>
          <div style={{ display: "flex", gap: 6 }}>
            {auditAreas.map(a => <AreaPie key={a.key} factors={factors} area={a.key} />)}
          </div>
        </div>
        <div style={{
          background: "#232a2e", borderRadius: 17, boxShadow: "0 2px 12px #FFD70022", padding: "11px 18px", fontWeight: 900, minWidth: 250
        }}>
          <div style={{ color: "#FFD700", fontSize: 19 }}>Quick Filters</div>
          <div style={{ marginTop: 8 }}>
            <FaFilter color="#FFD700" />{" "}
            <select value={filter.area} onChange={e => setFilter(f => ({ ...f, area: e.target.value }))} style={{
              background: "#1a1d20", color: "#FFD700", borderRadius: 7, border: "none", fontWeight: 700, padding: "4px 10px"
            }}>
              <option value="">Area</option>
              {auditAreas.map(a => <option key={a.key} value={a.key}>{a.key}</option>)}
            </select>
            <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} style={{
              background: "#1a1d20", color: "#FFD700", borderRadius: 7, border: "none", fontWeight: 700, padding: "4px 10px", marginLeft: 6
            }}>
              <option value="">Status</option>
              {statusList.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
            </select>
            <FaSearch color="#FFD700" style={{ marginLeft: 6 }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Find item..." style={{ border: "none", outline: "none", background: "transparent", color: "#FFD700", fontWeight: 700, fontSize: 15, width: 100, marginLeft: 5 }} />
          </div>
        </div>
      </div>
      {/* AUDIT TABLE */}
      <div style={{
        minWidth: 410, maxWidth: 900, background: "#283E51", borderRadius: 20, padding: 16, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, overflowX: "auto"
      }}>
        <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 17, marginBottom: 8 }}>Risk Audit Table</div>
        <button
          style={{
            background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 900,
            border: "none", padding: "8px 16px", fontSize: 16, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 8px 0 #1de68266",
            marginBottom: 12
          }}
          onClick={() => { setAdding(true); setForm({}); setEditing(null); }}>
          <FaPlusCircle style={{ marginRight: 8 }} /> Add Factor
        </button>
        {(adding || editing) &&
          <div style={{ background: "#FFD70022", color: "#232a2e", borderRadius: 11, padding: "12px 10px", marginBottom: 12 }}>
            <form onSubmit={e => { e.preventDefault(); adding ? handleAddNew() : handleSaveEdit(); }}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <b>Area:</b>
                  <select value={form.area || auditAreas[0].key}
                    onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    {auditAreas.map(a => <option key={a.key} value={a.key}>{a.key}</option>)}
                  </select>
                </div>
                <div>
                  <b>Item:</b>
                  <input type="text" value={form.item || ""} required
                    onChange={e => setForm(f => ({ ...f, item: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 110, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Status:</b>
                  <select value={form.status || "Compliant"}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", fontWeight: 700 }}>
                    {statusList.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <b>Evidence (link):</b>
                  <input type="text" value={form.evidence || ""}
                    onChange={e => setForm(f => ({ ...f, evidence: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 90, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Owner:</b>
                  <input type="text" value={form.owner || ""}
                    onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 85, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Last Audit:</b>
                  <input type="number" value={form.lastAudit || 2024}
                    onChange={e => setForm(f => ({ ...f, lastAudit: Number(e.target.value) }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 60, fontWeight: 700 }} />
                </div>
                <div>
                  <b>Note:</b>
                  <input type="text" value={form.note || ""}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 7, padding: "5px 10px", width: 120, fontWeight: 700 }} />
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
              <th>Area</th>
              <th>Item</th>
              <th>Status</th>
              <th>Evidence</th>
              <th>Owner</th>
              <th>Last Audit</th>
              <th>Note</th>
              <th>Timeline</th>
              <th>Edit</th>
              <th>Del</th>
              <th>Scenario</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} style={{ background: statusColor(f.status) + "19" }}>
                <td style={{ color: statusColor(f.status), fontWeight: 900, cursor: "pointer" }} onClick={() => setSidebar(f)}>{f.area}</td>
                <td>{f.item}</td>
                <td style={{ color: statusColor(f.status), fontWeight: 900 }}>{f.status}</td>
                <td>
                  {f.evidence && f.evidence.startsWith("http") ? (
                    <a href={f.evidence} target="_blank" rel="noopener noreferrer" style={{ color: "#1de682", textDecoration: "underline" }}>
                      <FaLink style={{ marginRight: 4 }} /> Evidence
                    </a>
                  ) : f.evidence}
                </td>
                <td>{f.owner}</td>
                <td>{f.lastAudit}</td>
                <td>{f.note}</td>
                <td><AuditTimeline history={f.history || []} /></td>
                <td>
                  <button onClick={() => handleEdit(f)}
                    style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer" }}>
                    <FaEdit />
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDelete(f.id)}
                    style={{ background: "#ff6b6b", color: "#fff", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 11px", fontSize: 15, cursor: "pointer" }}>
                    <FaTrash />
                  </button>
                </td>
                <td>
                  <select onChange={e => simulateScenario(f.id, e.target.value)} value={f.status} style={{
                    background: statusColor(f.status), color: "#232a2e", borderRadius: 7, border: "none", fontWeight: 700, padding: "2px 7px", fontSize: 13
                  }}>
                    {statusList.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
                  </select>
                </td>
                <td>
                  {f.actions?.map((a, idx) =>
                    <div key={idx} style={{ color: a.resolved ? "#1de682" : "#FFD700", fontWeight: 700, marginBottom: 1 }}>
                      {a.text} ({a.owner})
                      {!a.resolved &&
                        <button style={{
                          marginLeft: 7, background: "#1de682", color: "#232a2e", border: "none", borderRadius: 5, fontWeight: 900, padding: "2px 8px", fontSize: 11, cursor: "pointer"
                        }} onClick={() => resolveAction(f.id, idx)}>
                          Resolve
                        </button>}
                    </div>
                  )}
                  <button
                    style={{
                      background: "#FFD700", color: "#232a2e", borderRadius: 6, fontWeight: 900,
                      border: "none", padding: "3px 8px", fontSize: 13, cursor: "pointer", marginTop: 2
                    }}
                    onClick={() => {
                      const text = prompt("Action/Assignment:");
                      const owner = prompt("Assign to:");
                      if (text && owner) addAction(f.id, text, owner);
                    }}>
                    <FaUserPlus style={{ marginRight: 3 }} /> Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* SIDEBAR: Factor Deep Dive */}
      <div style={{
        minWidth: 340, maxWidth: 480, background: "#232a2e", borderRadius: 19, padding: 19, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 12
      }}>
        <b style={{ color: "#FFD700", fontWeight: 900, fontSize: 18 }}>Factor Deep Dive</b>
        {sidebar ? (
          <>
            <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 20, margin: "8px 0 6px 0" }}>
              {sidebar.area}: {sidebar.item}
            </div>
            <div><b>Status:</b> <span style={{ color: statusColor(sidebar.status), fontWeight: 900 }}>{sidebar.status}</span></div>
            <div><b>Evidence:</b> <span style={{ color: "#FFD700" }}>{sidebar.evidence}</span></div>
            <div><b>Owner:</b> {sidebar.owner}</div>
            <div><b>Last Audit:</b> {sidebar.lastAudit}</div>
            <div><b>Note:</b> <span style={{ color: "#FFD700" }}>{sidebar.note}</span></div>
            <div style={{ marginTop: 9 }}><b>Audit Timeline:</b> <AuditTimeline history={sidebar.history || []} /></div>
            <div style={{ marginTop: 14 }}>
              <b>Open Actions:</b>
              <ul style={{ marginLeft: 12 }}>
                {(sidebar.actions || []).map((a, idx) =>
                  <li key={idx} style={{ color: a.resolved ? "#1de682" : "#FFD700" }}>
                    {a.text} ({a.owner}) {a.resolved && "✓"}
                  </li>
                )}
              </ul>
            </div>
            <div style={{ marginTop: 14 }}>
              <b>Suggestions:</b>
              <ul style={{ marginLeft: 12 }}>
                {sidebar.status === "At Risk" && <li style={{ color: "#FFD700" }}>Escalate to management for action.</li>}
                {sidebar.status === "At Risk" && <li style={{ color: "#FFD700" }}>Allocate resources or review policy.</li>}
                {sidebar.status === "Compliant" && <li style={{ color: "#1de682" }}>Maintain current standards, schedule next audit.</li>}
                {sidebar.status === "Elite" && <li style={{ color: "#1de682" }}>Use as benchmark for other areas.</li>}
                {sidebar.status === "Fail" && <li style={{ color: "#ff6b6b" }}>Immediate intervention required!</li>}
              </ul>
            </div>
          </>
        ) : (
          <div style={{ margin: "11px 0 10px 0", color: "#FFD700", fontSize: 15, fontWeight: 900 }}>
            Click factor for full audit details.
          </div>
        )}
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
        Proprietary to CourtEvo Vero. Audit intelligence for real boardroom impact.
      </div>
    </div>
  );
}
