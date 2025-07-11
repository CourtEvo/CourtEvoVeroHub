import React, { useState } from "react";
import {
  FaUserTie, FaPlusCircle, FaEdit, FaTrash, FaCloudDownloadAlt, FaCheckCircle,
  FaHistory, FaExclamationTriangle, FaChartBar, FaUserFriends, FaCalendarAlt, FaArrowRight, FaLightbulb, FaVoteYea, FaHeartbeat, FaUserShield, FaEuroSign
} from "react-icons/fa";

// Initial roles: add your real data or import from API
const initialRoles = [
  {
    id: 1,
    title: "Head Coach",
    owner: "Tomislav Pavic",
    start: "2023-07",
    accountabilities: "Senior team, lead tactical, talent ID",
    skills: ["Tactical", "Player Development", "Analytics"],
    tenure: 1,
    succession: "Ivan Babic",
    contribution: 8,
    risk: "Low",
    health: 82,
    value: 42000,
    output: 8.7,
    feedback: [{ who: "Board", text: "Outstanding leadership, needs more digital edge.", rating: 9 }],
    pipeline: [{ name: "Lovro Kovac", eta: 12, ready: "amber" }],
    votes: [8, 9, 7],
    changeLog: [
      { date: "2023-07", action: "Appointed", note: "Promoted from U18s" }
    ],
    upgrade: "Complete data training Q3 2024",
    notes: ""
  },
  {
    id: 2,
    title: "Performance Analyst",
    owner: "Ana Simic",
    start: "2023-08",
    accountabilities: "Squad data, dashboards, opposition scout",
    skills: ["Analytics", "Tech", "Video"],
    tenure: 1,
    succession: "",
    contribution: 6,
    risk: "Medium",
    health: 69,
    value: 27000,
    output: 6.2,
    feedback: [{ who: "Coach", text: "Great reports, but needs to engage players more.", rating: 7 }],
    pipeline: [],
    votes: [6, 7, 7],
    changeLog: [
      { date: "2023-08", action: "Appointed", note: "Hired for digital upgrade" }
    ],
    upgrade: "Enroll in sports communication course.",
    notes: ""
  }
];
const requiredSkills = ["Tactical", "Analytics", "Tech", "Youth Dev", "Compliance", "Physio", "Recruitment", "Comms"];

const trafficColor = { green: "#1de682", amber: "#FFD700", red: "#ff6b6b" };

function nextRoleId(arr) {
  return Math.max(0, ...arr.map(r => r.id)) + 1;
}

export default function DynamicRoleEvolutionIntelligenceSuite() {
  const [roles, setRoles] = useState(initialRoles);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [filterSkill, setFilterSkill] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);

  // CRUD
  function handleEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setAdding(false);
  }
  function handleDelete(id) {
    setRoles(rs => rs.filter(r => r.id !== id));
    setEditing(null);
    setSelectedRole(null);
  }
  function handleSaveEdit() {
    setRoles(rs => rs.map(r => r.id === editing.id ? { ...form, id: editing.id } : r));
    setEditing(null);
    setSelectedRole(null);
  }
  function handleAddNew() {
    setRoles(rs => [...rs, { ...form, id: Date.now(), changeLog: [{ date: form.start, action: "Appointed", note: "" }], feedback: [], pipeline: [], votes: [] }]);
    setAdding(false);
  }

  // Export as CSV
  function exportCSV() {
    const header = "Title,Owner,Start,Accountabilities,Skills,Tenure,Succession,Contribution,Risk,Value,Output,Notes\n";
    const body = roles.map(r =>
      [
        r.title, r.owner, r.start, r.accountabilities, (r.skills || []).join("|"), r.tenure, r.succession, r.contribution, r.risk, r.value, r.output, r.notes
      ].join(",")
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "role_evolution_matrix.csv";
    link.click();
  }

  // Peer benchmarking - allow “dummy” peer upload
  const peerBenchmark = {
    roles: 9,
    avgTenure: 1.4,
    avgSkills: 4,
    digitalRatio: 0.43
  };
  const myBenchmark = {
    roles: roles.length,
    avgTenure: roles.length ? Math.round(roles.reduce((a, r) => a + (r.tenure || 0), 0) / roles.length * 10) / 10 : 0,
    avgSkills: roles.length ? Math.round(roles.reduce((a, r) => a + (r.skills?.length || 0), 0) / roles.length * 10) / 10 : 0,
    digitalRatio: roles.length ? Math.round(roles.filter(r => (r.skills || []).includes("Tech") || (r.skills || []).includes("Analytics")).length * 100 / roles.length) / 100 : 0
  };

  // Filter/search
  const filtered = roles.filter(r =>
    (!filterSkill || (r.skills || []).includes(filterSkill)) &&
    (search === "" || r.title.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase()))
  );

  // Role health radar (succession, risk, skills, digital, tenure)
  function roleHealthRadar(r) {
    const d = [
      r.succession ? 1 : 0.4,
      r.risk === "Low" ? 1 : r.risk === "Medium" ? 0.7 : 0.4,
      (r.skills?.length || 0) / requiredSkills.length,
      (r.skills || []).includes("Tech") || (r.skills || []).includes("Analytics") ? 1 : 0.4,
      Math.min(1, (r.tenure || 0) / 3)
    ];
    const radius = 54;
    const points = d.map((val, i) => {
      const angle = (Math.PI * 2 * i) / d.length - Math.PI / 2;
      return [
        70 + Math.cos(angle) * radius * val,
        66 + Math.sin(angle) * radius * val
      ];
    });
    const poly = points.map(p => p.join(",")).join(" ");
    const labels = ["Succession", "Risk", "Skill", "Digital", "Tenure"];
    return (
      <svg width={140} height={130}>
        <circle cx={70} cy={66} r={radius} fill="#FFD70022" />
        <polygon points={poly} fill="#1de682cc" stroke="#FFD700" strokeWidth={2} />
        {labels.map((lab, i) => {
          const angle = (Math.PI * 2 * i) / d.length - Math.PI / 2;
          return (
            <g key={lab}>
              <text x={70 + Math.cos(angle) * (radius + 12)}
                y={66 + Math.sin(angle) * (radius + 14)}
                fontSize={11}
                fill="#FFD700"
                textAnchor="middle"
                fontWeight="bold"
              >{lab}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  // Talent pipeline visualizer
  function PipelineVisualizer({ pipeline }) {
    if (!pipeline?.length) return <span style={{ color: "#ff6b6b" }}>No pipeline</span>;
    return (
      <div style={{ display: "flex", gap: 9 }}>
        {pipeline.map(p =>
          <div key={p.name} style={{ borderRadius: 8, background: trafficColor[p.ready], color: "#232a2e", padding: "4px 12px", fontWeight: 700 }}>
            {p.name} <FaArrowRight /> {p.eta}mo
          </div>
        )}
      </div>
    );
  }

  // 360 Feedback
  function FeedbackFeed({ feedback }) {
    if (!feedback?.length) return <span style={{ color: "#FFD700" }}>No feedback yet.</span>;
    return (
      <ul style={{ margin: 0, fontSize: 14 }}>
        {feedback.map((f, i) =>
          <li key={i}><b>{f.who}</b>: {f.text} <span style={{ color: "#1de682" }}>({f.rating}/10)</span></li>
        )}
      </ul>
    );
  }

  // Upgrade recommendations
  function UpgradePath({ upgrade }) {
    return (
      <div style={{ color: "#FFD700", fontSize: 14, marginTop: 6 }}>
        <FaLightbulb /> Next Step: <span style={{ color: "#1de682", fontWeight: 700 }}>{upgrade}</span>
      </div>
    );
  }

  // Live polling
  function PollRole({ role }) {
    const [vote, setVote] = useState(null);
    function submitVote() {
      setRoles(rs => rs.map(r => r.id === role.id ? { ...r, votes: [...(r.votes || []), vote] } : r));
      setVote(null);
    }
    return (
      <div style={{ marginTop: 4 }}>
        <FaVoteYea /> <b>Board Pulse:</b>
        <input type="number" min={1} max={10} value={vote || ""} onChange={e => setVote(Number(e.target.value))}
          style={{ borderRadius: 5, padding: "2px 7px", width: 50, marginLeft: 6, marginRight: 6 }} />
        <button onClick={submitVote} style={{
          background: "#FFD700", color: "#232a2e", borderRadius: 5, border: "none", fontWeight: 700, padding: "3px 10px", cursor: "pointer"
        }}>Vote</button>
        <span style={{ color: "#1de682", fontWeight: 700, marginLeft: 9 }}>
          Avg: {role.votes && role.votes.length ? Math.round(role.votes.reduce((a, b) => a + b, 0) / role.votes.length * 10) / 10 : "-"}
        </span>
      </div>
    );
  }

  // AI Alerting
  function aiAlert(role) {
    if (!role.succession) return <span style={{ color: "#ff6b6b" }}>No succession plan!</span>;
    if (role.risk === "High") return <span style={{ color: "#ff6b6b" }}>Role is at high risk!</span>;
    if ((role.skills?.length || 0) < 3) return <span style={{ color: "#FFD700" }}>Skillset too narrow.</span>;
    if (role.tenure > 3) return <span style={{ color: "#FFD700" }}>Possible burnout: rotate or support.</span>;
    if (role.value > 50000 && role.output < 5) return <span style={{ color: "#ff6b6b" }}>Over-valued: consider restructure.</span>;
    return <span style={{ color: "#1de682" }}>Role healthy.</span>;
  }

  // Peer comparison
  function PeerBenchmark() {
    return (
      <div style={{ marginTop: 10, background: "#232a2e", borderRadius: 9, padding: 9, fontSize: 14 }}>
        <b style={{ color: "#FFD700" }}>Peer Benchmark</b><br />
        <span>Roles: {myBenchmark.roles} (peer: {peerBenchmark.roles})</span><br />
        <span>Avg Tenure: {myBenchmark.avgTenure} (peer: {peerBenchmark.avgTenure})</span><br />
        <span>Avg Skills/role: {myBenchmark.avgSkills} (peer: {peerBenchmark.avgSkills})</span><br />
        <span>Digital roles: {Math.round(myBenchmark.digitalRatio * 100)}% (peer: {Math.round(peerBenchmark.digitalRatio * 100)}%)</span>
      </div>
    );
  }

  // Upgrade mapping/alerts
  const upgradeGaps = roles.filter(r => (!r.succession || (r.skills?.length || 0) < 3 || r.risk === "High"));

  return (
    <div style={{
      background: "#232a2e", color: "#fff", fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh", borderRadius: "24px", padding: "38px 28px 18px 28px", boxShadow: "0 6px 32px 0 #1a1d20"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <FaUserTie size={38} color="#FFD700" style={{ marginRight: 13 }} />
        <div>
          <div style={{
            fontWeight: 700, fontSize: 28, letterSpacing: 1, marginBottom: 4, color: "#FFD700",
          }}>
            DYNAMIC ROLE EVOLUTION INTELLIGENCE SUITE
          </div>
          <div style={{ color: "#1de682", fontStyle: "italic", fontSize: 15 }}>
            True role health, value, risk, feedback, pipeline, and benchmarking.
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
          onClick={() => { setAdding(true); setForm({ skills: [] }); setEditing(null); }}
        >
          <FaPlusCircle style={{ marginRight: 7 }} /> Add Role
        </button>
      </div>
      {/* PEER BENCHMARK */}
      <PeerBenchmark />
      {/* ALERTS */}
      {upgradeGaps.length > 0 &&
        <div style={{ background: "#FFD70022", color: "#FFD700", fontWeight: 700, borderRadius: 10, padding: "11px 19px", marginBottom: 17 }}>
          <FaExclamationTriangle />{" "}
          Upgrade priority: {upgradeGaps.map(r => r.title).join(", ")}
        </div>
      }
      {/* FLEX ROW */}
      <div style={{ display: "flex", gap: 36, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* MAIN TABLE */}
        <div style={{
          minWidth: 400, maxWidth: 650, flex: "1 1 540px", background: "#283E51", borderRadius: 22, padding: 22, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, overflowX: "auto"
        }}>
          <div style={{ marginBottom: 12 }}>
            <b>Skill:</b>
            <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)} style={{ marginLeft: 8, borderRadius: 6, padding: "4px 10px" }}>
              <option value="">All</option>
              {requiredSkills.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <b style={{ marginLeft: 13 }}>Search:</b>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Role/Owner"
              style={{ marginLeft: 8, borderRadius: 6, padding: "4px 10px", width: 120 }} />
          </div>
          {(adding || editing) &&
            <div style={{ background: "#FFD70022", color: "#232a2e", borderRadius: 11, padding: "13px 11px", marginBottom: 13 }}>
              <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 7 }}>{adding ? "Add New Role" : "Edit Role"}</div>
              <form onSubmit={e => { e.preventDefault(); adding ? handleAddNew() : handleSaveEdit(); }}>
                <div>
                  <b>Title:</b>
                  <input type="text" value={form.title || ""} required
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }} />
                </div>
                <div>
                  <b>Owner:</b>
                  <input type="text" value={form.owner || ""} required
                    onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }} />
                </div>
                <div>
                  <b>Start (YYYY-MM):</b>
                  <input type="month" value={form.start || ""} required
                    onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }} />
                </div>
                <div>
                  <b>Accountabilities:</b>
                  <input type="text" value={form.accountabilities || ""} required
                    onChange={e => setForm(f => ({ ...f, accountabilities: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 170 }} />
                </div>
                <div>
                  <b>Skills:</b>
                  <select multiple value={form.skills || []}
                    onChange={e => setForm(f => ({
                      ...f,
                      skills: Array.from(e.target.selectedOptions).map(o => o.value)
                    }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 155, height: 52 }}>
                    {requiredSkills.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <b>Succession:</b>
                  <input type="text" value={form.succession || ""}
                    onChange={e => setForm(f => ({ ...f, succession: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }} />
                </div>
                <div>
                  <b>Contribution (1-10):</b>
                  <input type="number" min={1} max={10} value={form.contribution || ""}
                    onChange={e => setForm(f => ({ ...f, contribution: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 45 }} />
                </div>
                <div>
                  <b>Risk:</b>
                  <select value={form.risk || ""} required
                    onChange={e => setForm(f => ({ ...f, risk: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px" }}>
                    <option value="">Select</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <b>Role Value:</b>
                  <input type="number" min={0} value={form.value || ""}
                    onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 80 }} />
                </div>
                <div>
                  <b>Output (1-10):</b>
                  <input type="number" min={1} max={10} value={form.output || ""}
                    onChange={e => setForm(f => ({ ...f, output: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 45 }} />
                </div>
                <div>
                  <b>Upgrade path:</b>
                  <input type="text" value={form.upgrade || ""}
                    onChange={e => setForm(f => ({ ...f, upgrade: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 180 }} />
                </div>
                <div>
                  <b>Notes:</b>
                  <input type="text" value={form.notes || ""}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ marginLeft: 8, borderRadius: 5, padding: "4px 7px", width: 160 }} />
                </div>
                <div style={{ marginTop: 9 }}>
                  <button type="submit" style={{
                    background: "#FFD700", color: "#232a2e", border: "none", borderRadius: 7, fontWeight: 700, padding: "5px 16px", marginRight: 8, cursor: "pointer"
                  }}>{adding ? "Add" : "Save"}</button>
                  <button type="button" style={{
                    background: "#ff6b6b", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, padding: "5px 16px", cursor: "pointer"
                  }} onClick={() => { setAdding(false); setEditing(null); setForm({}); }}>Cancel</button>
                </div>
              </form>
            </div>
          }
          <div style={{ overflowX: "auto", maxHeight: 400 }}>
            <table style={{ width: "100%", color: "#fff", fontSize: 15, borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Owner</th>
                  <th>Succession</th>
                  <th>Value</th>
                  <th>Output</th>
                  <th>Contribution</th>
                  <th>Risk</th>
                  <th>Skills</th>
                  <th>Edit</th>
                  <th>Del</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} style={r.risk === "High" ? { background: "#ff6b6b22" } : {}}>
                    <td style={{ fontWeight: 700, color: "#FFD700", cursor: "pointer" }}
                      onClick={() => setSelectedRole(r)}>{r.title}</td>
                    <td>{r.owner}</td>
                    <td style={{ color: r.succession ? "#1de682" : "#ff6b6b" }}>{r.succession || "None"}</td>
                    <td><FaEuroSign /> {r.value}</td>
                    <td>{r.output}</td>
                    <td>{r.contribution}</td>
                    <td style={{
                      color: r.risk === "High" ? "#ff6b6b" : r.risk === "Medium" ? "#FFD700" : "#1de682",
                      fontWeight: 700
                    }}>{r.risk}</td>
                    <td>{(r.skills || []).join(", ")}</td>
                    <td>
                      <button onClick={() => handleEdit(r)}
                        style={{ background: "#FFD700", color: "#232a2e", borderRadius: 6, fontWeight: 700, border: "none", padding: "2px 8px", cursor: "pointer" }}>
                        <FaEdit />
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(r.id)}
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
        {/* SIDEBAR: ROLE INTELLIGENCE */}
        <div style={{
          minWidth: 260, maxWidth: 340, background: "#232a2e", borderRadius: 22, padding: 19, boxShadow: "0 2px 12px 0 #15171a", marginBottom: 18, height: "100%"
        }}>
          {selectedRole
            ? (
              <>
                <div style={{ fontWeight: 700, color: "#FFD700", marginBottom: 9, fontSize: 17 }}>{selectedRole.title} Intelligence</div>
                <div style={{ marginBottom: 9 }}>{roleHealthRadar(selectedRole)}</div>
                <div><b>Accountabilities:</b> <span style={{ color: "#1de682" }}>{selectedRole.accountabilities}</span></div>
                <div style={{ margin: "8px 0" }}><b>Change Log:</b>
                  <ul style={{ margin: 0, fontSize: 14 }}>
                    {selectedRole.changeLog?.map((h, i) =>
                      <li key={i}><FaHistory style={{ marginRight: 6 }} /> <b>{h.date}:</b> {h.action} – {h.note}</li>
                    )}
                  </ul>
                </div>
                <div><b>Pipeline:</b> <PipelineVisualizer pipeline={selectedRole.pipeline} /></div>
                <UpgradePath upgrade={selectedRole.upgrade} />
                <div style={{ marginTop: 8 }}><b>360 Feedback:</b> <FeedbackFeed feedback={selectedRole.feedback} /></div>
                <PollRole role={selectedRole} />
                <div style={{ marginTop: 10 }}>{aiAlert(selectedRole)}</div>
              </>
            )
            : <div style={{ margin: "9px 0 16px 0", color: "#FFD700", fontSize: 15 }}>Select a role for full intelligence view.</div>
          }
        </div>
      </div>
      {/* Footer */}
      <div style={{
        marginTop: 36,
        fontSize: 14,
        opacity: 0.7,
        textAlign: "center",
      }}>
        Proprietary to CourtEvo Vero. Every role. Real value. Total security. <span style={{ color: "#FFD700", fontWeight: 700 }}>MALE ONLY.</span>
      </div>
    </div>
  );
}
