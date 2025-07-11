import React, { useState } from "react";
import {
  FaClipboardList, FaUserTie, FaBell, FaChartLine, FaCheckCircle, FaHourglassHalf, FaExclamationTriangle, FaHistory, FaEdit, FaPlus, FaFlag, FaStar, FaFilePdf, FaFileExcel, FaFilter, FaSearch, FaPrint, FaTrophy, FaCalendarAlt, FaMoon, FaSun, FaEye
} from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

// ----- Module options -----
const MODULES = [
  "Performance Analytics",
  "Community Impact",
  "Volunteer Pipeline",
  "Coach/Staff Pipeline",
  "Athlete Development",
  "Resource Gap",
  "Board KPI",
  "Scenario/AI Insights",
  "Compliance/Accreditation",
  "Custom/Other"
];
const OUTCOME_QUALITY = [
  "Exceeded Expectations",
  "Met Expectations",
  "Below Expectations",
  "Unmeasured/Unknown"
];

const COLORS = ["#FFD700", "#1de682", "#e82e2e", "#5ec8f8", "#232a2e", "#283E51"];
const STATUS_COLORS = { Done: "#1de682", "In Progress": "#FFD700", Overdue: "#e82e2e" };

const INIT_LOG = [
  {
    who: "Marko Proleta",
    when: "2025-06-12",
    what: "Approved additional funding for youth analytics system",
    module: "Performance Analytics",
    why: "Skill Progression below benchmark",
    status: "Done",
    deadline: "2025-06-30",
    outcome: "Skill index improved 8.4→8.9, sponsor interest up",
    outcomeQuality: "Exceeded Expectations",
    impact: 5,
    timeToClose: 18,
    comments: [
      { by: "Board", date: "2025-06-14", text: "Action delivered result. Confirmed by KPI chart." }
    ]
  },
  {
    who: "Ivan Horvat",
    when: "2025-05-23",
    what: "Launched Family Open Day event",
    module: "Community Impact",
    why: "Gap: Too few events",
    status: "Done",
    deadline: "2025-06-01",
    outcome: "80 families engaged; local TV covered event",
    outcomeQuality: "Met Expectations",
    impact: 5,
    timeToClose: 9,
    comments: [
      { by: "Board", date: "2025-06-02", text: "Media coverage reached local TV." }
    ]
  },
  {
    who: "Board",
    when: "2025-06-01",
    what: "Mandated coach re-certification U15–U19",
    module: "Compliance/Accreditation",
    why: "Expiring FIBA accreditations flagged",
    status: "In Progress",
    deadline: "2025-07-01",
    outcome: "",
    outcomeQuality: "Unmeasured/Unknown",
    impact: 0,
    timeToClose: 0,
    comments: [
      { by: "Admin", date: "2025-06-01", text: "Process underway." }
    ]
  }
];

// --- Helper functions ---
function daysBetween(d1, d2) {
  try {
    return Math.round((new Date(d2) - new Date(d1)) / 86400000);
  } catch {
    return 0;
  }
}
function monthStr(dt) {
  const d = new Date(dt);
  return d.toLocaleString("default", { month: "short", year: "2-digit" });
}
function statusColor(s, colorblind) {
  if (colorblind) {
    return s === "Done" ? "#26547c" : s === "In Progress" ? "#ff6b6b" : "#ffd166";
  }
  return STATUS_COLORS[s] || "#FFD700";
}
function statusIcon(status) {
  return status === "Done"
    ? <FaCheckCircle style={{ color: "#1de682" }} />
    : status === "In Progress"
      ? <FaHourglassHalf style={{ color: "#FFD700" }} />
      : <FaExclamationTriangle style={{ color: "#e82e2e" }} />;
}

export default function DecisionInsightActionLog() {
  const [log, setLog] = useState(INIT_LOG);
  const [addMode, setAddMode] = useState(false);
  const [filter, setFilter] = useState({ status: "All", module: "All", who: "" });
  const [colorblind, setColorblind] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("Done");
  const [showCommentIdx, setShowCommentIdx] = useState(null);
  const [addComment, setAddComment] = useState("");
  const [editIdx, setEditIdx] = useState(null);

  // Add/Edit form
  const [newLog, setNewLog] = useState({
    who: "",
    when: new Date().toISOString().slice(0, 10),
    what: "",
    module: MODULES[0],
    why: "",
    status: "In Progress",
    deadline: "",
    outcome: "",
    outcomeQuality: OUTCOME_QUALITY[3],
    impact: 0,
    timeToClose: 0,
    comments: []
  });

  // --- Analytics for charts ---
  const moduleCount = MODULES.map(mod => ({
    module: mod,
    count: log.filter(l => l.module === mod).length
  }));
  const statusCount = ["Done", "In Progress", "Overdue"].map(s => ({
    status: s,
    count: log.filter(l => l.status === s).length
  }));
  const monthly = {};
  log.forEach(l => {
    if (l.when) {
      const m = monthStr(l.when);
      if (!monthly[m]) monthly[m] = 0;
      monthly[m]++;
    }
  });
  const monthlyData = Object.entries(monthly).map(([month, count]) => ({ month, count }));

  // Calendar heatmap data
  const dateCounts = {};
  log.forEach(l => {
    if (l.when) {
      dateCounts[l.when] = (dateCounts[l.when] || 0) + 1;
    }
  });
  const heatmapValues = [];
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    heatmapValues.push({
      date: iso,
      count: dateCounts[iso] || 0
    });
  }
  // --- Filtered log ---
  const filtered = log.filter(l =>
    (filter.status === "All" || l.status === filter.status) &&
    (filter.module === "All" || l.module === filter.module) &&
    (filter.who === "" || l.who.toLowerCase().includes(filter.who.toLowerCase()))
  );
  const done = filtered.filter(l => l.status === "Done").length;
  const inProgress = filtered.filter(l => l.status === "In Progress").length;
  const overdue = filtered.filter(l => l.status === "Overdue").length;
  const avgImpact = (filtered.reduce((a, l) => a + (Number(l.impact) || 0), 0) / (filtered.length || 1)).toFixed(1);
  const avgTime = (filtered.reduce((a, l) => a + (Number(l.timeToClose) || 0), 0) / (done || 1)).toFixed(1);
  const followThrough = ((done / (filtered.length || 1)) * 100).toFixed(1);

  // Top-impact module
  const impactByModule = MODULES.map(m => ({
    module: m,
    impact: filtered.filter(l => l.module === m).reduce((a, l) => a + (l.impact || 0), 0)
  }));
  const topImpactModule = impactByModule.reduce((a, b) => (a.impact > b.impact ? a : b), { module: "", impact: 0 });

  // --- Add/Edit log ---
  function saveLog(e) {
    e.preventDefault();
    const ttc = newLog.status === "Done" && newLog.when && newLog.deadline
      ? daysBetween(newLog.when, newLog.deadline)
      : 0;
    if (editIdx == null) {
      setLog([{ ...newLog, timeToClose: ttc, comments: [{ by: "Board", date: new Date().toISOString().slice(0, 10), text: "Action logged." }] }, ...log]);
    } else {
      setLog(log.map((l, i) => i === editIdx ? { ...newLog, timeToClose: ttc } : l));
    }
    setAddMode(false);
    setEditIdx(null);
    setNewLog({
      who: "",
      when: new Date().toISOString().slice(0, 10),
      what: "",
      module: MODULES[0],
      why: "",
      status: "In Progress",
      deadline: "",
      outcome: "",
      outcomeQuality: OUTCOME_QUALITY[3],
      impact: 0,
      timeToClose: 0,
      comments: []
    });
  }
  function editLog(idx) {
    setEditIdx(idx);
    setAddMode(true);
    setNewLog({ ...log[idx] });
  }
  function addToComments(idx) {
    if (!addComment.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    setLog(log =>
      log.map((l, i) =>
        i === idx
          ? { ...l, comments: [{ by: "Board", date: today, text: addComment }, ...(l.comments || [])] }
          : l
      )
    );
    setAddComment("");
    setShowCommentIdx(null);
  }
  // Bulk select and update
  function toggleSelect(idx) {
    setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  }
  function bulkUpdate() {
    setLog(log =>
      log.map((l, i) =>
        selected.includes(i) ? { ...l, status: bulkStatus } : l
      )
    );
    setSelected([]);
  }
  // Remind (stub for backend)
  function remind(idx) {
    alert(`Reminder sent to owner: ${log[idx].who}`);
  }
  // Download (CSV)
  function downloadCSV() {
    const rows = [
      ["Date", "Who", "What", "Module", "Why", "Status", "Deadline", "Outcome", "Outcome Quality", "Impact", "Time to Close"],
      ...log.map(l => [l.when, l.who, l.what, l.module, l.why, l.status, l.deadline, l.outcome, l.outcomeQuality, l.impact, l.timeToClose])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "decision_insight_action_log.csv";
    a.click();
  }

  return (
    <div style={{
      background: theme === "dark" ? "#232a2e" : "#f5f5f5",
      color: theme === "dark" ? "#FFD700" : "#232a2e",
      minHeight: "100vh",
      borderRadius: 20,
      padding: 18
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontWeight: 900, marginBottom: 10 }}>
          Decision Insight–Action Log <FaClipboardList style={{ marginLeft: 10, color: "#1de682", fontSize: 22, verticalAlign: -2 }} />
        </h2>
        <div>
          <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={btnStyle}>
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>
          <button onClick={() => setColorblind(c => !c)} style={btnStyle}><FaEye />{colorblind ? "Colorblind ON" : "Colorblind OFF"}</button>
          <button onClick={() => window.print()} style={btnStyle}><FaPrint /></button>
          <button onClick={downloadCSV} style={btnStyle}><FaFileExcel /></button>
        </div>
      </div>
      {/* Snapshots */}
      <div style={{ display: "flex", gap: 36, margin: "18px 0", flexWrap: "wrap" }}>
        <div style={snapCard}><FaTrophy style={{ marginRight: 8 }} /> Total: {filtered.length}</div>
        <div style={snapCard}><FaCheckCircle style={{ color: "#1de682", marginRight: 8 }} /> Done: {done}</div>
        <div style={snapCard}><FaHourglassHalf style={{ color: "#FFD700", marginRight: 8 }} /> In Progress: {inProgress}</div>
        <div style={snapCard}><FaExclamationTriangle style={{ color: "#e82e2e", marginRight: 8 }} /> Overdue: {overdue}</div>
        <div style={snapCard}>Avg. Impact: {avgImpact} <FaStar color="#FFD700" /></div>
        <div style={snapCard}>% Follow-Through: {followThrough}%</div>
        <div style={snapCard}>Avg. Time to Close: {avgTime}d</div>
        <div style={snapCard}>Top Impact: {topImpactModule.module || "-"} ({topImpactModule.impact})</div>
      </div>
      {/* Charts */}
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginBottom: 24 }}>
        <div style={{ flex: 1, minWidth: 270 }}>
          <b>Actions by Module</b>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={moduleCount}>
              <XAxis dataKey="module" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill={theme === "dark" ? "#FFD700" : "#232a2e"} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <b>Status Breakdown</b>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusCount} dataKey="count" nameKey="status" outerRadius={70} label>
                {statusCount.map((entry, i) =>
                  <Cell key={i} fill={colorblind ? COLORS[i % COLORS.length] : (entry.status === "Done" ? "#1de682" : entry.status === "In Progress" ? "#FFD700" : "#e82e2e")} />
                )}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <b>Completion Trend</b>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#FFD700" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Calendar Heat Map */}
      <div style={{ margin: "16px 0 26px 0" }}>
        <b><FaCalendarAlt style={{ marginRight: 6 }} /> Board Action Calendar</b>
        <CalendarHeatmap
          startDate={new Date(Date.now() - 364 * 24 * 60 * 60 * 1000)}
          endDate={new Date()}
          values={heatmapValues}
          classForValue={val => !val ? "color-empty" : val.count >= 4 ? "color-scale-4" : `color-scale-${val.count}`}
          showWeekdayLabels={true}
          tooltipDataAttrs={val => ({
            "data-tip": val && val.date ? `${val.date}: ${val.count} actions` : null
          })}
          style={{ width: "100%", margin: "0 auto", background: "none" }}
        />
      </div>
      {/* Filters, Bulk, Add, Table */}
      <div style={{ display: "flex", gap: 19, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
        <FaFilter color="#FFD700" />
        <label>Status:
          <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} style={filtInput}>
            {["All", "In Progress", "Done", "Overdue"].map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Module:
          <select value={filter.module} onChange={e => setFilter(f => ({ ...f, module: e.target.value }))} style={filtInput}>
            {["All", ...MODULES].map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>Owner:
          <input value={filter.who} onChange={e => setFilter(f => ({ ...f, who: e.target.value }))} placeholder="Board/Admin/Coach" style={filtInput} />
        </label>
        <button onClick={() => { setAddMode(true); setEditIdx(null); }} style={addBtnStyle}><FaPlus style={{ marginRight: 7 }} />New</button>
        {selected.length > 0 && (
          <>
            <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} style={filtInput}>
              {["Done", "In Progress", "Overdue"].map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={bulkUpdate} style={addBtnStyle}>Set Status for {selected.length} Selected</button>
          </>
        )}
      </div>
      {/* Add/Edit Form */}
      {addMode && (
        <form onSubmit={saveLog} style={{
          background: "#232a2e",
          borderRadius: 16,
          padding: "28px 36px",
          marginBottom: 18,
          boxShadow: "0 2px 18px #FFD70018"
        }}>
          <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 18, marginBottom: 9 }}>
            {editIdx == null ? "Log New Board Decision/Action" : "Edit Decision/Action"}
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <label style={formLabel}>Who:</label><br />
              <input required value={newLog.who} onChange={e => setNewLog(l => ({ ...l, who: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Date:</label><br />
              <input required type="date" value={newLog.when} onChange={e => setNewLog(l => ({ ...l, when: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>What:</label><br />
              <input required value={newLog.what} onChange={e => setNewLog(l => ({ ...l, what: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Module/Insight:</label><br />
              <select value={newLog.module} onChange={e => setNewLog(l => ({ ...l, module: e.target.value }))} style={formInput}>
                {MODULES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={formLabel}>Why (Insight/Alert):</label><br />
              <input value={newLog.why} onChange={e => setNewLog(l => ({ ...l, why: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Status:</label><br />
              <select value={newLog.status} onChange={e => setNewLog(l => ({ ...l, status: e.target.value }))} style={formInput}>
                <option>In Progress</option>
                <option>Done</option>
                <option>Overdue</option>
              </select>
            </div>
            <div>
              <label style={formLabel}>Deadline:</label><br />
              <input type="date" value={newLog.deadline} onChange={e => setNewLog(l => ({ ...l, deadline: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Outcome/Result:</label><br />
              <input value={newLog.outcome} onChange={e => setNewLog(l => ({ ...l, outcome: e.target.value }))} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Outcome Quality:</label><br />
              <select value={newLog.outcomeQuality} onChange={e => setNewLog(l => ({ ...l, outcomeQuality: e.target.value }))} style={formInput}>
                {OUTCOME_QUALITY.map(q => <option key={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label style={formLabel}>Impact Score:</label><br />
              <select value={newLog.impact} onChange={e => setNewLog(l => ({ ...l, impact: Number(e.target.value) }))} style={formInput}>
                {[0, 1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s} Star{s > 1 && "s"}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" style={{
            marginTop: 16, ...addBtnStyle, fontSize: 16, padding: "8px 26px"
          }}>
            <FaCheckCircle style={{ marginRight: 7 }} /> {editIdx == null ? "Add" : "Save"}
          </button>
        </form>
      )}
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
              <th></th>
              <th>Date</th>
              <th>Who</th>
              <th>Action/Decision</th>
              <th>Module/Insight</th>
              <th>Why</th>
              <th>Status</th>
              <th>Deadline</th>
              <th>Outcome</th>
              <th>Outcome Quality</th>
              <th>Impact</th>
              <th>Time to Close</th>
              <th>Edit</th>
              <th>Audit Log</th>
              <th>Remind</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={15} style={{ color: "#e82e2e", fontWeight: 900, textAlign: "center", padding: 24 }}>
                  No decisions found for filter.
                </td>
              </tr>
            )}
            {filtered.map((l, idx) => (
              <tr key={idx} style={{
                background: idx % 2 === 0 ? "#21282c" : "#232a2e",
                color: "#fff"
              }}>
                <td>
                  <input type="checkbox" checked={selected.includes(idx)} onChange={() => toggleSelect(idx)} />
                </td>
                <td>{l.when}</td>
                <td>{l.who}</td>
                <td style={{ color: "#FFD700", fontWeight: 900 }}>{l.what}</td>
                <td style={{ color: "#FFD700", fontWeight: 900 }}>{l.module}</td>
                <td>{l.why}</td>
                <td style={{ fontWeight: 900, color: statusColor(l.status, colorblind) }}>{statusIcon(l.status)} {l.status}</td>
                <td>{l.deadline}</td>
                <td>{l.outcome}</td>
                <td style={{ color: l.outcomeQuality === "Exceeded Expectations" ? "#1de682" : (l.outcomeQuality === "Met Expectations" ? "#FFD700" : "#e82e2e") }}>
                  {l.outcomeQuality}
                </td>
                <td>{[...Array(5)].map((_, i) => <FaStar key={i} color={i < l.impact ? "#FFD700" : "#444"} />)}</td>
                <td>{l.timeToClose ? `${l.timeToClose}d` : "-"}</td>
                <td>
                  <button onClick={() => editLog(idx)} style={editBtnStyle}><FaEdit /></button>
                </td>
                <td>
                  <button style={logBtnStyle}
                    onClick={() => setShowCommentIdx(showCommentIdx === idx ? null : idx)}
                  >
                    <FaHistory style={{ marginRight: 7 }} />
                    Log
                  </button>
                  {showCommentIdx === idx && (
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
                        <FaHistory style={{ marginRight: 6 }} />Audit Log
                      </div>
                      <ul style={{ marginLeft: 9, marginBottom: 8 }}>
                        {(l.comments && l.comments.length > 0)
                          ? l.comments.map((c, i) =>
                            <li key={i}><b>{c.by}</b> <span style={{ color: "#fff" }}>({c.date})</span>: {c.text}</li>
                          )
                          : <li style={{ color: "#1de682" }}>No comments yet.</li>
                        }
                      </ul>
                      <textarea
                        placeholder="Add comment..."
                        value={addComment}
                        onChange={e => setAddComment(e.target.value)}
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
                        onClick={() => addToComments(idx)}
                      >
                        Add Comment
                      </button>
                    </div>
                  )}
                </td>
                <td>
                  <button onClick={() => remind(idx)} style={editBtnStyle}><FaBell /></button>
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
        <FaTrophy style={{ marginRight: 7, verticalAlign: -2 }} />
        Board, management, and auditors see every decision, origin, follow-through, analytics, and action timeline—true C-suite oversight, ready for sponsors, compliance, and city review.
      </div>
      {/* --- Add custom calendar heatmap coloring styles to your CSS --- */}
      <style>{`
        .color-empty { fill: #222; }
        .color-scale-1 { fill: #FFD70088; }
        .color-scale-2 { fill: #FFD700cc; }
        .color-scale-3 { fill: #1de682cc; }
        .color-scale-4 { fill: #e82e2ecc; }
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
const formLabel = {
  color: "#FFD700",
  fontWeight: 800,
  fontSize: 14
};
const snapCard = {
  background: "#232a2e",
  color: "#FFD700",
  border: "1.5px solid #FFD700",
  borderRadius: 15,
  fontWeight: 800,
  fontSize: 18,
  padding: "16px 22px",
  minWidth: 190
};
