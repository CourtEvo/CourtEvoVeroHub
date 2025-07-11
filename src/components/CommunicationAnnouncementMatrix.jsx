import React, { useState } from "react";
import { FaBullhorn, FaEnvelope, FaComments, FaUserTie, FaCheckCircle, FaExclamationTriangle, FaPaperPlane, FaCalendarAlt, FaEdit, FaPlus, FaCopy, FaDownload, FaRobot, FaBuilding } from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import jsPDF from "jspdf";
import "./CommunicationAnnouncementMatrix.css";

// --- ORGS, CHANNELS, AUDIENCES ---
const ORGS = ["Demo Club", "Demo Academy", "Demo Federation"];
const CHANNELS = [
  { key: "email", label: "Email", icon: <FaEnvelope /> },
  { key: "whatsapp", label: "WhatsApp", icon: <FaComments /> },
  { key: "newsletter", label: "Newsletter", icon: <FaBullhorn /> },
  { key: "meeting", label: "Meeting", icon: <FaUserTie /> }
];
const AUDIENCES = ["Players", "Parents", "Coaches", "Board", "Partners"];
const STATUS = {
  scheduled: { label: "Scheduled", color: "#35b378", icon: <FaCheckCircle /> },
  sent: { label: "Sent", color: "#FFD700", icon: <FaPaperPlane /> },
  overdue: { label: "Overdue", color: "#f35650", icon: <FaExclamationTriangle /> },
  urgent: { label: "Urgent", color: "#f2a900", icon: <FaExclamationTriangle /> }
};

// --- MOCK DATA (extend for real backend) ---
const INIT_ANNOUNCEMENTS = [
  {
    id: 1,
    org: "Demo Club",
    channel: "email",
    message: "Training moved to 19:00 next Friday",
    target: ["Players", "Coaches"],
    owner: "Petar Kovač",
    date: "2024-06-28",
    status: "scheduled",
    compliance: "ok",
    impact: 3,
    log: ["Scheduled by Petar"]
  },
  {
    id: 2,
    org: "Demo Academy",
    channel: "newsletter",
    message: "Summer camp registration open",
    target: ["Parents", "Players"],
    owner: "Admin",
    date: "2024-07-01",
    status: "sent",
    compliance: "ok",
    impact: 4,
    log: ["Sent by Admin"]
  },
  {
    id: 3,
    org: "Demo Club",
    channel: "meeting",
    message: "Board review meeting",
    target: ["Board"],
    owner: "GM",
    date: "2024-06-25",
    status: "urgent",
    compliance: "flag",
    impact: 5,
    log: ["Marked urgent by GM"]
  },
  {
    id: 4,
    org: "Demo Federation",
    channel: "email",
    message: "Season start rules update",
    target: ["Coaches", "Board"],
    owner: "Federation Admin",
    date: "2024-06-20",
    status: "sent",
    compliance: "ok",
    impact: 5,
    log: ["Sent by Fed Admin"]
  }
];

// --- Planner Badge ---
function statusBadge(s) {
  const b = STATUS[s] || STATUS["scheduled"];
  return <span className="cam-badge" style={{ background: b.color + "22", color: b.color }}>{b.icon} {b.label}</span>;
}

// --- AI Copilot: Gaps, duplicates, at-risk, per org
function aiCopilot(ann, org, actOn) {
  let notes = [];
  AUDIENCES.forEach(aud => {
    const last = ann.filter(a => a.org === org && a.target.includes(aud)).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (!last || new Date(last.date) < new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)) {
      notes.push(`No update to ${aud} in last 2 weeks (${org})`);
    }
  });
  ann.filter(a => a.org === org).forEach(a => {
    if (ann.filter(x => x.org === org && x.date === a.date && x.message === a.message && x.id !== a.id).length) {
      notes.push(`Duplicate "${a.message}" on ${a.date} in ${org}`);
    }
  });
  if (!notes.length) notes.push(`All audiences in ${org} are covered.`);
  return (
    <div className="cam-copilot-col">
      <span>{notes.join(" | ")}</span>
      <div className="cam-copilot-actions">
        <button className="cam-copilot-btn" onClick={() => actOn("remind", org)}>Send Reminder</button>
        <button className="cam-copilot-btn" onClick={() => actOn("bulk", org)}>Bulk Schedule</button>
        <button className="cam-copilot-btn" onClick={() => actOn("flag", org)}>Flag Urgent</button>
      </div>
    </div>
  );
}

// --- Compliance Analytics: % by org/channel
function analyticsData(ann, org) {
  const sent = ann.filter(a => a.org === org && a.status === "sent").length;
  const overdue = ann.filter(a => a.org === org && a.status === "overdue").length;
  const scheduled = ann.filter(a => a.org === org && a.status === "scheduled").length;
  const urgent = ann.filter(a => a.org === org && a.status === "urgent").length;
  return [
    { type: "Sent", value: sent },
    { type: "Scheduled", value: scheduled },
    { type: "Overdue", value: overdue },
    { type: "Urgent", value: urgent }
  ];
}

// --- PDF Export (planner, calendar, mapping, log, analytics, org)
function exportPDF(ann, log, org) {
  const doc = new jsPDF("p", "mm", "a4");
  let y = 16;
  doc.setFillColor(35,42,46);
  doc.rect(0,0,210,20,"F");
  doc.setTextColor(255,215,0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`CourtEvo Vero: Communication Matrix – ${org}`, 12, y);
  doc.setFontSize(10);
  doc.text("BE REAL. BE VERO.", 148, y);
  y += 10;
  doc.setTextColor(255,255,255);
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 12, y);
  y += 10;
  doc.setTextColor(35,42,46);
  doc.setFontSize(12);
  doc.text("Planner:", 12, y); y+=6;
  ann.filter(a=>a.org===org).forEach(a => {
    doc.text(`${CHANNELS.find(c=>c.key===a.channel)?.label}: "${a.message}" | To: ${a.target.join(", ")} | ${a.owner} | ${a.date} | Status: ${a.status}`, 12, y); y+=5;
    if (y>260) {doc.addPage(); y=16;}
  });
  y+=3; doc.setFontSize(12);
  doc.text("Action/History Log:", 12, y); y+=6;
  log.filter(l=>l.org===org).slice(0,16).forEach(l => {
    doc.text(`${l.time}: [${l.user}] ${l.action} (${l.target})`, 12, y); y+=5;
    if (y>270) {doc.addPage(); y=16;}
  });
  y+=8;
  doc.setTextColor(120,120,120);
  doc.setFontSize(9);
  doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 12, 287);
  doc.save(`CommMatrix_${org}_CourtEvoVero.pdf`);
}

// --- Bulk Schedule Modal ---
function BulkScheduleModal({ org, onSave, onClose }) {
  const [selected, setSelected] = useState({
    channel: "email", message: "", audience: [], owner: "", date: new Date().toISOString().slice(0,10), status: "scheduled"
  });
  function update(field, val) { setSelected(s=>({...s,[field]:val})); }
  function toggleAudience(aud) {
    setSelected(s=>{
      const next = s.audience.includes(aud)
        ? s.audience.filter(x=>x!==aud)
        : [...s.audience,aud];
      return {...s, audience: next};
    });
  }
  function save() { onSave(selected); }
  return (
    <div className="cam-modal-overlay">
      <div className="cam-modal">
        <div className="cam-modal-header">
          <FaPlus /> Bulk Schedule for {org}
          <button className="cam-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="cam-modal-row">
          <label>Channel:</label>
          <select value={selected.channel} onChange={e=>update("channel",e.target.value)}>
            {CHANNELS.map(c=><option value={c.key} key={c.key}>{c.label}</option>)}
          </select>
          <label>Status:</label>
          <select value={selected.status} onChange={e=>update("status",e.target.value)}>
            {Object.keys(STATUS).map(s=><option value={s} key={s}>{STATUS[s].label}</option>)}
          </select>
        </div>
        <div className="cam-modal-row">
          <label>Message:</label>
          <input value={selected.message} onChange={e=>update("message",e.target.value)} style={{width:220}}/>
        </div>
        <div className="cam-modal-row">
          <label>Audience:</label>
          {AUDIENCES.map(aud=>
            <button key={aud}
              className={`cam-modal-aud-btn${selected.audience.includes(aud) ? " cam-modal-aud-on" : ""}`}
              onClick={()=>toggleAudience(aud)}
            >{aud}</button>
          )}
        </div>
        <div className="cam-modal-row">
          <label>Owner:</label>
          <input value={selected.owner} onChange={e=>update("owner",e.target.value)}/>
          <label>Date:</label>
          <input type="date" value={selected.date} onChange={e=>update("date",e.target.value)}/>
        </div>
        <div className="cam-modal-actions">
          <button className="cam-pdf-btn" onClick={save}>
            <FaCheckCircle/> Schedule to {org}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Drilldown Modal (view, edit, export, log) ---
function DrilldownModal({ obj, onEdit, onExport, onClose }) {
  return (
    <div className="cam-modal-overlay">
      <div className="cam-modal">
        <div className="cam-modal-header">
          <FaBullhorn /> Announcement Detail
          <button className="cam-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="cam-modal-row"><b>Org:</b> {obj.org}</div>
        <div className="cam-modal-row"><b>Channel:</b> {CHANNELS.find(c=>c.key===obj.channel)?.label}</div>
        <div className="cam-modal-row"><b>Message:</b> {obj.message}</div>
        <div className="cam-modal-row"><b>Audience:</b> {obj.target.join(", ")}</div>
        <div className="cam-modal-row"><b>Owner:</b> {obj.owner}</div>
        <div className="cam-modal-row"><b>Date:</b> {obj.date}</div>
        <div className="cam-modal-row"><b>Status:</b> {statusBadge(obj.status)}</div>
        <div className="cam-modal-row"><b>Log:</b> {obj.log && obj.log.join(" | ")}</div>
        <div className="cam-modal-actions">
          <button className="cam-edit-btn" onClick={()=>onEdit(obj)}><FaEdit/> Edit</button>
          <button className="cam-pdf-btn" onClick={()=>onExport(obj)}><FaDownload/> Export This</button>
        </div>
      </div>
    </div>
  );
}

// --- Add/Edit Announcement Modal ---
function AnnouncementModal({ obj, org, onSave, onClose }) {
  const [state, setState] = useState({
    ...obj,
    org: obj.org || org,
    channel: obj.channel || "email",
    message: obj.message || "",
    target: obj.target || [],
    owner: obj.owner || "",
    date: obj.date || new Date().toISOString().slice(0,10),
    status: obj.status || "scheduled",
    log: obj.log || []
  });
  function update(field, val) { setState(s=>({...s, [field]: val})); }
  function toggleAudience(aud) {
    setState(s=>{
      const next = s.target.includes(aud)
        ? s.target.filter(x=>x!==aud)
        : [...s.target,aud];
      return {...s, target: next};
    });
  }
  function save() { onSave(state); }
  return (
    <div className="cam-modal-overlay">
      <div className="cam-modal">
        <div className="cam-modal-header">
          <FaEdit /> {obj.id ? "Edit Announcement" : "Add Announcement"}
          <button className="cam-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="cam-modal-row">
          <label>Org:</label>
          <select value={state.org} onChange={e=>update("org",e.target.value)}>
            {ORGS.map(o=><option value={o} key={o}>{o}</option>)}
          </select>
          <label>Channel:</label>
          <select value={state.channel} onChange={e=>update("channel",e.target.value)}>
            {CHANNELS.map(c=><option value={c.key} key={c.key}>{c.label}</option>)}
          </select>
          <label>Status:</label>
          <select value={state.status} onChange={e=>update("status",e.target.value)}>
            {Object.keys(STATUS).map(s=><option value={s} key={s}>{STATUS[s].label}</option>)}
          </select>
        </div>
        <div className="cam-modal-row">
          <label>Message:</label>
          <input value={state.message} onChange={e=>update("message",e.target.value)} style={{width:220}}/>
        </div>
        <div className="cam-modal-row">
          <label>Target:</label>
          {AUDIENCES.map(aud=>
            <button key={aud}
              className={`cam-modal-aud-btn${state.target.includes(aud) ? " cam-modal-aud-on" : ""}`}
              onClick={()=>toggleAudience(aud)}
            >{aud}</button>
          )}
        </div>
        <div className="cam-modal-row">
          <label>Owner:</label>
          <input value={state.owner} onChange={e=>update("owner",e.target.value)}/>
          <label>Date:</label>
          <input type="date" value={state.date} onChange={e=>update("date",e.target.value)}/>
        </div>
        <div className="cam-modal-actions">
          <button className="cam-pdf-btn" onClick={save}>
            <FaCheckCircle/> Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CommunicationAnnouncementMatrix() {
  const [org, setOrg] = useState(ORGS[0]);
  const [announcements, setAnnouncements] = useState(INIT_ANNOUNCEMENTS);
  const [modal, setModal] = useState(null);
  const [bulkModal, setBulkModal] = useState(null);
  const [drilldown, setDrilldown] = useState(null);
  const [log, setLog] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date().toISOString().slice(0,7));
  const [filter, setFilter] = useState({ channel: "", audience: "", status: "" });

  // --- Board Log
  function addLog(action, target, orgKey="") {
    setLog(l => [
      { time: new Date().toLocaleString(), user: "Board Admin", action, target, org: orgKey||org },
      ...l
    ]);
  }

  // --- Copilot/Bulk Actions
  function handleCopilot(key, orgName) {
    if (key === "remind") addLog("Sent Reminder", "All", orgName);
    if (key === "bulk") setBulkModal(orgName);
    if (key === "flag") addLog("Flagged for Board", "Board", orgName);
    alert("Demo: Copilot action executed");
  }

  // --- Filter per org
  let filtered = announcements.filter(a => a.org === org)
    .filter(a => {
      if (filter.channel && a.channel !== filter.channel) return false;
      if (filter.audience && !a.target.includes(filter.audience)) return false;
      if (filter.status && a.status !== filter.status) return false;
      return true;
    });

  // --- Announcement Calendar Logic (per org)
  const daysInMonth = (month) => {
    const [y, m] = month.split("-").map(Number);
    return new Date(y, m, 0).getDate();
  };
  const calendar = [];
  for (let d=1; d<=daysInMonth(calendarMonth); ++d) {
    const date = `${calendarMonth}-${String(d).padStart(2,"0")}`;
    calendar.push({
      date,
      items: announcements.filter(a => a.org === org && a.date === date)
    });
  }

  // --- Group Mapping (per org)
  let mapping = {};
  AUDIENCES.forEach(aud => mapping[aud] = []);
  announcements.filter(a=>a.org===org).forEach(a => a.target.forEach(t => mapping[t].push(a.channel)));

  // --- Analytics Bar (per org)
  const analytics = analyticsData(announcements, org);

  return (
    <div className="cam-main">
      <div className="cam-header">
        <h2>
          <FaBullhorn style={{ color: "#FFD700", marginRight: 13 }} />
          Communication & Announcement Matrix
        </h2>
        <div>
          <select value={org} onChange={e=>setOrg(e.target.value)} className="cam-org-select">
            {ORGS.map(o=><option value={o} key={o}>{o}</option>)}
          </select>
          <button className="cam-pdf-btn" onClick={() => exportPDF(announcements, log, org)}>
            <FaDownload /> Export PDF
          </button>
          <button className="cam-add-btn" onClick={() => setModal({ org })}>
            <FaPlus /> Add Announcement
          </button>
        </div>
      </div>

      {/* --- Analytics Bar --- */}
      <div className="cam-analytics-bar">
        <div className="cam-analytics-title"><FaBuilding/> Compliance & Impact Analytics</div>
        <div style={{height: 140, width: 390}}>
          <ResponsiveBar
            data={analytics}
            keys={["value"]}
            indexBy="type"
            margin={{top: 18, right: 20, bottom: 40, left: 45}}
            padding={0.38}
            colors={({index})=>["#35b378","#FFD700","#f35650","#f2a900"][index]}
            axisBottom={{
              tickSize: 7,
              legend: "Status",
              legendOffset: 26,
              legendPosition: "middle"
            }}
            axisLeft={{
              tickSize: 6,
              legend: "Count",
              legendOffset: -26,
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
      </div>

      {/* --- AI Copilot --- */}
      <div className="cam-copilot-card">
        <div className="cam-copilot-title"><FaRobot/> Communication Copilot – {org}</div>
        {aiCopilot(announcements, org, handleCopilot)}
      </div>

      {/* --- Filter Row --- */}
      <div className="cam-filter-row">
        <select value={filter.channel} onChange={e => setFilter(f => ({ ...f, channel: e.target.value }))}>
          <option value="">Channel</option>
          {CHANNELS.map(c => <option value={c.key} key={c.key}>{c.label}</option>)}
        </select>
        <select value={filter.audience} onChange={e => setFilter(f => ({ ...f, audience: e.target.value }))}>
          <option value="">Audience</option>
          {AUDIENCES.map(a => <option value={a} key={a}>{a}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">Status</option>
          {Object.keys(STATUS).map(s => <option value={s} key={s}>{STATUS[s].label}</option>)}
        </select>
        <button className="cam-add-btn" style={{marginLeft: 14}} onClick={()=>setBulkModal(org)}>
          <FaPlus/> Bulk Schedule
        </button>
      </div>

      {/* --- Planner Grid --- */}
      <div className="cam-planner-grid">
        <div className="cam-planner-row cam-planner-header">
          <div>Channel</div>
          <div>Message</div>
          <div>Audience</div>
          <div>Owner</div>
          <div>Date</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {filtered.length === 0 && (
          <div className="cam-planner-row cam-empty">
            <FaExclamationTriangle /> No communications found.
          </div>
        )}
        {filtered.map(a => (
          <div className="cam-planner-row" key={a.id}>
            <div>{CHANNELS.find(c=>c.key===a.channel)?.icon} {CHANNELS.find(c=>c.key===a.channel)?.label}</div>
            <div className="cam-planner-msg" onClick={()=>setDrilldown(a)} style={{cursor:'pointer', textDecoration:'underline'}}>{a.message}</div>
            <div>{a.target.join(", ")}</div>
            <div>{a.owner}</div>
            <div>{a.date}</div>
            <div>{statusBadge(a.status)}</div>
            <div>
              <button className="cam-edit-btn" onClick={()=>setModal(a)} title="Edit"><FaEdit/></button>
              <button className="cam-dup-btn" onClick={()=>{
                setModal({...a, id:null, date:"", status:"scheduled"});
                addLog("Duplicated Announcement", a.message, org);
              }} title="Duplicate"><FaCopy/></button>
            </div>
          </div>
        ))}
      </div>

      {/* --- Announcement Calendar --- */}
      <div className="cam-calendar-card">
        <div className="cam-calendar-title">
          <FaCalendarAlt/> Announcement Calendar
          <input type="month" value={calendarMonth} onChange={e=>setCalendarMonth(e.target.value)} style={{marginLeft:12}}/>
        </div>
        <div className="cam-calendar-grid">
          {calendar.map(day => (
            <div className="cam-calendar-day" key={day.date}>
              <div className="cam-calendar-date">{day.date.slice(-2)}</div>
              {day.items.map(item => (
                <div key={item.id} className={`cam-calendar-item cam-status-${item.status}`} onClick={()=>setDrilldown(item)} style={{cursor:'pointer'}}>
                  {CHANNELS.find(c=>c.key===item.channel)?.icon}
                  <span className="cam-calendar-msg">{item.message}</span>
                  {statusBadge(item.status)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* --- Group Mapping --- */}
      <div className="cam-mapping-card">
        <div className="cam-mapping-title">
          <FaComments/> Target Group Mapping
        </div>
        <div className="cam-mapping-grid">
          {AUDIENCES.map(aud => (
            <div className="cam-mapping-row" key={aud}>
              <span className="cam-mapping-aud">{aud}</span>
              {CHANNELS.map(c => (
                <span key={c.key} className={`cam-mapping-cell ${mapping[aud].includes(c.key) ? "cam-green" : "cam-red"}`}>
                  {c.icon}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="cam-mapping-alert">
          {AUDIENCES.filter(aud=>CHANNELS.some(c=>!mapping[aud].includes(c.key))).length > 0
            ? <><FaExclamationTriangle/> Some audiences have channel gaps!</>
            : <>All audiences fully covered.</>
          }
        </div>
      </div>

      {/* --- Modal for Add/Edit --- */}
      {modal && (
        <AnnouncementModal
          obj={modal}
          org={org}
          onSave={obj => {
            setAnnouncements(list => {
              if (obj.id && list.some(x => x.id === obj.id)) {
                addLog("Edited Announcement", obj.message, obj.org);
                return list.map(x => x.id === obj.id ? obj : x);
              }
              addLog("Added Announcement", obj.message, obj.org);
              return [...list, {...obj, id: Math.max(...list.map(y=>y.id),0)+1}];
            });
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}

      {/* --- Modal for Bulk Schedule --- */}
      {bulkModal && (
        <BulkScheduleModal
          org={bulkModal}
          onSave={vals => {
            setAnnouncements(list =>
              [...list, {
                id: Math.max(...list.map(y=>y.id),0)+1,
                org: bulkModal,
                channel: vals.channel,
                message: vals.message,
                target: vals.audience,
                owner: vals.owner,
                date: vals.date,
                status: vals.status,
                log: [`Bulk scheduled for ${bulkModal}`]
              }]
            );
            addLog("Bulk Scheduled", vals.message, bulkModal);
            setBulkModal(null);
          }}
          onClose={() => setBulkModal(null)}
        />
      )}

      {/* --- Drilldown Modal --- */}
      {drilldown && (
        <DrilldownModal
          obj={drilldown}
          onEdit={a=>{setModal(a); setDrilldown(null);}}
          onExport={a=>exportPDF([a],log,a.org)}
          onClose={()=>setDrilldown(null)}
        />
      )}

      {/* --- Action Log --- */}
      <div className="cam-boardlog-panel">
        <div className="cam-boardlog-title"><FaUserTie/> Action/History Log ({org})</div>
        <div className="cam-boardlog-list">
          {log.filter(l=>l.org===org).length === 0 && <div className="cam-log-empty">No recent comms actions.</div>}
          {log.filter(l=>l.org===org).slice(0, 14).map((entry, i) => (
            <div className="cam-log-entry" key={i}>
              <span className="cam-log-time">{entry.time}</span>
              <span className="cam-log-user">{entry.user}</span>
              <span className="cam-log-action">{entry.action}</span>
              <span className="cam-log-title">{entry.target}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cam-tagline">BE REAL. BE VERO.</div>
    </div>
  );
}
