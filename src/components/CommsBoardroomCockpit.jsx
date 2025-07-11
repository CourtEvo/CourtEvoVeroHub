import React, { useState } from "react";
import { FaBullhorn, FaExclamationTriangle, FaCheckCircle, FaBell, FaComments, FaClipboardList, FaRobot, FaArrowRight, FaPaperPlane, FaDownload, FaFileCsv, FaCalendarAlt, FaInbox, FaUserShield, FaInfoCircle, FaUsers, FaPlus, FaPaperclip, FaChevronDown } from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import jsPDF from "jspdf";
import "./CommsBoardroomCockpit.css";

// --- Demo Data ---
const INIT_COMMS = [
  {
    id: "C001", date: "2024-06-28", type: "Emergency", channel: "SMS", sender: "Board", group: "All Staff", topic: "GYM CLOSED – POWER OUTAGE",
    status: "urgent", thread: [
      { date: "2024-06-28", by: "Board", text: "SMS sent to all staff (08:12)" }
    ],
    tags: ["urgent", "compliance"],
    timeline: [
      { date: "2024-06-28", type: "sent", label: "SMS sent", color: "#f35650" }
    ]
  },
  {
    id: "C002", date: "2024-06-26", type: "Update", channel: "Email", sender: "Admin", group: "Coaches", topic: "SCHEDULE: SUMMER TRAINING SLOTS",
    status: "sent", thread: [
      { date: "2024-06-26", by: "Admin", text: "Email sent to coaching group." },
      { date: "2024-06-27", by: "Coach Ana", text: "Received, confirming my slot." }
    ],
    tags: ["info"],
    timeline: [
      { date: "2024-06-26", type: "sent", label: "Email sent", color: "#FFD700" },
      { date: "2024-06-27", type: "response", label: "Coach replied", color: "#35b378" }
    ]
  },
  {
    id: "C003", date: "2024-06-23", type: "Board", channel: "Meeting", sender: "President", group: "Exec Board", topic: "QUARTERLY FINANCE REPORT",
    status: "pending", thread: [
      { date: "2024-06-23", by: "President", text: "Agenda set. Awaiting responses." }
    ],
    tags: ["board-level", "finance"],
    timeline: [
      { date: "2024-06-23", type: "scheduled", label: "Board meeting scheduled", color: "#FFD700" }
    ]
  }
];
const STATUS = ["urgent","pending","sent"];
const STATUS_LABEL = {
  urgent: "Urgent",
  pending: "Pending",
  sent: "Sent"
};
const STATUS_COLORS = {
  urgent: "#f35650",
  pending: "#FFD700",
  sent: "#35b378"
};
const TYPE_ICONS = {
  Emergency: <FaExclamationTriangle />,
  Board: <FaUserShield />,
  Update: <FaInfoCircle />,
  Reminder: <FaBell />
};

// --- PDF Export ---
function exportPDF(comms) {
  const doc = new jsPDF("p", "mm", "a4");
  (Array.isArray(comms)?comms:[comms]).forEach((c, i) => {
    let y = 16;
    doc.setFillColor(35,42,46);
    doc.rect(0,0,210,20,"F");
    doc.setTextColor(255,215,0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CourtEvo Vero: Boardroom Comms", 12, y);
    doc.setFontSize(10);
    doc.text("BE REAL. BE VERO.", 148, y);
    y += 12;
    doc.setTextColor(35,42,46);
    doc.setFontSize(13);
    doc.text(`Date: ${c.date} | Type: ${c.type} | Channel: ${c.channel}`, 12, y); y+=8;
    doc.text(`Sender: ${c.sender} | Group: ${c.group}`, 12, y); y+=8;
    doc.text(`Topic: ${c.topic}`, 12, y); y+=8;
    doc.text(`Status: ${c.status}`, 12, y); y+=8;
    if (c.tags && c.tags.length) { doc.setFontSize(10); doc.text(`Tags: ${c.tags.join(", ")}`, 12, y); y+=6;}
    if (c.timeline && c.timeline.length) {
      doc.setFontSize(11); doc.text("Timeline/Events:", 12, y); y+=6;
      c.timeline.forEach(e=>{ doc.text(`${e.date}: ${e.label}`, 14, y); y+=5; });
    }
    y+=2; doc.setFontSize(12); doc.text("Thread:", 12, y); y+=6;
    (c.thread||[]).forEach(n=>{ doc.setFontSize(10); doc.text(`${n.date} (${n.by}): ${n.text}`, 12, y); y+=5; });
    y+=4;
    doc.setTextColor(120,120,120);
    doc.setFontSize(9);
    doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 12, 287);
    if (i<comms.length-1) doc.addPage();
  });
  doc.save("Comms_Boardroom.pdf");
}
// --- Analytics ---
function statusAnalytics(comms) {
  const bins = { sent:0, urgent:0, pending:0 };
  comms.forEach(c=>{bins[c.status]=1+(bins[c.status]||0);});
  return Object.keys(bins).map(k=>({status:k,count:bins[k]}));
}
function weekTrend(comms) {
  const weeks = {};
  comms.forEach(c=>{
    const w = c.date.slice(0,7);
    weeks[w]=(weeks[w]||0)+1;
  });
  return Object.keys(weeks).map(k=>({week:k,count:weeks[k]}));
}
// --- AI Copilot (always present, sticky) ---
function aiCopilot(comms) {
  const overdue = comms.filter(c=>c.status==="urgent");
  const pending = comms.filter(c=>c.status==="pending");
  let notes = [];
  if (overdue.length) notes.push(`${overdue.length} URGENT.`);
  if (pending.length) notes.push(`${pending.length} pending responses.`);
  if (!notes.length) notes.push("All comms handled.");
  return (
    <div className="cbc-ai-widget">
      <FaRobot style={{color:"#FFD700",marginRight:7}}/>
      {notes.join(" | ")}
    </div>
  );
}

export default function CommsBoardroomCockpit() {
  const [comms, setComms] = useState(INIT_COMMS);
  const [drill, setDrill] = useState(null);
  const [response, setResponse] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // --- Boardroom Stats (Top Block) ---
  const kpi = {
    total: comms.length,
    urgent: comms.filter(c=>c.status==="urgent").length,
    lastUrgent: comms.find(c=>c.status==="urgent"),
    past7: comms.filter(c=>{
      const d = new Date(c.date);
      const now = new Date();
      return (now-d)/(1000*60*60*24) <= 7;
    }).length
  };

  // --- Swimlane Kanban ---
  const lanes = STATUS.map(status=>({
    status,
    items: comms.filter(c=>(filter==="all"||c.group===filter) && c.status===status && (search===""||c.topic.toLowerCase().includes(search.toLowerCase())))
  }));

  // --- No sidebar: Group select at top, then only cards/panels ---
  return (
    <div className="cbc-exec-root">
      {/* EXEC SUMMARY / TOP KPI BAR */}
      <div className="cbc-exec-kpi-row">
        <div className="cbc-exec-kpi-block">
          <div className="cbc-exec-kpi-label"><FaClipboardList/> Total</div>
          <div className="cbc-exec-kpi-value">{kpi.total}</div>
        </div>
        <div className="cbc-exec-kpi-block cbc-exec-kpi-urgent">
          <div className="cbc-exec-kpi-label"><FaExclamationTriangle/> Urgent</div>
          <div className="cbc-exec-kpi-value">{kpi.urgent}</div>
        </div>
        <div className="cbc-exec-kpi-block">
          <div className="cbc-exec-kpi-label"><FaCalendarAlt/> Last Urgent</div>
          <div className="cbc-exec-kpi-value">
            {kpi.lastUrgent ? `${kpi.lastUrgent.date}` : "-"}
          </div>
        </div>
        <div className="cbc-exec-kpi-block">
          <div className="cbc-exec-kpi-label"><FaBullhorn/> 7d Activity</div>
          <div className="cbc-exec-kpi-value">{kpi.past7}</div>
        </div>
        <div className="cbc-exec-kpi-actions">
          <button className="cbc-exec-action-btn" onClick={()=>exportPDF(comms)}><FaDownload/> PDF</button>
        </div>
      </div>
      {/* GROUP FILTER/SEARCH */}
      <div className="cbc-exec-filter-row">
        <select value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">All Groups</option>
          {[...new Set(comms.map(c=>c.group))].map(g=>
            <option value={g} key={g}>{g}</option>
          )}
        </select>
        <input
          type="text"
          className="cbc-exec-search"
          placeholder="Search topic..."
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
        {aiCopilot(comms)}
      </div>
      {/* SWIMLANES */}
      <div className="cbc-swimlanes-row">
        {lanes.map(lane=>(
          <div className={`cbc-swimlane cbc-swimlane-${lane.status}`} key={lane.status}>
            <div className="cbc-swimlane-header">
              <span style={{color:STATUS_COLORS[lane.status], fontWeight:900, fontSize:'1.11rem'}}>{STATUS_LABEL[lane.status]}</span>
            </div>
            {lane.items.length === 0 && (
              <div className="cbc-swimlane-empty">No {STATUS_LABEL[lane.status]} comms.</div>
            )}
            {lane.items.map(c=>(
              <div className={`cbc-commcard cbc-commcard-${c.status}`} key={c.id} onClick={()=>setDrill({c})}>
                <div className="cbc-commcard-type">{TYPE_ICONS[c.type]||<FaBell/>} {c.type}</div>
                <div className="cbc-commcard-topic">{c.topic}</div>
                <div className="cbc-commcard-meta">
                  <span><FaUsers/> {c.group}</span>
                  <span><FaCalendarAlt/> {c.date}</span>
                  <span className="cbc-commcard-status" style={{color:STATUS_COLORS[c.status]}}>{c.status.toUpperCase()}</span>
                  {c.tags && c.tags.map(tag=>
                    <span className="cbc-commcard-tag">{tag}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* --- Drilldown Modal --- */}
      {drill && (
        <div className="cbc-modal-overlay">
          <div className="cbc-modal">
            <div className="cbc-modal-header">
              <FaBullhorn/> {drill.c.topic}
              <button className="cbc-modal-close" onClick={()=>setDrill(null)}>×</button>
            </div>
            <div className="cbc-modal-status-row">
              <span className="cbc-modal-type">{TYPE_ICONS[drill.c.type]||<FaBell/>} {drill.c.type}</span>
              <span className="cbc-modal-channel">{drill.c.channel}</span>
              <span className="cbc-modal-group"><FaUsers/> {drill.c.group}</span>
              <span className="cbc-modal-status" style={{color:STATUS_COLORS[drill.c.status]}}>{drill.c.status.toUpperCase()}</span>
            </div>
            <div className="cbc-modal-timeline-title"><FaClipboardList/> Timeline</div>
            <div className="cbc-modal-timeline">
              {(drill.c.timeline||[]).map((e,i)=>
                <div className="cbc-modal-timeline-row" key={i} style={{borderLeft:`6px solid ${e.color}`}}>
                  <span className="cbc-modal-timeline-date">{e.date}</span>
                  <span className="cbc-modal-timeline-label">{e.label}</span>
                </div>
              )}
              {(!drill.c.timeline||!drill.c.timeline.length) && (
                <div className="cbc-modal-timeline-row" style={{borderLeft:"6px solid #b7bec9"}}>
                  <span className="cbc-modal-timeline-label" style={{color:"#b7bec9"}}>No timeline entries yet.</span>
                </div>
              )}
            </div>
            <div className="cbc-modal-thread-title"><FaComments/> Thread / Responses</div>
            <div className="cbc-modal-thread">
              {(drill.c.thread||[]).map((n,i)=>
                <div className="cbc-modal-note" key={i}>
                  <span className="cbc-modal-note-date">{n.date}</span>
                  <span className="cbc-modal-note-user">{n.by}</span>
                  <span className="cbc-modal-note-text">{n.text}</span>
                </div>
              )}
            </div>
            <div style={{marginTop:8, display:'flex', alignItems:'center', gap:10}}>
              <input type="text" value={response} onChange={e=>setResponse(e.target.value)} placeholder="Add response/action..."/>
              <button className="cbc-addnote-btn" onClick={()=>{
                if (!response.trim()) return;
                setComms(list=>{
                  const next = [...list];
                  const idx = list.findIndex(x=>x.id===drill.c.id);
                  next[idx].thread.push({
                    date: new Date().toISOString().slice(0,10),
                    by: "Board/Admin",
                    text: response
                  });
                  return next;
                });
                setResponse("");
              }}><FaPlus/> Add</button>
            </div>
            <div className="cbc-modal-tags-row">
              {(drill.c.tags||[]).map((tag,i)=>
                <span className="cbc-modal-tag">{tag}</span>
              )}
            </div>
            <div className="cbc-modal-copilot">
              <FaRobot style={{color:"#FFD700",marginRight:8}}/>
              {drill.c.status==="urgent"
                ? "Urgent—follow up immediately."
                : drill.c.status==="pending"
                  ? "Awaiting responses—consider reminder."
                  : "Communication handled."}
            </div>
            <div className="cbc-tagline cbc-tagline-sticky">BE REAL. BE VERO.</div>
          </div>
        </div>
      )}
      <div className="cbc-tagline">BE REAL. BE VERO.</div>
    </div>
  );
}
