import React, { useState } from "react";
import {
  FaSitemap, FaCheckCircle, FaUserTie, FaUserCheck, FaUserFriends, FaInfoCircle, FaQuestionCircle,
  FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaDownload, FaExclamationTriangle, FaSearch, FaUserCog
} from "react-icons/fa";

// --- Initial data ---
const INIT_HEADERS = [
  "President", "Technical Director", "Coach", "Medical Officer", "Finance Director", "Commercial Lead", "CourtEvo Consultant"
];
const INIT_TASKS = [
  { task: "Approve Budget", raci: ["A", "C", "I", "I", "R", "C", "C"], notes: "Board must sign; Finance Director is Responsible." },
  { task: "Hire New Coach", raci: ["A", "R", "C", "I", "C", "I", "C"], notes: "Technical Director runs process; President gives final sign-off." },
  { task: "Medical Clearance", raci: ["I", "I", "I", "R", "I", "I", "C"], notes: "Medical Officer Responsible; Board only Informed." },
  { task: "Negotiate Sponsorship", raci: ["C", "I", "I", "I", "I", "R", "C"], notes: "Commercial Lead is Responsible." },
  { task: "Youth Player Pathway", raci: ["C", "R", "A", "I", "I", "C", "C"], notes: "Coach is Accountable, Tech Director Responsible." },
  { task: "Monthly Compliance Report", raci: ["A", "R", "C", "I", "R", "I", "C"], notes: "Technical Director Responsible; President Accountable." }
];

const RACI_COLORS = {
  R: "#1de682", // Responsible
  A: "#FFD700", // Accountable
  C: "#7fa1ff", // Consulted
  I: "#d1d1d1"  // Informed
};
const RACI_LABELS = {
  R: "Responsible",
  A: "Accountable",
  C: "Consulted",
  I: "Informed"
};
const ALL_RACI = ["R", "A", "C", "I"];

// --- Analytics: show any role with > N R's or A's
function getRoleLoad(tasks, headers) {
  const byRole = headers.map((role, idx) => {
    const R = tasks.filter(t => t.raci[idx] === "R").length;
    const A = tasks.filter(t => t.raci[idx] === "A").length;
    return { role, R, A, total: R + A };
  });
  return byRole;
}
function analyzeBottlenecks(tasks) {
  // Any task with more than 1 "A" or no "R" is a bottleneck
  const issues = [];
  tasks.forEach((row, idx) => {
    const aCount = row.raci.filter(r => r === "A").length;
    const rCount = row.raci.filter(r => r === "R").length;
    if (aCount !== 1) issues.push({ idx, type: "Accountable", msg: "There should be exactly one Accountable." });
    if (rCount < 1) issues.push({ idx, type: "Responsible", msg: "At least one Responsible is required." });
  });
  return issues;
}

export default function RoleClarityMatrix() {
  const [headers, setHeaders] = useState(INIT_HEADERS);
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ task: "", notes: "", raci: Array(INIT_HEADERS.length).fill("I") });
  const [editIdx, setEditIdx] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [expandIdx, setExpandIdx] = useState(null);
  const [audit, setAudit] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editingRole, setEditingRole] = useState(-1);
  const [roleEditValue, setRoleEditValue] = useState("");
  const bottlenecks = analyzeBottlenecks(tasks);
  const roleLoad = getRoleLoad(tasks, headers);

  function exportCSV() {
    const rows = [["Task", ...headers, "Notes"]];
    tasks.forEach(row => rows.push([row.task, ...row.raci, row.notes]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "role_clarity_matrix.csv";
    a.click();
  }
  function exportAuditLog() {
    const rows = [["Timestamp", "Action", "Task"]];
    audit.forEach(a => rows.push([a.time, a.action, a.task]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "role_clarity_audit_log.csv";
    a.click();
  }
  // --- Adding new task/row
  function handleAddTask(e) {
    e.preventDefault();
    setTasks([...tasks, { ...newTask }]);
    setAudit([...audit, { time: new Date().toLocaleString(), action: "Add", task: newTask.task }]);
    setShowAdd(false);
    setNewTask({ task: "", notes: "", raci: Array(headers.length).fill("I") });
  }
  // --- Editing task
  function handleEditTask(idx) {
    setEditIdx(idx);
    setEditTask({ ...tasks[idx], raci: [...tasks[idx].raci] });
  }
  function handleSaveEdit(idx) {
    const updated = tasks.map((row, i) => (i === idx ? editTask : row));
    setTasks(updated);
    setAudit([...audit, { time: new Date().toLocaleString(), action: "Edit", task: editTask.task }]);
    setEditIdx(null);
    setEditTask(null);
  }
  function handleDeleteTask(idx) {
    setAudit([...audit, { time: new Date().toLocaleString(), action: "Delete", task: tasks[idx].task }]);
    setTasks(tasks.filter((_, i) => i !== idx));
    setExpandIdx(null);
  }
  // --- Editing role header
  function handleEditRole(idx) {
    setEditingRole(idx);
    setRoleEditValue(headers[idx]);
  }
  function handleSaveRole(idx) {
    if (!roleEditValue.trim()) return;
    const newHeaders = headers.map((r, i) => (i === idx ? roleEditValue.trim() : r));
    setHeaders(newHeaders);
    setAudit([...audit, { time: new Date().toLocaleString(), action: "Role Rename", task: `${headers[idx]} → ${roleEditValue.trim()}` }]);
    setEditingRole(-1);
    setRoleEditValue("");
  }
  // --- Filtering/search logic
  const filteredTasks = tasks.filter(
    row =>
      (!search || row.task.toLowerCase().includes(search.toLowerCase()) || row.notes.toLowerCase().includes(search.toLowerCase())) &&
      (!roleFilter || headers.some((h, idx) => h === roleFilter && (row.raci[idx] === "A" || row.raci[idx] === "R")))
  );
  function isConflict(idx, type) {
    return bottlenecks.some(b => b.idx === idx && b.type === type);
  }

  return (
    <div style={{
      background: "linear-gradient(135deg,#232a2e 0%,#283E51 100%)",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 28,
      padding: 36,
      maxWidth: 1750,
      margin: "0 auto",
      display: "flex",
      gap: 36
    }}>
      {/* --- Sidebar: Legend, Analytics, Export, Audit --- */}
      <div style={{ minWidth: 320, maxWidth: 350 }}>
        <div style={{
          background: "#181e23",
          color: "#FFD700",
          borderRadius: 14,
          padding: "18px 17px",
          fontWeight: 700,
          marginBottom: 18
        }}>
          <FaSitemap style={{ fontSize: 28, marginRight: 10, color: "#FFD700" }} />
          <span style={{ fontWeight: 900, fontSize: 22 }}>RACI Legend</span>
          <div style={{ marginTop: 11 }}>
            <FaCheckCircle style={{ color: "#FFD700", marginRight: 7 }} />
            <b>A:</b> Accountable <span style={{ color: "#FFD700bb" }}>(final sign-off)</span><br />
            <FaUserCheck style={{ color: "#1de682", marginRight: 7, marginLeft: 10 }} />
            <b>R:</b> Responsible <span style={{ color: "#1de682bb" }}>(executes work)</span><br />
            <FaUserFriends style={{ color: "#7fa1ff", marginRight: 7, marginLeft: 10 }} />
            <b>C:</b> Consulted <span style={{ color: "#7fa1ffbb" }}>(advises)</span><br />
            <FaUserTie style={{ color: "#d1d1d1", marginRight: 7, marginLeft: 10 }} />
            <b>I:</b> Informed <span style={{ color: "#d1d1d1bb" }}>(kept in loop)</span>
          </div>
        </div>
        {/* --- RACI Heatmap --- */}
        <div style={{
          background: "#232a2e",
          color: "#FFD700",
          borderRadius: 12,
          padding: "14px 13px",
          fontSize: 14,
          marginBottom: 22
        }}>
          <FaUserCog style={{ marginRight: 7, color: "#FFD700" }} />
          <b>RACI Heatmap</b>
          <ul style={{ margin: "11px 0 0 12px" }}>
            {roleLoad.map((r, idx) => (
              <li key={r.role}>
                <span style={{ color: "#FFD700", fontWeight: 800 }}>
                  {r.role}:
                </span> <span style={{ color: "#1de682" }}>R:{r.R}</span> / <span style={{ color: "#FFD700" }}>A:{r.A}</span>
                {r.R > 4 && <span style={{ color: "#FFD700", marginLeft: 8 }}>({r.R} R's: check overload)</span>}
                {r.A > 2 && <span style={{ color: "#FFD700", marginLeft: 8 }}>({r.A} A's: check clarity)</span>}
              </li>
            ))}
          </ul>
        </div>
        {/* --- Boardroom Insight (conflict/bottleneck warning) --- */}
        <div style={{
          background: "#232a2e",
          color: "#FFD700",
          borderRadius: 12,
          padding: "15px 14px",
          marginBottom: 22
        }}>
          <FaExclamationTriangle style={{ color: "#FFD700", marginRight: 6 }} />
          <b>Boardroom Insight:</b>
          <ul style={{ paddingLeft: 22, margin: "11px 0" }}>
            {bottlenecks.length === 0 && <li>All tasks have valid RACI assignment.</li>}
            {bottlenecks.map((b, idx) => (
              <li key={idx}>
                <span style={{ color: "#FFD700" }}>{tasks[b.idx]?.task}</span>: {b.msg}
              </li>
            ))}
          </ul>
        </div>
        {/* --- Export + Audit Log --- */}
        <button style={btnStyle} onClick={exportCSV}><FaDownload style={{ marginRight: 8, fontSize: 15 }} /> Export Matrix</button>
        <button style={{ ...btnStyle, marginLeft: 11 }} onClick={exportAuditLog}><FaDownload style={{ marginRight: 8, fontSize: 15 }} /> Export Audit</button>
        <div style={{ fontSize: 13, color: "#FFD700aa", marginTop: 13 }}>
          <FaInfoCircle style={{ marginRight: 5 }} />
          Changes tracked below:
        </div>
        <div style={{
          background: "#232a2e",
          color: "#FFD700",
          borderRadius: 12,
          marginTop: 13,
          padding: "13px 13px",
          maxHeight: 210,
          overflowY: "auto",
          fontSize: 13
        }}>
          <b>Audit Log:</b>
          <ul style={{ margin: "7px 0 0 15px" }}>
            {audit.length === 0 && <li>No changes made yet.</li>}
            {audit.slice(-8).reverse().map((a, i) => (
              <li key={i}><span style={{ color: "#1de682" }}>{a.time}</span>: {a.action} <b>{a.task}</b></li>
            ))}
          </ul>
        </div>
      </div>

      {/* --- Main Matrix --- */}
      <div style={{ flex: 1, minWidth: 700 }}>
        <div style={{ display: "flex", gap: 13, alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontWeight: 900, fontSize: 32, letterSpacing: 2, margin: 0 }}>Role Clarity Matrix (RACI)</h2>
          <button style={btnStyle} onClick={() => setShowAdd(s => !s)}>
            <FaPlus style={{ marginRight: 8 }} />
            {showAdd ? "Cancel" : "Add Task"}
          </button>
          <span style={{ marginLeft: 17, display: "flex", alignItems: "center", gap: 7 }}>
            <FaSearch />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." style={inputStyle} />
          </span>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={inputStyle}>
            <option value="">Filter by Role (R/A)</option>
            {headers.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        {/* --- Add New Task --- */}
        {showAdd && (
          <form onSubmit={handleAddTask} style={{ background: "#232a2e", borderRadius: 14, padding: "13px 17px", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input
                required
                value={newTask.task}
                onChange={e => setNewTask(n => ({ ...n, task: e.target.value }))}
                placeholder="Task/Process"
                style={inputStyle}
              />
              {headers.map((h, idx) => (
                <select
                  key={h}
                  value={newTask.raci[idx]}
                  onChange={e => setNewTask(n => {
                    const raci = [...n.raci];
                    raci[idx] = e.target.value;
                    return { ...n, raci };
                  })}
                  style={inputStyle}
                >
                  {ALL_RACI.map(x => <option key={x}>{x}</option>)}
                </select>
              ))}
              <input
                value={newTask.notes}
                onChange={e => setNewTask(n => ({ ...n, notes: e.target.value }))}
                placeholder="Notes"
                style={inputStyle}
              />
              <button style={btnStyle}><FaSave style={{ marginRight: 5 }} />Add</button>
            </div>
          </form>
        )}
        <div style={{
          overflowX: "auto",
          borderRadius: 16,
          background: "#232a2e"
        }}>
          <table style={{
            width: "100%",
            fontSize: 16,
            borderCollapse: "collapse",
            background: "#232a2e",
            borderRadius: 16
          }}>
            <thead>
              <tr>
                <th style={thStyle}>Task/Process</th>
                {headers.map((h, idx) =>
                  <th key={idx} style={thStyle}>
                    {editingRole === idx
                      ? <span>
                          <input
                            value={roleEditValue}
                            onChange={e => setRoleEditValue(e.target.value)}
                            style={inputStyle}
                          />
                          <button style={btnStyle} onClick={() => handleSaveRole(idx)}>
                            <FaSave />
                          </button>
                          <button style={delBtn} onClick={() => setEditingRole(-1)}>
                            <FaTimes />
                          </button>
                        </span>
                      : <span>
                          {h}
                          <button style={{ ...btnStyle, padding: "2px 6px", marginLeft: 7 }} onClick={() => handleEditRole(idx)}>
                            <FaEdit />
                          </button>
                        </span>
                    }
                  </th>
                )}
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((row, rowIdx) => editIdx === rowIdx ? (
                <tr key={rowIdx} style={{ borderBottom: "2.5px solid #181e23" }}>
                  <td style={tdStyle}>
                    <input
                      value={editTask.task}
                      onChange={e => setEditTask(et => ({ ...et, task: e.target.value }))}
                      style={inputStyle}
                    />
                  </td>
                  {editTask.raci.map((cell, idx) => (
                    <td key={idx} style={{
                      ...tdStyle,
                      background: RACI_COLORS[cell] + "33",
                      color: "#232a2e",
                      fontWeight: 900,
                      textAlign: "center"
                    }}>
                      <select
                        value={cell}
                        onChange={e => setEditTask(et => {
                          const raci = [...et.raci];
                          raci[idx] = e.target.value;
                          return { ...et, raci };
                        })}
                        style={{
                          ...inputStyle,
                          width: 47,
                          textAlign: "center"
                        }}
                      >
                        {ALL_RACI.map(x => <option key={x}>{x}</option>)}
                      </select>
                    </td>
                  ))}
                  <td style={tdStyle}>
                    <input
                      value={editTask.notes}
                      onChange={e => setEditTask(et => ({ ...et, notes: e.target.value }))}
                      style={inputStyle}
                    />
                    <button style={btnStyle} onClick={() => handleSaveEdit(rowIdx)}>
                      <FaSave />
                    </button>
                    <button style={delBtn} onClick={() => setEditIdx(null)}>
                      <FaTimes />
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={rowIdx} style={{ borderBottom: "2.5px solid #181e23" }}>
                  <td style={tdStyle}>{row.task}</td>
                  {row.raci.map((cell, idx) => (
                    <td key={idx} style={{
                      ...tdStyle,
                      background: RACI_COLORS[cell] + "33",
                      color: "#232a2e",
                      fontWeight: 900,
                      textAlign: "center",
                      border: isConflict(tasks.indexOf(row), RACI_LABELS[cell]) ? "2px solid #FFD700" : undefined
                    }}>
                      {cell}
                    </td>
                  ))}
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button style={btnStyle} onClick={() => setExpandIdx(expandIdx === tasks.indexOf(row) ? null : tasks.indexOf(row))}>
                      {expandIdx === tasks.indexOf(row) ? "Hide" : "Notes"}
                    </button>
                    <button style={btnStyle} onClick={() => handleEditTask(tasks.indexOf(row))}>
                      <FaEdit />
                    </button>
                    <button style={delBtn} onClick={() => handleDeleteTask(tasks.indexOf(row))}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Notes */}
        {expandIdx !== null && (
          <div style={{
            background: "#181e23",
            color: "#FFD700",
            borderRadius: 12,
            marginBottom: 12,
            padding: "13px 19px",
            fontWeight: 700,
            fontSize: 15
          }}>
            <FaQuestionCircle style={{ marginRight: 7, color: "#FFD700" }} />
            <span style={{ fontWeight: 900 }}>{tasks[expandIdx]?.task}:</span> {tasks[expandIdx]?.notes}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Styling ---
const thStyle = {
  color: "#FFD700",
  background: "#232a2e",
  fontWeight: 900,
  padding: "13px 12px",
  textAlign: "center",
  borderRadius: "10px 10px 0 0"
};
const tdStyle = {
  background: "#fff",
  color: "#232a2e",
  fontWeight: 700,
  padding: "11px 9px"
};
const inputStyle = {
  background: "#fff",
  color: "#232a2e",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 14,
  padding: "6px 8px",
  marginRight: 7,
  marginBottom: 3
};
const btnStyle = {
  background: "#FFD700",
  color: "#232a2e",
  border: "none",
  borderRadius: 7,
  fontWeight: 900,
  fontSize: 14,
  padding: "5px 13px",
  marginRight: 5,
  cursor: "pointer"
};
const delBtn = {
  background: "#e82e2e",
  color: "#FFD700",
  border: "none",
  borderRadius: 7,
  fontWeight: 900,
  fontSize: 13,
  padding: "5px 10px",
  marginLeft: 4,
  cursor: "pointer"
};
