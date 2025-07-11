import React, { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { FaCheckCircle, FaExclamationTriangle, FaRocket, FaChartLine, FaClipboardList, FaFlag, FaComments, FaCrown, FaUserTie, FaUserMd, FaDownload, FaArrowRight, FaPlus, FaEdit, FaRobot, FaSortUp, FaSortDown, FaCalendarAlt } from "react-icons/fa";
import jsPDF from "jspdf";
import "./StrategicGrowthExpansionEngine.css";

// --- INITIATIVES MOCK DATA (real: plug CSV/Excel loader) ---
const INITIATIVES = [
  {
    id: 1,
    title: "Launch U10 Tournament",
    owner: "Board",
    ownerIcon: <FaCrown />,
    phase: "Initiation",
    category: "Sport",
    status: "ontrack",
    priority: "High",
    impact: 5,
    risk: 1,
    deadline: "2024-09-10",
    start: "2024-06-10",
    log: ["Initial budget approved.", "Head coach shortlist started."]
  },
  {
    id: 2,
    title: "New Regional Sponsorship",
    owner: "GM",
    ownerIcon: <FaUserTie />,
    phase: "In Progress",
    category: "Commercial",
    status: "opportunity",
    priority: "Normal",
    impact: 4,
    risk: 2,
    deadline: "2024-07-30",
    start: "2024-05-22",
    log: ["Negotiating with top 2 prospects."]
  },
  {
    id: 3,
    title: "International Tournament Entry",
    owner: "Sport Director",
    ownerIcon: <FaUserMd />,
    phase: "Blocked",
    category: "Sport",
    status: "risk",
    priority: "Critical",
    impact: 4,
    risk: 4,
    deadline: "2024-11-01",
    start: "2024-06-01",
    log: ["Visa issues flagged.", "Funding gap remains."]
  },
  {
    id: 4,
    title: "Digital Transformation",
    owner: "COO",
    ownerIcon: <FaUserTie />,
    phase: "In Progress",
    category: "Innovation",
    status: "ontrack",
    priority: "Low",
    impact: 3,
    risk: 2,
    deadline: "2024-10-15",
    start: "2024-04-17",
    log: ["App prototype released.", "User training set for August."]
  }
];

const PHASES = ["Initiation", "In Progress", "Blocked", "Completed"];
const OWNERS = [
  { name: "Board", icon: <FaCrown /> },
  { name: "GM", icon: <FaUserTie /> },
  { name: "Sport Director", icon: <FaUserMd /> },
  { name: "COO", icon: <FaUserTie /> }
];
const STATUS_BADGES = {
  ontrack: { label: "On Track", color: "#35b378", icon: <FaCheckCircle /> },
  opportunity: { label: "Opportunity", color: "#FFD700", icon: <FaRocket /> },
  risk: { label: "At Risk", color: "#f35650", icon: <FaExclamationTriangle /> },
  completed: { label: "Completed", color: "#b7bec9", icon: <FaChartLine /> },
  blocked: { label: "Blocked", color: "#f2a900", icon: <FaFlag /> }
};
const CATEGORIES = ["Sport", "Commercial", "Innovation"];
const PRIORITY_LEVELS = [
  { label: "Low", color: "#b7bec9" },
  { label: "Normal", color: "#35b378" },
  { label: "High", color: "#FFD700" },
  { label: "Critical", color: "#f35650" }
];

function statusBadge(status) {
  const b = STATUS_BADGES[status] || STATUS_BADGES["blocked"];
  return <span className="sge-badge" style={{ background: b.color + "22", color: b.color }}>{b.icon} {b.label}</span>;
}
function priorityBadge(priority) {
  const p = PRIORITY_LEVELS.find(x => x.label === priority) || PRIORITY_LEVELS[1];
  return <span className="sge-priority" style={{ background: p.color + "22", color: p.color }}>{p.label}</span>;
}
function ownerAvatar(owner) {
  const found = OWNERS.find(o => o.name === owner);
  return found ? found.icon : <FaUserTie />;
}

// --- AI Copilot: Board-level logic
function aiCopilot(initiatives) {
  let notes = [];
  const now = new Date();
  const risks = initiatives.filter(i => i.status === "risk" || i.risk >= 3);
  const opps = initiatives.filter(i => i.status === "opportunity");
  const blocked = initiatives.filter(i => i.phase === "Blocked");
  const overdue = initiatives.filter(i => new Date(i.deadline) < now && i.phase !== "Completed");
  if (risks.length) notes.push(`Flag ${risks.map(i => `"${i.title}"`).join(", ")} for urgent board review`);
  if (opps.length) notes.push(`Prioritize: ${opps.map(i => i.title).join(", ")}`);
  if (blocked.length) notes.push(`Unblock: ${blocked.map(i => i.title).join(", ")}`);
  if (overdue.length) notes.push(`Overdue: ${overdue.map(i => i.title).join(", ")}`);
  if (!notes.length) notes.push("All initiatives within parameters. Monitor new entries.");
  return notes.join(" | ");
}

function boardMicroKPI(initiatives) {
  const now = new Date();
  const ontrack = initiatives.filter(i => i.status === "ontrack").length;
  const risk = initiatives.filter(i => i.status === "risk").length;
  const overdue = initiatives.filter(i => new Date(i.deadline) < now && i.phase !== "Completed").length;
  const nextReview = initiatives.reduce((min, i) => {
    if (i.phase === "Completed") return min;
    const d = new Date(i.deadline);
    return (!min || d < min) ? d : min;
  }, null);
  const avgRisk = (initiatives.reduce((sum, i) => sum + i.risk, 0) / initiatives.length).toFixed(1);
  const avgImpact = (initiatives.reduce((sum, i) => sum + i.impact, 0) / initiatives.length).toFixed(1);
  return {
    ontrack, risk, overdue,
    nextReview: nextReview ? nextReview.toLocaleDateString() : "—",
    avgRisk, avgImpact
  };
}

// --- Board Decision Log
function logAction(setLog, action, obj) {
  setLog(log => [
    {
      time: new Date().toLocaleString(),
      user: "Board Admin",
      action,
      title: obj.title,
      id: obj.id,
      impact: obj.impact,
      risk: obj.risk
    },
    ...log
  ]);
}

// --- Timeline: Build data for all initiatives (start, deadline, current phase)
function buildTimeline(initiatives) {
  return initiatives.map(i => ({
    id: i.id,
    title: i.title,
    start: i.start,
    deadline: i.deadline,
    phase: i.phase,
    priority: i.priority,
    owner: i.owner
  })).sort((a, b) => new Date(a.start) - new Date(b.start));
}

export default function StrategicGrowthExpansionEngine() {
  const [initiatives, setInitiatives] = useState(INITIATIVES);
  const [filter, setFilter] = useState({ phase: "", owner: "", status: "", category: "" });
  const [modal, setModal] = useState(null);
  const [logModal, setLogModal] = useState(null);
  const [decisionLog, setDecisionLog] = useState([]);
  const [timelineExpanded, setTimelineExpanded] = useState(true);

  // --- Add decision log on add/edit
  function saveModal(obj) {
    setInitiatives(ins => {
      let updated;
      if (obj.id && ins.some(i => i.id === obj.id)) {
        updated = ins.map(i => i.id === obj.id ? obj : i);
      } else {
        updated = [...ins, { ...obj, id: Math.max(...ins.map(i => i.id)) + 1 }];
      }
      logAction(setDecisionLog, obj.id ? "Edit Initiative" : "Add Initiative", obj);
      return updated;
    });
    setModal(null);
  }
  function saveLog(id, entry) {
    setInitiatives(ins =>
      ins.map(i => i.id === id ? { ...i, log: [...i.log, entry] } : i)
    );
    setLogModal(null);
    logAction(setDecisionLog, "Add Log Entry", { id, title: (initiatives.find(x => x.id === id) || {}).title, impact: 0, risk: 0 });
  }

  // --- Priority order logic
  function movePriority(id, dir) {
    setInitiatives(ins => {
      const col = ins.filter(i => i.phase === ins.find(x => x.id === id).phase);
      const idx = col.findIndex(i => i.id === id);
      if ((dir === -1 && idx === 0) || (dir === 1 && idx === col.length - 1)) return ins;
      const targetIdx = idx + dir;
      const colIds = col.map(i => i.id);
      const all = [...ins];
      const id1 = colIds[idx], id2 = colIds[targetIdx];
      const i1 = all.findIndex(x => x.id === id1), i2 = all.findIndex(x => x.id === id2);
      [all[i1], all[i2]] = [all[i2], all[i1]];
      return all;
    });
  }

  // --- Filters
  let filtered = initiatives.filter(i => {
    if (filter.phase && i.phase !== filter.phase) return false;
    if (filter.owner && i.owner !== filter.owner) return false;
    if (filter.status && i.status !== filter.status) return false;
    if (filter.category && i.category !== filter.category) return false;
    return true;
  });

  // --- Analytics
  const phaseCounts = PHASES.map(phase => ({
    phase,
    count: initiatives.filter(i => i.phase === phase).length
  }));
  const statusCounts = Object.keys(STATUS_BADGES).map(k => ({
    status: STATUS_BADGES[k].label,
    count: initiatives.filter(i => i.status === k).length
  }));

  // --- Board KPI
  const kpi = boardMicroKPI(initiatives);

  // --- Timeline
  const timeline = buildTimeline(initiatives);

  // --- PDF Export (with timeline & log)
  function exportPDF() {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 16;
    doc.setFillColor(35, 42, 46);
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(255, 215, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CourtEvo Vero: Strategic Growth Board Pack", 12, y);
    doc.setFontSize(10);
    doc.text("BE REAL. BE VERO.", 148, y);
    y += 10;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 12, y);
    y += 10;
    doc.setTextColor(35, 42, 46);
    doc.setFontSize(12);
    doc.text("Initiative Timeline:", 12, y);
    y += 6;
    timeline.forEach((t, idx) => {
      doc.text(`${t.title}: Start ${t.start}, Deadline ${t.deadline}, Phase: ${t.phase}, Priority: ${t.priority}`, 12, y);
      y += 5;
      if (y > 250) { doc.addPage(); y = 16; }
    });
    y += 2;
    doc.setFontSize(12);
    doc.text("Board Decision Log:", 12, y);
    y += 6;
    decisionLog.slice(0, 10).forEach((entry, idx) => {
      doc.text(`${entry.time}: [${entry.user}] ${entry.action} (${entry.title})`, 12, y);
      y += 5;
      if (y > 270) { doc.addPage(); y = 16; }
    });
    y += 2;
    doc.setFontSize(12);
    doc.text("Initiatives:", 12, y);
    y += 5;
    initiatives.forEach((i, idx) => {
      doc.setFontSize(11);
      doc.text(`${i.title} (${i.phase}, ${i.owner}, ${i.category}, ${i.priority})`, 12, y);
      y += 5;
      doc.text(`Status: ${i.status.toUpperCase()} | Impact: ${i.impact}/5 | Risk: ${i.risk}/5 | Deadline: ${i.deadline}`, 12, y);
      y += 5;
      doc.text(`Log: ${i.log.join(" | ")}`, 12, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 16; }
    });
    y += 3;
    doc.setFontSize(10);
    doc.text(`AI Copilot: ${aiCopilot(initiatives)}`, 12, y);
    y += 8;
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(9);
    doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 12, 287);
    doc.save(`StrategicGrowthPack_CourtEvoVero.pdf`);
  }

  return (
    <div className="sge-main">
      <div className="sge-header">
        <h2>
          <FaRocket style={{ color: "#FFD700", marginRight: 13 }} />
          Strategic Growth & Board Intelligence Engine
        </h2>
        <div>
          <button className="sge-pdf-btn" onClick={exportPDF}>
            <FaDownload /> Export Board Pack
          </button>
          <button className="sge-add-btn" onClick={() => setModal({})}>
            <FaPlus /> Add Initiative
          </button>
        </div>
      </div>

      {/* --- Timeline View --- */}
      <div className="sge-timeline-box">
        <div className="sge-timeline-head" onClick={() => setTimelineExpanded((v) => !v)}>
          <FaCalendarAlt /> Board Timeline {timelineExpanded ? "▼" : "▶"}
        </div>
        {timelineExpanded && (
          <div className="sge-timeline-track">
            {timeline.map((t, idx) => {
              const overdue = new Date(t.deadline) < new Date() && t.phase !== "Completed";
              return (
                <div className="sge-timeline-point" key={t.id}>
                  <div className="sge-timeline-title">
                    {ownerAvatar(t.owner)}
                    <span>{t.title}</span>
                  </div>
                  <div className="sge-timeline-row">
                    <span className="sge-timeline-phase">{t.phase}</span>
                    {priorityBadge(t.priority)}
                    <span className={`sge-timeline-date ${overdue ? "sge-overdue" : ""}`}>
                      {t.start} <FaArrowRight /> {t.deadline}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- Board KPI Microdashboard --- */}
      <div className="sge-boardkpi-row">
        <div className="sge-boardkpi-card">
          <div className="sge-boardkpi-title">On Track</div>
          <div className="sge-boardkpi-value sge-green">{kpi.ontrack}</div>
        </div>
        <div className="sge-boardkpi-card">
          <div className="sge-boardkpi-title">At Risk</div>
          <div className="sge-boardkpi-value sge-red">{kpi.risk}</div>
        </div>
        <div className="sge-boardkpi-card">
          <div className="sge-boardkpi-title">Overdue</div>
          <div className="sge-boardkpi-value sge-yellow">{kpi.overdue}</div>
        </div>
        <div className="sge-boardkpi-card">
          <div className="sge-boardkpi-title">Next Review</div>
          <div className="sge-boardkpi-value">{kpi.nextReview}</div>
        </div>
        <div className="sge-boardkpi-card">
          <div className="sge-boardkpi-title">Avg. Risk</div>
          <div className="sge-boardkpi-value">{kpi.avgRisk}</div>
        </div>
        <div className="sge-boardkpi-card">
          <div className="sge-boardkpi-title">Avg. Impact</div>
          <div className="sge-boardkpi-value">{kpi.avgImpact}</div>
        </div>
      </div>

      {/* --- Analytics --- */}
      <div className="sge-analytics-row">
        <div className="sge-analytics-card">
          <div className="sge-analytics-title">
            <FaClipboardList /> Initiative Phases
          </div>
          <div style={{ height: 105 }}>
            <ResponsiveBar
              data={phaseCounts}
              keys={["count"]}
              indexBy="phase"
              margin={{ top: 10, right: 18, bottom: 32, left: 35 }}
              padding={0.32}
              colors={["#FFD700"]}
              axisBottom={{
                tickSize: 6,
                tickRotation: -10,
                legend: "Phase",
                legendOffset: 22,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 6,
                legend: "Initiatives",
                legendOffset: -22,
                legendPosition: "middle"
              }}
              labelSkipWidth={100}
              labelSkipHeight={12}
              theme={{
                axis: { ticks: { text: { fill: "#FFD700" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              height={105}
              enableLabel={true}
              labelTextColor="#232a2e"
              isInteractive={false}
            />
          </div>
        </div>
        <div className="sge-analytics-card">
          <div className="sge-analytics-title">
            <FaChartLine /> By Status
          </div>
          <div style={{ height: 105 }}>
            <ResponsiveBar
              data={statusCounts}
              keys={["count"]}
              indexBy="status"
              margin={{ top: 10, right: 18, bottom: 32, left: 35 }}
              padding={0.32}
              colors={["#35b378"]}
              axisBottom={{
                tickSize: 6,
                tickRotation: -10,
                legend: "Status",
                legendOffset: 22,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 6,
                legend: "Initiatives",
                legendOffset: -22,
                legendPosition: "middle"
              }}
              labelSkipWidth={100}
              labelSkipHeight={12}
              theme={{
                axis: { ticks: { text: { fill: "#35b378" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              height={105}
              enableLabel={true}
              labelTextColor="#232a2e"
              isInteractive={false}
            />
          </div>
        </div>
        <div className="sge-analytics-card">
          <div className="sge-analytics-title">
            <FaRobot /> AI Copilot
          </div>
          <div className="sge-copilot-box">{aiCopilot(initiatives)}</div>
        </div>
      </div>

      {/* --- Filter Row --- */}
      <div className="sge-filter-row">
        <select value={filter.phase} onChange={e => setFilter(f => ({ ...f, phase: e.target.value }))}>
          <option value="">Phase</option>
          {PHASES.map(p => (
            <option value={p} key={p}>
              {p}
            </option>
          ))}
        </select>
        <select value={filter.owner} onChange={e => setFilter(f => ({ ...f, owner: e.target.value }))}>
          <option value="">Owner</option>
          {OWNERS.map(o => (
            <option value={o.name} key={o.name}>
              {o.name}
            </option>
          ))}
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">Status</option>
          {Object.keys(STATUS_BADGES).map(k => (
            <option value={k} key={k}>
              {STATUS_BADGES[k].label}
            </option>
          ))}
        </select>
        <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}>
          <option value="">Category</option>
          {CATEGORIES.map(c => (
            <option value={c} key={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* --- Initiatives Kanban --- */}
      <div className="sge-kanban-row">
        {PHASES.map(phase => (
          <div className="sge-kanban-col" key={phase}>
            <div className="sge-phase-title">{phase}</div>
            {initiatives.filter(i => i.phase === phase).length === 0 && (
              <div className="sge-empty">No initiatives</div>
            )}
            {initiatives
              .filter(i => i.phase === phase)
              .sort((a, b) => PRIORITY_LEVELS.findIndex(x => x.label === b.priority) - PRIORITY_LEVELS.findIndex(x => x.label === a.priority))
              .map((i, idx, arr) => (
                <div className="sge-card" key={i.id}>
                  <div className="sge-card-title">
                    {ownerAvatar(i.owner)}
                    {i.title}
                    {statusBadge(i.status)}
                    {priorityBadge(i.priority)}
                    <button className="sge-edit-btn" title="Edit" onClick={() => setModal(i)}>
                      <FaEdit />
                    </button>
                  </div>
                  <div className="sge-card-row">
                    <b>Category:</b> {i.category}
                  </div>
                  <div className="sge-card-row">
                    <b>Impact:</b> {i.impact}/5 &nbsp; <b>Risk:</b> {i.risk}/5
                  </div>
                  <div className="sge-card-row">
                    <b>Start:</b> {i.start} &nbsp; <b>Deadline:</b>{" "}
                    <span className={new Date(i.deadline) < new Date() && i.phase !== "Completed" ? "sge-overdue" : ""}>
                      {i.deadline}
                    </span>
                  </div>
                  <div className="sge-card-log">
                    {i.log.slice(-2).map((l, ix) => (
                      <div key={ix}>
                        <FaComments style={{ color: "#FFD700", fontSize: 12, marginRight: 3 }} />
                        {l}
                      </div>
                    ))}
                  </div>
                  <div className="sge-card-actions">
                    <button className="sge-log-btn" onClick={() => setLogModal(i)}>
                      <FaComments /> Add Log
                    </button>
                    <button className="sge-move-btn" disabled={idx === 0} onClick={() => movePriority(i.id, -1)} title="Move Up">
                      <FaSortUp />
                    </button>
                    <button className="sge-move-btn" disabled={idx === arr.length - 1} onClick={() => movePriority(i.id, 1)} title="Move Down">
                      <FaSortDown />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* --- Board Decision Log --- */}
      <div className="sge-decision-log-panel">
        <div className="sge-decision-log-title">
          <FaClipboardList /> Board Decision Log
        </div>
        <div className="sge-decision-log-list">
          {decisionLog.length === 0 && <div className="sge-log-empty">No recent board actions.</div>}
          {decisionLog.slice(0, 9).map((entry, i) => (
            <div className="sge-log-entry" key={i}>
              <span className="sge-log-time">{entry.time}</span>
              <span className="sge-log-user">{entry.user}</span>
              <span className="sge-log-action">{entry.action}</span>
              <span className="sge-log-title">{entry.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- Modal for Add/Edit Initiative --- */}
      {modal && (
        <InitiativeEditModal
          obj={modal}
          onSave={saveModal}
          onClose={() => setModal(null)}
        />
      )}
      {/* --- Modal for Add Log --- */}
      {logModal && (
        <LogAddModal obj={logModal} onSave={saveLog} onClose={() => setLogModal(null)} />
      )}

      <div className="sge-tagline">BE REAL. BE VERO.</div>
    </div>
  );
}

// --- Initiative Edit Modal ---
function InitiativeEditModal({ obj, onSave, onClose }) {
  const [state, setState] = useState({
    ...obj,
    title: obj.title ?? "",
    owner: obj.owner ?? "Board",
    phase: obj.phase ?? PHASES[0],
    category: obj.category ?? CATEGORIES[0],
    impact: obj.impact ?? 1,
    risk: obj.risk ?? 1,
    priority: obj.priority ?? "Normal",
    start: obj.start ?? new Date().toISOString().slice(0, 10),
    deadline: obj.deadline ?? "",
    log: obj.log ?? []
  });
  function update(field, val) {
    setState((s) => ({ ...s, [field]: val }));
  }
  function save() {
    onSave(state);
  }
  return (
    <div className="sge-modal-overlay">
      <div className="sge-modal">
        <div className="sge-modal-header">
          <FaEdit /> {obj.id ? "Edit Initiative" : "Add Initiative"}
          <button className="sge-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="sge-modal-row">
          <label>Title:</label>
          <input value={state.title} onChange={e => update("title", e.target.value)} />
        </div>
        <div className="sge-modal-row">
          <label>Owner:</label>
          <select value={state.owner} onChange={e => update("owner", e.target.value)}>
            {OWNERS.map(o => (
              <option value={o.name} key={o.name}>
                {o.name}
              </option>
            ))}
          </select>
          <label>Phase:</label>
          <select value={state.phase} onChange={e => update("phase", e.target.value)}>
            {PHASES.map(p => (
              <option value={p} key={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="sge-modal-row">
          <label>Category:</label>
          <select value={state.category} onChange={e => update("category", e.target.value)}>
            {CATEGORIES.map(c => (
              <option value={c} key={c}>
                {c}
              </option>
            ))}
          </select>
          <label>Priority:</label>
          <select value={state.priority} onChange={e => update("priority", e.target.value)}>
            {PRIORITY_LEVELS.map(p => (
              <option value={p.label} key={p.label}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sge-modal-row">
          <label>Impact:</label>
          <input type="number" min={1} max={5} value={state.impact} onChange={e => update("impact", Number(e.target.value))} style={{ width: 62 }} />
          <label>Risk:</label>
          <input type="number" min={1} max={5} value={state.risk} onChange={e => update("risk", Number(e.target.value))} style={{ width: 62 }} />
        </div>
        <div className="sge-modal-row">
          <label>Start:</label>
          <input type="date" value={state.start} onChange={e => update("start", e.target.value)} />
          <label>Deadline:</label>
          <input type="date" value={state.deadline} onChange={e => update("deadline", e.target.value)} />
        </div>
        <div className="sge-modal-actions">
          <button className="sge-pdf-btn" onClick={save}>
            <FaCheckCircle /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Log Add Modal ---
function LogAddModal({ obj, onSave, onClose }) {
  const [log, setLog] = useState("");
  function submit() {
    if (log.trim()) onSave(obj.id, log);
  }
  return (
    <div className="sge-modal-overlay">
      <div className="sge-modal">
        <div className="sge-modal-header">
          <FaComments /> Add Log
          <button className="sge-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="sge-modal-row">
          <label>New Log Entry:</label>
          <input value={log} onChange={e => setLog(e.target.value)} />
        </div>
        <div className="sge-modal-actions">
          <button className="sge-pdf-btn" onClick={submit}>
            <FaCheckCircle /> Save Log
          </button>
        </div>
      </div>
    </div>
  );
}
