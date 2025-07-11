import React, { useState } from "react";
import {
  FaArrowCircleUp, FaCheck, FaExclamationTriangle, FaCloudDownloadAlt, FaFilePdf,
  FaFilter, FaPlus, FaUserTie, FaChartBar, FaCalendarAlt, FaCommentAlt, FaEye, FaEyeSlash, FaListAlt, FaBolt
} from "react-icons/fa";
import Papa from "papaparse";
import { saveAs } from "file-saver";

// ----------- PHASES & ROLES -----------------
const PHASES = [
  { key: "Preparation", color: "#FFD700" },
  { key: "Execution", color: "#1de682" },
  { key: "Monitoring", color: "#48b5ff" },
  { key: "Optimization", color: "#e94057" },
  { key: "Sustainability", color: "#8A5CF6" }
];

const ROLES = ["All", "Sport Director", "Business Ops", "Compliance Officer", "Analytics Lead", "Coach", "Board Member"];

// ----------- SAMPLE PLAN (EXTENDED) -----------------
const samplePlan = [
  {
    id: 1,
    phase: "Preparation",
    task: "Define club vision and objectives",
    owner: "Sport Director",
    due: "2024-09-01",
    status: "Complete",
    priority: "High",
    progress: 100,
    kpi: "Vision Statement Approved",
    aiRec: "Share vision in internal portal and onboarding.",
    boardEscalation: false,
    docUrl: "",
    comments: [{user: "Board", msg: "Great work on vision clarity.", ts: "2024-07-01"}],
    roleVisibility: ["Sport Director", "Board Member"],
    actionLog: [
      {user: "Sport Director", action: "Completed vision", date: "2024-08-30"}
    ]
  },
  {
    id: 2,
    phase: "Preparation",
    task: "Draft operating procedures",
    owner: "Business Ops",
    due: "2024-09-10",
    status: "In Progress",
    priority: "High",
    progress: 55,
    kpi: "Drafts Submitted",
    aiRec: "Weekly board review.",
    boardEscalation: false,
    docUrl: "",
    comments: [],
    roleVisibility: ["Business Ops", "Board Member"],
    actionLog: []
  },
  {
    id: 3,
    phase: "Execution",
    task: "Deploy digital platform to staff",
    owner: "Head of IT",
    due: "2024-10-01",
    status: "In Progress",
    priority: "Medium",
    progress: 45,
    kpi: "Staff logins",
    aiRec: "Automate onboarding emails to all users.",
    boardEscalation: true,
    docUrl: "",
    comments: [],
    roleVisibility: ["Business Ops", "Sport Director"],
    actionLog: []
  },
  {
    id: 4,
    phase: "Monitoring",
    task: "Launch quarterly compliance review",
    owner: "Compliance Officer",
    due: "2024-12-01",
    status: "Planned",
    priority: "Medium",
    progress: 0,
    kpi: "Audit Complete",
    aiRec: "Set recurring audit reminders in platform.",
    boardEscalation: false,
    docUrl: "",
    comments: [],
    roleVisibility: ["Compliance Officer", "Board Member"],
    actionLog: []
  },
  {
    id: 5,
    phase: "Optimization",
    task: "Analyze performance dashboard data",
    owner: "Analytics Lead",
    due: "2025-01-15",
    status: "Planned",
    priority: "Low",
    progress: 0,
    kpi: "Quarterly report",
    aiRec: "Highlight low-performing areas for review.",
    boardEscalation: false,
    docUrl: "",
    comments: [],
    roleVisibility: ["Analytics Lead", "Sport Director"],
    actionLog: []
  },
  // --- EXTENDED EXAMPLES (NEW PHASES, MORE TASKS, BOARD LOGS, ETC.) ---
  {
    id: 6,
    phase: "Sustainability",
    task: "Review ESG (Environmental, Social, Governance) compliance",
    owner: "Compliance Officer",
    due: "2025-03-01",
    status: "Planned",
    priority: "High",
    progress: 0,
    kpi: "ESG Audit Pass",
    aiRec: "AI: Review suppliers for compliance.",
    boardEscalation: false,
    docUrl: "",
    comments: [],
    roleVisibility: ["Compliance Officer", "Board Member"],
    actionLog: []
  },
  {
    id: 7,
    phase: "Optimization",
    task: "Refine sponsorship activation strategy",
    owner: "Business Ops",
    due: "2025-02-20",
    status: "Planned",
    priority: "High",
    progress: 0,
    kpi: "New sponsor onboarded",
    aiRec: "AI: Identify top ROI sponsors in analytics.",
    boardEscalation: true,
    docUrl: "",
    comments: [],
    roleVisibility: ["Business Ops", "Board Member"],
    actionLog: []
  },
  {
    id: 8,
    phase: "Preparation",
    task: "Board governance workshop",
    owner: "Board Member",
    due: "2024-09-20",
    status: "Planned",
    priority: "Medium",
    progress: 0,
    kpi: "Attendance 100%",
    aiRec: "AI: Send automated reminders.",
    boardEscalation: false,
    docUrl: "",
    comments: [],
    roleVisibility: ["Board Member"],
    actionLog: []
  },
];

// ----------- COMPONENT -----------------
function StrategicExecutionPlanDashboard() {
  const [plan, setPlan] = useState(samplePlan);
  const [filterPhase, setFilterPhase] = useState("All");
  const [filterOwner, setFilterOwner] = useState("All");
  const [filterRole, setFilterRole] = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showLog, setShowLog] = useState(null);
  const [showComments, setShowComments] = useState(null);
  const [newTask, setNewTask] = useState({
    phase: "Preparation",
    task: "",
    owner: "",
    due: "",
    status: "Planned",
    priority: "Medium",
    progress: 0,
    kpi: "",
    aiRec: "",
    boardEscalation: false,
    docUrl: "",
    comments: [],
    roleVisibility: ["All"],
    actionLog: []
  });
  const [aiAlert, setAIAlert] = useState(null);

  // Owners for dropdown
  const owners = [...new Set(plan.map(t => t.owner))];

  // Board-level risk/bottleneck detection
  React.useEffect(() => {
    const soonDue = plan.filter(t => t.status !== "Complete" && daysUntil(t.due) <= 7 && t.progress < 70);
    const atRisk = plan.filter(t => t.status === "At Risk");
    if (soonDue.length > 0) {
      setAIAlert(`⚠️ ${soonDue.length} task(s) due soon with slow progress.`);
    } else if (atRisk.length > 0) {
      setAIAlert(`🔥 ${atRisk.length} task(s) flagged as "At Risk".`);
    } else {
      setAIAlert(null);
    }
  }, [plan]);

  // Filtering and searching
  let display = plan;
  if (filterPhase !== "All") display = display.filter(t => t.phase === filterPhase);
  if (filterOwner !== "All") display = display.filter(t => t.owner === filterOwner);
  if (filterRole !== "All") display = display.filter(t => t.roleVisibility.includes(filterRole) || t.roleVisibility.includes("All"));
  if (search) display = display.filter(t =>
    t.task.toLowerCase().includes(search.toLowerCase()) ||
    t.owner.toLowerCase().includes(search.toLowerCase())
  );

  // Status color map
  const statusColor = { "Complete": "#1de682", "In Progress": "#FFD700", "At Risk": "#e94057", "Planned": "#48b5ff" };

  // Export handlers
  function handleExport(type) {
    let blob, name;
    if (type === "csv") {
      const csv = Papa.unparse(plan);
      blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      name = "StrategicExecutionPlan.csv";
    } else if (type === "json") {
      blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
      name = "StrategicExecutionPlan.json";
    } else {
      window.print();
      return;
    }
    saveAs(blob, name);
  }

  // Add new task
  function handleAdd(e) {
    e.preventDefault();
    setPlan([...plan, { ...newTask, id: Date.now(), comments: [], actionLog: [] }]);
    setShowAdd(false);
    setNewTask({
      phase: "Preparation", task: "", owner: "", due: "", status: "Planned", priority: "Medium",
      progress: 0, kpi: "", aiRec: "", boardEscalation: false, docUrl: "", comments: [], roleVisibility: ["All"], actionLog: []
    });
  }

  // Update status
  function updateStatus(id, newStatus) {
    setPlan(plan.map(t => t.id === id ? { ...t, status: newStatus, progress: newStatus === "Complete" ? 100 : t.progress } : t));
  }

  // Toggle escalation
  function toggleEscalation(id) {
    setPlan(plan.map(t => t.id === id ? { ...t, boardEscalation: !t.boardEscalation } : t));
  }

  // Add comment
  function addComment(id, comment) {
    setPlan(plan.map(t => t.id === id
      ? { ...t, comments: [...t.comments, { user: "Board", msg: comment, ts: new Date().toISOString().slice(0,10) }] }
      : t
    ));
  }

  // Add log action
  function addLog(id, action) {
    setPlan(plan.map(t => t.id === id
      ? { ...t, actionLog: [...t.actionLog, { user: "Board", action, date: new Date().toISOString().slice(0,10) }] }
      : t
    ));
  }

  // Bulk update
  function bulkComplete() {
    setPlan(plan.map(t => ({ ...t, status: "Complete", progress: 100 })));
  }

  // Role visibility toggle (multi-select)
  function handleRoleVis(id, role) {
    setPlan(plan.map(t =>
      t.id === id
        ? {
          ...t,
          roleVisibility: t.roleVisibility.includes(role)
            ? t.roleVisibility.filter(r => r !== role)
            : [...t.roleVisibility, role]
        }
        : t
    ));
  }

  // Helper: Days until
  function daysUntil(dateStr) {
    if (!dateStr) return 0;
    const d = new Date(dateStr), now = new Date();
    return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  }

  // --- UI
  return (
    <div style={{ maxWidth: 1500, margin: "0 auto", padding: 0 }}>
      <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 34, margin: "30px 0 17px 0" }}>
        Strategic Execution Plan Dashboard
      </h2>
      {aiAlert && (
        <div style={{ background: "#FFD70022", color: "#e94057", fontWeight: 900, fontSize: 19, padding: 14, borderRadius: 14, marginBottom: 18 }}>
          <FaBolt style={{ fontSize: 21, marginRight: 7 }} /> {aiAlert}
        </div>
      )}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setShowAdd(true)} style={btnS}><FaPlus /> Add Task</button>
        <button onClick={() => handleExport("csv")} style={{ ...btnS, background: "#FFD700", color: "#232a2e" }}><FaCloudDownloadAlt /> CSV</button>
        <button onClick={() => handleExport("json")} style={{ ...btnS, background: "#1de682", color: "#232a2e" }}><FaCloudDownloadAlt /> JSON</button>
        <button onClick={() => handleExport("pdf")} style={{ ...btnS, background: "#232a2e", color: "#FFD700" }}><FaFilePdf /> Print</button>
        <button onClick={bulkComplete} style={{ ...btnS, background: "#232a2e", color: "#1de682" }}><FaCheck /> Bulk Complete</button>
        <span style={{ color: "#FFD700", fontWeight: 600, marginLeft: 18 }}><FaFilter /> Phase:</span>
        <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)} style={inputS}>
          <option>All</option>{PHASES.map(p => <option key={p.key}>{p.key}</option>)}
        </select>
        <span style={{ color: "#FFD700", fontWeight: 600, marginLeft: 8 }}>Owner:</span>
        <select value={filterOwner} onChange={e => setFilterOwner(e.target.value)} style={inputS}>
          <option>All</option>
          {owners.map(o => <option key={o}>{o}</option>)}
        </select>
        <span style={{ color: "#FFD700", fontWeight: 600, marginLeft: 8 }}>Role:</span>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={inputS}>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search task or owner"
          style={{ ...inputS, width: 180, marginLeft: 12, background: "#181e23" }}
        />
      </div>
      {/* --- PHASE VISUALIZATION --- */}
      <div style={{ display: "flex", gap: 23, marginBottom: 18, flexWrap: "wrap" }}>
        {PHASES.map(phase => {
          const total = plan.filter(t => t.phase === phase.key).length;
          const complete = plan.filter(t => t.phase === phase.key && t.status === "Complete").length;
          const progress = total > 0 ? Math.round(plan.filter(t => t.phase === phase.key).reduce((a, b) => a + (+b.progress), 0) / total) : 0;
          return (
            <div key={phase.key} style={{
              background: phase.color + "22", borderRadius: 16, boxShadow: `0 2px 8px ${phase.color}55`,
              padding: "19px 32px", color: phase.color, minWidth: 180, flex: 1
            }}>
              <div style={{ fontWeight: 900, fontSize: 21 }}>{phase.key}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Total Tasks: <b>{total}</b></div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1de682" }}>Complete: <b>{complete}</b></div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#FFD700" }}>Progress: <b>{progress}%</b></div>
            </div>
          );
        })}
      </div>
      {/* --- PLAN TABLE --- */}
      <div style={{
        background: "#232a2e", borderRadius: 14, boxShadow: "0 2px 14px #181e2322",
        padding: "8px 7px 28px 7px", marginBottom: 28, overflowX: "auto"
      }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1340 }}>
          <thead>
            <tr>
              <th style={thS}>Phase</th>
              <th style={thS}>Task</th>
              <th style={thS}>Owner</th>
              <th style={thS}>Due</th>
              <th style={thS}>Status</th>
              <th style={thS}>Priority</th>
              <th style={thS}>Progress</th>
              <th style={thS}>KPI</th>
              <th style={thS}>AI Recommendation</th>
              <th style={thS}>Board Escalation</th>
              <th style={thS}>Docs</th>
              <th style={thS}>Actions</th>
              <th style={thS}>Comments</th>
              <th style={thS}>Role Visibility</th>
              <th style={thS}>Log</th>
            </tr>
          </thead>
          <tbody>
            {display.map(t => (
              <tr key={t.id}>
                <td style={{ ...tdS, color: PHASES.find(p => p.key === t.phase)?.color || "#fff", fontWeight: 800 }}>{t.phase}</td>
                <td style={tdS}>{t.task}</td>
                <td style={tdS}>{t.owner}</td>
                <td style={tdS}>{t.due}</td>
                <td style={{ ...tdS, color: statusColor[t.status] }}>{t.status}</td>
                <td style={{ ...tdS, color: t.priority === "High" ? "#FFD700" : t.priority === "Medium" ? "#1de682" : "#48b5ff" }}>{t.priority}</td>
                {/* Progress ring */}
                <td style={tdS}>
                  <ProgressRing percent={t.progress} />
                </td>
                <td style={tdS}>{t.kpi}</td>
                <td style={tdS}>{t.aiRec}</td>
                <td style={{ ...tdS, color: t.boardEscalation ? "#e94057" : "#1de682", fontWeight: 900 }}>
                  <button onClick={() => toggleEscalation(t.id)} style={{
                    background: "none", border: "none", color: t.boardEscalation ? "#e94057" : "#1de682",
                    fontWeight: 900, fontSize: 18, cursor: "pointer"
                  }}>{t.boardEscalation ? <FaExclamationTriangle /> : <FaCheck />}</button>
                </td>
                <td style={tdS}>
                  {t.docUrl
                    ? <a href={t.docUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#FFD700" }}>View</a>
                    : "—"}
                </td>
                <td style={tdS}>
                  <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)} style={inputS}>
                    <option>Complete</option>
                    <option>In Progress</option>
                    <option>Planned</option>
                    <option>At Risk</option>
                  </select>
                </td>
                <td style={tdS}>
                  <button onClick={() => setShowComments(t.id)} style={{ ...btnS, background: "#1de682", color: "#232a2e", fontSize: 15 }}><FaCommentAlt /></button>
                </td>
                <td style={tdS}>
                  <button onClick={() => setShowLog(t.id)} style={{ ...btnS, background: "#FFD700", color: "#232a2e", fontSize: 15 }}><FaListAlt /></button>
                </td>
                <td style={tdS}>
                  <button onClick={() => handleRoleVis(t.id, "Board Member")} style={{
                    background: t.roleVisibility.includes("Board Member") ? "#FFD700" : "#232a2e",
                    color: t.roleVisibility.includes("Board Member") ? "#232a2e" : "#FFD700",
                    border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 700, cursor: "pointer"
                  }}>
                    {t.roleVisibility.includes("Board Member") ? <FaEye /> : <FaEyeSlash />} Board
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {display.length === 0 && <div style={{ color: "#FFD700", fontWeight: 900, padding: 24 }}>No tasks match filter.</div>}
      </div>
      {/* --- Add Task Modal --- */}
      {showAdd && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "#181e2366", zIndex: 99, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <form onSubmit={handleAdd} style={{ background: "#232a2e", padding: 32, borderRadius: 20, minWidth: 420, boxShadow: "0 8px 32px #FFD70055" }}>
            <div style={labelS}>Phase</div>
            <select value={newTask.phase} onChange={e => setNewTask({ ...newTask, phase: e.target.value })} style={inputS}>
              {PHASES.map(p => <option key={p.key}>{p.key}</option>)}
            </select>
            <div style={labelS}>Task</div>
            <input value={newTask.task} onChange={e => setNewTask({ ...newTask, task: e.target.value })} required style={inputS} />
            <div style={labelS}>Owner</div>
            <input value={newTask.owner} onChange={e => setNewTask({ ...newTask, owner: e.target.value })} required style={inputS} />
            <div style={labelS}>Due Date</div>
            <input value={newTask.due} type="date" onChange={e => setNewTask({ ...newTask, due: e.target.value })} required style={inputS} />
            <div style={labelS}>Status</div>
            <select value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })} style={inputS}>
              <option>Planned</option>
              <option>In Progress</option>
              <option>Complete</option>
              <option>At Risk</option>
            </select>
            <div style={labelS}>Priority</div>
            <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} style={inputS}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <div style={labelS}>Progress (%)</div>
            <input value={newTask.progress} type="number" min={0} max={100} onChange={e => setNewTask({ ...newTask, progress: +e.target.value })} style={inputS} />
            <div style={labelS}>KPI</div>
            <input value={newTask.kpi} onChange={e => setNewTask({ ...newTask, kpi: e.target.value })} style={inputS} />
            <div style={labelS}>AI Recommendation</div>
            <input value={newTask.aiRec} onChange={e => setNewTask({ ...newTask, aiRec: e.target.value })} style={inputS} />
            <div style={labelS}>Board Escalation</div>
            <select value={newTask.boardEscalation ? "Yes" : "No"} onChange={e => setNewTask({ ...newTask, boardEscalation: e.target.value === "Yes" })} style={inputS}>
              <option>No</option>
              <option>Yes</option>
            </select>
            <div style={labelS}>Doc URL (link or file upload)</div>
            <input value={newTask.docUrl} onChange={e => setNewTask({ ...newTask, docUrl: e.target.value })} placeholder="Paste link or upload" style={inputS} />
            <div style={labelS}>Role Visibility</div>
            <select multiple value={newTask.roleVisibility} onChange={e =>
              setNewTask({ ...newTask, roleVisibility: Array.from(e.target.selectedOptions, o => o.value) })}
              style={inputS}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button type="submit" style={{ ...btnS, flex: 1 }}><FaCheck /> Save Task</button>
              <button onClick={() => setShowAdd(false)} type="button" style={{ ...btnS, flex: 1, background: "#e94057", color: "#fff" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {/* --- Comments Modal --- */}
      {showComments && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "#181e2366", zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#232a2e", borderRadius: 14, padding: 30, minWidth: 420, boxShadow: "0 4px 30px #FFD70055" }}>
            <h3 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 10 }}>Comments & Thread</h3>
            {plan.find(t => t.id === showComments)?.comments?.map((c, idx) => (
              <div key={idx} style={{ color: "#fff", fontWeight: 700, marginBottom: 5, fontSize: 15 }}>
                <span style={{ color: "#FFD700", fontWeight: 900 }}>{c.user}:</span> {c.msg} <span style={{ color: "#888", fontSize: 13 }}>({c.ts})</span>
              </div>
            ))}
            <form onSubmit={e => {
              e.preventDefault();
              const txt = e.target.elements.msg.value;
              addComment(showComments, txt);
              e.target.reset();
            }}>
              <input name="msg" placeholder="Add comment..." required style={inputS} />
              <button type="submit" style={{ ...btnS, background: "#FFD700", color: "#232a2e", marginTop: 7 }}>Send</button>
              <button onClick={() => setShowComments(null)} type="button" style={{ ...btnS, background: "#e94057", color: "#fff", marginLeft: 10 }}>Close</button>
            </form>
          </div>
        </div>
      )}
      {/* --- Action Log Modal --- */}
      {showLog && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "#181e2366", zIndex: 111, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#232a2e", borderRadius: 14, padding: 30, minWidth: 420, boxShadow: "0 4px 30px #FFD70055" }}>
            <h3 style={{ color: "#FFD700", fontWeight: 900, marginBottom: 10 }}>Action Log</h3>
            {plan.find(t => t.id === showLog)?.actionLog?.map((l, idx) => (
              <div key={idx} style={{ color: "#fff", fontWeight: 700, marginBottom: 5, fontSize: 15 }}>
                <span style={{ color: "#FFD700", fontWeight: 900 }}>{l.user}:</span> {l.action} <span style={{ color: "#888", fontSize: 13 }}>({l.date})</span>
              </div>
            ))}
            <form onSubmit={e => {
              e.preventDefault();
              const txt = e.target.elements.action.value;
              addLog(showLog, txt);
              e.target.reset();
            }}>
              <input name="action" placeholder="Add log action..." required style={inputS} />
              <button type="submit" style={{ ...btnS, background: "#FFD700", color: "#232a2e", marginTop: 7 }}>Save</button>
              <button onClick={() => setShowLog(null)} type="button" style={{ ...btnS, background: "#e94057", color: "#fff", marginLeft: 10 }}>Close</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- Progress Ring Visual
function ProgressRing({ percent }) {
  const size = 40, stroke = 5, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#232a2e" strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#1de682" strokeWidth={stroke}
        fill="none" strokeDasharray={c} strokeDashoffset={c - c * (percent / 100)}
        style={{ transition: "stroke-dashoffset 0.7s" }} />
      <text x="50%" y="56%" textAnchor="middle" fill="#FFD700" fontSize="14" fontWeight="900">{percent}%</text>
    </svg>
  );
}

// --- Styles
const btnS = {
  background: "#181e23", color: "#FFD700", fontWeight: 800, border: "none",
  borderRadius: 8, padding: "7px 17px", fontSize: 16, cursor: "pointer",
  boxShadow: "0 2px 7px #FFD70022", display: "flex", alignItems: "center", gap: 7
};
const thS = { padding: "13px 10px", background: "#232a2e", color: "#FFD700", fontWeight: 900, fontSize: 15, borderBottom: "2px solid #FFD700" };
const tdS = { padding: "11px 10px", borderBottom: "1px solid #2b3240", fontWeight: 600, fontSize: 15, color: "#fff", background: "#181e23" };
const labelS = { fontWeight: 700, color: "#FFD700", fontSize: 14, marginTop: 2 };
const inputS = { padding: "8px 13px", borderRadius: 7, border: "none", fontWeight: 700, fontSize: 16, background: "#232a2e", color: "#FFD700" };

export default StrategicExecutionPlanDashboard;
