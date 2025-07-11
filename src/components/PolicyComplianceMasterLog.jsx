import React, { useState, useRef, useEffect } from "react";
import {
  FaGavel, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaFilePdf, FaHistory, FaPlus, FaEdit, FaSearch, FaCloudUploadAlt, FaUserTie, FaFilter, FaUsers, FaSignature, FaRegFileAlt, FaEnvelope, FaFileExport, FaEye, FaMoon, FaSun, FaAsterisk, FaProjectDiagram, FaClock, FaTimes
} from "react-icons/fa";
import { Network } from "vis-network/standalone";
import { Timeline as VisTimeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import "vis-network/styles/vis-network.min.css";

const POLICY_TYPES = [
  "Code of Conduct", "Safeguarding", "Data Privacy", "Anti-Doping", "Volunteer", "Finance", "Travel", "Recruitment", "Disciplinary", "Other"
];
const STATUSES = ["Draft", "Pending", "Active", "Review", "Rejected", "Expired", "Superseded"];
const COVERAGE = ["All Staff", "Volunteers", "Coaches", "Players", "Parents", "Board", "Medical", "Admin", "Marketing"];

const INIT_POLICIES = [
  {
    id: 1,
    title: "Code of Conduct",
    type: "Code of Conduct",
    area: "All Staff/Volunteers",
    coverage: ["All Staff", "Volunteers", "Coaches", "Players"],
    owner: "Marko Proleta",
    status: "Active",
    approval: { status: "Approved", by: "Board", date: "2024-08-01", comments: [] },
    dateEffective: "2024-08-01",
    dateExpiry: "2025-08-01",
    lastReview: "2025-06-12",
    nextReview: "2025-08-01",
    uploads: [
      { file: "https://yourclub.com/policies/codeofconduct.pdf", version: 1, date: "2024-08-01" }
    ],
    version: 1,
    approvedBy: "Board",
    signedBy: ["Marko Proleta", "Ivan Horvat"],
    acknowledged: [
      { name: "Marko Proleta", date: "2024-08-01" },
      { name: "Ivan Horvat", date: "2024-08-01" }
    ],
    auditTrail: [
      { by: "Marko Proleta", date: "2024-07-25", note: "Policy created." },
      { by: "Board", date: "2024-08-01", note: "Approved for all staff." }
    ],
    dependencies: [2],
    changeLog: [
      { date: "2025-06-12", by: "Admin", note: "Minor update to code wording (section 2.2)." }
    ]
  },
  {
    id: 2,
    title: "Data Privacy",
    type: "Data Privacy",
    area: "All Club Systems",
    coverage: ["All Staff", "Coaches", "Admin"],
    owner: "Ivan Horvat",
    status: "Review",
    approval: { status: "Pending", by: "", date: "", comments: [] },
    dateEffective: "2024-09-01",
    dateExpiry: "2025-09-01",
    lastReview: "2025-06-10",
    nextReview: "2025-09-01",
    uploads: [],
    version: 1,
    approvedBy: "CEO",
    signedBy: [],
    acknowledged: [],
    auditTrail: [
      { by: "Ivan Horvat", date: "2024-08-25", note: "Drafted, submitted for CEO approval." }
    ],
    dependencies: [],
    changeLog: []
  }
];

function daysTo(date) {
  if (!date) return "";
  const d = new Date(date);
  const today = new Date();
  return Math.ceil((d - today) / 86400000);
}

export default function PolicyComplianceMasterLog() {
  const [policies, setPolicies] = useState(INIT_POLICIES);
  const [filter, setFilter] = useState({ status: "All", type: "All", owner: "" });
  const [theme, setTheme] = useState("dark");
  const [colorblind, setColorblind] = useState(false);
  const [showTrailIdx, setShowTrailIdx] = useState(null);
  const [showVersionIdx, setShowVersionIdx] = useState(null);
  const [showCoverage, setShowCoverage] = useState(false);
  const [showDepMap, setShowDepMap] = useState(false);
  const [showTimelineIdx, setShowTimelineIdx] = useState(null);
  const [addMode, setAddMode] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [newPolicy, setNewPolicy] = useState({
    title: "",
    type: POLICY_TYPES[0],
    area: "",
    coverage: [],
    owner: "",
    status: "Draft",
    approval: { status: "Pending", by: "", date: "", comments: [] },
    dateEffective: "",
    dateExpiry: "",
    lastReview: "",
    nextReview: "",
    uploads: [],
    version: 1,
    approvedBy: "",
    signedBy: [],
    acknowledged: [],
    auditTrail: [],
    dependencies: [],
    changeLog: []
  });
  const [signName, setSignName] = useState("");
  const [ackName, setAckName] = useState("");
  const [otp, setOTP] = useState("");
  const [upload, setUpload] = useState("");
  const [auditNote, setAuditNote] = useState("");
  const [approvalComment, setApprovalComment] = useState("");
  const [emailToast, setEmailToast] = useState("");

  // --- Add/Edit/Workflow functions (same as above, with OTP for e-signature) ---
  function savePolicy(e) {
    e.preventDefault();
    if (editIdx == null) {
      setPolicies([{ ...newPolicy, id: Date.now(), auditTrail: [{ by: newPolicy.owner, date: new Date().toISOString().slice(0, 10), note: "Policy created." }] }, ...policies]);
    } else {
      setPolicies(policies.map((p, i) => i === editIdx ? { ...newPolicy } : p));
    }
    setAddMode(false);
    setEditIdx(null);
    setNewPolicy({
      title: "",
      type: POLICY_TYPES[0],
      area: "",
      coverage: [],
      owner: "",
      status: "Draft",
      approval: { status: "Pending", by: "", date: "", comments: [] },
      dateEffective: "",
      dateExpiry: "",
      lastReview: "",
      nextReview: "",
      uploads: [],
      version: 1,
      approvedBy: "",
      signedBy: [],
      acknowledged: [],
      auditTrail: [],
      dependencies: [],
      changeLog: []
    });
  }
  function editPolicy(idx) {
    setEditIdx(idx);
    setAddMode(true);
    setNewPolicy({ ...policies[idx] });
  }
  function addAudit(idx) {
    if (!auditNote.trim()) return;
    setPolicies(policies =>
      policies.map((p, i) =>
        i === idx
          ? { ...p, auditTrail: [{ by: "Board", date: new Date().toISOString().slice(0, 10), note: auditNote }, ...(p.auditTrail || [])] }
          : p
      )
    );
    setAuditNote("");
    setShowTrailIdx(null);
  }
  function approvePolicy(idx, approved) {
    setPolicies(policies =>
      policies.map((p, i) =>
        i === idx
          ? {
              ...p,
              approval: {
                status: approved ? "Approved" : "Rejected",
                by: "Board",
                date: new Date().toISOString().slice(0, 10),
                comments: approvalComment ? [{ by: "Board", date: new Date().toISOString().slice(0, 10), text: approvalComment }] : []
              },
              status: approved ? "Active" : "Rejected"
            }
          : p
      )
    );
    setApprovalComment("");
  }
  function signPolicy(idx) {
    if (!signName.trim() || otp !== "123456") {
      alert("Name required and OTP must be 123456 (demo).");
      return;
    }
    setPolicies(policies =>
      policies.map((p, i) =>
        i === idx
          ? { ...p, signedBy: Array.from(new Set([...(p.signedBy || []), signName])) }
          : p
      )
    );
    setSignName(""); setOTP("");
  }
  function ackPolicy(idx) {
    if (!ackName.trim()) return;
    setPolicies(policies =>
      policies.map((p, i) =>
        i === idx
          ? { ...p, acknowledged: Array.from(new Set([...(p.acknowledged || []), { name: ackName, date: new Date().toISOString().slice(0, 10) }])) }
          : p
      )
    );
    setAckName("");
  }
  function uploadPolicy(idx) {
    if (!upload.trim()) return;
    setPolicies(policies =>
      policies.map((p, i) =>
        i === idx
          ? { ...p, uploads: [...(p.uploads || []), { file: upload, version: (p.version || 1) + 1, date: new Date().toISOString().slice(0, 10) }], version: (p.version || 1) + 1 }
          : p
      )
    );
    setUpload("");
  }
  function bulkExpire() {
    setPolicies(policies.map(p => daysTo(p.dateExpiry) <= 0 && p.status !== "Expired"
      ? { ...p, status: "Expired", auditTrail: [{ by: "System", date: new Date().toISOString().slice(0, 10), note: "Policy auto-expired." }, ...(p.auditTrail || [])] }
      : p
    ));
  }
  function remind(idx) {
    setEmailToast(`Reminder email sent to: ${policies[idx].owner}`);
    setTimeout(() => setEmailToast(""), 3000);
  }
  function downloadCSV() {
    const rows = [
      ["Title", "Type", "Status", "Owner", "Area", "Coverage", "DateEff", "DateExp", "Version", "SignedBy", "Ack%", "LastReview", "NextReview", "ApprovedBy"],
      ...policies.map(p => [
        p.title, p.type, p.status, p.owner, p.area, (p.coverage || []).join(";"), p.dateEffective, p.dateExpiry, p.version, (p.signedBy || []).join(";"), ((p.acknowledged || []).length), p.lastReview, p.nextReview, p.approvedBy
      ])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "policy_compliance_master_log.csv";
    a.click();
  }

  // --- Analytics, Coverage, Dependency Map, Timeline ---
  const filtered = policies.filter(p =>
    (filter.status === "All" || p.status === filter.status) &&
    (filter.type === "All" || p.type === filter.type) &&
    (filter.owner === "" || (p.owner || "").toLowerCase().includes(filter.owner.toLowerCase()))
  );
  const expiring = filtered.filter(p => daysTo(p.dateExpiry) <= 30 && daysTo(p.dateExpiry) > 0);
  const expired = filtered.filter(p => daysTo(p.dateExpiry) < 0);
  const total = filtered.length;
  const coverageStats = {};
  COVERAGE.forEach(role => { coverageStats[role] = 0; });
  filtered.forEach(p => (p.coverage || []).forEach(role => coverageStats[role]++));
  const coverageArr = Object.entries(coverageStats);

  // --- Dependency Map using vis-network ---
  const depMapRef = useRef(null);
  useEffect(() => {
    if (showDepMap && depMapRef.current) {
      const nodes = policies.map(p => ({
        id: p.id, label: p.title, shape: "box", color: "#FFD700", font: { color: "#232a2e", bold: true }
      }));
      const edges = [];
      policies.forEach(p => (p.dependencies || []).forEach(dep => edges.push({
        from: p.id, to: dep, arrows: "to", color: "#1de682"
      })));
      // eslint-disable-next-line
      new Network(depMapRef.current, { nodes, edges }, {
        nodes: { borderWidth: 2, size: 24, color: { border: "#FFD700", background: "#232a2e" }, font: { color: "#FFD700", size: 18 } },
        edges: { color: "#1de682", width: 2, arrows: "to" },
        layout: { hierarchical: false },
        physics: false
      });
    }
  }, [showDepMap, policies]);

  // --- Timeline using vis-timeline ---
  const timelineRef = useRef(null);
  useEffect(() => {
    if (showTimelineIdx != null && timelineRef.current) {
      const p = policies[showTimelineIdx];
      const items = [
        ...p.auditTrail.map((e, i) => ({
          id: i + 1,
          content: `${e.by}: ${e.note}`,
          start: e.date,
          type: "box"
        })),
        ...p.changeLog.map((e, i) => ({
          id: 100 + i,
          content: `Change: ${e.note}`,
          start: e.date,
          type: "point"
        }))
      ];
      // eslint-disable-next-line
      new VisTimeline(timelineRef.current, items, {
        width: "100%", height: "160px", margin: { item: 12 },
        editable: false, stack: false, showMajorLabels: true, showMinorLabels: true
      });
    }
  }, [showTimelineIdx, policies]);

  // --- RENDER ---
  return (
    <div style={{
      background: theme === "dark" ? "#232a2e" : "#f5f5f5",
      color: theme === "dark" ? "#FFD700" : "#232a2e",
      minHeight: "100vh",
      borderRadius: 18,
      padding: 16
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontWeight: 900, marginBottom: 14 }}>
          <FaGavel style={{ marginRight: 10 }} /> Policy & Compliance Master Log
        </h2>
        <div>
          <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={btnStyle}>
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>
          <button onClick={() => setColorblind(c => !c)} style={btnStyle}><FaEye />{colorblind ? "Colorblind ON" : "Colorblind OFF"}</button>
          <button onClick={downloadCSV} style={btnStyle}><FaFileExport /> Export CSV</button>
          <button onClick={() => window.print()} style={btnStyle}><FaFilePdf /> Print</button>
        </div>
      </div>
      {emailToast && (
        <div style={{ position: "fixed", right: 30, top: 60, background: "#1de682", color: "#232a2e", borderRadius: 11, fontWeight: 900, fontSize: 18, padding: "11px 26px", zIndex: 99 }}>{emailToast}</div>
      )}
      {/* Analytics */}
      <div style={{ display: "flex", gap: 28, margin: "18px 0", flexWrap: "wrap" }}>
        <div style={snapCard}><FaRegFileAlt style={{ marginRight: 7 }} />Total: {total}</div>
        <div style={snapCard}><FaCheckCircle style={{ color: "#1de682", marginRight: 7 }} />Active: {filtered.filter(p => p.status === "Active").length}</div>
        <div style={snapCard}><FaCalendarAlt style={{ color: "#FFD700", marginRight: 7 }} />Expiring 30d: {expiring.length}</div>
        <div style={snapCard}><FaExclamationTriangle style={{ color: "#e82e2e", marginRight: 7 }} />Expired: {expired.length}</div>
        <div style={snapCard}><FaAsterisk style={{ color: "#FFD700", marginRight: 7 }} />Bulk:</div>
        <button onClick={bulkExpire} style={addBtnStyle}>Auto-Expire All</button>
      </div>
      {/* Coverage Heatmap / Dependency Map */}
      <button style={addBtnStyle} onClick={() => setShowCoverage(c => !c)}>
        <FaUsers /> {showCoverage ? "Hide" : "Show"} Policy Coverage
      </button>
      {showCoverage && (
        <div style={{ margin: "24px 0", background: "#232a2e", borderRadius: 18, padding: 20 }}>
          <h4 style={{ color: "#FFD700", fontWeight: 900 }}>Policy Coverage Heatmap (by Role/Team)</h4>
          <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {COVERAGE.map((role, i) => <th key={i} style={{ color: "#FFD700" }}>{role}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                {coverageArr.map(([role, count], i) =>
                  <td key={i} style={{
                    background: count === 0 ? "#222" : count > 2 ? "#1de68299" : "#FFD70077",
                    color: "#232a2e", fontWeight: 800, textAlign: "center"
                  }}>{count}</td>
                )}
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 13, color: "#FFD700", marginTop: 7 }}>
            Shows how many policies apply to each club/federation role—aim for full coverage.
          </div>
        </div>
      )}
      <button style={addBtnStyle} onClick={() => setShowDepMap(d => !d)}>
        <FaProjectDiagram /> {showDepMap ? "Hide" : "Show"} Dependency Map
      </button>
      {showDepMap && (
        <div ref={depMapRef} style={{ height: 310, width: "100%", background: "#232a2e", borderRadius: 20, margin: "16px 0", boxShadow: "0 2px 20px #FFD70011" }}></div>
      )}
      {/* Filters */}
      <div style={{ display: "flex", gap: 16, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
        <FaFilter color="#FFD700" />
        <label>Status:
          <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} style={filtInput}>
            {["All", ...STATUSES].map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Type:
          <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} style={filtInput}>
            {["All", ...POLICY_TYPES].map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Owner:
          <input value={filter.owner} onChange={e => setFilter(f => ({ ...f, owner: e.target.value }))} placeholder="Owner name" style={filtInput} />
        </label>
        <FaSearch color="#FFD700" />
        <button onClick={() => { setAddMode(true); setEditIdx(null); }} style={addBtnStyle}><FaPlus style={{ marginRight: 7 }} />New</button>
      </div>
      {/* Add/Edit Form */}
      {addMode && (
        <form onSubmit={savePolicy} style={{
          background: "#232a2e",
          borderRadius: 16,
          padding: "28px 36px",
          marginBottom: 18,
          boxShadow: "0 2px 18px #FFD70018"
        }}>
          <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 18, marginBottom: 9 }}>
            {editIdx == null ? "Add New Policy" : "Edit Policy"}
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <label style={formLabel}>Title:</label><br />
              <input required value={newPolicy.title} onChange={e => setNewPolicy(p => ({ ...p, title: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Type:</label><br />
              <select value={newPolicy.type} onChange={e => setNewPolicy(p => ({ ...p, type: e.target.value }))} style={formInput}>
                {POLICY_TYPES.map(pt => <option key={pt}>{pt}</option>)}
              </select>
            </div>
            <div>
              <label style={formLabel}>Area/Scope:</label><br />
              <input value={newPolicy.area} onChange={e => setNewPolicy(p => ({ ...p, area: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Owner:</label><br />
              <input required value={newPolicy.owner} onChange={e => setNewPolicy(p => ({ ...p, owner: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Status:</label><br />
              <select value={newPolicy.status} onChange={e => setNewPolicy(p => ({ ...p, status: e.target.value }))} style={formInput}>
                {STATUSES.map(st => <option key={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label style={formLabel}>Date Effective:</label><br />
              <input type="date" value={newPolicy.dateEffective} onChange={e => setNewPolicy(p => ({ ...p, dateEffective: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Date Expiry:</label><br />
              <input type="date" value={newPolicy.dateExpiry} onChange={e => setNewPolicy(p => ({ ...p, dateExpiry: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Coverage:</label><br />
              <select multiple value={newPolicy.coverage} onChange={e => setNewPolicy(p => ({ ...p, coverage: Array.from(e.target.selectedOptions, opt => opt.value) }))} style={{ ...formInput, minHeight: 65 }}>
                {COVERAGE.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={formLabel}>Last Review:</label><br />
              <input type="date" value={newPolicy.lastReview} onChange={e => setNewPolicy(p => ({ ...p, lastReview: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Next Review:</label><br />
              <input type="date" value={newPolicy.nextReview} onChange={e => setNewPolicy(p => ({ ...p, nextReview: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Approved By:</label><br />
              <input value={newPolicy.approvedBy} onChange={e => setNewPolicy(p => ({ ...p, approvedBy: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Dependencies (comma-separated):</label><br />
              <input value={newPolicy.dependencies} onChange={e => setNewPolicy(p => ({ ...p, dependencies: e.target.value.split(",").map(d => d.trim()) }))} style={formInput} />
            </div>
          </div>
          <button type="submit" style={{
            marginTop: 16, ...addBtnStyle, fontSize: 16, padding: "8px 26px"
          }}>
            <FaCheckCircle style={{ marginRight: 7 }} /> {editIdx == null ? "Add Policy" : "Save Changes"}
          </button>
        </form>
      )}
      {/* Table with Timeline and E-signature */}
      <div style={{
        background: "#232a2e",
        borderRadius: 16,
        padding: "20px 28px",
        boxShadow: "0 2px 18px #FFD70018",
        marginBottom: 10,
        marginTop: 10,
        overflowX: "auto"
      }}>
        <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#FFD700", borderBottom: "2px solid #FFD700", fontWeight: 900 }}>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Area</th>
              <th>Coverage</th>
              <th>Effective</th>
              <th>Expiry</th>
              <th>Last Review</th>
              <th>Doc</th>
              <th>Version</th>
              <th>Dependencies</th>
              <th>Approval</th>
              <th>Signed</th>
              <th>Ack%</th>
              <th>Timeline</th>
              <th>Edit</th>
              <th>E-sign</th>
              <th>Ack</th>
              <th>Upload</th>
              <th>Audit</th>
              <th>Remind</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={21} style={{ color: "#e82e2e", fontWeight: 900, textAlign: "center", padding: 24 }}>
                  No policies found.
                </td>
              </tr>
            )}
            {filtered.map((p, idx) => (
              <tr key={idx} style={{
                background: idx % 2 === 0 ? "#21282c" : "#232a2e",
                color: "#fff"
              }}>
                <td style={{ fontWeight: 900, color: "#FFD700" }}>{p.title}</td>
                <td>{p.type}</td>
                <td style={{ fontWeight: 900, color: p.status === "Active" ? "#1de682" : p.status === "Review" ? "#FFD700" : "#e82e2e" }}>{p.status}</td>
                <td>{p.owner}</td>
                <td>{p.area}</td>
                <td>
                  {(p.coverage || []).join(", ")}
                </td>
                <td>{p.dateEffective}</td>
                <td style={{ fontWeight: 700 }}>{p.dateExpiry}</td>
                <td>{p.lastReview}</td>
                <td>
                  {p.uploads && p.uploads.length > 0 ? (
                    <button style={editBtnStyle} onClick={() => setShowVersionIdx(showVersionIdx === idx ? null : idx)}><FaRegFileAlt /></button>
                  ) : "-"}
                  {showVersionIdx === idx && (
                    <div style={{
                      position: "absolute",
                      background: "#181e23",
                      color: "#FFD700",
                      borderRadius: 10,
                      padding: "14px 21px",
                      boxShadow: "0 3px 20px #FFD70033",
                      minWidth: 200,
                      zIndex: 10,
                      marginTop: 12
                    }}>
                      <b>Document Versions:</b>
                      <ul>
                        {p.uploads.map((u, i) => (
                          <li key={i}>
                            <a href={u.file} target="_blank" rel="noopener noreferrer" style={{ color: "#FFD700" }}>
                              v{u.version} ({u.date})
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>{p.version}</td>
                <td>{(p.dependencies || []).join(", ")}</td>
                <td>
                  <div style={{ color: p.approval.status === "Approved" ? "#1de682" : p.approval.status === "Pending" ? "#FFD700" : "#e82e2e", fontWeight: 800 }}>
                    {p.approval.status}
                  </div>
                  {p.approval.status === "Pending" && (
                    <div>
                      <textarea value={approvalComment} onChange={e => setApprovalComment(e.target.value)} placeholder="Approval comment" style={{ ...formInput, width: 100, marginTop: 3 }} />
                      <button style={addBtnStyle} onClick={() => approvePolicy(idx, true)}>Approve</button>
                      <button style={editBtnStyle} onClick={() => approvePolicy(idx, false)}>Reject</button>
                    </div>
                  )}
                  {p.approval.comments && p.approval.comments.length > 0 && (
                    <ul style={{ fontSize: 12 }}>
                      {p.approval.comments.map((c, i) => <li key={i}>{c.text}</li>)}
                    </ul>
                  )}
                </td>
                <td style={{ color: "#FFD700", fontWeight: 800 }}>{(p.signedBy || []).join(", ")}</td>
                <td>
                  {p.acknowledged ? Math.round((p.acknowledged.length / (p.coverage.length || 1)) * 100) : 0}%
                </td>
                <td>
                  <button style={addBtnStyle} onClick={() => setShowTimelineIdx(idx)}>
                    <FaClock /> Timeline
                  </button>
                  {showTimelineIdx === idx && (
                    <div style={{ background: "#232a2e", borderRadius: 14, padding: 17, margin: 6 }}>
                      <div ref={timelineRef} />
                      <button style={editBtnStyle} onClick={() => setShowTimelineIdx(null)}><FaTimes /> Close</button>
                    </div>
                  )}
                </td>
                <td>
                  <button onClick={() => editPolicy(idx)} style={editBtnStyle}><FaEdit /></button>
                </td>
                <td>
                  <input
                    placeholder="Name"
                    value={signName}
                    onChange={e => setSignName(e.target.value)}
                    style={{ ...formInput, width: 75, marginRight: 2 }}
                  />
                  <input
                    placeholder="OTP"
                    value={otp}
                    onChange={e => setOTP(e.target.value)}
                    style={{ ...formInput, width: 60, marginRight: 2 }}
                  />
                  <button onClick={() => signPolicy(idx)} style={editBtnStyle}><FaSignature /> E-sign</button>
                </td>
                <td>
                  <input
                    placeholder="Name"
                    value={ackName}
                    onChange={e => setAckName(e.target.value)}
                    style={{ ...formInput, width: 75, marginRight: 2 }}
                  />
                  <button onClick={() => ackPolicy(idx)} style={addBtnStyle}>Acknowledge</button>
                </td>
                <td>
                  <input
                    placeholder="URL"
                    value={upload}
                    onChange={e => setUpload(e.target.value)}
                    style={{ ...formInput, width: 90, marginRight: 2 }}
                  />
                  <button onClick={() => uploadPolicy(idx)} style={editBtnStyle}><FaCloudUploadAlt /></button>
                </td>
                <td>
                  <button style={logBtnStyle}
                    onClick={() => setShowTrailIdx(showTrailIdx === idx ? null : idx)}
                  >
                    <FaHistory style={{ marginRight: 7 }} />
                    Audit
                  </button>
                  {showTrailIdx === idx && (
                    <div style={{
                      position: "absolute",
                      background: "#181e23",
                      color: "#FFD700",
                      borderRadius: 10,
                      padding: "14px 21px",
                      boxShadow: "0 3px 20px #FFD70033",
                      minWidth: 250,
                      zIndex: 10,
                      marginTop: 12
                    }}>
                      <div style={{ fontWeight: 900, marginBottom: 6 }}>
                        <FaHistory style={{ marginRight: 6 }} />Audit Trail
                      </div>
                      <ul style={{ marginLeft: 9, marginBottom: 8 }}>
                        {(p.auditTrail && p.auditTrail.length > 0)
                          ? p.auditTrail.map((c, i) =>
                            <li key={i}><b>{c.by}</b> <span style={{ color: "#fff" }}>({c.date})</span>: {c.note}</li>
                          )
                          : <li style={{ color: "#1de682" }}>No audit entries yet.</li>
                        }
                      </ul>
                      <textarea
                        placeholder="Add audit note..."
                        value={auditNote}
                        onChange={e => setAuditNote(e.target.value)}
                        style={{
                          background: "#232a2e",
                          color: "#FFD700",
                          border: "1.5px solid #FFD700",
                          borderRadius: 7,
                          fontWeight: 700,
                          fontSize: 14,
                          padding: "8px 13px",
                          width: "100%",
                          marginBottom: 7,
                          minHeight: 37
                        }}
                      />
                      <button style={logBtnStyle}
                        onClick={() => addAudit(idx)}
                      >
                        Add Audit
                      </button>
                    </div>
                  )}
                </td>
                <td>
                  <button onClick={() => remind(idx)} style={editBtnStyle}><FaEnvelope /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{
        background: "#181e23",
        color: "#FFD700",
        borderRadius: 10,
        padding: "13px 21px",
        fontWeight: 600,
        fontSize: 15
      }}>
        <FaGavel style={{ marginRight: 7, verticalAlign: -2 }} />
        Policy risk and compliance—boardroom ready, fully auditable, and always exportable.
        <span style={{ marginLeft: 12, color: "#1de682" }}>All actions, versions, acknowledgments, and dependencies are tracked for real oversight.</span>
      </div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable, #printable * { visibility: visible; }
          #printable { position: absolute; left: 0; top: 0; }
        }
      `}</style>
    </div>
  );
}

// --- Styling constants ---
const btnStyle = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 8,
  fontWeight: 800,
  fontSize: 18,
  padding: "8px 12px",
  margin: "0 4px",
  cursor: "pointer"
};
const addBtnStyle = {
  background: "#1de682",
  color: "#232a2e",
  border: "none",
  borderRadius: 8,
  padding: "8px 18px",
  fontWeight: 900,
  fontSize: 15,
  marginLeft: 12,
  boxShadow: "0 2px 12px #1de68244",
  cursor: "pointer"
};
const editBtnStyle = {
  background: "#FFD70022",
  color: "#FFD700",
  border: "none",
  borderRadius: 8,
  fontWeight: 800,
  fontSize: 17,
  padding: "6px 11px",
  boxShadow: "0 1px 7px #FFD70022",
  cursor: "pointer"
};
const logBtnStyle = {
  background: "#FFD700",
  color: "#232a2e",
  fontWeight: 800,
  fontSize: 15,
  border: "none",
  borderRadius: 8,
  padding: "6px 15px",
  boxShadow: "0 1px 7px #FFD70033",
  cursor: "pointer"
};
const formInput = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 15,
  padding: "7px 13px",
  width: 160,
  marginBottom: 8
};
const filtInput = {
  ...formInput,
  width: 130,
  marginLeft: 7,
  marginRight: 7,
  padding: "5px 10px"
};
const snapCard = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 15,
  fontWeight: 800,
  fontSize: 17,
  padding: "14px 20px",
  minWidth: 150
};
const formLabel = {
  color: "#FFD700",
  fontWeight: 800,
  fontSize: 14
};
