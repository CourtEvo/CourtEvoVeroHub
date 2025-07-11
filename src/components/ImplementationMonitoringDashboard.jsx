import React, { useState, useRef } from "react";
import {
  FaUserCheck, FaUserClock, FaFlagCheckered, FaExclamationTriangle, FaCalendarAlt, FaRobot,
  FaClipboardList, FaCheckCircle, FaHourglassHalf, FaChartLine, FaBullhorn, FaSync, FaFilePdf, FaDownload, FaHistory, FaRegCommentDots
} from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Sample base milestones (extend as needed)
const BASE_MILESTONES = [
  {
    id: 1,
    task: "Complete Coach Licensure Module",
    owner: "Ivan",
    due: "2025-07-15",
    status: "In Progress",
    progress: 65,
    risk: "Low",
    blockers: "",
    notes: "Online platform launched, 2/3 modules done.",
    kpis: [{ name: "Modules Complete", value: 2, target: 3, trend: [0, 1, 2] }],
    updates: [
      { date: "2025-06-19", by: "Ivan", text: "Module 2 done, starting final unit." }
    ],
    alerts: [],
    escalated: false
  },
  {
    id: 2,
    task: "Organize U14 Regional Tournament",
    owner: "Petra",
    due: "2025-08-01",
    status: "Planning",
    progress: 20,
    risk: "Medium",
    blockers: "Venue contract not signed",
    notes: "Sponsors interested. Awaiting final venue agreement.",
    kpis: [{ name: "Teams Confirmed", value: 6, target: 12, trend: [2, 4, 6] }],
    updates: [
      { date: "2025-06-10", by: "Petra", text: "Initial sponsors reached." }
    ],
    alerts: ["Venue at risk—escalate by July 1"],
    escalated: false
  },
  {
    id: 3,
    task: "Publish Annual Compliance Report",
    owner: "Jakov",
    due: "2025-06-30",
    status: "Review",
    progress: 90,
    risk: "Low",
    blockers: "",
    notes: "Awaiting board approval.",
    kpis: [{ name: "Pages Complete", value: 16, target: 18, trend: [10, 12, 16] }],
    updates: [
      { date: "2025-06-17", by: "Jakov", text: "Draft sent to board." }
    ],
    alerts: [],
    escalated: false
  }
];

// Risk color codes
const RISK_COLOR = {
  Low: "#1de682",
  Medium: "#FFD700",
  High: "#e94057"
};

// Status color
const STATUS_COLOR = {
  "In Progress": "#FFD700",
  Planning: "#66c1ff",
  Review: "#8f61ff",
  Complete: "#1de682"
};

function KPIProgress({ kpi }) {
  if (!kpi) return null;
  const percent = Math.min(100, Math.round((kpi.value / (kpi.target || 1)) * 100));
  return (
    <span style={{
      display: "inline-block", minWidth: 60, borderRadius: 8,
      background: "#222", color: "#FFD700", fontWeight: 700,
      padding: "2px 9px", marginRight: 6
    }}>
      {kpi.name}: {kpi.value} / {kpi.target} ({percent}%)
    </span>
  );
}

function Sparkline({ data, color = "#FFD700", width = 38, height = 12 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const norm = v => height - ((v - min) / (max - min || 1)) * height;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${norm(v)}`).join(' ');
  return (
    <svg width={width} height={height}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

function StatusBadge({ status }) {
  return (
    <span style={{
      color: STATUS_COLOR[status] || "#fff",
      background: "#232a2e",
      border: `1.5px solid ${STATUS_COLOR[status] || "#fff"}`,
      borderRadius: 8,
      fontWeight: 800,
      padding: "2px 10px",
      fontSize: 15
    }}>{status}</span>
  );
}

function RiskBadge({ risk }) {
  return (
    <span style={{
      color: "#fff",
      background: RISK_COLOR[risk] || "#FFD700",
      borderRadius: 8,
      fontWeight: 800,
      padding: "2px 10px",
      fontSize: 15,
      marginLeft: 6
    }}>
      {risk}
    </span>
  );
}

function UpdateLog({ updates }) {
  if (!updates?.length) return <span style={{ color: "#aaa" }}>No updates yet.</span>;
  return (
    <ul style={{ fontSize: 13, color: "#FFD700", marginTop: 2 }}>
      {updates.map((u, idx) =>
        <li key={idx}><FaHistory style={{ marginRight: 6 }} /> {u.date}: <b>{u.text}</b> <i style={{ color: "#1de682" }}>({u.by})</i></li>
      )}
    </ul>
  );
}

function AlertLog({ alerts }) {
  if (!alerts?.length) return null;
  return (
    <ul style={{ fontSize: 14, color: "#FFD700" }}>
      {alerts.map((a, idx) =>
        <li key={idx}><FaBullhorn style={{ marginRight: 6 }} /> {a}</li>
      )}
    </ul>
  );
}

function ImplementationMonitoringDashboard() {
  const [tasks, setTasks] = useState(BASE_MILESTONES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [escalateId, setEscalateId] = useState(null);
  const [newUpdate, setNewUpdate] = useState("");
  const [viewDrill, setViewDrill] = useState(null);

  // Filtering
  let filtered = tasks;
  if (search.trim())
    filtered = filtered.filter(t =>
      t.task.toLowerCase().includes(search.toLowerCase()) ||
      t.owner.toLowerCase().includes(search.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()))
    );
  if (statusFilter !== "All")
    filtered = filtered.filter(t => t.status === statusFilter);
  if (riskFilter !== "All")
    filtered = filtered.filter(t => t.risk === riskFilter);
  if (ownerFilter !== "All")
    filtered = filtered.filter(t => t.owner === ownerFilter);

  // PDF export
  const exportRef = useRef();
  const handlePDF = async () => {
    const canvas = await html2canvas(exportRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    pdf.addImage(imgData, "PNG", 25, 30, 770, 540);
    pdf.save("Implementation_Monitoring_BoardPack.pdf");
  };

  // CSV export
  const handleCSV = () => {
    let csv = "Task,Owner,Due,Status,Progress,Risk,Blockers,Notes,KPIs,Alerts\n";
    tasks.forEach(t =>
      csv += `"${t.task}","${t.owner}","${t.due}","${t.status}","${t.progress}%","${t.risk}","${t.blockers}","${t.notes.replace(/"/g, '""')}","${(t.kpis || []).map(k => `${k.name}:${k.value}/${k.target}`).join('; ')}","${(t.alerts || []).join('; ')}"\n`
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Implementation_Monitoring_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add new task (demo)
  function addDemoTask() {
    setTasks(ts => [
      ...ts,
      {
        id: ts.length + 1,
        task: "New Task Example",
        owner: "Ana",
        due: "2025-09-15",
        status: "Planning",
        progress: 0,
        risk: "Low",
        blockers: "",
        notes: "",
        kpis: [],
        updates: [{ date: new Date().toLocaleDateString(), by: "Ana", text: "Task created." }],
        alerts: [],
        escalated: false
      }
    ]);
  }

  // Escalate risk/alert
  function handleEscalate(id) {
    setTasks(ts => ts.map(t =>
      t.id !== id ? t : { ...t, escalated: true, alerts: [...(t.alerts || []), "Board escalation triggered."] }
    ));
    setEscalateId(null);
  }

  // Add update
  function handleAddUpdate(task) {
    if (!newUpdate.trim()) return;
    setTasks(ts => ts.map(t =>
      t.id !== task.id ? t : {
        ...t,
        updates: [...(t.updates || []), { date: new Date().toLocaleDateString(), by: "You", text: newUpdate }]
      }
    ));
    setNewUpdate("");
    setViewDrill(null);
  }

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 17 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 19 }}>
        <h2 style={{ color: "#FFD700", fontWeight: 900, fontSize: 32, letterSpacing: 2 }}>
          <FaClipboardList style={{ marginRight: 8, marginBottom: -8 }} /> Implementation & Monitoring Dashboard
        </h2>
        <div>
          <button
            onClick={handlePDF}
            style={{ background: "#FFD700", color: "#232a2e", borderRadius: 8, fontWeight: 900, fontSize: 15, padding: "9px 18px", marginRight: 11 }}>
            <FaFilePdf style={{ marginRight: 4, marginBottom: -2 }} /> Export PDF
          </button>
          <button
            onClick={handleCSV}
            style={{ background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 900, fontSize: 15, padding: "9px 18px" }}>
            <FaDownload style={{ marginRight: 4, marginBottom: -2 }} /> Export CSV
          </button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 15 }}>
        <input
          placeholder="Search tasks/notes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ borderRadius: 8, fontSize: 16, padding: "5px 13px", width: 180 }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ borderRadius: 8, fontSize: 15 }}>
          <option>All</option>
          <option>Planning</option>
          <option>In Progress</option>
          <option>Review</option>
          <option>Complete</option>
        </select>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} style={{ borderRadius: 8, fontSize: 15 }}>
          <option>All</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} style={{ borderRadius: 8, fontSize: 15 }}>
          <option>All</option>
          {Array.from(new Set(tasks.map(t => t.owner))).map(o => <option key={o}>{o}</option>)}
        </select>
        <button onClick={addDemoTask} style={{ fontWeight: 800, borderRadius: 8, fontSize: 15, background: "#FFD700", color: "#232a2e", padding: "7px 18px" }}>
          + Add Demo Task
        </button>
      </div>
      <div ref={exportRef} style={{ borderRadius: 14, background: "#181e23", boxShadow: "0 2px 22px #FFD70022", padding: 17 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18 }}>
          <thead>
            <tr>
              <th style={{ color: "#FFD700", fontWeight: 700, fontSize: 16 }}>Task</th>
              <th>Owner</th>
              <th>Due</th>
              <th>Status</th>
              <th>Progress</th>
              <th>KPI(s)</th>
              <th>Risk</th>
              <th>Blockers</th>
              <th>Notes</th>
              <th>Alerts</th>
              <th>Update Log</th>
              <th>Escalate</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(task => (
              <tr
                key={task.id}
                style={{
                  background: task.escalated ? "#e9405733" : undefined,
                  cursor: "pointer", fontWeight: 700, borderBottom: "2.5px solid #222"
                }}
                title="Click to view/add update"
                onClick={() => setViewDrill(task)}
              >
                <td style={{ color: "#FFD700", fontWeight: 800 }}>{task.task}</td>
                <td>{task.owner}</td>
                <td>
                  <FaCalendarAlt style={{ marginBottom: -2, marginRight: 4 }} /> {task.due}
                </td>
                <td>
                  <StatusBadge status={task.status} />
                </td>
                <td>
                  <div style={{ height: 16, background: "#232a2e", borderRadius: 8, width: 105, position: "relative" }}>
                    <div style={{
                      width: `${task.progress}%`,
                      background: task.progress > 85 ? "#1de682" : task.progress > 50 ? "#FFD700" : "#e94057",
                      height: "100%", borderRadius: 7
                    }}></div>
                    <span style={{
                      position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                      fontWeight: 800, color: "#222", fontSize: 13
                    }}>{task.progress}%</span>
                  </div>
                </td>
                <td>
                  {task.kpis.map((k, i) =>
                    <span key={i}>
                      <KPIProgress kpi={k} />
                      <Sparkline data={k.trend} />
                    </span>
                  )}
                </td>
                <td><RiskBadge risk={task.risk} /></td>
                <td style={{ color: "#FFD70099", fontWeight: 600 }}>{task.blockers}</td>
                <td style={{ color: "#fff", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {task.notes}
                </td>
                <td><AlertLog alerts={task.alerts} /></td>
                <td>
                  <UpdateLog updates={task.updates} />
                </td>
                <td>
                  {!task.escalated && (
                    <button onClick={e => { e.stopPropagation(); setEscalateId(task.id); }} style={{
                      background: "#e94057", color: "#fff", borderRadius: 7, fontWeight: 800,
                      fontSize: 14, padding: "6px 11px", border: "none"
                    }}><FaBullhorn /> Escalate</button>
                  )}
                  {task.escalated && <span style={{ color: "#FFD700", fontWeight: 900 }}>Escalated</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 14, color: "#FFD70088", fontWeight: 600, fontSize: 14, textAlign: "center", borderTop: "1.5px solid #333", paddingTop: 11 }}>
          <b>
            Click any row to add progress, update notes, or escalate for board action. Use PDF/CSV export for board/ops reviews.<br />
            Board-level monitoring—flag risks or overdue actions for instant escalation.
          </b>
        </div>
      </div>
      {escalateId && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#232a2e", padding: 36, borderRadius: 18, minWidth: 400, color: "#fff" }}>
            <h3 style={{ color: "#FFD700", marginBottom: 14 }}>Confirm Board Escalation?</h3>
            <p>This will notify board/leadership about an urgent risk or blocker.</p>
            <button onClick={() => handleEscalate(escalateId)} style={{
              background: "#e94057", color: "#fff", borderRadius: 8, fontWeight: 800,
              fontSize: 17, padding: "10px 28px", marginRight: 16, border: "none"
            }}>Escalate</button>
            <button onClick={() => setEscalateId(null)} style={{
              background: "#FFD700", color: "#232a2e", borderRadius: 8, fontWeight: 700,
              fontSize: 15, padding: "8px 22px", border: "none"
            }}>Cancel</button>
          </div>
        </div>
      )}
      {viewDrill && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#232a2e", padding: 39, borderRadius: 18, minWidth: 400, color: "#fff", minHeight: 310 }}>
            <h3 style={{ color: "#FFD700", marginBottom: 14 }}><FaRegCommentDots style={{ marginRight: 6, marginBottom: -3 }} /> Update Task</h3>
            <div style={{ marginBottom: 10 }}>
              <b>Task:</b> {viewDrill.task}
            </div>
            <div style={{ marginBottom: 10 }}>
              <b>Owner:</b> {viewDrill.owner}
            </div>
            <div style={{ marginBottom: 10 }}>
              <b>Progress:</b> {viewDrill.progress}%
            </div>
            <div style={{ marginBottom: 10 }}>
              <b>Add Progress Update/Note:</b>
              <textarea value={newUpdate} onChange={e => setNewUpdate(e.target.value)} rows={3} style={{ width: "100%", borderRadius: 7, fontSize: 15, marginTop: 7 }} />
            </div>
            <button onClick={() => handleAddUpdate(viewDrill)} style={{
              background: "#1de682", color: "#232a2e", borderRadius: 8, fontWeight: 700, fontSize: 16, padding: "7px 18px", marginRight: 16, border: "none"
            }}>Add Update</button>
            <button onClick={() => setViewDrill(null)} style={{
              background: "#FFD700", color: "#232a2e", borderRadius: 8, fontWeight: 700, fontSize: 15, padding: "7px 18px", border: "none"
            }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImplementationMonitoringDashboard;
