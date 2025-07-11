import React, { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { FaUserTie, FaCrown, FaUserMd, FaChalkboardTeacher, FaUserCheck, FaUserClock, FaUserPlus, FaEdit, FaDownload, FaCheckCircle, FaExclamationTriangle, FaGraduationCap, FaRobot, FaFlag, FaBullhorn } from "react-icons/fa";
import jsPDF from "jspdf";
import "./StaffVolunteerHRDevelopmentSuite.css";

// --- MOCK DATA (add/edit enabled, plug Excel for real) ---
const INIT_STAFF = [
  {
    id: 1,
    name: "Ivan Kovač",
    role: "Head Coach",
    area: "U18",
    email: "ana.kovac@demo.club",
    avatar: <FaChalkboardTeacher />,
    status: "Active",
    contract: "2025-06-30",
    cpd: 18,
    cpdReq: 20,
    cpdExp: "2025-05-15",
    cpdHistory: [4, 6, 5, 3], // last 4 quarters
    competencies: {
      "Coaching License": "green",
      "First Aid": "yellow",
      "Youth Dev": "green",
      "Video Analysis": "red"
    },
    pipeline: "Ready",
    flag: false,
    log: ["CPD renewed May 2024.", "Assigned U18 project."]
  },
  {
    id: 2,
    name: "Ivan Horvat",
    role: "Volunteer",
    area: "Community",
    email: "ivan.horvat@demo.club",
    avatar: <FaUserCheck />,
    status: "Active",
    contract: "2024-09-30",
    cpd: 6,
    cpdReq: 10,
    cpdExp: "2024-08-01",
    cpdHistory: [2, 2, 1, 1],
    competencies: {
      "Coaching License": "yellow",
      "First Aid": "yellow",
      "Youth Dev": "red",
      "Video Analysis": "yellow"
    },
    pipeline: "At Risk",
    flag: false,
    log: ["Onboarded Feb 2024."]
  },
  {
    id: 3,
    name: "Petar Novak",
    role: "Medical",
    area: "Seniors",
    email: "martina.novak@demo.club",
    avatar: <FaUserMd />,
    status: "Active",
    contract: "2026-04-30",
    cpd: 24,
    cpdReq: 20,
    cpdExp: "2026-04-01",
    cpdHistory: [6, 7, 5, 6],
    competencies: {
      "Coaching License": "yellow",
      "First Aid": "green",
      "Youth Dev": "green",
      "Video Analysis": "green"
    },
    pipeline: "Promotion",
    flag: false,
    log: ["Promoted to seniors 2023."]
  }
];
// --- ROLES, COMPETENCIES, BENCH ---
const ROLES = ["Head Coach", "Assistant Coach", "Medical", "Volunteer"];
const AREAS = ["U18", "Community", "Seniors"];
const COMP_KEYS = ["Coaching License", "First Aid", "Youth Dev", "Video Analysis"];
const PIPELINE_BADGE = {
  "Ready": { label: "Ready", color: "#35b378", icon: <FaCheckCircle/> },
  "At Risk": { label: "At Risk", color: "#FFD700", icon: <FaExclamationTriangle/> },
  "Promotion": { label: "Promotion Pool", color: "#b7bec9", icon: <FaGraduationCap/> }
};
const CPD_TAGS = [
  { test: (c,s) => c >= s, color: "#35b378", label: "Up-to-date" },
  { test: (c,s,e) => c < s && new Date(e) > new Date(), color: "#FFD700", label: "Expiring soon" },
  { test: (c,s,e) => c < s && new Date(e) <= new Date(), color: "#f35650", label: "Overdue" }
];
const ACTIONS = [
  { key: "cpd", icon: <FaGraduationCap/>, label: "Schedule CPD" },
  { key: "promotion", icon: <FaCheckCircle/>, label: "Nominate for Promotion" },
  { key: "succession", icon: <FaFlag/>, label: "Plan Succession" },
  { key: "alert", icon: <FaBullhorn/>, label: "Send Alert" }
];
const BOARDUSER = "Board Admin";

// --- CPD status logic ---
function cpdStatus(staff) {
  for (const tag of CPD_TAGS) {
    if (tag.test(staff.cpd, staff.cpdReq, staff.cpdExp)) return tag;
  }
  return CPD_TAGS[2];
}
function pipelineBadge(pipeline, flagged) {
  const b = PIPELINE_BADGE[pipeline] || PIPELINE_BADGE["Ready"];
  return (
    <span className="svhr-badge" style={{background:b.color+"22",color:b.color}}>
      {b.icon} {b.label} {flagged && <FaFlag style={{color:"#f35650",marginLeft:7}}/>}
    </span>
  );
}
function cpdBadge(staff) {
  const c = cpdStatus(staff);
  return <span className="svhr-badge" style={{background:c.color+"22",color:c.color}}>{c.label}</span>;
}

// --- Analytics logic ---
function microAnalytics(staff) {
  const up = staff.filter(s => cpdStatus(s).label === "Up-to-date").length;
  const soon = staff.filter(s => cpdStatus(s).label === "Expiring soon").length;
  const overdue = staff.filter(s => cpdStatus(s).label === "Overdue").length;
  const ready = staff.filter(s => s.pipeline === "Ready").length;
  const risk = staff.filter(s => s.pipeline === "At Risk").length;
  const promo = staff.filter(s => s.pipeline === "Promotion").length;
  return { up, soon, overdue, ready, risk, promo };
}
function benchStrength(staff) {
  return ROLES.map(role => {
    const pool = staff.filter(s => s.role === role);
    const ready = pool.filter(s => s.pipeline === "Ready").length;
    const risk = pool.filter(s => s.pipeline === "At Risk").length;
    const vacant = pool.length === 0;
    return { role, ready, risk, vacant };
  });
}

// --- Succession grid logic ---
function successionGrid(staff) {
  return ROLES.map(role => {
    const all = staff.filter(s => s.role === role);
    return {
      role,
      primary: all[0]?.name ?? "-",
      successor: all[1]?.name ?? "-",
      bench: all.length > 2 ? all.slice(2).map(s=>s.name).join(", ") : "-",
      vacant: all.length === 0
    };
  });
}

// --- Compliance heatmap data (last 4 quarters) ---
function cpdHeatmapData(staff) {
  return staff.map(s => ({
    name: s.name,
    Q1: s.cpdHistory?.[0] ?? 0,
    Q2: s.cpdHistory?.[1] ?? 0,
    Q3: s.cpdHistory?.[2] ?? 0,
    Q4: s.cpdHistory?.[3] ?? 0,
    req: s.cpdReq
  }));
}

// --- AI Copilot, Actions, Log ---
function aiCopilot(staff, log, actOn) {
  const a = microAnalytics(staff);
  let notes = [];
  if (a.overdue) notes.push(`CPD overdue: ${a.overdue} staff—board action needed`);
  if (a.risk) notes.push(`Pipeline at risk: ${a.risk}—plan upskilling`);
  if (a.promo) notes.push(`Promotion pool: ${a.promo} ready—consider advancement`);
  if (!notes.length) notes.push("All staff and volunteer HR indicators stable.");
  return (
    <div className="svhr-copilot-col">
      <span>{notes.join(" | ")}</span>
      <div className="svhr-copilot-actions">
        {ACTIONS.map(act =>
          <button key={act.key} className="svhr-copilot-btn" onClick={()=>actOn(act.key)}>{act.icon} {act.label}</button>
        )}
      </div>
    </div>
  );
}

// --- Export PDF/CSV ---
function exportPDF(staff, log, bench, succ) {
  const doc = new jsPDF("p", "mm", "a4");
  let y = 16;
  doc.setFillColor(35,42,46);
  doc.rect(0,0,210,20,"F");
  doc.setTextColor(255,215,0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("CourtEvo Vero: Staff & Volunteer HR Board Pack", 12, y);
  doc.setFontSize(10);
  doc.text("BE REAL. BE VERO.", 148, y);
  y += 10;
  doc.setTextColor(255,255,255);
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 12, y);
  y += 8;
  doc.setTextColor(35,42,46);
  doc.setFontSize(12);
  doc.text("Succession Grid:", 12, y); y+=6;
  succ.forEach(s => {
    doc.text(`${s.role} | Primary: ${s.primary} | Successor: ${s.successor} | Bench: ${s.bench}`, 12, y); y+=5;
    if (y>260) {doc.addPage(); y=16;}
  });
  y+=2; doc.setFontSize(12);
  doc.text("Bench Strength:", 12, y); y+=6;
  bench.forEach(b => {
    doc.text(`${b.role}: ${b.ready} Ready, ${b.risk} At Risk, Vacant: ${b.vacant ? "YES" : "No"}`, 12, y); y+=5;
    if (y>260) {doc.addPage(); y=16;}
  });
  y+=2; doc.setFontSize(12);
  doc.text("Directory:", 12, y); y+=6;
  staff.forEach(s => {
    doc.setFontSize(11);
    doc.text(`${s.name} (${s.role}, ${s.area}), Email: ${s.email}, Status: ${s.status}, CPD: ${s.cpd}/${s.cpdReq} (${cpdStatus(s).label})`, 12, y); y+=5;
    doc.text(`Competencies: ${COMP_KEYS.map(k => k + " [" + (s.competencies[k]||"—") + "]").join(", ")}`, 12, y); y+=5;
    doc.text(`Pipeline: ${s.pipeline}${s.flag?" (Flagged)":""}`, 12, y); y+=5;
    doc.text(`Log: ${s.log.join(" | ")}`, 12, y); y+=7;
    if (y>260) {doc.addPage(); y=16;}
  });
  y+=2; doc.setFontSize(12);
  doc.text("Board HR Log:", 12, y); y+=6;
  log.slice(0,15).forEach(l => {
    doc.text(`${l.time}: [${l.user}] ${l.action} (${l.target})`, 12, y); y+=5;
    if (y>270) {doc.addPage(); y=16;}
  });
  y+=2; doc.setFontSize(12);
  doc.text("Compliance Summary: Auto-alert if compliance falls below legal/board minimum.", 12, y);
  y+=8;
  doc.setTextColor(120,120,120);
  doc.setFontSize(9);
  doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 12, 287);
  doc.save(`StaffVolunteerHR_CourtEvoVero.pdf`);
}

export default function StaffVolunteerHRDevelopmentSuite() {
  const [staff, setStaff] = useState(INIT_STAFF);
  const [modal, setModal] = useState(null);
  const [logModal, setLogModal] = useState(null);
  const [compModal, setCompModal] = useState(null);
  const [filter, setFilter] = useState({ area: "", role: "", pipeline: "", status: "" });
  const [boardLog, setBoardLog] = useState([]);
  const bench = benchStrength(staff);
  const succession = successionGrid(staff);

  // --- Board Log
  function addLog(action, target, impact = "Standard") {
    setBoardLog(log => [
      { time: new Date().toLocaleString(), user: BOARDUSER, action, target, impact },
      ...log
    ]);
  }

  // --- Actions
  function handleAction(key) {
    if (key === "cpd") {
      addLog("Scheduled CPD Review", "All Staff", "Compliance");
    } else if (key === "promotion") {
      addLog("Nominated Promotion", "Promotion Pool", "Succession");
    } else if (key === "succession") {
      addLog("Planned Succession", "Bench/Succession", "Risk");
    } else if (key === "alert") {
      addLog("Sent Alert", "All At Risk", "Legal/Board");
    }
    alert("Demo: Board action logged.");
  }
  function flagStaff(id) {
    setStaff(staff =>
      staff.map(s => s.id === id ? { ...s, flag: !s.flag } : s)
    );
    const flagged = staff.find(s=>s.id===id);
    addLog("Flagged Staff", flagged ? flagged.name : id, "Immediate");
  }

  // --- Directory Filtering
  let filtered = staff.filter(s => {
    if (filter.area && s.area !== filter.area) return false;
    if (filter.role && s.role !== filter.role) return false;
    if (filter.pipeline && s.pipeline !== filter.pipeline) return false;
    if (filter.status && s.status !== filter.status) return false;
    return true;
  });

  // --- CPD Heatmap Data ---
  const heatmapData = cpdHeatmapData(staff);

  // --- Bench/Pipeline Microdashboard
  const analytics = microAnalytics(staff);

  return (
    <div className="svhr-main">
      <div className="svhr-header">
        <h2>
          <FaUserTie style={{ color: "#FFD700", marginRight: 13 }} />
          Staff & Volunteer HR Development Suite
        </h2>
        <div>
          <button className="svhr-pdf-btn" onClick={() => exportPDF(filtered, boardLog, bench, succession)}>
            <FaDownload /> Export PDF
          </button>
          <button className="svhr-add-btn" onClick={() => setModal({})}>
            <FaUserPlus /> Add Staff
          </button>
        </div>
      </div>

      {/* --- Succession Grid --- */}
      <div className="svhr-succession-grid">
        <div className="svhr-succession-title">Succession Grid & Coverage Gaps</div>
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Primary</th>
              <th>Successor</th>
              <th>Bench</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {succession.map(s => (
              <tr key={s.role}>
                <td>{s.role}</td>
                <td>{s.primary}</td>
                <td>{s.successor}</td>
                <td>{s.bench}</td>
                <td>
                  <span className={`svhr-succession-badge ${
                    s.vacant ? "svhr-red" :
                    s.successor === "-" ? "svhr-yellow" : "svhr-green"
                  }`}>
                    {s.vacant ? "Vacancy" : s.successor === "-" ? "Succession Gap" : "Ready"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Bench/Pipeline Microdashboard --- */}
      <div className="svhr-benchdashboard-row">
        {bench.map(b => (
          <div className="svhr-bench-card" key={b.role}>
            <div className="svhr-bench-title">{b.role}</div>
            <div className="svhr-bench-bar">
              <span className="svhr-green">{b.ready} Ready</span> | <span className="svhr-yellow">{b.risk} Risk</span> | <span className="svhr-red">{b.vacant ? "Vacant" : "Covered"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* --- Compliance Heatmap --- */}
      <div className="svhr-heatmap-card">
        <div className="svhr-heatmap-title"><FaGraduationCap /> CPD/Compliance Heatmap (Last 4 Quarters)</div>
        <div style={{height:120}}>
          <ResponsiveBar
            data={heatmapData}
            keys={["Q1","Q2","Q3","Q4"]}
            indexBy="name"
            margin={{top: 10, right: 18, bottom: 35, left: 80}}
            padding={0.35}
            colors={bar => {
              if (bar.value >= bar.data.req) return "#35b378";
              if (bar.value >= bar.data.req*0.75) return "#FFD700";
              return "#f35650";
            }}
            axisBottom={{
              tickSize: 7,
              legend: "Quarter",
              legendOffset: 26,
              legendPosition: "middle"
            }}
            axisLeft={{
              tickSize: 6,
              legend: "Staff",
              legendOffset: -64,
              legendPosition: "middle"
            }}
            labelSkipWidth={100}
            labelSkipHeight={12}
            labelTextColor="#232a2e"
            enableLabel={true}
            theme={{
              axis: { ticks: { text: { fill: "#FFD700" } } },
              grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
            }}
            height={120}
            isInteractive={false}
          />
        </div>
        <div className="svhr-heatmap-alert">
          <FaExclamationTriangle style={{color:"#f35650",marginRight:5}} />
          {analytics.overdue > 0 && <b>Compliance alert:</b>} {analytics.overdue > 0 ? `${analytics.overdue} staff with overdue CPD.` : "All staff within compliance limits."}
        </div>
      </div>

      {/* --- Microdashboard --- */}
      <div className="svhr-microdashboard-row">
        <div className="svhr-microdashboard-card">
          <div className="svhr-microdashboard-title">CPD Up-to-date</div>
          <div className="svhr-microdashboard-value svhr-green">{analytics.up}</div>
        </div>
        <div className="svhr-microdashboard-card">
          <div className="svhr-microdashboard-title">Expiring Soon</div>
          <div className="svhr-microdashboard-value svhr-yellow">{analytics.soon}</div>
        </div>
        <div className="svhr-microdashboard-card">
          <div className="svhr-microdashboard-title">Overdue</div>
          <div className="svhr-microdashboard-value svhr-red">{analytics.overdue}</div>
        </div>
        <div className="svhr-microdashboard-card">
          <div className="svhr-microdashboard-title">Ready</div>
          <div className="svhr-microdashboard-value">{analytics.ready}</div>
        </div>
        <div className="svhr-microdashboard-card">
          <div className="svhr-microdashboard-title">At Risk</div>
          <div className="svhr-microdashboard-value">{analytics.risk}</div>
        </div>
        <div className="svhr-microdashboard-card">
          <div className="svhr-microdashboard-title">Promotion Pool</div>
          <div className="svhr-microdashboard-value">{analytics.promo}</div>
        </div>
      </div>

      {/* --- AI Copilot --- */}
      <div className="svhr-analytics-card">
        <div className="svhr-analytics-title">
          <FaRobot /> HR Copilot
        </div>
        {aiCopilot(staff, boardLog, handleAction)}
      </div>

      {/* --- Filter Row --- */}
      <div className="svhr-filter-row">
        <select value={filter.area} onChange={e => setFilter(f => ({ ...f, area: e.target.value }))}>
          <option value="">Area</option>
          {[...new Set(staff.map(s => s.area))].map(a => (
            <option value={a} key={a}>{a}</option>
          ))}
        </select>
        <select value={filter.role} onChange={e => setFilter(f => ({ ...f, role: e.target.value }))}>
          <option value="">Role</option>
          {[...new Set(staff.map(s => s.role))].map(r => (
            <option value={r} key={r}>{r}</option>
          ))}
        </select>
        <select value={filter.pipeline} onChange={e => setFilter(f => ({ ...f, pipeline: e.target.value }))}>
          <option value="">Pipeline</option>
          {Object.keys(PIPELINE_BADGE).map(p => (
            <option value={p} key={p}>{PIPELINE_BADGE[p].label}</option>
          ))}
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">Status</option>
          {[...new Set(staff.map(s => s.status))].map(s => (
            <option value={s} key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* --- Directory Grid --- */}
      <div className="svhr-staff-grid">
        {filtered.length === 0 && (
          <div className="svhr-empty">
            <FaExclamationTriangle /> No staff/volunteers found. Adjust filters.
          </div>
        )}
        {filtered.map(staffObj => (
          <div className={`svhr-card${staffObj.flag ? " svhr-flagged" : ""}`} key={staffObj.id}>
            <div className="svhr-card-header">
              <span className="svhr-avatar">{staffObj.avatar}</span>
              <span className="svhr-card-name">{staffObj.name}</span>
              <span className="svhr-card-role">{staffObj.role}</span>
              {pipelineBadge(staffObj.pipeline, staffObj.flag)}
              {cpdBadge(staffObj)}
              <button className="svhr-flag-btn" onClick={()=>flagStaff(staffObj.id)} title="Flag for Board">
                <FaFlag style={{color:staffObj.flag?"#f35650":"#FFD700"}}/>
              </button>
            </div>
            <div className="svhr-card-row"><b>Area:</b> {staffObj.area}</div>
            <div className="svhr-card-row"><b>Email:</b> {staffObj.email}</div>
            <div className="svhr-card-row"><b>Status:</b> {staffObj.status}</div>
            <div className="svhr-card-row"><b>Contract:</b> {staffObj.contract}</div>
            <div className="svhr-card-row"><b>CPD:</b> {staffObj.cpd}/{staffObj.cpdReq} | Exp: {staffObj.cpdExp}</div>
            {/* Competency Matrix */}
            <div className="svhr-comp-matrix">
              {COMP_KEYS.map(k => (
                <span
                  className={`svhr-comp svhr-${staffObj.competencies[k] || "red"}`}
                  key={k}
                  title={k}
                  onClick={()=>setCompModal({staff:staffObj, key:k})}
                  style={{cursor:'pointer'}}
                >
                  {k}
                </span>
              ))}
            </div>
            <div className="svhr-card-log">
              {staffObj.log.slice(-2).map((l,ix) =>
                <div key={ix}>
                  <FaUserClock style={{color:"#FFD700",fontSize:12,marginRight:3}}/>{l}
                </div>
              )}
            </div>
            <div className="svhr-card-actions">
              <button className="svhr-edit-btn" onClick={() => setModal(staffObj)}><FaEdit /> Edit</button>
              <button className="svhr-log-btn" onClick={() => setLogModal(staffObj)}><FaUserClock /> Add Log</button>
            </div>
          </div>
        ))}
      </div>

      {/* --- Modal for Add/Edit --- */}
      {modal && (
        <StaffEditModal
          obj={modal}
          onSave={s => {
            setStaff(list => {
              if (s.id && list.some(x => x.id === s.id)) {
                addLog("Edited Staff", s.name);
                return list.map(x => x.id === s.id ? s : x);
              }
              addLog("Added Staff", s.name);
              return [...list, {...s, id: Math.max(...list.map(y=>y.id),0)+1}];
            });
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}
      {/* --- Modal for Add Log --- */}
      {logModal && (
        <LogAddModal obj={logModal} onSave={(id, logEntry) => {
          setStaff(list => list.map(s => s.id === id ? {...s, log: [...s.log, logEntry]} : s));
          addLog("Added HR Log", (staff.find(x=>x.id===id)||{}).name || id);
          setLogModal(null);
        }} onClose={() => setLogModal(null)} />
      )}
      {/* --- Modal for Competency Detail --- */}
      {compModal && (
        <CompetencyModal modal={compModal} onClose={()=>setCompModal(null)} onAddNote={note=>{
          setStaff(list => list.map(s => s.id === compModal.staff.id ? {...s, log:[...(s.log||[]),note]} : s));
          addLog("Added Competency Note", compModal.staff.name+" - "+compModal.key);
          setCompModal(null);
        }}/>
      )}

      {/* --- Board HR Log --- */}
      <div className="svhr-boardlog-panel">
        <div className="svhr-boardlog-title"><FaUserTie/> Board HR Action Log</div>
        <div className="svhr-boardlog-list">
          {boardLog.length === 0 && <div className="svhr-log-empty">No recent HR/board actions.</div>}
          {boardLog.slice(0, 12).map((entry, i) => (
            <div className="svhr-log-entry" key={i}>
              <span className="svhr-log-time">{entry.time}</span>
              <span className="svhr-log-user">{entry.user}</span>
              <span className="svhr-log-action">{entry.action}</span>
              <span className="svhr-log-title">{entry.target}</span>
              <span className="svhr-log-impact">{entry.impact}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="svhr-tagline">BE REAL. BE VERO.</div>
    </div>
  );
}

// --- Staff Add/Edit Modal ---
function StaffEditModal({ obj, onSave, onClose }) {
  const [state, setState] = useState({
    ...obj,
    name: obj.name || "",
    role: obj.role || "Volunteer",
    area: obj.area || "",
    email: obj.email || "",
    avatar: obj.avatar || <FaUserTie />,
    status: obj.status || "Active",
    contract: obj.contract || "",
    cpd: obj.cpd || 0,
    cpdReq: obj.cpdReq || 10,
    cpdExp: obj.cpdExp || "",
    cpdHistory: obj.cpdHistory || [0,0,0,0],
    competencies: obj.competencies || {
      "Coaching License": "red",
      "First Aid": "red",
      "Youth Dev": "red",
      "Video Analysis": "red"
    },
    pipeline: obj.pipeline || "Ready",
    flag: obj.flag || false,
    log: obj.log || []
  });
  function update(field, val) { setState(s=>({...s, [field]: val})); }
  function updateComp(k, v) { setState(s=>({...s, competencies: {...s.competencies, [k]: v}})); }
  function save() { onSave(state); }
  function updateCPDHist(idx, v) {
    const arr = [...state.cpdHistory];
    arr[idx]=Number(v);
    setState(s=>({...s, cpdHistory:arr}));
  }
  return (
    <div className="svhr-modal-overlay">
      <div className="svhr-modal">
        <div className="svhr-modal-header">
          <FaEdit /> {obj.id ? "Edit Staff" : "Add Staff"}
          <button className="svhr-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="svhr-modal-row">
          <label>Name:</label>
          <input value={state.name} onChange={e=>update("name", e.target.value)}/>
          <label>Role:</label>
          <input value={state.role} onChange={e=>update("role", e.target.value)}/>
        </div>
        <div className="svhr-modal-row">
          <label>Area:</label>
          <input value={state.area} onChange={e=>update("area", e.target.value)}/>
          <label>Email:</label>
          <input value={state.email} onChange={e=>update("email", e.target.value)}/>
        </div>
        <div className="svhr-modal-row">
          <label>Status:</label>
          <select value={state.status} onChange={e=>update("status", e.target.value)}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <label>Contract:</label>
          <input value={state.contract} onChange={e=>update("contract", e.target.value)}/>
        </div>
        <div className="svhr-modal-row">
          <label>CPD:</label>
          <input type="number" value={state.cpd} onChange={e=>update("cpd", Number(e.target.value))}/>
          <label>Required:</label>
          <input type="number" value={state.cpdReq} onChange={e=>update("cpdReq", Number(e.target.value))}/>
          <label>Exp Date:</label>
          <input type="date" value={state.cpdExp} onChange={e=>update("cpdExp", e.target.value)}/>
        </div>
        <div className="svhr-modal-row">
          <label>CPD Last 4Q:</label>
          {[0,1,2,3].map(i=>
            <input key={i} style={{width:39}} value={state.cpdHistory[i]||0} type="number" onChange={e=>updateCPDHist(i,e.target.value)}/>
          )}
        </div>
        <div className="svhr-modal-row">
          <label>Pipeline:</label>
          <select value={state.pipeline} onChange={e=>update("pipeline", e.target.value)}>
            {Object.keys(PIPELINE_BADGE).map(p => <option value={p} key={p}>{PIPELINE_BADGE[p].label}</option>)}
          </select>
          <label>Flagged:</label>
          <input type="checkbox" checked={state.flag||false} onChange={e=>update("flag", e.target.checked)}/>
        </div>
        <div className="svhr-modal-row">
          <label>Competencies:</label>
          {COMP_KEYS.map(k=>
            <select
              key={k}
              value={state.competencies[k]||"red"}
              onChange={e=>updateComp(k, e.target.value)}
              style={{marginRight:12}}
            >
              <option value="green">Green (Ready)</option>
              <option value="yellow">Yellow (In Progress)</option>
              <option value="red">Red (Gap)</option>
            </select>
          )}
        </div>
        <div className="svhr-modal-actions">
          <button className="svhr-pdf-btn" onClick={save}>
            <FaCheckCircle/> Save
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Add Log Modal ---
function LogAddModal({ obj, onSave, onClose }) {
  const [log, setLog] = useState("");
  function submit() {
    if (log.trim()) onSave(obj.id, log);
  }
  return (
    <div className="svhr-modal-overlay">
      <div className="svhr-modal">
        <div className="svhr-modal-header">
          <FaUserClock/> Add Log
          <button className="svhr-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="svhr-modal-row">
          <label>New Log Entry:</label>
          <input value={log} onChange={e=>setLog(e.target.value)}/>
        </div>
        <div className="svhr-modal-actions">
          <button className="svhr-pdf-btn" onClick={submit}>
            <FaCheckCircle/> Save Log
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Competency Drill-Down Modal ---
function CompetencyModal({ modal, onClose, onAddNote }) {
  const staff = modal.staff;
  const key = modal.key;
  const status = staff.competencies[key] || "red";
  const reqs = {
    "Coaching License": "National Coaching License Level 2 required for full compliance.",
    "First Aid": "CPR & Sport First Aid (valid within last 2 years) required.",
    "Youth Dev": "Minimum 1 year coaching youth athletes OR federation course.",
    "Video Analysis": "Club/federation workshop or equivalent certificate."
  };
  return (
    <div className="svhr-modal-overlay">
      <div className="svhr-modal">
        <div className="svhr-modal-header">
          <FaEdit/> {key} – Detail ({staff.name})
          <button className="svhr-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="svhr-modal-row">
          <label>Status:</label>
          <span className={`svhr-comp svhr-${status}`}>{status.toUpperCase()}</span>
        </div>
        <div className="svhr-modal-row">
          <label>Requirement:</label>
          <span>{reqs[key]}</span>
        </div>
        <div className="svhr-modal-row">
          <label>Latest CPD:</label>
          <span>{staff.cpd} hrs / Req: {staff.cpdReq} (Exp: {staff.cpdExp})</span>
        </div>
        <div className="svhr-modal-row">
          <label>Add Board/Coach Note:</label>
          <input type="text" placeholder="E.g. Needs update..." style={{width:220}} onKeyDown={e=>{
            if(e.key==="Enter"&&e.target.value.trim()) {onAddNote(e.target.value);}
          }}/>
        </div>
        <div className="svhr-modal-actions">
          <button className="svhr-pdf-btn" onClick={onClose}>
            <FaCheckCircle/> Close
          </button>
        </div>
      </div>
    </div>
  );
}
