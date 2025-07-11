import React, { useState } from "react";
import {
  FaFileAlt, FaUserShield, FaRegClock, FaCalendarCheck, FaExclamationTriangle,
  FaUpload, FaHistory, FaBell, FaFilePdf, FaDownload, FaUser, FaFlag, FaSearch,
  FaBug, FaBullseye, FaBrain, FaRocket, FaCheckCircle, FaChartBar, FaEnvelope
} from "react-icons/fa";

// --- CATEGORIES / AREAS ---
const CATEGORIES = [
  { key: "finance", label: "Finance", color: "#FFD700" },
  { key: "legal", label: "Legal", color: "#e94057" },
  { key: "league", label: "League Regs", color: "#1de682" },
  { key: "gdpr", label: "GDPR/Data", color: "#48b5ff" },
  { key: "hr", label: "HR & Safeguarding", color: "#8f61ff" },
  { key: "antiDoping", label: "Anti-Doping", color: "#fa5" },
  { key: "medical", label: "Medical", color: "#f36" }
];

// --- INITIAL COMPLIANCE ITEMS ---
const INITIAL_ITEMS = [
  {
    id: 1,
    area: "finance",
    item: "Submit Annual Budget",
    status: "Compliant",
    due: "2025-07-01",
    owner: "Jakov",
    file: null,
    fileUrl: "",
    policyRef: "Budgeting_Standard.pdf",
    blocker: false,
    flagged: false,
    escalation: false,
    history: [],
    notes: "",
    lastChange: "2025-06-18"
  },
  {
    id: 2,
    area: "legal",
    item: "Board Minutes Filed",
    status: "At Risk",
    due: "2025-06-25",
    owner: "Petra",
    file: null,
    fileUrl: "",
    policyRef: "Board_Governance_Policy.pdf",
    blocker: true,
    flagged: true,
    escalation: false,
    history: [],
    notes: "Last filed: 2024-09-10. New minutes needed.",
    lastChange: "2025-06-17"
  },
  {
    id: 3,
    area: "gdpr",
    item: "Consent Forms All Athletes",
    status: "Non-Compliant",
    due: "2025-06-23",
    owner: "Ana",
    file: null,
    fileUrl: "",
    policyRef: "GDPR_Consent_Policy.pdf",
    blocker: true,
    flagged: false,
    escalation: true,
    history: [],
    notes: "20 athletes missing forms.",
    lastChange: "2025-06-17"
  }
];

// --- STATUS COLORS ---
const STATUS_COLOR = {
  "Compliant": "#1de682",
  "At Risk": "#FFD700",
  "Non-Compliant": "#e94057"
};

// --- AI/ANALYTICS SIM ---
function aiInsight(items) {
  const nonCompliant = items.filter(i => i.status === "Non-Compliant").length;
  const atRisk = items.filter(i => i.status === "At Risk").length;
  if (nonCompliant > 1)
    return "⚠️ Multiple non-compliance issues. Immediate action needed to avoid risk of penalties or board escalation.";
  if (atRisk > 2)
    return "⚠️ High number of 'At Risk' items. Recommend assigning additional resources or holding a compliance review.";
  return "✅ All compliance areas generally under control. Maintain regular monitoring and timely document updates.";
}

// --- POLICY REFERENCE LINKS (simulate) ---
const POLICY_LIBRARY = {
  "Budgeting_Standard.pdf": "/policies/Budgeting_Standard.pdf",
  "Board_Governance_Policy.pdf": "/policies/Board_Governance_Policy.pdf",
  "GDPR_Consent_Policy.pdf": "/policies/GDPR_Consent_Policy.pdf"
};

function ComplianceMonitoringDashboard() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showUpload, setShowUpload] = useState(null);
  const [fileName, setFileName] = useState("");
  const [note, setNote] = useState("");
  const [showHistory, setShowHistory] = useState(null);
  const [showEscalate, setShowEscalate] = useState(null);

  // File upload simulation
  function handleFileUpload(id, file) {
    setItems(list => list.map(i =>
      i.id === id ? { ...i, file: file.name, fileUrl: "#", lastChange: new Date().toISOString().slice(0, 10) } : i
    ));
    setShowUpload(null);
    setFileName("");
  }

  // Status update
  function handleStatus(id, status) {
    setItems(list => list.map(i =>
      i.id === id
        ? {
            ...i,
            status,
            history: [...i.history, {
              time: new Date().toLocaleString(),
              by: "Admin",
              action: `Set to ${status}`
            }],
            lastChange: new Date().toISOString().slice(0, 10)
          }
        : i
    ));
  }

  // Add note
  function handleAddNote(id) {
    setItems(list => list.map(i =>
      i.id === id
        ? {
            ...i,
            notes: note,
            history: [...i.history, {
              time: new Date().toLocaleString(),
              by: "Admin",
              action: `Note added`
            }],
            lastChange: new Date().toISOString().slice(0, 10)
          }
        : i
    ));
    setSelected(null);
    setNote("");
  }

  // Add new item (demo)
  function addNew() {
    setItems(list => [
      ...list,
      {
        id: list.length + 1,
        area: "finance",
        item: "New Compliance Item",
        status: "At Risk",
        due: "2025-09-01",
        owner: "You",
        file: null,
        fileUrl: "",
        policyRef: "",
        blocker: false,
        flagged: false,
        escalation: false,
        history: [],
        notes: "",
        lastChange: new Date().toISOString().slice(0, 10)
      }
    ]);
  }

  // Toggle blocker/flagged/escalation
  function toggleField(id, field) {
    setItems(list => list.map(i =>
      i.id === id ? { ...i, [field]: !i[field] } : i
    ));
  }

  // Escalate to board
  function handleEscalate(id) {
    setItems(list => list.map(i =>
      i.id === id ? { ...i, escalation: true, history: [...i.history, { time: new Date().toLocaleString(), by: "Admin", action: "Escalated to Board" }] } : i
    ));
    setShowEscalate(null);
  }

  // Filtering
  let display = items;
  if (filter !== "All") display = display.filter(i => i.area === filter);
  if (search.trim()) display = display.filter(i =>
    i.item.toLowerCase().includes(search.toLowerCase()) ||
    i.owner.toLowerCase().includes(search.toLowerCase())
  );

  // --- Sectional Analytics ---
  const complianceStats = CATEGORIES.map(cat => {
    const arr = items.filter(i => i.area === cat.key);
    if (arr.length === 0) return null;
    const compliant = arr.filter(i => i.status === "Compliant").length;
    const risk = arr.filter(i => i.status === "At Risk").length;
    const non = arr.filter(i => i.status === "Non-Compliant").length;
    return {
      ...cat,
      total: arr.length,
      compliant, risk, non
    };
  }).filter(Boolean);

  return (
    <div style={{ maxWidth: 1320, margin: "0 auto", padding: 30 }}>
      <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 32 }}>
        <FaUserShield style={{ marginRight: 8, marginBottom: -7 }} />
        Compliance & Monitoring Dashboard
      </h2>

      {/* --- AI INSIGHTS / ALERTS --- */}
      <div style={{
        background: "#1d2e35",
        padding: "17px 22px",
        borderRadius: 13,
        marginBottom: 19,
        color: "#fff",
        boxShadow: "0 2px 10px #FFD70024",
        display: "flex", alignItems: "center", gap: 15
      }}>
        <FaBrain style={{ color: "#FFD700", fontSize: 29, marginRight: 7 }} />
        <span style={{ fontSize: 17, fontWeight: 600 }}>{aiInsight(items)}</span>
      </div>

      {/* --- QUICK STATS HEATMAP --- */}
      <div style={{
        display: "flex", gap: 19, marginBottom: 14, flexWrap: "wrap"
      }}>
        {complianceStats.map(stat => (
          <div key={stat.key} style={{
            background: "#232a2e", borderRadius: 11,
            padding: "12px 28px 12px 18px",
            color: "#fff", minWidth: 190, boxShadow: "0 2px 10px #FFD70022"
          }}>
            <div style={{ fontWeight: 900, color: stat.color, fontSize: 16 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 14 }}>
              <FaCheckCircle style={{ color: "#1de682", marginRight: 4 }} /> {stat.compliant} Compliant<br />
              <FaExclamationTriangle style={{ color: "#FFD700", marginRight: 4 }} /> {stat.risk} At Risk<br />
              <FaBug style={{ color: "#e94057", marginRight: 4 }} /> {stat.non} Non-Compliant
            </div>
          </div>
        ))}
      </div>

      {/* --- FILTER/SEARCH/ACTIONS --- */}
      <div style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "center" }}>
        <FaSearch style={{ color: "#FFD700", fontSize: 19 }} />
        <input
          placeholder="Search compliance items…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ borderRadius: 8, fontSize: 16, padding: "5px 12px", width: 200 }}
        />
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ borderRadius: 8, fontSize: 15 }}>
          <option value="All">All Areas</option>
          {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
        <button onClick={addNew} style={{
          background: "#FFD700", color: "#222", borderRadius: 8, fontWeight: 800, fontSize: 15,
          padding: "8px 19px"
        }}>
          <FaRocket style={{ marginRight: 5, marginBottom: -3 }} /> Add Item
        </button>
      </div>

      {/* --- COMPLIANCE CHECKLIST TABLE --- */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18 }}>
        <thead>
          <tr>
            <th style={{ color: "#FFD700", fontWeight: 700 }}>Area</th>
            <th>Item</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Owner</th>
            <th>File</th>
            <th>Policy Ref</th>
            <th>Blocker</th>
            <th>Escalate</th>
            <th>Notes</th>
            <th>Audit Trail</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {display.map(i => {
            const daysLeft = Math.ceil(
              (new Date(i.due) - new Date()) / (1000 * 3600 * 24)
            );
            let deadlineStyle = {};
            if (daysLeft <= 7) deadlineStyle = { color: "#e94057", fontWeight: 700 };
            else if (daysLeft <= 14) deadlineStyle = { color: "#FFD700", fontWeight: 600 };
            else if (daysLeft <= 30) deadlineStyle = { color: "#1de682" };
            return (
              <tr key={i.id} style={{ background: "#232a2e" }}>
                <td style={{ color: CATEGORIES.find(c => c.key === i.area)?.color || "#FFD700", fontWeight: 700 }}>
                  {CATEGORIES.find(c => c.key === i.area)?.label || i.area}
                </td>
                <td style={{ fontWeight: 700 }}>{i.item}</td>
                <td>
                  <span style={{
                    color: STATUS_COLOR[i.status], background: "#181e23",
                    border: `2.5px solid ${STATUS_COLOR[i.status]}`, borderRadius: 8, fontWeight: 900,
                    padding: "2px 9px", fontSize: 15
                  }}>{i.status}</span>
                </td>
                <td style={deadlineStyle}>
                  <FaCalendarCheck style={{ marginRight: 5 }} />
                  {i.due}
                  {daysLeft <= 30 &&
                    <span style={{ marginLeft: 7 }}>
                      <FaBell style={{ color: "#FFD700", marginBottom: -2 }} />
                      {daysLeft > 0
                        ? `${daysLeft}d left`
                        : <span style={{ color: "#e94057" }}> Overdue!</span>}
                    </span>
                  }
                </td>
                <td>
                  <FaUser style={{ marginRight: 4 }} />{i.owner}
                </td>
                <td>
                  {i.file ? (
                    <a href={i.fileUrl || "#"} style={{ color: "#FFD700", fontWeight: 700 }}>
                      <FaFileAlt style={{ marginBottom: -2, marginRight: 2 }} /> {i.file}
                    </a>
                  ) : (
                    <button
                      onClick={() => setShowUpload(i.id)}
                      style={{
                        background: "#FFD700", color: "#232a2e",
                        borderRadius: 7, fontWeight: 700, fontSize: 14, padding: "3px 12px", border: "none"
                      }}>
                      <FaUpload style={{ marginBottom: -2, marginRight: 2 }} />Upload
                    </button>
                  )}
                </td>
                <td>
                  {i.policyRef ? (
                    <a
                      href={POLICY_LIBRARY[i.policyRef] || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#1de682", fontWeight: 700, textDecoration: "underline"
                      }}
                    >
                      <FaFilePdf style={{ marginRight: 4, marginBottom: -2 }} /> {i.policyRef.replace(".pdf", "")}
                    </a>
                  ) : (
                    <span style={{ color: "#FFD70088", fontStyle: "italic" }}>n/a</span>
                  )}
                </td>
                <td>
                  <button
                    title="Mark as blocker for club ops"
                    onClick={() => toggleField(i.id, "blocker")}
                    style={{
                      background: i.blocker ? "#e94057" : "#181e23",
                      color: i.blocker ? "#fff" : "#FFD70077",
                      border: "none",
                      borderRadius: 7,
                      fontWeight: 900,
                      padding: "2px 13px"
                    }}
                  >
                    <FaBullseye style={{ marginBottom: -2 }} /> {i.blocker ? "Blocker" : "—"}
                  </button>
                </td>
                <td>
                  <button
                    title="Escalate to board"
                    onClick={() => setShowEscalate(i.id)}
                    style={{
                      background: i.escalation ? "#FFD700" : "#181e23",
                      color: i.escalation ? "#e94057" : "#FFD70077",
                      border: "none",
                      borderRadius: 7,
                      fontWeight: 900,
                      padding: "2px 12px"
                    }}
                  >
                    <FaEnvelope style={{ marginBottom: -2 }} /> {i.escalation ? "Escalated" : "Escalate"}
                  </button>
                </td>
                <td style={{ maxWidth: 120, color: "#fff" }}>{i.notes}</td>
                <td>
                  <button
                    onClick={() => setShowHistory(i.id)}
                    style={{
                      background: "#1de682", color: "#232a2e",
                      borderRadius: 7, fontWeight: 700, fontSize: 14, padding: "3px 12px", border: "none"
                    }}>
                    <FaHistory style={{ marginBottom: -2, marginRight: 2 }} />View
                  </button>
                </td>
                <td>
                  <select value={i.status} onChange={e => handleStatus(i.id, e.target.value)} style={{ borderRadius: 7, fontSize: 14 }}>
                    <option>Compliant</option>
                    <option>At Risk</option>
                    <option>Non-Compliant</option>
                  </select>
                  <button
                    onClick={() => setSelected(i.id)}
                    style={{
                      background: "#8f61ff", color: "#fff", borderRadius: 7, fontWeight: 700, fontSize: 14, padding: "2px 8px", marginLeft: 5, border: "none"
                    }}>
                    Add Note
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ fontSize: 14, color: "#FFD700cc", fontWeight: 500, textAlign: 'center', marginTop: 10 }}>
        <FaFlag style={{ marginBottom: -2, marginRight: 5 }} />
        All actions are logged for board/federation audits. Attach supporting docs. Set status and owner. Deadline alerts activate 30/14/7d before due.
      </div>

      {/* --- MODALS --- */}
      {showUpload && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#232a2e", padding: 38, borderRadius: 16, minWidth: 350, color: "#fff" }}>
            <h3 style={{ color: "#FFD700" }}>Upload Compliance Document</h3>
            <input type="file" onChange={e => setFileName(e.target.files[0])} style={{ marginBottom: 14 }} />
            <button
              onClick={() => handleFileUpload(showUpload, fileName)}
              style={{
                background: "#FFD700", color: "#232a2e", borderRadius: 8, fontWeight: 700,
                fontSize: 15, padding: "7px 18px", border: "none", marginRight: 8
              }}>Upload</button>
            <button
              onClick={() => setShowUpload(null)}
              style={{
                background: "#8f61ff", color: "#fff", borderRadius: 8, fontWeight: 700,
                fontSize: 15, padding: "7px 18px", border: "none"
              }}>Cancel</button>
          </div>
        </div>
      )}

      {selected && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.75)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#232a2e", padding: 39, borderRadius: 16, minWidth: 380, color: "#fff" }}>
            <h3 style={{ color: "#FFD700" }}>Add Note</h3>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              style={{ width: "100%", borderRadius: 7, fontSize: 15, marginTop: 7, marginBottom: 16 }}
            />
            <button
              onClick={() => handleAddNote(selected)}
              style={{
                background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 700, fontSize: 16, padding: "7px 18px", marginRight: 16, border: "none"
              }}>Save</button>
            <button
              onClick={() => setSelected(null)}
              style={{
                background: "#FFD700", color: "#232a2e", borderRadius: 8, fontWeight: 700, fontSize: 15, padding: "7px 18px", border: "none"
              }}>Cancel</button>
          </div>
        </div>
      )}

      {showEscalate && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.75)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#232a2e", padding: 42, borderRadius: 18, minWidth: 420, color: "#fff" }}>
            <h3 style={{ color: "#FFD700" }}>
              <FaEnvelope style={{ marginRight: 7, marginBottom: -4 }} />
              Escalate to Board/Exec
            </h3>
            <div style={{ margin: "13px 0 18px 0", color: "#FFD700bb" }}>
              Are you sure you want to escalate this item to the Board/Executive? They will be notified immediately.
            </div>
            <button
              onClick={() => handleEscalate(showEscalate)}
              style={{
                background: "#FFD700", color: "#232a2e", borderRadius: 8, fontWeight: 700,
                fontSize: 16, padding: "7px 22px", border: "none", marginRight: 15
              }}>Escalate</button>
            <button
              onClick={() => setShowEscalate(null)}
              style={{
                background: "#8f61ff", color: "#fff", borderRadius: 8, fontWeight: 700,
                fontSize: 16, padding: "7px 22px", border: "none"
              }}>Cancel</button>
          </div>
        </div>
      )}

      {showHistory && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.9)", zIndex: 9997, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#232a2e", padding: 36, borderRadius: 18, minWidth: 410, color: "#fff" }}>
            <h3 style={{ color: "#FFD700" }}><FaHistory style={{ marginRight: 6, marginBottom: -3 }} />Audit Trail</h3>
            <ul>
              {items.find(i => i.id === showHistory)?.history?.length
                ? items.find(i => i.id === showHistory).history.map((h, i) =>
                  <li key={i} style={{ marginBottom: 4 }}>
                    <b>{h.time}:</b> <span style={{ color: "#FFD700" }}>{h.action}</span> <i style={{ color: "#1de682" }}>({h.by})</i>
                  </li>
                )
                : <li style={{ color: "#aaa" }}>No audit history yet.</li>
              }
            </ul>
            <button
              onClick={() => setShowHistory(null)}
              style={{
                background: "#FFD700", color: "#232a2e", borderRadius: 8, fontWeight: 700, fontSize: 15, padding: "7px 18px", border: "none"
              }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplianceMonitoringDashboard;
