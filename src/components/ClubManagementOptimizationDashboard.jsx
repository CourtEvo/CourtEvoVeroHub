import React, { useState } from 'react';
import {
  FaUsers, FaUserTie, FaBullhorn, FaChartLine, FaExclamationTriangle, FaClipboardList, FaRegEdit,
  FaCogs, FaHistory, FaDownload, FaRobot, FaUserCheck, FaUserTimes, FaPlus, FaTrash, FaFilePdf, FaFileCsv, FaCalendarAlt, FaUser, FaFileAlt, FaFlag, FaCheck, FaTimes
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Papa from 'papaparse';

const DOMAINS = [
  { name: "Executive", icon: <FaUserTie /> },
  { name: "Sport & Performance", icon: <FaChartLine /> },
  { name: "Finance & Admin", icon: <FaCogs /> },
  { name: "Engagement & Media", icon: <FaBullhorn /> },
  { name: "Operations", icon: <FaUsers /> }
];

const DEFAULT_STRUCTURE = [
  {
    domain: "Executive",
    roles: [
      { name: "President", score: 92, status: "healthy", tasks: "Strategic vision; external relations", actions: "", vacant: false, owner: "President", notes: "", flags: [], history: [], timeline: "Ongoing", docs: [] },
      { name: "Vice-President", score: 88, status: "healthy", tasks: "Operations, board support", actions: "", vacant: false, owner: "Vice-President", notes: "", flags: [], history: [], timeline: "Ongoing", docs: [] }
    ]
  },
  {
    domain: "Sport & Performance",
    roles: [
      { name: "Sport Director", score: 74, status: "attention", tasks: "Sport strategy, staff", actions: "", vacant: false, owner: "Sport Director", notes: "", flags: [], history: [], timeline: "Q2 Review", docs: [] },
      { name: "Technical Director", score: 81, status: "healthy", tasks: "Coaching structure", actions: "", vacant: false, owner: "Technical Director", notes: "", flags: [], history: [], timeline: "Ongoing", docs: [] },
      { name: "Youth Dev Lead", score: 85, status: "healthy", tasks: "Youth program, talent ID", actions: "", vacant: false, owner: "Youth Dev Lead", notes: "", flags: [], history: [], timeline: "Ongoing", docs: [] }
    ]
  },
  {
    domain: "Finance & Admin",
    roles: [
      { name: "Finance Lead", score: 94, status: "healthy", tasks: "Budget, reporting", actions: "", vacant: false, owner: "Finance Lead", notes: "", flags: [], history: [], timeline: "Ongoing", docs: [] },
      { name: "Legal/Compliance", score: 67, status: "attention", tasks: "Contracts, policies", actions: "", vacant: false, owner: "Legal/Compliance", notes: "", flags: [], history: [], timeline: "Ongoing", docs: [] }
    ]
  },
  {
    domain: "Engagement & Media",
    roles: [
      { name: "PR/Media Lead", score: 79, status: "attention", tasks: "Media, communication", actions: "", vacant: false, owner: "PR/Media Lead", notes: "", flags: [], history: [], timeline: "Q3 Review", docs: [] },
      { name: "Community Officer", score: 92, status: "healthy", tasks: "Outreach, schools", actions: "", vacant: false, owner: "Community Officer", notes: "", flags: [], history: [], timeline: "Ongoing", docs: [] },
      { name: "Sponsorship Lead", score: 61, status: "risk", tasks: "Sponsor relations", actions: "", vacant: true, owner: "Open", notes: "", flags: [], history: [], timeline: "Immediate", docs: [] }
    ]
  },
  {
    domain: "Operations",
    roles: [
      { name: "Operations Manager", score: 60, status: "risk", tasks: "Logistics, scheduling", actions: "", vacant: true, owner: "Open", notes: "", flags: [], history: [], timeline: "Urgent", docs: [] }
    ]
  }
];

const STATUS_COLORS = {
  healthy: "#1de682",
  attention: "#FFD700",
  risk: "#e94057"
};
const STATUS_LABELS = {
  healthy: "Healthy",
  attention: "Attention",
  risk: "Risk"
};

const AI_SUGGESTIONS = {
  healthy: ["Stable: continue leadership development.", "Maintain cross-role collaboration.", "Recognize and reward performance."],
  attention: ["Review succession plan.", "Consider additional resources or staff training.", "Clarify KPIs and accountability."],
  risk: ["Urgent: Fill vacant positions ASAP.", "Engage board in contingency planning.", "External consultant recommended."]
};

const FLAG_TYPES = [
  { key: "risk", label: "Risk", icon: <FaExclamationTriangle color="#e94057" /> },
  { key: "resource", label: "Under-resourced", icon: <FaFlag color="#FFD700" /> },
  { key: "conflict", label: "Conflict", icon: <FaUsers color="#FFD700" /> },
  { key: "succession", label: "Succession Issue", icon: <FaHistory color="#FFD700" /> }
];

const OWNER_OPTIONS = [
  "President", "Vice-President", "Sport Director", "Technical Director", "Youth Dev Lead",
  "Finance Lead", "Legal/Compliance", "PR/Media Lead", "Community Officer", "Sponsorship Lead", "Operations Manager", "Open"
];

const TIMELINE_OPTIONS = [
  "Ongoing", "Immediate", "Urgent", "Q2 Review", "Q3 Review", "Q4 Review", "2025 Planning"
];

export default function ClubManagementOptimizationDashboard() {
  const [structure, setStructure] = useState(DEFAULT_STRUCTURE);
  const [editRole, setEditRole] = useState(null);
  const [editField, setEditField] = useState(null);
  const [roleHistory, setRoleHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(null);
  const [newRole, setNewRole] = useState({ name: "", domain: DOMAINS[0].name });

  // Inline edit (tasks, actions, notes, owner, timeline, docs)
  const handleEdit = (domainIdx, roleIdx, field, val) => {
    setStructure(prev => prev.map((d, i) =>
      i === domainIdx ? {
        ...d,
        roles: d.roles.map((r, j) => {
          if (j === roleIdx) {
            const old = { ...r };
            if (field === "flags" && Array.isArray(val)) {
              const newFlag = val.find(f => !old.flags.includes(f));
              if (newFlag) {
                setRoleHistory(h => [
                  ...h,
                  { role: r.name, domain: d.domain, field: "flags", change: newFlag, date: new Date().toLocaleString() }
                ]);
              }
            } else if (["tasks", "actions", "notes", "owner", "timeline", "docs"].includes(field)) {
              setRoleHistory(h => [
                ...h,
                { role: r.name, domain: d.domain, field, change: val, date: new Date().toLocaleString() }
              ]);
            }
            return { ...r, [field]: val };
          }
          return r;
        })
      } : d
    ));
    setEditRole(null); setEditField(null);
  };

  // Add Role
  const handleAddRole = () => {
    if (!newRole.name) return;
    setStructure(prev => prev.map(d =>
      d.domain === newRole.domain
        ? { ...d, roles: [...d.roles, { ...newRole, score: 70, status: "attention", tasks: "", actions: "", vacant: true, owner: "Open", notes: "", flags: [], history: [], timeline: "Ongoing", docs: [] }] }
        : d
    ));
    setNewRole({ name: "", domain: DOMAINS[0].name });
  };

  // Remove Role
  const handleRemoveRole = (domainIdx, roleIdx) => {
    setStructure(prev => prev.map((d, i) =>
      i === domainIdx ? { ...d, roles: d.roles.filter((_, j) => j !== roleIdx) } : d
    ));
  };

  // Export PDF
  const handleExportPDF = async () => {
    const element = document.getElementById("club-structure-root");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "l", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`ClubManagementStructure_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [];
    structure.forEach(d => {
      d.roles.forEach(r => {
        rows.push({
          Domain: d.domain, Role: r.name, Score: r.score, Status: STATUS_LABELS[r.status], Owner: r.owner, Tasks: r.tasks,
          Actions: r.actions, Timeline: r.timeline, Notes: r.notes, Flags: r.flags.join(", "), Vacant: r.vacant ? "Yes" : "No"
        });
      });
    });
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ClubManagementStructure_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  // --- AI Health Pulse ---
  const total = structure.reduce((s, d) => s + d.roles.length, 0);
  const risk = structure.reduce((s, d) => s + d.roles.filter(r => r.status === "risk").length, 0);
  const attention = structure.reduce((s, d) => s + d.roles.filter(r => r.status === "attention").length, 0);
  const healthLevel = risk > 0 ? "risk" : attention > 0 ? "attention" : "healthy";
  const clubPulseMsg = {
    healthy: "All systems stable. Continue with growth and innovation.",
    attention: "Review flagged roles. Some attention needed for key domains.",
    risk: "Critical risk detected. Immediate board action required."
  };

  return (
    <div id="club-structure-root" style={{
      background: "#232a2e", borderRadius: 22, boxShadow: "0 4px 18px #FFD70025",
      maxWidth: 1700, margin: "38px auto", padding: 36, position: "relative"
    }}>
      {/* --- AI HEALTH PULSE --- */}
      <div style={{
        background: STATUS_COLORS[healthLevel] + "22",
        border: `2px solid ${STATUS_COLORS[healthLevel]}`,
        color: STATUS_COLORS[healthLevel],
        borderRadius: 16, fontWeight: 900, fontSize: 21, marginBottom: 27, padding: "17px 19px",
        display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 18px #FFD70018"
      }}>
        <span>
          <FaRobot style={{ fontSize: 27, marginRight: 13, color: STATUS_COLORS[healthLevel] }} />
          AI Health Pulse: <span style={{ color: "#fff" }}>{STATUS_LABELS[healthLevel]}</span> — {clubPulseMsg[healthLevel]}
        </span>
        <span>
          <FaCheck color="#1de682" /> Healthy: {total - attention - risk} &nbsp;
          <FaExclamationTriangle color="#FFD700" /> Attention: {attention} &nbsp;
          <FaExclamationTriangle color="#e94057" /> Risk: {risk}
        </span>
        <span>
          <button onClick={handleExportPDF} title="Export as PDF"><FaFilePdf /> PDF</button>
          <button onClick={handleExportCSV} title="Export as CSV"><FaFileCsv /> CSV</button>
        </span>
      </div>
      {/* --- ADD ROLE --- */}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <b style={{ color: "#FFD700" }}><FaPlus /> Add Role:</b>
        <select value={newRole.domain} onChange={e => setNewRole(r => ({ ...r, domain: e.target.value }))}
          style={{ fontWeight: 700, fontSize: 17, background: "#181e23", color: "#FFD700", borderRadius: 8 }}>
          {DOMAINS.map(d => <option key={d.name}>{d.name}</option>)}
        </select>
        <input
          value={newRole.name}
          onChange={e => setNewRole(r => ({ ...r, name: e.target.value }))}
          placeholder="Role Name"
          style={{ padding: 8, borderRadius: 8, fontWeight: 700, fontSize: 16, marginRight: 6 }}
        />
        <button onClick={handleAddRole} style={{ background: "#1de682", color: "#232a2e" }}><FaCheck /> Add</button>
      </div>
      {/* --- STRUCTURE TABLE --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 28 }}>
        {structure.map((d, i) => (
          <div key={d.domain} style={{
            background: "#181e23", borderRadius: 17, boxShadow: "0 2px 14px #FFD70022",
            padding: 18, minHeight: 230, position: 'relative'
          }}>
            <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 20, marginBottom: 10, display: "flex", alignItems: "center" }}>
              {DOMAINS.find(dom => dom.name === d.domain)?.icon}&nbsp;{d.domain}
            </div>
            {d.roles.map((r, j) => (
              <div key={r.name} style={{
                background: "#232a2e", borderRadius: 11, padding: "11px 13px", marginBottom: 12,
                borderLeft: `6px solid ${STATUS_COLORS[r.status]}`, position: 'relative'
              }}>
                <div style={{ fontWeight: 800, color: "#FFD700", fontSize: 17, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {r.vacant ? <FaUserTimes style={{ color: "#e94057" }} /> : <FaUserCheck style={{ color: "#1de682" }} />}
                  {r.name}
                  {r.status === "risk" && <FaExclamationTriangle style={{ color: "#e94057", marginLeft: 8 }} />}
                  <span style={{
                    marginLeft: "auto", fontWeight: 800, color: STATUS_COLORS[r.status], fontSize: 15,
                    background: "#181e23", borderRadius: 7, padding: "2px 10px"
                  }}>{STATUS_LABELS[r.status]}</span>
                  <button onClick={() => handleRemoveRole(i, j)} style={{
                    background: "transparent", color: "#FFD700", fontSize: 18, border: "none", cursor: "pointer", marginLeft: 8
                  }} title="Remove Role"><FaTrash /></button>
                </div>
                {/* Owner */}
                <div style={{ marginBottom: 3 }}>
                  <b style={{ color: "#FFD700" }}>Owner:</b>{" "}
                  {editRole && editRole[0] === i && editRole[1] === j && editField === "owner" ?
                    <select
                      autoFocus
                      value={r.owner}
                      onBlur={e => handleEdit(i, j, "owner", e.target.value)}
                      onChange={e => handleEdit(i, j, "owner", e.target.value)}
                      style={{ borderRadius: 6, fontSize: 14 }}
                    >
                      {OWNER_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                    :
                    <span onClick={() => { setEditRole([i, j]); setEditField("owner"); }} style={{ cursor: "pointer" }}>
                      {r.owner || <FaRegEdit />}
                    </span>
                  }
                </div>
                {/* Timeline */}
                <div style={{ marginBottom: 3 }}>
                  <b style={{ color: "#FFD700" }}>Timeline:</b>{" "}
                  {editRole && editRole[0] === i && editRole[1] === j && editField === "timeline" ?
                    <select
                      autoFocus
                      value={r.timeline}
                      onBlur={e => handleEdit(i, j, "timeline", e.target.value)}
                      onChange={e => handleEdit(i, j, "timeline", e.target.value)}
                      style={{ borderRadius: 6, fontSize: 14 }}
                    >
                      {TIMELINE_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                    :
                    <span onClick={() => { setEditRole([i, j]); setEditField("timeline"); }} style={{ cursor: "pointer" }}>
                      {r.timeline || <FaRegEdit />}
                    </span>
                  }
                </div>
                {/* Key Tasks */}
                <div style={{ marginBottom: 3 }}>
                  <b style={{ color: "#FFD700" }}>Key Tasks:</b>{" "}
                  {editRole && editRole[0] === i && editRole[1] === j && editField === "tasks" ?
                    <input
                      autoFocus defaultValue={r.tasks}
                      onBlur={e => handleEdit(i, j, "tasks", e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleEdit(i, j, "tasks", e.target.value); }}
                      style={{ width: 155, fontSize: 14, borderRadius: 6 }}
                    />
                    :
                    <span onClick={() => { setEditRole([i, j]); setEditField("tasks"); }} style={{ cursor: "pointer" }}>
                      {r.tasks || <FaRegEdit />}
                    </span>
                  }
                </div>
                {/* Action Plan */}
                <div style={{ marginBottom: 3 }}>
                  <b style={{ color: "#FFD700" }}>Action Plan:</b>{" "}
                  {editRole && editRole[0] === i && editRole[1] === j && editField === "actions" ?
                    <input
                      autoFocus defaultValue={r.actions}
                      onBlur={e => handleEdit(i, j, "actions", e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleEdit(i, j, "actions", e.target.value); }}
                      style={{ width: 155, fontSize: 14, borderRadius: 6 }}
                    />
                    :
                    <span onClick={() => { setEditRole([i, j]); setEditField("actions"); }} style={{ cursor: "pointer" }}>
                      {r.actions || <FaRegEdit />}
                    </span>
                  }
                </div>
                {/* Notes */}
                <div style={{ marginBottom: 3 }}>
                  <b style={{ color: "#FFD700" }}>Role Notes:</b>{" "}
                  {editRole && editRole[0] === i && editRole[1] === j && editField === "notes" ?
                    <input
                      autoFocus defaultValue={r.notes}
                      onBlur={e => handleEdit(i, j, "notes", e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleEdit(i, j, "notes", e.target.value); }}
                      style={{ width: 140, fontSize: 14, borderRadius: 6 }}
                    />
                    :
                    <span onClick={() => { setEditRole([i, j]); setEditField("notes"); }} style={{ cursor: "pointer" }}>
                      {r.notes || <FaRegEdit />}
                    </span>
                  }
                </div>
                {/* Flags */}
                <div style={{ marginBottom: 3 }}>
                  <b style={{ color: "#FFD700" }}>Boardroom Flags:</b>{" "}
                  {FLAG_TYPES.map(f =>
                    <span
                      key={f.key}
                      style={{
                        marginRight: 5,
                        cursor: "pointer",
                        opacity: r.flags.includes(f.key) ? 1 : 0.5,
                        borderBottom: r.flags.includes(f.key) ? "2px solid #FFD700" : "none"
                      }}
                      title={f.label}
                      onClick={() => {
                        const updated = r.flags.includes(f.key)
                          ? r.flags.filter(x => x !== f.key)
                          : [...r.flags, f.key];
                        handleEdit(i, j, "flags", updated);
                      }}
                    >{f.icon}</span>
                  )}
                </div>
                {/* History */}
                <div style={{ marginBottom: 3 }}>
                  <b style={{ color: "#FFD700" }}>History:</b>{" "}
                  <span onClick={() => setShowHistory(showHistory === r.name ? null : r.name)}
                    style={{ cursor: "pointer", color: "#FFD700", textDecoration: "underline" }}>
                    <FaHistory /> {showHistory === r.name ? "Hide" : "Show"}
                  </span>
                  {showHistory === r.name && (
                    <div style={{
                      background: "#FFD70022", borderRadius: 7, marginTop: 3, padding: 6, color: "#fff", fontSize: 13
                    }}>
                      {(roleHistory.filter(h => h.role === r.name).length === 0)
                        ? "No changes tracked yet."
                        : roleHistory.filter(h => h.role === r.name).map((h, idx) =>
                          <div key={idx}>
                            [{h.date}] <b>{h.field}</b> changed to <b>{h.change}</b>
                          </div>
                        )}
                    </div>
                  )}
                </div>
                {/* AI Suggestion */}
                <div style={{ color: "#FFD70088", fontSize: 13, marginTop: 2 }}>
                  <FaRobot style={{ marginRight: 7 }} />
                  {AI_SUGGESTIONS[r.status][Math.floor(Math.random() * AI_SUGGESTIONS[r.status].length)]}
                </div>
                {/* Supporting Documents */}
                <div style={{ marginTop: 7, marginBottom: 4 }}>
                  <b style={{ color: "#FFD700" }}>Supporting Documents:</b>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    style={{ marginLeft: 8 }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = evt => {
                        // Save as base64 with filename
                        handleEdit(i, j, "docs", [
                          ...(r.docs || []),
                          { name: file.name, data: evt.target.result }
                        ]);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {r.docs && r.docs.length > 0 && (
                    <ul style={{ margin: '5px 0 0 0', padding: 0, listStyle: 'none', fontSize: 14 }}>
                      {r.docs.map((doc, idx) => (
                        <li key={idx} style={{ marginBottom: 2 }}>
                          <a
                            href={doc.data}
                            download={doc.name}
                            style={{
                              color: "#1de682", textDecoration: "underline", marginRight: 9, fontWeight: 700
                            }}>
                            {doc.name}
                          </a>
                          <button
                            style={{
                              color: "#e94057", background: "none", border: "none", fontSize: 15, marginLeft: 3, cursor: "pointer"
                            }}
                            onClick={() => {
                              // Remove this doc
                              handleEdit(i, j, "docs", r.docs.filter((_, dIdx) => dIdx !== idx));
                            }}>
                            <FaTrash />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ color: "#FFD70088", fontSize: 14, textAlign: "center", marginTop: 15, fontWeight: 700 }}>
        <b>
          Use this cockpit for real-time board review, risk assessment, and optimization. <br />
          Every action and flag is tracked for compliance and management reporting.
        </b>
      </div>
      <style>{`
        button {
          background:#283E51; color:#FFD700; border:none; padding:7px 13px;
          border-radius:7px; cursor:pointer; font-size:17px; font-weight:800;
          transition:background 0.2s; outline:none;
        }
        button:hover { background:#FFD700; color:#232a2e }
        input, select { outline: none; }
      `}</style>
    </div>
  );
}
