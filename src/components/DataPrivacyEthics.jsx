import React, { useState } from "react";
import { FaUserShield, FaCheck, FaTimes, FaFlag, FaFileExport, FaClipboardCheck, FaInfoCircle, FaCalendarAlt, FaPlus } from "react-icons/fa";

// Helper: months to next review
function calcNextReview(lastAudit, freq) {
  if (!lastAudit || !freq) return "";
  const months = { "Annual": 12, "6 Months": 6, "Quarterly": 3, "Monthly": 1 }[freq] || 12;
  const d = new Date(lastAudit);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

const INIT = [
  {
    id: 1,
    process: "Athlete Registration Portal",
    area: "Player Data",
    owner: "Club Secretary",
    dpo: "Petar Horvat",
    criticality: "High",
    reviewFreq: "Annual",
    riskLevel: "Medium",
    description: "Online form for player/family data. GDPR risk, uses 3rd party hosting.",
    privacyScore: 3,
    ethicsScore: 4,
    documentation: ["https://club.com/privacy-policy.pdf"],
    boardSignoff: false,
    lastAudit: "2024-05-16",
    status: "Pending",
    comments: ["Check server location and data processor agreement."],
    auditLog: [
      { by: "Club Secretary", date: "2024-05-16", action: "Created process" }
    ]
  },
  {
    id: 2,
    process: "Medical Records Upload",
    area: "Health Data",
    owner: "Medical Officer",
    dpo: "Dr. Luka Kovač",
    criticality: "High",
    reviewFreq: "6 Months",
    riskLevel: "High",
    description: "Uploads and stores player medical certificates. Involves minors.",
    privacyScore: 2,
    ethicsScore: 4,
    documentation: [],
    boardSignoff: true,
    lastAudit: "2024-06-01",
    status: "Active",
    comments: ["Need DPO signoff every 6 months."],
    auditLog: [
      { by: "Medical Officer", date: "2024-06-01", action: "Audit passed, DPO signed off" }
    ]
  },
  {
    id: 3,
    process: "Video Analytics (AI Tool)",
    area: "Analytics",
    owner: "Performance Lead",
    dpo: "Board DPO",
    criticality: "Low",
    reviewFreq: "Annual",
    riskLevel: "Low",
    description: "No personal data stored, only anonymized stats.",
    privacyScore: 5,
    ethicsScore: 5,
    documentation: [],
    boardSignoff: true,
    lastAudit: "2024-05-10",
    status: "Active",
    comments: ["No personal data."],
    auditLog: [
      { by: "Board DPO", date: "2024-05-10", action: "Board review and signoff" }
    ]
  },
  {
    id: 4,
    process: "Event Signup (Summer Camp)",
    area: "Events",
    owner: "Events Coordinator",
    dpo: "Petar Horvat",
    criticality: "Medium",
    reviewFreq: "Annual",
    riskLevel: "Medium",
    description: "Collects names, ages, contacts for external camps. Parental consent mandatory.",
    privacyScore: 3,
    ethicsScore: 4,
    documentation: [],
    boardSignoff: false,
    lastAudit: "2024-02-20",
    status: "Pending",
    comments: ["Parental consent check required."],
    auditLog: [
      { by: "Events Coordinator", date: "2024-02-20", action: "Created, pending board review" }
    ]
  },
  {
    id: 5,
    process: "Marketing Email Platform (MailChimp)",
    area: "Marketing",
    owner: "Marketing Lead",
    dpo: "Board DPO",
    criticality: "Medium",
    reviewFreq: "Quarterly",
    riskLevel: "Medium",
    description: "Stores emails, sends newsletters, tracks opens. Uses external servers.",
    privacyScore: 3,
    ethicsScore: 3,
    documentation: [],
    boardSignoff: false,
    lastAudit: "2024-05-01",
    status: "Pending",
    comments: ["Confirm EU data center."],
    auditLog: [
      { by: "Marketing Lead", date: "2024-05-01", action: "Created marketing integration" }
    ]
  },
  {
    id: 6,
    process: "Sponsor Contact Sharing",
    area: "Sponsors",
    owner: "Commercial Manager",
    dpo: "Board DPO",
    criticality: "High",
    reviewFreq: "Annual",
    riskLevel: "High",
    description: "Sharing contact info with sponsors for direct campaigns. Requires opt-in consent.",
    privacyScore: 2,
    ethicsScore: 2,
    documentation: [],
    boardSignoff: false,
    lastAudit: "2024-03-13",
    status: "Pending",
    comments: ["Consent check missing."],
    auditLog: [
      { by: "Commercial Manager", date: "2024-03-13", action: "Raised process with board" }
    ]
  },
  {
    id: 7,
    process: "Club Social Media Photos",
    area: "Media",
    owner: "Media Officer",
    dpo: "Board DPO",
    criticality: "Low",
    reviewFreq: "Annual",
    riskLevel: "Low",
    description: "Posts team photos and action shots. All players sign image release annually.",
    privacyScore: 4,
    ethicsScore: 4,
    documentation: [],
    boardSignoff: true,
    lastAudit: "2024-06-10",
    status: "Active",
    comments: ["Release form collected for all athletes."],
    auditLog: [
      { by: "Media Officer", date: "2024-06-10", action: "Board approval after audit" }
    ]
  }
];

const RISK_COLORS = {
  "Low": "#1de682", // green
  "Medium": "#FFD700", // gold
  "High": "#e82e2e" // red
};

const CRIT_COLORS = {
  "Low": "#fff",
  "Medium": "#FFD700bb",
  "High": "#e82e2e"
};

const FREQS = ["Annual", "6 Months", "Quarterly", "Monthly"];

export default function DataPrivacyEthics() {
  const [rows, setRows] = useState(INIT);
  const [showAdd, setShowAdd] = useState(false);
  const [newRow, setNewRow] = useState({
    process: "", area: "", owner: "", dpo: "", criticality: "Low", reviewFreq: "Annual",
    riskLevel: "Low", description: "",
    privacyScore: 3, ethicsScore: 3, documentation: [], boardSignoff: false, lastAudit: "", status: "Pending", comments: [], auditLog: []
  });
  const [docInput, setDocInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [auditIdx, setAuditIdx] = useState(null);

  function addRow(e) {
    e.preventDefault();
    setRows([
      {
        ...newRow,
        id: Date.now(),
        documentation: (newRow.documentation || []),
        comments: (newRow.comments || []),
        lastAudit: new Date().toISOString().slice(0, 10),
        auditLog: [{ by: newRow.owner, date: new Date().toISOString().slice(0, 10), action: "Created process" }]
      },
      ...rows
    ]);
    setNewRow({
      process: "", area: "", owner: "", dpo: "", criticality: "Low", reviewFreq: "Annual",
      riskLevel: "Low", description: "",
      privacyScore: 3, ethicsScore: 3, documentation: [], boardSignoff: false, lastAudit: "", status: "Pending", comments: [], auditLog: []
    });
    setShowAdd(false);
  }

  function addDoc(idx) {
    if (!docInput.trim()) return;
    setRows(r =>
      r.map((row, i) =>
        i === idx ? {
          ...row,
          documentation: [...(row.documentation || []), docInput],
          auditLog: [...(row.auditLog || []), { by: row.owner, date: new Date().toISOString().slice(0, 10), action: "Added doc" }]
        } : row
      )
    );
    setDocInput("");
  }

  function addComment(idx) {
    if (!commentInput.trim()) return;
    setRows(r =>
      r.map((row, i) =>
        i === idx ? {
          ...row,
          comments: [...(row.comments || []), commentInput],
          auditLog: [...(row.auditLog || []), { by: row.owner, date: new Date().toISOString().slice(0, 10), action: "Added comment" }]
        } : row
      )
    );
    setCommentInput("");
  }

  function toggleSignoff(idx) {
    setRows(r =>
      r.map((row, i) =>
        i === idx
          ? {
            ...row,
            boardSignoff: !row.boardSignoff,
            auditLog: [
              ...(row.auditLog || []),
              {
                by: "Board",
                date: new Date().toISOString().slice(0, 10),
                action: row.boardSignoff ? "Removed signoff" : "Board signoff"
              }
            ]
          }
          : row
      )
    );
  }

  function exportCSV() {
    const rowsArr = [["Process", "Area", "Owner", "DPO", "Criticality", "ReviewFreq", "RiskLevel", "Description", "PrivacyScore", "EthicsScore", "Docs", "Signoff", "LastAudit", "Status", "Comments"]];
    rows.forEach(r =>
      rowsArr.push([
        r.process, r.area, r.owner, r.dpo, r.criticality, r.reviewFreq, r.riskLevel, r.description,
        r.privacyScore, r.ethicsScore,
        (r.documentation || []).join("; "),
        r.boardSignoff ? "Yes" : "No",
        r.lastAudit, r.status,
        (r.comments || []).join(" | ")
      ])
    );
    const csv = rowsArr.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data_privacy_ethics.csv";
    a.click();
  }

  return (
    <div style={{
      background: "linear-gradient(135deg,#232a2e 0%,#283E51 100%)",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 24,
      padding: 22,
      maxWidth: 1100,
      margin: "0 auto"
    }}>
      <div style={{ height: 7, borderRadius: 5, margin: "0 0 24px 0", background: "linear-gradient(90deg, #FFD700 30%, #1de682 100%)" }} />
      <h2 style={{ fontWeight: 900, marginBottom: 14 }}>
        <FaUserShield style={{ marginRight: 8 }} /> Data Privacy & Ethics Tracker
      </h2>
      <div style={{ marginBottom: 18, fontSize: 15, background: "#232a2e", borderRadius: 12, padding: "10px 18px", color: "#FFD700cc" }}>
        <FaInfoCircle style={{ marginRight: 7, verticalAlign: -2 }} />
        <b>Purpose:</b> Track every data process and project for privacy/ethics risk, documentation, criticality, review, DPO, audit, and board signoff.
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "12px 0" }}>
        <button style={addBtnStyle} onClick={() => setShowAdd(true)}><FaPlus /> Add Process</button>
        <button style={btnStyle} onClick={exportCSV}><FaFileExport /> Export</button>
      </div>
      {showAdd && (
        <form onSubmit={addRow} style={{
          background: "#232a2e",
          borderRadius: 12,
          padding: "18px 20px",
          margin: "12px 0",
          boxShadow: "0 2px 12px #FFD70018"
        }}>
          <div style={{ display: "flex", gap: 13, flexWrap: "wrap" }}>
            <div>
              <label style={formLabel}>Process:</label><br />
              <input required value={newRow.process} onChange={e => setNewRow(n => ({ ...n, process: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Area:</label><br />
              <input value={newRow.area} onChange={e => setNewRow(n => ({ ...n, area: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Owner:</label><br />
              <input value={newRow.owner} onChange={e => setNewRow(n => ({ ...n, owner: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>DPO Contact:</label><br />
              <input value={newRow.dpo} onChange={e => setNewRow(n => ({ ...n, dpo: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Criticality:</label><br />
              <select value={newRow.criticality} onChange={e => setNewRow(n => ({ ...n, criticality: e.target.value }))} style={formInput}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
            <div>
              <label style={formLabel}>Review Freq.:</label><br />
              <select value={newRow.reviewFreq} onChange={e => setNewRow(n => ({ ...n, reviewFreq: e.target.value }))} style={formInput}>
                {FREQS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={formLabel}>Risk Level:</label><br />
              <select value={newRow.riskLevel} onChange={e => setNewRow(n => ({ ...n, riskLevel: e.target.value }))} style={formInput}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
            <div>
              <label style={formLabel}>Privacy Score (1-5):</label><br />
              <input type="number" min={1} max={5} value={newRow.privacyScore} onChange={e => setNewRow(n => ({ ...n, privacyScore: parseInt(e.target.value) }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Ethics Score (1-5):</label><br />
              <input type="number" min={1} max={5} value={newRow.ethicsScore} onChange={e => setNewRow(n => ({ ...n, ethicsScore: parseInt(e.target.value) }))} style={formInput} />
            </div>
          </div>
          <div>
            <label style={formLabel}>Description:</label><br />
            <textarea value={newRow.description} onChange={e => setNewRow(n => ({ ...n, description: e.target.value }))} style={{ ...formInput, minWidth: 220, minHeight: 40 }} />
          </div>
          <button type="submit" style={addBtnStyle}><FaCheck /> Add</button>
          <button type="button" style={editBtnStyle} onClick={() => setShowAdd(false)}><FaTimes /> Cancel</button>
        </form>
      )}
      <div style={{ overflowX: "auto", maxWidth: "100%", margin: "0 0 10px 0" }}>
      <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse", background: "#232a2e", borderRadius: 12 }}>
        <thead>
          <tr style={{ color: "#FFD700" }}>
            <th>Process</th>
            <th>Area</th>
            <th>Owner</th>
            <th>DPO</th>
            <th>Criticality</th>
            <th>Review</th>
            <th>Risk</th>
            <th>Description</th>
            <th>Privacy</th>
            <th>Ethics</th>
            <th>Docs</th>
            <th>Signoff</th>
            <th>Last Audit</th>
            <th>Next Review</th>
            <th>Status</th>
            <th>Comments</th>
            <th>Audit Log</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id}>
              <td>{row.process}</td>
              <td>{row.area}</td>
              <td>{row.owner}</td>
              <td>{row.dpo}</td>
              <td>
                <span style={{
                  background: CRIT_COLORS[row.criticality],
                  color: row.criticality === "High" ? "#fff" : "#232a2e",
                  borderRadius: 5,
                  padding: "1px 7px",
                  fontWeight: 800
                }}>{row.criticality} {row.criticality === "High" && <FaFlag style={{ color: "#e82e2e" }} />}</span>
              </td>
              <td>{row.reviewFreq}</td>
              <td>
                <span style={{
                  background: RISK_COLORS[row.riskLevel],
                  color: "#232a2e",
                  borderRadius: 5,
                  padding: "1px 8px",
                  fontWeight: 800
                }}>{row.riskLevel}</span>
              </td>
              <td style={{ fontSize: 13, maxWidth: 180, wordBreak: "break-word" }}>{row.description}</td>
              <td>
                <span style={{
                  background: row.privacyScore < 3 ? "#e82e2e" : row.privacyScore === 3 ? "#FFD700" : "#1de682",
                  color: "#232a2e",
                  borderRadius: 5,
                  padding: "1px 7px",
                  fontWeight: 800
                }}>{row.privacyScore}</span>
              </td>
              <td>
                <span style={{
                  background: row.ethicsScore < 3 ? "#e82e2e" : row.ethicsScore === 3 ? "#FFD700" : "#1de682",
                  color: "#232a2e",
                  borderRadius: 5,
                  padding: "1px 7px",
                  fontWeight: 800
                }}>{row.ethicsScore}</span>
              </td>
              <td>
                {(row.documentation || []).map((d, i) =>
                  <div key={i}><a href={d} target="_blank" rel="noopener noreferrer" style={{ color: "#1de682" }}>Doc {i + 1}</a></div>
                )}
                <input value={docInput} onChange={e => setDocInput(e.target.value)} placeholder="URL" style={formInput} />
                <button style={editBtnStyle} onClick={() => addDoc(idx)}><FaClipboardCheck /></button>
              </td>
              <td>
                <button style={{
                  background: row.boardSignoff ? "#1de682" : "#FFD70033",
                  color: row.boardSignoff ? "#232a2e" : "#FFD700",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: 14,
                  padding: "5px 12px",
                  cursor: "pointer"
                }} onClick={() => toggleSignoff(idx)}>
                  {row.boardSignoff ? <FaCheck /> : <FaTimes />}
                </button>
              </td>
              <td>{row.lastAudit}</td>
              <td>
                <span style={{ color: "#1de682", fontWeight: 900 }}>
                  {calcNextReview(row.lastAudit, row.reviewFreq)}
                </span>
              </td>
              <td>
                <span style={{
                  color: row.status === "Active" ? "#1de682" : "#FFD700",
                  fontWeight: 900
                }}>{row.status}</span>
              </td>
              <td>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {(row.comments || []).map((c, i) => (
                    <li key={i} style={{ fontSize: 11 }}>{c}</li>
                  ))}
                </ul>
                <input value={commentInput} onChange={e => setCommentInput(e.target.value)} placeholder="Comment" style={formInput} />
                <button style={addBtnStyle} onClick={() => addComment(idx)}><FaPlus /> Add</button>
              </td>
              <td>
                <button style={editBtnStyle} onClick={() => setAuditIdx(auditIdx === idx ? null : idx)}><FaCalendarAlt /> Audit</button>
                {auditIdx === idx && (
                  <ul style={{
                    background: "#232a2e", color: "#FFD700", borderRadius: 8, fontSize: 12,
                    listStyle: "none", padding: "6px 9px", margin: "6px 0", maxHeight: 90, overflowY: "auto"
                  }}>
                    {(row.auditLog || []).map((a, i) =>
                      <li key={i}>{a.date} | {a.by}: {a.action}</li>
                    )}
                  </ul>
                )}
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
        padding: "11px 14px",
        fontWeight: 600,
        fontSize: 14,
        marginTop: 17
      }}>
        <FaUserShield style={{ marginRight: 7, verticalAlign: -2 }} />
        Every entry is fully auditable. Criticality, review, DPO, risk, signoff—all board and regulatory ready.
      </div>
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
  fontSize: 16,
  padding: "6px 10px",
  margin: "0 3px",
  cursor: "pointer"
};
const addBtnStyle = {
  background: "#1de682",
  color: "#232a2e",
  border: "none",
  borderRadius: 8,
  padding: "6px 12px",
  fontWeight: 900,
  fontSize: 14,
  marginLeft: 7,
  boxShadow: "0 2px 10px #1de68244",
  cursor: "pointer"
};
const editBtnStyle = {
  background: "#FFD70022",
  color: "#FFD700",
  border: "none",
  borderRadius: 8,
  fontWeight: 800,
  fontSize: 14,
  padding: "5px 8px",
  boxShadow: "0 1px 7px #FFD70022",
  cursor: "pointer"
};
const formInput = {
  background: "#fff",
  color: "#232a2e",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 13,
  padding: "6px 7px",
  width: 80,
  marginBottom: 4
};
const formLabel = {
  color: "#FFD700",
  fontWeight: 800,
  fontSize: 13
};
