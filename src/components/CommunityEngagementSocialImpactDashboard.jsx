import React, { useState } from "react";
import { FaStar, FaGlobe, FaCalendarAlt, FaHandHoldingHeart, FaUserTie, FaCheckCircle,
     FaExclamationTriangle, FaPlus, FaDownload, FaRobot, FaMapMarkedAlt, FaSitemap, FaUsers, FaEdit } from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import jsPDF from "jspdf";
import "./CommunityEngagementSocialImpactDashboard.css";

// --- MOCK EVENTS/PROJECTS (replace with Excel backend) ---
const INIT_ENGAGEMENTS = [
  {
    id: 1,
    event: "Basketball Clinic: Elementary Schools",
    date: "2024-06-14",
    type: "Clinic",
    reach: 85,
    owner: "Ivan Horvat",
    status: "complete",
    stakeholders: ["Schools", "Families"],
    impact: 4,
    log: ["Completed by Ivan", "Engaged 4 schools"]
  },
  {
    id: 2,
    event: "Charity Fundraiser for Youth Teams",
    date: "2024-06-05",
    type: "Charity",
    reach: 150,
    owner: "Admin",
    status: "complete",
    stakeholders: ["Sponsors", "Media", "Families"],
    impact: 5,
    log: ["Raised 8000 EUR", "Media: SportsTV"]
  },
  {
    id: 3,
    event: "Summer Open Day",
    date: "2024-07-06",
    type: "Open Day",
    reach: 120,
    owner: "Ana Kovač",
    status: "scheduled",
    stakeholders: ["Public", "Schools", "Families"],
    impact: 0,
    log: ["Scheduled for July"]
  },
  {
    id: 4,
    event: "Coaches Workshop: Inclusive Sport",
    date: "2024-07-18",
    type: "Workshop",
    reach: 28,
    owner: "Ana Kovač",
    status: "scheduled",
    stakeholders: ["Coaches"],
    impact: 0,
    log: ["Federation-supported"]
  }
];
const TYPES = ["Clinic", "Charity", "Open Day", "Workshop"];
const STATUSES = {
  scheduled: { label: "Scheduled", color: "#35b378", icon: <FaCalendarAlt /> },
  ongoing: { label: "Ongoing", color: "#FFD700", icon: <FaGlobe /> },
  complete: { label: "Complete", color: "#b7bec9", icon: <FaCheckCircle /> }
};
const STAKEHOLDERS = ["Schools", "Sponsors", "Media", "Families", "Public", "Municipality", "Coaches"];

// --- Status Badge ---
function statusBadge(s) {
  const b = STATUSES[s] || STATUSES.scheduled;
  return <span className="cesi-badge" style={{ background: b.color + "22", color: b.color }}>{b.icon} {b.label}</span>;
}
// --- Impact Stars ---
function impactStars(i) {
  return (
    <span className="cesi-impact-stars">
      {[1,2,3,4,5].map(n=>n<=i
        ? <FaStar key={n} style={{color: "#FFD700", fontSize: 19}}/>
        : <FaStar key={n} style={{color: "#b7bec9", fontSize: 17, opacity:0.41}}/>
      )}
    </span>
  );
}

// --- AI Copilot
function aiCopilot(events, actOn) {
  let notes = [];
  // Stakeholder gaps
  STAKEHOLDERS.forEach(stake => {
    if (!events.some(e => e.stakeholders.includes(stake) && new Date(e.date) > new Date(Date.now() - 1000*60*60*24*60)))
      notes.push(`No engagement with ${stake} in last 2 months`);
  });
  // Event type gaps
  TYPES.forEach(t => {
    if (!events.some(e=>e.type===t && new Date(e.date) > new Date(Date.now() - 1000*60*60*24*60)))
      notes.push(`No ${t} held in last 2 months`);
  });
  // Top impact
  const maxImpact = Math.max(...events.map(e=>e.impact));
  const best = events.filter(e=>e.impact===maxImpact && maxImpact>0);
  if (best.length) notes.push(`Highest impact: "${best[0].event}" (${best[0].type})`);
  if (!notes.length) notes.push("All community/impact KPIs are stable.");
  return (
    <div className="cesi-copilot-col">
      <span>{notes.join(" | ")}</span>
      <div className="cesi-copilot-actions">
        <button className="cesi-copilot-btn" onClick={()=>actOn("open-day")}>Schedule Open Day for Schools</button>
        <button className="cesi-copilot-btn" onClick={()=>actOn("boost-sponsor")}>Boost Sponsor Activation</button>
        <button className="cesi-copilot-btn" onClick={()=>actOn("flag-media")}>Flag Media Action</button>
      </div>
    </div>
  );
}

// --- Analytics: Nivo Bar data
function analyticsByType(events) {
  let byType = TYPES.map(type => ({
    type,
    count: events.filter(e=>e.type===type).length,
    reach: events.filter(e=>e.type===type).reduce((a,b)=>a+b.reach,0),
    impact: events.filter(e=>e.type===type).reduce((a,b)=>a+b.impact,0)
  }));
  return byType;
}

// --- Export PDF
function exportPDF(events, log) {
  const doc = new jsPDF("p", "mm", "a4");
  let y = 16;
  doc.setFillColor(35,42,46);
  doc.rect(0,0,210,20,"F");
  doc.setTextColor(255,215,0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("CourtEvo Vero: Community Engagement & Impact", 12, y);
  doc.setFontSize(10);
  doc.text("BE REAL. BE VERO.", 148, y);
  y += 10;
  doc.setTextColor(255,255,255);
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 12, y);
  y += 10;
  doc.setTextColor(35,42,46);
  doc.setFontSize(12);
  doc.text("Event Tracker:", 12, y); y+=6;
  events.forEach(e => {
    doc.text(`${e.type}: "${e.event}" | ${e.date} | Reach: ${e.reach} | Owner: ${e.owner} | Stakeholders: ${e.stakeholders.join(", ")} | Status: ${e.status} | Impact: ${e.impact}`, 12, y); y+=5;
    if (y>260) {doc.addPage(); y=16;}
  });
  y+=3; doc.setFontSize(12);
  doc.text("Action/History Log:", 12, y); y+=6;
  log.slice(0,16).forEach(l => {
    doc.text(`${l.time}: [${l.user}] ${l.action} (${l.target})`, 12, y); y+=5;
    if (y>270) {doc.addPage(); y=16;}
  });
  y+=8;
  doc.setTextColor(120,120,120);
  doc.setFontSize(9);
  doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 12, 287);
  doc.save(`CommunityEngagement_CourtEvoVero.pdf`);
}

export default function CommunityEngagementSocialImpactDashboard() {
  const [engagements, setEngagements] = useState(INIT_ENGAGEMENTS);
  const [modal, setModal] = useState(null);
  const [log, setLog] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date().toISOString().slice(0,7));
  const [filter, setFilter] = useState({ type: "", status: "", stakeholder: "" });

  // --- Action Log
  function addLog(action, target) {
    setLog(l => [
      { time: new Date().toLocaleString(), user: "Board Admin", action, target },
      ...l
    ]);
  }
  // --- Copilot Actions
  function handleCopilot(key) {
    if (key === "open-day") addLog("AI Suggest", "Schedule Open Day for Schools");
    if (key === "boost-sponsor") addLog("AI Suggest", "Boost Sponsor Activation");
    if (key === "flag-media") addLog("AI Suggest", "Flag Media Action");
    alert("Demo: Copilot action executed");
  }

  // --- Filter logic
  let filtered = engagements.filter(e => {
    if (filter.type && e.type !== filter.type) return false;
    if (filter.status && e.status !== filter.status) return false;
    if (filter.stakeholder && !e.stakeholders.includes(filter.stakeholder)) return false;
    return true;
  });

  // --- Calendar logic
  const daysInMonth = (month) => {
    const [y, m] = month.split("-").map(Number);
    return new Date(y, m, 0).getDate();
  };
  const calendar = [];
  for (let d=1; d<=daysInMonth(calendarMonth); ++d) {
    const date = `${calendarMonth}-${String(d).padStart(2,"0")}`;
    calendar.push({
      date,
      items: engagements.filter(e => e.date === date)
    });
  }

  // --- Stakeholder Mapping
  let mapping = {};
  STAKEHOLDERS.forEach(stake => mapping[stake] = []);
  engagements.forEach(e => e.stakeholders.forEach(t => mapping[t].push(e.type)));

  // --- Analytics data
  const analytics = analyticsByType(engagements);

  return (
    <div className="cesi-main">
      <div className="cesi-header">
        <h2>
          <FaHandHoldingHeart style={{ color: "#FFD700", marginRight: 13 }} />
          Community Engagement & Social Impact Dashboard
        </h2>
        <div>
          <button className="cesi-pdf-btn" onClick={() => exportPDF(filtered, log)}>
            <FaDownload /> Export PDF
          </button>
          <button className="cesi-add-btn" onClick={() => setModal({})}>
            <FaPlus /> Add Event
          </button>
        </div>
      </div>

      {/* --- Analytics --- */}
      <div className="cesi-analytics-bar">
        <div className="cesi-analytics-title"><FaSitemap/> Impact Analytics by Type</div>
        <div style={{height: 140, width: 480}}>
          <ResponsiveBar
            data={analytics}
            keys={["count","reach","impact"]}
            indexBy="type"
            margin={{top: 18, right: 20, bottom: 40, left: 45}}
            padding={0.38}
            colors={["#35b378","#FFD700","#f35650"]}
            axisBottom={{
              tickSize: 7,
              legend: "Event Type",
              legendOffset: 26,
              legendPosition: "middle"
            }}
            axisLeft={{
              tickSize: 6,
              legend: "Count/Reach/Impact",
              legendOffset: -36,
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
            groupMode="grouped"
          />
        </div>
      </div>

      {/* --- AI Copilot --- */}
      <div className="cesi-copilot-card">
        <div className="cesi-copilot-title"><FaRobot/> Engagement Copilot</div>
        {aiCopilot(engagements, handleCopilot)}
      </div>

      {/* --- Filter Row --- */}
      <div className="cesi-filter-row">
        <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}>
          <option value="">Type</option>
          {TYPES.map(t => <option value={t} key={t}>{t}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">Status</option>
          {Object.keys(STATUSES).map(s => <option value={s} key={s}>{STATUSES[s].label}</option>)}
        </select>
        <select value={filter.stakeholder} onChange={e => setFilter(f => ({ ...f, stakeholder: e.target.value }))}>
          <option value="">Stakeholder</option>
          {STAKEHOLDERS.map(s => <option value={s} key={s}>{s}</option>)}
        </select>
      </div>

      {/* --- Engagement Tracker Grid --- */}
      <div className="cesi-tracker-grid">
        <div className="cesi-tracker-row cesi-tracker-header">
          <div>Event</div>
          <div>Date</div>
          <div>Type</div>
          <div>Reach</div>
          <div>Owner</div>
          <div>Status</div>
          <div>Impact</div>
          <div>Stakeholders</div>
        </div>
        {filtered.length === 0 && (
          <div className="cesi-tracker-row cesi-empty">
            <FaExclamationTriangle /> No events found.
          </div>
        )}
        {filtered.map(e => (
          <div className="cesi-tracker-row" key={e.id}>
            <div>{e.event}</div>
            <div>{e.date}</div>
            <div>{e.type}</div>
            <div>{e.reach}</div>
            <div>{e.owner}</div>
            <div>{statusBadge(e.status)}</div>
            <div>{impactStars(e.impact)}</div>
            <div>{e.stakeholders.join(", ")}</div>
          </div>
        ))}
      </div>

      {/* --- Community Calendar --- */}
      <div className="cesi-calendar-card">
        <div className="cesi-calendar-title">
          <FaCalendarAlt/> Community Engagement Calendar
          <input type="month" value={calendarMonth} onChange={e=>setCalendarMonth(e.target.value)} style={{marginLeft:12}}/>
        </div>
        <div className="cesi-calendar-grid">
          {calendar.map(day => (
            <div className="cesi-calendar-day" key={day.date}>
              <div className="cesi-calendar-date">{day.date.slice(-2)}</div>
              {day.items.map(item => (
                <div key={item.id} className={`cesi-calendar-item cesi-status-${item.status}`}>
                  <FaHandHoldingHeart style={{color:"#FFD700",marginRight:2}}/>
                  <span className="cesi-calendar-event">{item.event}</span>
                  {statusBadge(item.status)}
                  {impactStars(item.impact)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* --- Stakeholder Mapping --- */}
      <div className="cesi-mapping-card">
        <div className="cesi-mapping-title">
          <FaMapMarkedAlt/> Stakeholder Mapping
        </div>
        <div className="cesi-mapping-grid">
          {STAKEHOLDERS.map(stake => (
            <div className="cesi-mapping-row" key={stake}>
              <span className="cesi-mapping-stake">{stake}</span>
              {TYPES.map(t => (
                <span key={t} className={`cesi-mapping-cell ${mapping[stake].includes(t) ? "cesi-green" : "cesi-red"}`}>
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="cesi-mapping-alert">
          {STAKEHOLDERS.filter(stake=>TYPES.some(t=>!mapping[stake].includes(t))).length > 0
            ? <><FaExclamationTriangle/> Some stakeholder/event gaps!</>
            : <>All stakeholders fully engaged.</>
          }
        </div>
      </div>

      {/* --- Modal for Add/Edit --- */}
      {modal && (
        <EngagementModal
          obj={modal}
          onSave={obj => {
            setEngagements(list => {
              if (obj.id && list.some(x => x.id === obj.id)) {
                addLog("Edited Event", obj.event);
                return list.map(x => x.id === obj.id ? obj : x);
              }
              addLog("Added Event", obj.event);
              return [...list, {...obj, id: Math.max(...list.map(y=>y.id),0)+1}];
            });
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}

      {/* --- Action Log --- */}
      <div className="cesi-boardlog-panel">
        <div className="cesi-boardlog-title"><FaUserTie/> Action/History Log</div>
        <div className="cesi-boardlog-list">
          {log.length === 0 && <div className="cesi-log-empty">No recent actions.</div>}
          {log.slice(0, 14).map((entry, i) => (
            <div className="cesi-log-entry" key={i}>
              <span className="cesi-log-time">{entry.time}</span>
              <span className="cesi-log-user">{entry.user}</span>
              <span className="cesi-log-action">{entry.action}</span>
              <span className="cesi-log-title">{entry.target}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="cesi-tagline">BE REAL. BE VERO.</div>
    </div>
  );
}

// --- Add/Edit Engagement Modal ---
function EngagementModal({ obj, onSave, onClose }) {
  const [state, setState] = useState({
    ...obj,
    event: obj.event || "",
    date: obj.date || new Date().toISOString().slice(0,10),
    type: obj.type || "Clinic",
    reach: obj.reach || 0,
    owner: obj.owner || "",
    status: obj.status || "scheduled",
    stakeholders: obj.stakeholders || [],
    impact: obj.impact || 0,
    log: obj.log || []
  });
  function update(field, val) { setState(s=>({...s, [field]: val})); }
  function toggleStake(sname) {
    setState(s=>{
      const next = s.stakeholders.includes(sname)
        ? s.stakeholders.filter(x=>x!==sname)
        : [...s.stakeholders,sname];
      return {...s, stakeholders: next};
    });
  }
  function save() { onSave(state); }
  function setImpact(val) { setState(s=>({...s, impact: val})); }
  return (
    <div className="cesi-modal-overlay">
      <div className="cesi-modal">
        <div className="cesi-modal-header">
          <FaEdit /> {obj.id ? "Edit Event" : "Add Event"}
          <button className="cesi-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="cesi-modal-row">
          <label>Event:</label>
          <input value={state.event} onChange={e=>update("event",e.target.value)} style={{width:200}}/>
        </div>
        <div className="cesi-modal-row">
          <label>Date:</label>
          <input type="date" value={state.date} onChange={e=>update("date",e.target.value)}/>
          <label>Type:</label>
          <select value={state.type} onChange={e=>update("type",e.target.value)}>
            {TYPES.map(t=><option value={t} key={t}>{t}</option>)}
          </select>
        </div>
        <div className="cesi-modal-row">
          <label>Reach:</label>
          <input type="number" value={state.reach} onChange={e=>update("reach",Number(e.target.value))}/>
          <label>Owner:</label>
          <input value={state.owner} onChange={e=>update("owner",e.target.value)}/>
        </div>
        <div className="cesi-modal-row">
          <label>Status:</label>
          <select value={state.status} onChange={e=>update("status",e.target.value)}>
            {Object.keys(STATUSES).map(s=><option value={s} key={s}>{STATUSES[s].label}</option>)}
          </select>
          <label>Impact:</label>
          <span>
            {[1,2,3,4,5].map(n=>
              <FaStar key={n} className={n<=state.impact ? "cesi-star-on" : "cesi-star-off"}
                onClick={()=>setImpact(n)}
                style={{cursor:'pointer',fontSize:18,marginLeft:2}}/>
            )}
          </span>
        </div>
        <div className="cesi-modal-row">
          <label>Stakeholders:</label>
          {STAKEHOLDERS.map(sname=>
            <button key={sname}
              className={`cesi-modal-stake-btn${state.stakeholders.includes(sname) ? " cesi-modal-stake-on" : ""}`}
              onClick={()=>toggleStake(sname)}
            >{sname}</button>
          )}
        </div>
        <div className="cesi-modal-actions">
          <button className="cesi-pdf-btn" onClick={save}>
            <FaCheckCircle/> Save
          </button>
        </div>
      </div>
    </div>
  );
}
