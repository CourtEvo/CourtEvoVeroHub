import React, { useState } from "react";
import { FaDumbbell, FaBasketballBall, FaHeartbeat, FaClipboardList, FaPlus, FaCalendarWeek, FaUserTie, FaEdit, FaTrash, FaFileCsv, FaDownload, FaRobot, FaChevronDown, FaChevronUp, FaSyncAlt, FaExclamationTriangle } from "react-icons/fa";
import { ResponsiveBar } from "@nivo/bar";
import jsPDF from "jspdf";
import "./TrainingMicrocycleBuilder.css";

const SESSION_TYPES = [
  { key: "tech", label: "Technical", color: "#FFD700", icon: <FaBasketballBall/> },
  { key: "tact", label: "Tactical", color: "#35b378", icon: <FaClipboardList/> },
  { key: "sc", label: "S&C", color: "#1de682", icon: <FaDumbbell/> },
  { key: "rec", label: "Recovery", color: "#b7bec9", icon: <FaHeartbeat/> },
  { key: "game", label: "Game", color: "#f35650", icon: <FaCalendarWeek/> }
];
const LOAD_COLORS = { "L": "#b7bec9", "M": "#FFD700", "H": "#f35650" };
const LOAD_LABELS = { "L": "Low", "M": "Med", "H": "High" };
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function defaultSession(dayIdx=0, prev={}) {
  return {
    day: dayIdx,
    type: prev.type || "tech",
    focus: prev.focus || "",
    coach: prev.coach || "",
    attendance: prev.attendance || "",
    load: prev.load || "",
    notes: prev.notes || ""
  };
}
function weekLabel(weekIdx, startDate) {
  if (!startDate) return `Week ${weekIdx+1}`;
  const start = new Date(startDate);
  const end = new Date(start); end.setDate(start.getDate()+6);
  return `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;
}
const INIT_WEEKS = [
  {
    startDate: "2024-07-01",
    sessions: [
      [
        { day:0, type:"tech", focus:"Ball handling", coach:"Coach A", attendance:12, load:"M", notes:"" },
        { day:0, type:"sc", focus:"Lower body", coach:"S&C Coach", attendance:12, load:"H", notes:"" }
      ],
      [
        { day:1, type:"tact", focus:"Transition D", coach:"Coach A", attendance:12, load:"M", notes:"" }
      ],
      [
        { day:2, type:"rec", focus:"Mobility", coach:"Physio", attendance:10, load:"L", notes:"" }
      ],
      [
        { day:3, type:"tech", focus:"Shooting", coach:"Coach B", attendance:11, load:"M", notes:"" },
        { day:3, type:"tact", focus:"Zone offense", coach:"Coach B", attendance:12, load:"H", notes:"" }
      ],
      [
        { day:4, type:"sc", focus:"Upper body", coach:"S&C Coach", attendance:11, load:"M", notes:"" }
      ],
      [
        { day:5, type:"game", focus:"League Game", coach:"Coach A", attendance:12, load:"H", notes:"" }
      ],
      [
        { day:6, type:"rec", focus:"Rest", coach:"", attendance:12, load:"L", notes:"" }
      ]
    ]
  }
];

// PDF export (same as before)
function exportPDF(weeks) {
  const doc = new jsPDF("p", "mm", "a4");
  weeks.forEach((w,wi)=>{
    let y = 16;
    doc.setFillColor(35,42,46);
    doc.rect(0,0,210,20,"F");
    doc.setTextColor(255,215,0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CourtEvo Vero: Training Microcycle", 12, y);
    doc.setFontSize(10);
    doc.text("BE REAL. BE VERO.", 148, y);
    y += 10;
    doc.setTextColor(255,255,255);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 12, y);
    y += 10;
    doc.setTextColor(35,42,46);
    doc.setFontSize(12);
    doc.text(`${weekLabel(wi, w.startDate)}`, 12, y); y+=7;
    y+=2; doc.setFontSize(11);
    DAYS.forEach((day,di)=>{
      doc.text(`${day}:`, 14, y);
      let x = 27;
      (w.sessions[di]||[]).forEach(s=>{
        doc.setTextColor(SESSION_TYPES.find(t=>t.key===s.type).color||"#FFD700");
        doc.text(`[${s.type.toUpperCase()}] ${s.focus} | Coach: ${s.coach} | Attend: ${s.attendance} | Load: ${s.load}`, x, y);
        y+=5;
      });
      y+=3;
      doc.setTextColor(35,42,46);
    });
    y+=4;
    doc.setTextColor(120,120,120);
    doc.setFontSize(9);
    doc.text("© " + new Date().getFullYear() + " CourtEvo Vero. All Rights Reserved.", 12, 287);
    if (weeks.length>1 && wi<weeks.length-1) doc.addPage();
  });
  doc.save("Training_Microcycle.pdf");
}
// CSV export (same as before)
function exportCSV(weeks) {
  const rows = [
    ["Week","Day","Type","Focus","Coach","Attendance","Load","Notes"]
  ];
  weeks.forEach((w,wi)=>{
    DAYS.forEach((day,di)=>{
      (w.sessions[di]||[]).forEach(s=>{
        rows.push([
          weekLabel(wi,w.startDate), day, s.type, s.focus, s.coach, s.attendance, s.load, s.notes
        ]);
      });
    });
  });
  const csv = rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "Training_Microcycle.csv";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// Analytics
function sessionAnalytics(weeks) {
  let total = {};
  SESSION_TYPES.forEach(t=>total[t.key]=0);
  weeks.forEach(w=>w.sessions.flat().forEach(s=>total[s.type]=(total[s.type]||0)+1));
  return SESSION_TYPES.map(t=>({ type:t.label, count:total[t.key]||0 }));
}
function attendanceAnalytics(weeks) {
  let data = [];
  weeks.forEach((w,wi)=>{
    let attend = 0, count = 0;
    w.sessions.flat().forEach(s=>{attend+=Number(s.attendance||0);count++;});
    data.push({ week: weekLabel(wi,w.startDate), attendance: count?Math.round(attend/count):0 });
  });
  return data;
}
// For week at a glance
function weekSummary(w) {
  let out = {}, loadSum=0, loadCount=0;
  SESSION_TYPES.forEach(t=>out[t.key]=0);
  w.sessions.flat().forEach(s=>{
    out[s.type]=(out[s.type]||0)+1;
    if (s.load) {loadSum+=("LMH".indexOf(s.load)+1); loadCount++;}
  });
  return {
    ...out,
    total: w.sessions.flat().length,
    avgLoad: loadCount?Math.round(loadSum/loadCount):0
  };
}
function loadTraffic(avg) {
  if (avg<=1) return {color:"#b7bec9",icon:<FaExclamationTriangle/>}; // low
  if (avg===2) return {color:"#FFD700",icon:<FaExclamationTriangle/>}; // med
  if (avg>=3) return {color:"#f35650",icon:<FaExclamationTriangle/>}; // high
  return {color:"#b7bec9",icon:null};
}
export default function TrainingMicrocycleBuilder() {
  const [weeks, setWeeks] = useState(INIT_WEEKS);
  const [expanded, setExpanded] = useState(0);
  const [selected, setSelected] = useState({week:0, day:0, idx:null});
  const [modal, setModal] = useState(false);
  const [sessionEdit, setSessionEdit] = useState(defaultSession(0));
  const [weekDate, setWeekDate] = useState("");

  // Add, edit, duplicate, delete, clear logic
  function openEdit(wi,di,si) {
    setSelected({week:wi,day:di,idx:si});
    setSessionEdit({...weeks[wi].sessions[di][si]});
    setModal(true);
  }
  function handleEditChange(field, val) {
    setSessionEdit(se=>({...se,[field]:val}));
  }
  function saveSession() {
    setWeeks(list=>{
      const next = [...list];
      next[selected.week].sessions[selected.day][selected.idx] = {...sessionEdit};
      return next;
    });
    setModal(false);
  }
  function addSession(wi, di) {
    setWeeks(list=>{
      const next = [...list];
      // prefill with last session same day if present, else default
      const prev = (next[wi].sessions[di]&&next[wi].sessions[di].length)
        ? next[wi].sessions[di][next[wi].sessions[di].length-1] : {};
      next[wi].sessions[di].push(defaultSession(di,prev));
      return next;
    });
  }
  function deleteSession(wi,di,si) {
    setWeeks(list=>{
      const next = [...list];
      next[wi].sessions[di].splice(si,1);
      return next;
    });
    setModal(false);
  }
  function duplicateWeek(wi) {
    setWeeks(list=>{
      const next = [...list];
      let copy = JSON.parse(JSON.stringify(next[wi]));
      copy.startDate = ""; // force set new date
      next.push(copy);
      return next;
    });
  }
  function clearWeek(wi) {
    setWeeks(list=>{
      const next = [...list];
      next[wi].sessions = DAYS.map(()=>[]);
      return next;
    });
  }
  function addWeek() {
    if (!weekDate) return;
    setWeeks(list=>{
      const next = [...list];
      next.push({
        startDate: weekDate,
        sessions: DAYS.map(()=>[])
      });
      return next;
    });
    setWeekDate("");
  }

  // Analytics
  const sessionData = sessionAnalytics(weeks);
  const attendData = attendanceAnalytics(weeks);

  // AI Copilot
  function aiAdvice(w) {
    const summary = weekSummary(w);
    let notes = [];
    if (summary.sc<2) notes.push("S&C sessions low—consider adding.");
    if (w.sessions[5].some(s=>s.type==="game") && w.sessions[6].some(r=>r.type==="game"))
      notes.push("Back-to-back games—risk of fatigue.");
    if (!notes.length) notes.push("Session mix OK.");
    return notes.join(" ");
  }

  return (
    <div className="micro-main">
      <div className="micro-header">
        <h2>
          <FaClipboardList style={{ color: "#FFD700", marginRight: 13 }} />
          Elite Training Program Microcycle Builder
        </h2>
        <div>
          <button className="micro-pdf-btn" onClick={() => exportPDF(weeks)}>
            <FaDownload /> Export PDF
          </button>
          <button className="micro-csv-btn" onClick={() => exportCSV(weeks)}>
            <FaFileCsv /> Export CSV
          </button>
        </div>
      </div>

      {/* --- Analytics --- */}
      <div className="micro-analytics-row">
        <div className="micro-analytics-card">
          <div className="micro-analytics-title"><FaClipboardList/> Session Mix</div>
          <div style={{height:120, width:230}}>
            <ResponsiveBar
              data={sessionData}
              keys={["count"]}
              indexBy="type"
              margin={{top:16, right:15, bottom:35, left:40}}
              padding={0.33}
              colors={SESSION_TYPES.map(t=>t.color)}
              axisBottom={{
                tickSize: 6,
                legend: "Session",
                legendOffset: 20,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 6,
                legend: "Count",
                legendOffset: -22,
                legendPosition: "middle"
              }}
              labelSkipWidth={40}
              labelSkipHeight={12}
              labelTextColor="#232a2e"
              enableLabel={true}
              theme={{
                axis: { ticks: { text: { fill: "#FFD700" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              height={90}
              isInteractive={false}
            />
          </div>
        </div>
        <div className="micro-analytics-card">
          <div className="micro-analytics-title"><FaUserTie/> Avg Attendance</div>
          <div style={{height:120, width:230}}>
            <ResponsiveBar
              data={attendData}
              keys={["attendance"]}
              indexBy="week"
              margin={{top:16, right:15, bottom:35, left:40}}
              padding={0.33}
              colors={["#FFD700"]}
              axisBottom={{
                tickSize: 6,
                legend: "Week",
                legendOffset: 20,
                legendPosition: "middle"
              }}
              axisLeft={{
                tickSize: 6,
                legend: "Attendance",
                legendOffset: -22,
                legendPosition: "middle"
              }}
              labelSkipWidth={40}
              labelSkipHeight={12}
              labelTextColor="#232a2e"
              enableLabel={true}
              theme={{
                axis: { ticks: { text: { fill: "#FFD700" } } },
                grid: { line: { stroke: "#5c636e", strokeDasharray: "3 3" } }
              }}
              height={90}
              isInteractive={false}
            />
          </div>
        </div>
      </div>

      {/* --- Weeks, Accordion --- */}
      <div className="micro-weeks-accordion">
        {weeks.map((w,wi)=>
          <div className="micro-week-accordion-card" key={wi}>
            <div className="micro-week-acc-header" onClick={()=>setExpanded(wi===expanded?null:wi)}>
              <span className="micro-week-label">{weekLabel(wi, w.startDate)}</span>
              <div className="micro-week-summary">
                <WeekSummaryCard summary={weekSummary(w)} />
              </div>
              <div className="micro-week-acc-icons">
                <button className="micro-dup-btn" title="Duplicate Week" onClick={e=>{e.stopPropagation();duplicateWeek(wi);}}><FaSyncAlt/></button>
                <button className="micro-clear-btn" title="Clear Week" onClick={e=>{e.stopPropagation();clearWeek(wi);}}><FaTrash/></button>
                {wi===expanded
                  ? <FaChevronUp style={{marginLeft:14, color:"#FFD700"}}/>
                  : <FaChevronDown style={{marginLeft:14, color:"#FFD700"}}/>
                }
              </div>
            </div>
            {wi===expanded && (
              <div className="micro-week-acc-content">
                <div className="micro-week-ai"><FaRobot style={{color:"#FFD700",fontSize:18,marginRight:7}}/>{aiAdvice(w)}</div>
                <div className="micro-week-grid">
                  <div className="micro-cal-header-row">
                    {DAYS.map((day,di)=>
                      <div className="micro-cal-day-header" key={di}>{day}</div>
                    )}
                  </div>
                  <div className="micro-cal-sessions-row">
                    {DAYS.map((day,di)=>
                      <div className="micro-cal-day-cell" key={di}>
                        {(w.sessions[di]||[]).map((s,si)=>
                          <SessionPill
                            session={s}
                            onClick={()=>openEdit(wi,di,si)}
                            key={si}
                          />
                        )}
                        <button className="micro-add-btn micro-cal-add" onClick={()=>addSession(wi,di)}><FaPlus/></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Add week block */}
        <div className="micro-week-add">
          <input type="date" value={weekDate} onChange={e=>setWeekDate(e.target.value)} />
          <button className="micro-add-btn" onClick={addWeek}><FaPlus/> Add Week</button>
        </div>
      </div>

      {/* --- Modal Edit --- */}
      {modal && (
        <div className="micro-modal-overlay">
          <div className="micro-modal">
            <div className="micro-modal-header">
              <FaEdit/> Edit Session
              <button className="micro-modal-close" onClick={()=>setModal(false)}>×</button>
            </div>
            <div className="micro-modal-fields">
              <label>Type:
                <select value={sessionEdit.type} onChange={e=>handleEditChange("type",e.target.value)}>
                  {SESSION_TYPES.map(t=>
                    <option value={t.key} key={t.key}>{t.label}</option>
                  )}
                </select>
              </label>
              <label>Focus:
                <input value={sessionEdit.focus} onChange={e=>handleEditChange("focus",e.target.value)} />
              </label>
              <label>Coach:
                <input value={sessionEdit.coach} onChange={e=>handleEditChange("coach",e.target.value)} />
              </label>
              <label>Attendance:
                <input type="number" value={sessionEdit.attendance} onChange={e=>handleEditChange("attendance",e.target.value)} />
              </label>
              <label>Load:
                <select value={sessionEdit.load} onChange={e=>handleEditChange("load",e.target.value)}>
                  <option value="">--</option>
                  <option value="L">Low</option>
                  <option value="M">Med</option>
                  <option value="H">High</option>
                </select>
              </label>
              <label>Notes:
                <textarea value={sessionEdit.notes} onChange={e=>handleEditChange("notes",e.target.value)} />
              </label>
            </div>
            <div className="micro-modal-actions">
              <button className="micro-modal-save" onClick={saveSession}><FaEdit/> Save</button>
              <button className="micro-modal-del" onClick={()=>deleteSession(selected.week,selected.day,selected.idx)}><FaTrash/> Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="micro-tagline">BE REAL. BE VERO.</div>
    </div>
  );
}

// --- Session Pill Component ---
function SessionPill({ session, onClick }) {
  const t = SESSION_TYPES.find(t=>t.key===session.type);
  return (
    <div className="micro-session-pill" onClick={onClick}>
      <div className="micro-session-type-bar" style={{background:t.color}}/>
      <div className="micro-session-main">
        <div className="micro-session-icon">{t.icon}</div>
        <div className="micro-session-focus">{session.focus || t.label}</div>
      </div>
      <div className="micro-session-badges">
        {session.load && <span className="micro-session-load-dot" style={{background:LOAD_COLORS[session.load]}} title={LOAD_LABELS[session.load]} />}
        <span className="micro-session-att-badge">{session.attendance}</span>
      </div>
    </div>
  );
}
// --- Week Summary Card ---
function WeekSummaryCard({ summary }) {
  const traffic = loadTraffic(summary.avgLoad);
  return (
    <div className="micro-week-summary-card">
      <span style={{color:"#FFD700",fontWeight:900}}>{summary.total}x</span>
      <span style={{color:"#35b378"}}>S&C:{summary.sc}</span>
      <span style={{color:"#FFD700"}}>Tech:{summary.tech}</span>
      <span style={{color:"#b7bec9"}}>Rec:{summary.rec}</span>
      <span style={{color:"#f35650"}}>Game:{summary.game}</span>
      <span style={{color:traffic.color}} title="Avg Load">{traffic.icon}</span>
    </div>
  );
}
