import React, { useState } from "react";
import { FaRobot, FaCheckCircle, FaClock, FaArrowRight, FaTimesCircle, FaClipboardList, FaEdit, FaCommentDots, FaPlus, FaStar, FaCalendarAlt, FaUserTie, FaSearch, FaBolt } from "react-icons/fa";

// Sample modules
const SOURCES = [
  "Performance Analytics",
  "Community Impact",
  "Volunteer Pipeline",
  "Resource Gap",
  "Compliance/Accreditation",
  "Athlete Development"
];
const PRIORITIES = ["High", "Medium", "Low"];
const INIT_SUGGESTIONS = [
  {
    id: 1,
    source: "Performance Analytics",
    insight: "Skill progression for U17 team below league benchmark",
    aiAction: "Schedule extra skill sessions; consider outside skills coach",
    priority: "High",
    by: "AI",
    status: "Suggested",
    owner: "",
    scheduled: "",
    outcome: "",
    notes: [],
    impact: 0,
    date: "2025-06-15"
  },
  {
    id: 2,
    source: "Resource Gap",
    insight: "Equipment budget below target for Q2",
    aiAction: "Approve emergency budget transfer or delay non-essentials",
    priority: "Medium",
    by: "AI",
    status: "Suggested",
    owner: "",
    scheduled: "",
    outcome: "",
    notes: [],
    impact: 0,
    date: "2025-06-14"
  },
  {
    id: 3,
    source: "Volunteer Pipeline",
    insight: "Only 2 active volunteers in events; risk of burnout",
    aiAction: "Recruit parents for summer events, offer reward incentives",
    priority: "High",
    by: "AI",
    status: "Suggested",
    owner: "",
    scheduled: "",
    outcome: "",
    notes: [],
    impact: 0,
    date: "2025-06-10"
  },
  {
    id: 4,
    source: "Compliance/Accreditation",
    insight: "Coach certifications expiring next month",
    aiAction: "Mandate re-certification, schedule group renewal",
    priority: "High",
    by: "AI",
    status: "Suggested",
    owner: "",
    scheduled: "",
    outcome: "",
    notes: [],
    impact: 0,
    date: "2025-06-13"
  },
  {
    id: 5,
    source: "Athlete Development",
    insight: "Petar Horvat missed 4 wellness check-ins",
    aiAction: "Coach to check in with athlete; flag for potential support",
    priority: "Medium",
    by: "AI",
    status: "Suggested",
    owner: "",
    scheduled: "",
    outcome: "",
    notes: [],
    impact: 0,
    date: "2025-06-15"
  }
];

const STATUS = ["Suggested", "Accepted", "Scheduled", "Delegated", "Ignored", "Completed"];

export default function AINextBestAction() {
  const [suggestions, setSuggestions] = useState(INIT_SUGGESTIONS);
  const [filter, setFilter] = useState({ source: "All", priority: "All", status: "All", owner: "" });
  const [showNoteIdx, setShowNoteIdx] = useState(null);
  const [addNote, setAddNote] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [editAction, setEditAction] = useState("");

  // Filter logic
  const filtered = suggestions.filter(s =>
    (filter.source === "All" || s.source === filter.source) &&
    (filter.priority === "All" || s.priority === filter.priority) &&
    (filter.status === "All" || s.status === filter.status) &&
    (filter.owner === "" || (s.owner || "").toLowerCase().includes(filter.owner.toLowerCase()))
  );

  // Analytics
  const total = suggestions.length;
  const completed = suggestions.filter(s => s.status === "Completed").length;
  const acted = suggestions.filter(s => ["Accepted", "Scheduled", "Delegated", "Completed"].includes(s.status)).length;
  const ignored = suggestions.filter(s => s.status === "Ignored").length;
  const followThrough = ((acted / (total || 1)) * 100).toFixed(1);

  // Accept, schedule, delegate, ignore
  function handleStatus(idx, newStatus) {
    setSuggestions(suggestions =>
      suggestions.map((s, i) =>
        i === idx
          ? {
              ...s,
              status: newStatus,
              scheduled: newStatus === "Scheduled" ? new Date().toISOString().slice(0, 10) : s.scheduled,
              owner: newStatus === "Delegated" ? "Board" : s.owner // Example; can make richer
            }
          : s
      )
    );
  }
  // Edit action wording
  function saveEdit(idx) {
    setSuggestions(suggestions =>
      suggestions.map((s, i) =>
        i === idx
          ? { ...s, aiAction: editAction }
          : s
      )
    );
    setEditIdx(null);
    setEditAction("");
  }
  // Add board/staff note
  function addActionNote(idx) {
    if (!addNote.trim()) return;
    setSuggestions(suggestions =>
      suggestions.map((s, i) =>
        i === idx
          ? { ...s, notes: [{ by: "Board", date: new Date().toISOString().slice(0, 10), note: addNote }, ...(s.notes || [])] }
          : s
      )
    );
    setAddNote("");
    setShowNoteIdx(null);
  }

  return (
    <div style={{
      background: "#232a2e",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 20,
      padding: 18
    }}>
      <h2 style={{ fontWeight: 900, marginBottom: 16 }}>
        <FaRobot style={{ marginRight: 8 }} />
        AI Next Best Action Engine
      </h2>
      {/* Analytics */}
      <div style={{ display: "flex", gap: 28, margin: "18px 0", flexWrap: "wrap" }}>
        <div style={snapCard}><FaClipboardList style={{ marginRight: 7 }} /> Total: {total}</div>
        <div style={snapCard}><FaCheckCircle style={{ color: "#1de682", marginRight: 7 }} /> Completed: {completed}</div>
        <div style={snapCard}><FaBolt style={{ color: "#FFD700", marginRight: 7 }} /> Acted On: {acted}</div>
        <div style={snapCard}><FaTimesCircle style={{ color: "#e82e2e", marginRight: 7 }} /> Ignored: {ignored}</div>
        <div style={snapCard}>% Follow-Through: {followThrough}%</div>
      </div>
      {/* Filter */}
      <div style={{ display: "flex", gap: 14, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        <label>Source:
          <select value={filter.source} onChange={e => setFilter(f => ({ ...f, source: e.target.value }))} style={filtInput}>
            {["All", ...SOURCES].map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Priority:
          <select value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))} style={filtInput}>
            {["All", ...PRIORITIES].map(p => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label>Status:
          <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} style={filtInput}>
            {["All", ...STATUS].map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Owner:
          <input value={filter.owner} onChange={e => setFilter(f => ({ ...f, owner: e.target.value }))} placeholder="Type name" style={filtInput} />
        </label>
        <FaSearch color="#FFD700" />
      </div>
      {/* Table */}
      <div style={{
        background: "#232a2e",
        borderRadius: 16,
        padding: "24px 38px",
        boxShadow: "0 2px 18px #FFD70018",
        marginBottom: 12,
        marginTop: 10
      }}>
        <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#FFD700", borderBottom: "2px solid #FFD700", fontWeight: 900 }}>
              <th>Date</th>
              <th>Source</th>
              <th>Insight/Alert</th>
              <th>Suggested Action</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Schedule</th>
              <th>Outcome</th>
              <th>Edit</th>
              <th>Notes</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={12} style={{ color: "#e82e2e", fontWeight: 900, textAlign: "center", padding: 24 }}>
                  No suggestions found for filter.
                </td>
              </tr>
            )}
            {filtered.map((s, idx) => (
              <tr key={s.id} style={{
                background: idx % 2 === 0 ? "#21282c" : "#232a2e",
                color: "#fff"
              }}>
                <td>{s.date}</td>
                <td style={{ color: "#FFD700", fontWeight: 800 }}>{s.source}</td>
                <td>{s.insight}</td>
                <td>
                  {editIdx === idx
                    ? <>
                        <input value={editAction} onChange={e => setEditAction(e.target.value)} style={formInput} />
                        <button onClick={() => saveEdit(idx)} style={editBtnStyle}><FaCheckCircle /></button>
                      </>
                    : <>
                        {s.aiAction}
                        <button onClick={() => { setEditIdx(idx); setEditAction(s.aiAction); }} style={editBtnStyle}><FaEdit /></button>
                      </>
                  }
                </td>
                <td style={{ fontWeight: 900, color: s.priority === "High" ? "#e82e2e" : s.priority === "Medium" ? "#FFD700" : "#1de682" }}>{s.priority}</td>
                <td>{s.status}</td>
                <td>{s.owner}</td>
                <td>{s.scheduled}</td>
                <td>{s.outcome}</td>
                <td>
                  <button onClick={() => { setEditIdx(idx); setEditAction(s.aiAction); }} style={editBtnStyle}><FaEdit /></button>
                </td>
                <td>
                  <button style={logBtnStyle} onClick={() => setShowNoteIdx(showNoteIdx === idx ? null : idx)}>
                    <FaCommentDots style={{ marginRight: 7 }} /> Notes
                  </button>
                  {showNoteIdx === idx && (
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
                        <FaCommentDots style={{ marginRight: 6 }} />Notes Log
                      </div>
                      <ul style={{ marginLeft: 9, marginBottom: 8 }}>
                        {(s.notes && s.notes.length > 0)
                          ? s.notes.map((n, i) =>
                            <li key={i}><b>{n.by}</b> <span style={{ color: "#fff" }}>({n.date})</span>: {n.note}</li>
                          )
                          : <li style={{ color: "#1de682" }}>No notes yet.</li>
                        }
                      </ul>
                      <textarea
                        placeholder="Add note..."
                        value={addNote}
                        onChange={e => setAddNote(e.target.value)}
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
                        onClick={() => addActionNote(idx)}
                      >
                        Add Note
                      </button>
                    </div>
                  )}
                </td>
                <td>
                  {["Suggested", "Accepted", "Delegated"].includes(s.status) && (
                    <>
                      <button onClick={() => handleStatus(idx, "Accepted")} style={addBtnStyle}><FaCheckCircle /> Accept</button>
                      <button onClick={() => handleStatus(idx, "Scheduled")} style={addBtnStyle}><FaClock /> Schedule</button>
                      <button onClick={() => handleStatus(idx, "Delegated")} style={addBtnStyle}><FaUserTie /> Delegate</button>
                      <button onClick={() => handleStatus(idx, "Ignored")} style={editBtnStyle}><FaTimesCircle /> Ignore</button>
                    </>
                  )}
                  {s.status === "Scheduled" && (
                    <button onClick={() => handleStatus(idx, "Completed")} style={addBtnStyle}><FaCheckCircle /> Mark Completed</button>
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
        padding: "13px 21px",
        fontWeight: 600,
        fontSize: 15
      }}>
        <FaRobot style={{ marginRight: 7, verticalAlign: -2 }} />
        AI auto-generates board/staff actions. Accept, schedule, delegate, ignore, or comment. See analytics, export, and use for board review or AGM.
      </div>
    </div>
  );
}

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
const addBtnStyle = {
  background: "#1de682",
  color: "#232a2e",
  border: "none",
  borderRadius: 8,
  padding: "8px 14px",
  fontWeight: 900,
  fontSize: 15,
  margin: "2px 4px",
  boxShadow: "0 2px 12px #1de68244",
  cursor: "pointer"
};
const editBtnStyle = {
  background: "#FFD70022",
  color: "#FFD700",
  border: "none",
  borderRadius: 8,
  fontWeight: 800,
  fontSize: 16,
  padding: "6px 11px",
  boxShadow: "0 1px 7px #FFD70022",
  cursor: "pointer"
};
const logBtnStyle = {
  background: "#FFD700",
  color: "#232a2e",
  fontWeight: 800,
  fontSize: 14,
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
  width: 190,
  marginBottom: 8
};
const filtInput = {
  ...formInput,
  width: 130,
  marginLeft: 7,
  marginRight: 7,
  padding: "5px 10px"
};
