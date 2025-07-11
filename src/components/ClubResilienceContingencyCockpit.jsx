import React, { useState } from "react";
import {
  FaShieldAlt, FaExclamationTriangle, FaUserTie, FaPlusCircle, FaEdit, FaTrash, FaRegLightbulb,
  FaArrowRight, FaCloudDownloadAlt, FaSearch, FaBullhorn, FaChevronRight, FaCogs, FaHeartbeat,
  FaChartBar, FaSitemap, FaFire, FaFlagCheckered
} from "react-icons/fa";

const riskTypes = [
  { key: "financial", label: "Financial" },
  { key: "talent", label: "Talent" },
  { key: "operational", label: "Operational" },
  { key: "reputation", label: "Reputation" },
  { key: "facility", label: "Facility" },
  { key: "external", label: "External" }
];

const initialRisks = [
  {
    id: 1, type: "financial", description: "Main sponsor exits contract", owner: "Ivan Babic",
    likelihood: 7, impact: 8, status: "Open", scenario: "Sponsor exits mid-season", contingency: "Activate backup sponsor, reduce costs 10%, emergency board meeting.",
    dependencies: ["Sponsorship", "Marketing", "Senior Squad"], drills: [{ date: "2024-05-12", result: "Medium" }],
    alerts: ["Backup sponsor is not fully confirmed"], history: [{ date: "2024-06-01", action: "Scenario simulated" }]
  },
  {
    id: 2, type: "facility", description: "Arena unavailable for 1 month", owner: "Luka Simic",
    likelihood: 5, impact: 6, status: "Open", scenario: "Facility shutdown", contingency: "Negotiate temporary gym, reschedule games, adjust training plan.",
    dependencies: ["Training", "Youth Program"], drills: [{ date: "2024-03-10", result: "Good" }],
    alerts: [], history: []
  }
];

// Simulated club functions for dependency mapping
const clubFunctions = ["Senior Squad", "Youth Program", "Marketing", "Sponsorship", "Facilities", "Medical", "Academy", "Events"];

function getRiskScore(risk) {
  return Math.round(risk.likelihood * risk.impact / 10);
}

// Calculate a boardroom-level resilience index
function getResilienceIndex(risks) {
  const closed = risks.filter(r => r.status === "Closed").length;
  const total = risks.length;
  const highOpen = risks.filter(r => getRiskScore(r) >= 40 && r.status === "Open").length;
  let score = 90 - (total * 2) - (highOpen * 6) + (closed * 3);
  score = Math.max(20, Math.min(score, 98));
  return score;
}

export default function ClubResilienceScenarioIntelligenceCenter() {
  const [risks, setRisks] = useState(initialRisks);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selected, setSelected] = useState(null);

  // CRUD
  function handleEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setAdding(false);
  }
  function handleDelete(id) {
    setRisks(rs => rs.filter(r => r.id !== id));
    setEditing(null);
    setSelected(null);
  }
  function handleSaveEdit() {
    setRisks(rs => rs.map(r => r.id === editing.id ? { ...form, id: editing.id } : r));
    setEditing(null);
    setSelected(null);
  }
  function handleAddNew() {
    setRisks(rs => [...rs, { ...form, id: Date.now(), drills: [], history: [], alerts: [] }]);
    setAdding(false);
  }
  function exportCSV() {
    const header = "Type,Description,Owner,Likelihood,Impact,Score,Scenario,Contingency,Status,Dependencies,Alerts\n";
    const body = risks.map(r =>
      [
        r.type, r.description, r.owner, r.likelihood, r.impact, getRiskScore(r), r.scenario,
        r.contingency, r.status, (r.dependencies || []).join("|"), (r.alerts || []).join("|")
      ].join(",")
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "club_risks.csv";
    link.click();
  }

  // Filter/search
  const filtered = risks.filter(r =>
    (!filterType || r.type === filterType) &&
    (search === "" || r.description.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase()))
  );

  // Data for visuals
  const highRisks = risks.filter(r => getRiskScore(r) >= 40 && r.status === "Open");
  const openRisks = risks.filter(r => r.status === "Open");
  const noContingency = risks.filter(r => !r.contingency);
  const resilienceIndex = getResilienceIndex(risks);

  // --- Heatmap of risk areas ---
  function RiskRadarHeatmap() {
    return (
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15,
        background: "#232a2e", borderRadius: 17, padding: 20, marginBottom: 18, boxShadow: "0 1px 12px #FFD70022"
      }}>
        {riskTypes.map(rt => {
          const areaRisks = openRisks.filter(r => r.type === rt.key);
          const high = areaRisks.filter(r => getRiskScore(r) >= 40).length;
          const color = high ? "#ff6b6b" : areaRisks.length ? "#FFD700" : "#1de682";
          return (
            <div key={rt.key} style={{
              background: "#232a2e", border: `2.5px solid ${color}`,
              borderRadius: 14, padding: 15, minHeight: 90, boxShadow: `0 2px 12px ${color}22`
            }}>
              <div style={{ color, fontWeight: 900, fontSize: 18, display: "flex", alignItems: "center", gap: 6 }}>
                <FaExclamationTriangle /> {rt.label}
              </div>
              <div style={{ color: "#fff", fontSize: 14, marginTop: 9 }}>
                Open: <b>{areaRisks.length}</b> &nbsp;
                High: <b style={{ color: "#ff6b6b" }}>{high}</b>
              </div>
              <div style={{ color: "#1de682", fontSize: 13, marginTop: 4 }}>
                {areaRisks.length
                  ? "Risks: " + areaRisks.map(r => r.description.split(" ").slice(0, 4).join(" ") + (getRiskScore(r) >= 40 ? " 🔥" : "")).join(", ")
                  : "No open issues"}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // --- Resilience score panel ---
  function ResilienceScorePanel() {
    const color = resilienceIndex > 85 ? "#1de682"
      : resilienceIndex > 60 ? "#FFD700"
        : "#ff6b6b";
    return (
      <div style={{
        background: "#232a2e", borderRadius: 16, padding: 19, boxShadow: `0 2px 14px ${color}22`,
        marginBottom: 14, display: "flex", alignItems: "center", gap: 24
      }}>
        <FaHeartbeat color={color} size={35} style={{ marginRight: 12 }} />
        <div>
          <div style={{
            fontWeight: 900, fontSize: 22, color
          }}>Club Resilience Index: {resilienceIndex}</div>
          <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 16 }}>
            {resilienceIndex > 85
              ? "World-class resilience. Keep going."
              : resilienceIndex > 60
                ? "Resilience solid. Watch high-risk areas."
                : "Warning: Urgent action needed! Too many live risks."}
          </div>
        </div>
      </div>
    );
  }

  // --- Scenario dependency map (mini visual) ---
  function DependencyMap({ dependencies }) {
    return (
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 9 }}>
        <FaSitemap color="#FFD700" />
        {dependencies && dependencies.length
          ? dependencies.map(dep => (
            <span key={dep} style={{
              background: "#283E51", color: "#FFD700", borderRadius: 7, padding: "2px 12px", fontWeight: 800
            }}>{dep}</span>
          ))
          : <span style={{ color: "#1de682", fontWeight: 700 }}>None</span>}
      </div>
    );
  }

  // --- Scenario Library Panel ---
  function ScenarioLibrary() {
    return (
      <div style={{
        background: "#232a2e", borderRadius: 17, padding: 18, marginTop: 15, boxShadow: "0 2px 10px #FFD70022"
      }}>
        <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 17, marginBottom: 6 }}>
          <FaFlagCheckered /> Scenario Library & Drill Playback
        </div>
        {risks.length === 0 && <div style={{ color: "#FFD700", fontSize: 15 }}>No scenarios saved yet.</div>}
        <ul style={{ fontSize: 15, color: "#fff", marginLeft: 0, marginTop: 8 }}>
          {risks.map(r => (
            <li key={r.id} style={{ marginBottom: 7 }}>
              <b style={{ color: getRiskScore(r) >= 40 ? "#ff6b6b" : "#FFD700" }}>{r.description}</b>
              <span style={{ marginLeft: 9, color: "#FFD700" }}><FaCogs /> Scenario: {r.scenario}</span>
              <span style={{ marginLeft: 12, color: "#1de682" }}><FaUserTie /> Owner: {r.owner}</span>
              {r.drills && r.drills.length > 0 &&
                <span style={{ marginLeft: 12, color: "#FFD700" }}><FaRegLightbulb /> Drill: {r.drills[r.drills.length - 1].result} ({r.drills[r.drills.length - 1].date})</span>
              }
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // --- Board alert if open/high risks ---
  const boardAlert =
    (highRisks.length > 0 || noContingency.length > 0) && (
      <div style={{
        background: "#FFD70022", color: "#FFD700", fontWeight: 800, borderRadius: 10, padding: "14px 22px", marginBottom: 18
      }}>
        {highRisks.length > 0 && <span><FaExclamationTriangle /> {highRisks.length} HIGH-RISK issues open! </span>}
        {noContingency.length > 0 && <span><FaBullhorn /> {noContingency.length} risks missing contingency plan.</span>}
      </div>
    );

  // --- Main ---
  return (
    <div style={{
      background: "#232a2e", color: "#fff", fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh", borderRadius: "28px", padding: "38px 28px 24px 28px", boxShadow: "0 8px 38px 0 #15171a"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <FaShieldAlt size={44} color="#FFD700" style={{ marginRight: 17 }} />
        <div>
          <div style={{
            fontWeight: 900, fontSize: 31, letterSpacing: 1, marginBottom: 4, color: "#FFD700", textShadow: "0 2px 8px #FFD70055"
          }}>
            CLUB RESILIENCE & SCENARIO INTELLIGENCE CENTER
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 17 }}>
            Live risk radar, impact mapping, what-if simulation, and boardroom playbooks.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
          <FaSearch color="#FFD700" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Find risk..." style={{ border: "none", outline: "none", background: "transparent", color: "#FFD700", fontWeight: 700, fontSize: 17, width: 180, marginLeft: 6 }} />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{
              background: "#1a1d20", color: "#FFD700", borderRadius: 8,
              border: "none", fontWeight: 700, fontSize: 17, padding: "6px 16px", boxShadow: "0 2px 8px #FFD70022", cursor: "pointer"
            }}
          >
            <option value="">All Types</option>
            {riskTypes.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>
        <button
          style={{
            background: "#FFD700", color: "#232a2e", borderRadius: 12, fontWeight: 900,
            border: "none", padding: "12px 24px", marginLeft: 26, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 12px 0 #FFD70055"
          }}
          onClick={exportCSV}
        >
          <FaCloudDownloadAlt style={{ marginRight: 10 }} /> Export CSV
        </button>
      </div>
      <ResilienceScorePanel />
      {boardAlert}
      <RiskRadarHeatmap />
      <div style={{ display: "flex", gap: 38, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* TABLE */}
        <div style={{
          minWidth: 530, maxWidth: 900, flex: "1 1 730px", background: "#283E51", borderRadius: 22, padding: 22, boxShadow: "0 2px 14px 0 #15171a", marginBottom: 18, overflowX: "auto"
        }}>
          <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 20, marginBottom: 13 }}>Live Risk Register & What-If Simulator</div>
          <button
            style={{
              background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 900,
              border: "none", padding: "9px 23px", fontSize: 17, fontFamily: "Segoe UI", cursor: "pointer", boxShadow: "0 2px 10px 0 #1de68266",
              marginBottom: 12
            }}
            onClick={() => { setAdding(true); setForm({ type: "", status: "Open", likelihood: 5, impact: 5 }); setEditing(null); }}>
            <FaPlusCircle style={{ marginRight: 9 }} /> Add Risk/Scenario
          </button>
          {(adding || editing) &&
            <div style={{ background: "#FFD70022", color: "#232a2e", borderRadius: 13, padding: "18px 13px", marginBottom: 16 }}>
              <form onSubmit={e => { e.preventDefault(); adding ? handleAddNew() : handleSaveEdit(); }}>
                <div style={{ display: "flex", gap: 25, flexWrap: "wrap", alignItems: "center" }}>
                  <div>
                    <b>Type:</b>
                    <select value={form.type || ""} required
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 7, padding: "5px 14px", fontWeight: 800 }}>
                      <option value="">Select</option>
                      {riskTypes.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <b>Description:</b>
                    <input type="text" value={form.description || ""} required
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 7, padding: "5px 14px", fontWeight: 800, width: 185 }} />
                  </div>
                  <div>
                    <b>Owner:</b>
                    <input type="text" value={form.owner || ""} required
                      onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 7, padding: "5px 14px", fontWeight: 800, width: 120 }} />
                  </div>
                  <div>
                    <b>Likelihood (1-10):</b>
                    <input type="number" min={1} max={10} value={form.likelihood || 5}
                      onChange={e => setForm(f => ({ ...f, likelihood: Number(e.target.value) }))}
                      style={{ marginLeft: 8, borderRadius: 7, padding: "5px 14px", width: 55, fontWeight: 800 }} />
                  </div>
                  <div>
                    <b>Impact (1-10):</b>
                    <input type="number" min={1} max={10} value={form.impact || 5}
                      onChange={e => setForm(f => ({ ...f, impact: Number(e.target.value) }))}
                      style={{ marginLeft: 8, borderRadius: 7, padding: "5px 14px", width: 55, fontWeight: 800 }} />
                  </div>
                  <div>
                    <b>Status:</b>
                    <select value={form.status || "Open"}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 7, padding: "5px 14px", fontWeight: 800 }}>
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "center", marginTop: 11 }}>
                  <div>
                    <b>Scenario:</b>
                    <input type="text" value={form.scenario || ""}
                      onChange={e => setForm(f => ({ ...f, scenario: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 7, padding: "5px 14px", width: 190, fontWeight: 800 }} />
                  </div>
                  <div>
                    <b>Contingency:</b>
                    <input type="text" value={form.contingency || ""}
                      onChange={e => setForm(f => ({ ...f, contingency: e.target.value }))}
                      style={{ marginLeft: 8, borderRadius: 7, padding: "5px 14px", width: 210, fontWeight: 800 }} />
                  </div>
                  <div>
                    <b>Dependencies:</b>
                    <input type="text" value={form.dependencies ? form.dependencies.join(", ") : ""}
                      onChange={e => setForm(f => ({ ...f, dependencies: e.target.value.split(",").map(s => s.trim()) }))}
                      style={{ marginLeft: 8, borderRadius: 7, padding: "5px 14px", width: 200, fontWeight: 800 }} />
                  </div>
                </div>
                <div style={{ marginTop: 15 }}>
                  <button type="submit" style={{
                    background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 10, fontWeight: 900, fontSize: 16,
                    padding: "8px 27px", marginRight: 12, cursor: "pointer", boxShadow: "0 2px 10px #FFD70022"
                  }}>{adding ? "Add" : "Save"}</button>
                  <button type="button" style={{
                    background: "#ff6b6b", color: "#fff", border: "none", borderRadius: 10, fontWeight: 900, fontSize: 16,
                    padding: "8px 27px", cursor: "pointer", boxShadow: "0 2px 10px #ff6b6b33"
                  }} onClick={() => { setAdding(false); setEditing(null); setForm({}); }}>Cancel</button>
                </div>
              </form>
            </div>
          }
          <table style={{ width: "100%", color: "#fff", fontSize: 16, borderCollapse: "collapse", marginBottom: 9 }}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Owner</th>
                <th>Likelihood</th>
                <th>Impact</th>
                <th>Score</th>
                <th>Status</th>
                <th>Edit</th>
                <th>Del</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}
                  style={{
                    background: getRiskScore(r) >= 40 ? "#ff6b6b33"
                      : r.status === "Open" ? "#FFD70022" : "#1de68222",
                    fontWeight: r.status === "Open" ? 900 : 400
                  }}>
                  <td>{riskTypes.find(t => t.key === r.type)?.label || r.type}</td>
                  <td style={{ fontWeight: 900, color: "#FFD700", cursor: "pointer" }}
                    onClick={() => setSelected(r)}>{r.description}</td>
                  <td>{r.owner}</td>
                  <td>{r.likelihood}</td>
                  <td>{r.impact}</td>
                  <td style={{
                    fontWeight: 900, color: getRiskScore(r) >= 40 ? "#ff6b6b" : "#FFD700", fontSize: 18
                  }}>{getRiskScore(r)}</td>
                  <td>{r.status}</td>
                  <td>
                    <button onClick={() => handleEdit(r)}
                      style={{ background: "#FFD700", color: "#232a2e", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 12px", fontSize: 17, cursor: "pointer" }}>
                      <FaEdit />
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(r.id)}
                      style={{ background: "#ff6b6b", color: "#fff", borderRadius: 7, fontWeight: 900, border: "none", padding: "3px 12px", fontSize: 17, cursor: "pointer" }}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* SIDEBAR: CONTINGENCY, DEPENDENCIES, HISTORY */}
        <div style={{
          minWidth: 320, maxWidth: 390, background: "#232a2e", borderRadius: 22, padding: 24, boxShadow: "0 2px 14px 0 #15171a", marginBottom: 18, height: "100%"
        }}>
          <b style={{ color: "#FFD700", fontWeight: 900, fontSize: 18 }}>Risk & Scenario Intelligence</b>
          {selected ? (
            <>
              <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 20, margin: "9px 0 7px 0" }}>{selected.description}</div>
              <div><b>Scenario:</b> {selected.scenario}</div>
              <div style={{ margin: "7px 0" }}><b>Contingency:</b> {selected.contingency}</div>
              <div><b>Status:</b> {selected.status}</div>
              <div><b>Dependencies:</b> <DependencyMap dependencies={selected.dependencies} /></div>
              <div><b>Alerts:</b>
                <ul style={{ margin: 0, fontSize: 15 }}>
                  {(selected.alerts || []).map((a, i) => <li key={i} style={{ color: "#FFD700", fontWeight: 700 }}>{a}</li>)}
                </ul>
              </div>
              <div><b>Drills:</b>
                <ul style={{ margin: 0, fontSize: 15 }}>
                  {(selected.drills || []).map((d, i) =>
                    <li key={i}><FaRegLightbulb /> {d.date}: {d.result}</li>
                  )}
                </ul>
              </div>
              <div><b>History:</b>
                <ul style={{ margin: 0, fontSize: 15 }}>
                  {(selected.history || []).map((h, i) =>
                    <li key={i}><FaChevronRight /> {h.date}: {h.action}</li>
                  )}
                </ul>
              </div>
            </>
          ) : (
            <div style={{ margin: "18px 0 15px 0", color: "#FFD700", fontSize: 16, fontWeight: 900 }}>
              Select a risk/scenario for full intelligence view.
            </div>
          )}
        </div>
      </div>
      <ScenarioLibrary />
      {/* Footer */}
      <div style={{
        marginTop: 38,
        fontSize: 16,
        opacity: 0.8,
        textAlign: "center",
        color: "#FFD700",
        fontWeight: 900
      }}>
        Proprietary to CourtEvo Vero. Resilience isn’t luck—it’s leadership.
      </div>
    </div>
  );
}
