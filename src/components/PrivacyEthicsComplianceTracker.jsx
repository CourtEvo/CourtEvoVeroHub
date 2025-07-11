import React, { useState, useRef } from "react";
import {
  FaUserShield, FaCheckCircle, FaExclamationTriangle, FaBalanceScale, FaListAlt, FaFileAlt, FaLock, FaInfoCircle, FaUpload, FaSearch, FaDownload, FaEdit, FaHistory, FaCalendarAlt, FaBell, FaRegCommentDots, FaEye, FaRedoAlt
} from "react-icons/fa";

// Helper for calendar and expiry
function daysUntil(dateStr) {
  const today = new Date();
  const d = new Date(dateStr);
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}

// Demo board users
const BOARD_USERS = ["President", "Admin Lead", "Technical Director", "Finance Director"];

const initialLogs = [
  {
    type: "Policy", name: "GDPR Policy Updated", status: "Compliant", date: "2025-05-04",
    by: "President", evidence: "GDPR_v2.pdf", history: [],
    expiry: "2025-09-01", notes: []
  },
  {
    type: "Consent", name: "Player Consent (Petar Horvat)", status: "Compliant", date: "2025-06-03",
    by: "Admin Lead", evidence: "consent_PetarHorvat.pdf", history: [],
    expiry: "2025-07-20", notes: []
  },
  {
    type: "Incident", name: "Staff Laptop Lost", status: "Reported", date: "2025-03-14",
    by: "Facilities Manager", evidence: "incident_report.jpg", history: [],
    notes: []
  },
  {
    type: "Audit", name: "Annual Data Audit", status: "Compliant", date: "2025-01-21",
    by: "External Auditor", evidence: "audit2025.pdf", history: [],
    expiry: "2026-01-21", notes: []
  },
  {
    type: "Policy", name: "Image Rights Policy", status: "Pending", date: "2025-06-14",
    by: "Marketing Lead", evidence: "", history: [],
    expiry: "2025-08-31", notes: []
  },
  {
    type: "Ethics", name: "Player Data Ethics Review", status: "Compliant", date: "2025-05-22",
    by: "Ethics Committee", evidence: "ethics_statement.pdf", history: [],
    expiry: "2025-12-01", notes: []
  }
];

const STATUS_COLORS = {
  "Compliant": "#1de682",
  "Pending": "#FFD700",
  "Reported": "#e82e2e",
  "Rejected": "#e82e2e",
  "Renewed": "#1de682"
};
const statusList = ["Compliant", "Pending", "Reported", "Rejected", "Renewed"];
const typeList = ["Policy", "Consent", "Audit", "Incident", "Ethics"];

export default function PrivacyEthicsComplianceTracker() {
  const [logs, setLogs] = useState(initialLogs);
  const [newLog, setNewLog] = useState({ type: "", name: "", status: "Pending", date: "", by: "", evidence: "", history: [], expiry: "", notes: [] });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [statusEdit, setStatusEdit] = useState("");
  const [evidenceUpload, setEvidenceUpload] = useState("");
  const [timelineIdx, setTimelineIdx] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [notesDraft, setNotesDraft] = useState({});
  const scrollRef = useRef(null);

  // Filter
  const filteredLogs = logs.filter(l =>
    (!typeFilter || l.type === typeFilter) &&
    (!statusFilter || l.status === statusFilter) &&
    (l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.type.toLowerCase().includes(search.toLowerCase()) ||
      l.by.toLowerCase().includes(search.toLowerCase()))
  );

  // Compliance summary, smart reminders
  const expiringSoon = logs.filter(l => l.expiry && daysUntil(l.expiry) < 60 && daysUntil(l.expiry) >= 0).length;
  const incidentsOpen = logs.filter(l => l.type === "Incident" && l.status !== "Compliant").length;
  const itemsNeedAction = expiringSoon + incidentsOpen;
  const todayStr = new Date().toISOString().split("T")[0];

  // Board Alert (if action needed)
  const showAlert = itemsNeedAction > 0;

  // Calendar view events
  const calendarEvents = logs.filter(l =>
    (l.expiry && new Date(l.expiry).getMonth() === calendarMonth && new Date(l.expiry).getFullYear() === calendarYear) ||
    (new Date(l.date).getMonth() === calendarMonth && new Date(l.date).getFullYear() === calendarYear)
  );

  // Add Log
  function handleAddLog() {
    if (!newLog.type || !newLog.name || !newLog.by || !newLog.date) return;
    setLogs([{ ...newLog, history: [], notes: [] }, ...logs]);
    setNewLog({ type: "", name: "", status: "Pending", date: "", by: "", evidence: "", history: [], expiry: "", notes: [] });
  }

  // Export CSV (mock)
  function handleExport() {
    setShowExport(true);
    setTimeout(() => setShowExport(false), 900);
  }

  // Status update
  function openStatusEdit(idx) {
    setEditIdx(idx);
    setStatusEdit(logs[idx].status);
  }
  function saveStatus(idx) {
    const updateDate = todayStr;
    const updated = logs.map((log, i) => {
      if (i !== idx) return log;
      const hist = [...log.history, { status: log.status, by: "Board", date: updateDate }];
      return { ...log, status: statusEdit, history: hist };
    });
    setLogs(updated);
    setEditIdx(null);
    setStatusEdit("");
  }
  // Renew (set new expiry and log it)
  function handleRenew(idx) {
    const newExpiry = prompt("Enter new expiry date (YYYY-MM-DD):");
    if (!newExpiry) return;
    const updateDate = todayStr;
    setLogs(logs =>
      logs.map((log, i) => {
        if (i !== idx) return log;
        const hist = [...log.history, { status: "Renewed", by: "Board", date: updateDate, detail: "Renewed with new expiry" }];
        return { ...log, status: "Renewed", expiry: newExpiry, history: hist };
      })
    );
  }
  // Upload evidence
  function handleEvidence(idx, file) {
    setLogs(logs =>
      logs.map((log, i) => {
        if (i !== idx) return log;
        return { ...log, evidence: file.name };
      })
    );
    setEvidenceUpload("");
  }
  // Board note (per entry)
  function addNote(idx) {
    if (!notesDraft[idx]?.trim()) return;
    const newNote = { text: notesDraft[idx], by: "Board", date: todayStr };
    setLogs(logs =>
      logs.map((log, i) => {
        if (i !== idx) return log;
        return { ...log, notes: [newNote, ...log.notes] };
      })
    );
    setNotesDraft(n => ({ ...n, [idx]: "" }));
  }

  // Timeline for history/notes
  function openTimeline(idx) {
    setTimelineIdx(idx);
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 50);
  }
  function closeTimeline() { setTimelineIdx(null); }

  // Calendar month nav
  function nextMonth() {
    setCalendarMonth(m => (m === 11 ? 0 : m + 1));
    if (calendarMonth === 11) setCalendarYear(y => y + 1);
  }
  function prevMonth() {
    setCalendarMonth(m => (m === 0 ? 11 : m - 1));
    if (calendarMonth === 0) setCalendarYear(y => y - 1);
  }

  // Calendar render
  function renderCalendar() {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    let rows = [], cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(<td key={"empty" + i}></td>);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calendarYear}-${(calendarMonth + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
      const dayEvents = calendarEvents.filter(l => l.date === dateStr || l.expiry === dateStr);
      cells.push(
        <td key={d} style={{
          textAlign: "center",
          verticalAlign: "middle",
          background: dayEvents.length > 0 ? "#FFD70033" : "",
          borderRadius: 5,
          border: dayEvents.some(l=>l.status==="Reported")?"2px solid #e82e2e":dayEvents.some(l=>l.status==="Pending")?"2px solid #FFD700":""
        }}>
          <div style={{fontWeight:900, color:"#FFD700"}}>{d}</div>
          <div>
            {dayEvents.map((l,i)=>(
              <span key={i} title={l.name}>
                {l.status==="Reported"?<FaExclamationTriangle style={{color:"#e82e2e",fontSize:13}}/>:null}
                {l.expiry===dateStr?<FaRedoAlt style={{color:"#FFD700",fontSize:12}}/>:null}
                {l.status==="Compliant"?<FaCheckCircle style={{color:"#1de682",fontSize:12}}/>:null}
              </span>
            ))}
          </div>
        </td>
      );
      if ((cells.length) % 7 === 0) { rows.push(<tr key={d}>{cells}</tr>); cells = []; }
    }
    if (cells.length > 0) rows.push(<tr key={"last"}>{cells}</tr>);
    return <table style={{width:"100%",background:"#232a2e",borderRadius:11,padding:7,color:"#FFD700"}}><tbody>{rows}</tbody></table>;
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #232a2e 0%, #283E51 100%)",
      color: "#FFD700",
      minHeight: "100vh",
      borderRadius: 28,
      padding: 36,
      maxWidth: 1260,
      margin: "0 auto"
    }}>
      {/* Board Alerts */}
      {showAlert && (
        <div style={{
          background: "#FFD700",
          color: "#232a2e",
          borderRadius: 13,
          fontWeight: 900,
          fontSize: 18,
          padding: "14px 17px",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 16
        }}>
          <FaBell style={{color:"#e82e2e",fontSize:25}}/>
          <span>
            {incidentsOpen > 0 && <span>{incidentsOpen} incident(s) need immediate review. </span>}
            {expiringSoon > 0 && <span>{expiringSoon} policy/consent(s) expiring soon. </span>}
          </span>
        </div>
      )}
      {/* Smart reminder */}
      {itemsNeedAction === 0 && (
        <div style={{
          background: "#1de68222", color: "#1de682",
          borderRadius: 11, fontWeight: 900, padding: "8px 14px", marginBottom: 10
        }}>
          <FaCheckCircle style={{marginRight:7}}/> All compliance items up to date.
        </div>
      )}
      <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 19 }}>
        <FaUserShield style={{ fontSize: 30, color: "#FFD700", marginRight: 10 }} />
        <h2 style={{ fontWeight: 900, fontSize: 32, letterSpacing: 2, margin: 0 }}>
          Privacy & Ethics Compliance Tracker
        </h2>
        <button style={miniBtn} onClick={handleExport}><FaDownload style={{ marginRight: 7 }} /> Export CSV</button>
        {showExport && <span style={{ color: "#1de682", fontWeight: 900, marginLeft: 10 }}>Exported!</span>}
      </div>
      {/* Compliance Calendar */}
      <div style={{ background: "#232a2e", borderRadius: 14, padding: "17px 18px", marginBottom: 19 }}>
        <b style={{color:"#FFD700",fontSize:17}}><FaCalendarAlt style={{marginRight:8}}/>Compliance Calendar</b>
        <div style={{display:"flex",alignItems:"center",gap:17,marginTop:9}}>
          <button style={miniBtn} onClick={prevMonth}>&lt;</button>
          <b style={{fontSize:16}}>{new Date(calendarYear, calendarMonth).toLocaleString("en",{month:"long",year:"numeric"})}</b>
          <button style={miniBtn} onClick={nextMonth}>&gt;</button>
        </div>
        <div style={{marginTop:10}}>{renderCalendar()}</div>
        <div style={{fontSize:13,color:"#FFD700bb",marginTop:4}}>* Red triangle = Incident; Gold reload = expiring; Green check = compliant</div>
      </div>
      {/* Filter/Search */}
      <div style={{display:"flex",gap:13,alignItems:"center",marginBottom:13}}>
        <FaSearch style={{color:"#FFD700",fontSize:17,marginRight:3}} />
        <input style={{...inputStyle, width:150}} value={search} placeholder="Search..." onChange={e=>setSearch(e.target.value)} />
        <select style={inputStyle} value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {typeList.map(t=><option key={t}>{t}</option>)}
        </select>
        <select style={inputStyle} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {statusList.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      {/* Add Log Entry */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: "16px 18px", marginBottom: 16, display: "flex", gap: 17, flexWrap: "wrap", alignItems: "end"
      }}>
        <b style={{ color: "#FFD700", fontSize: 17, marginRight: 19 }}><FaFileAlt style={{ marginRight: 8 }} /> Add Log Entry</b>
        <select style={inputStyle} value={newLog.type} onChange={e => setNewLog(l => ({ ...l, type: e.target.value }))}>
          <option value="">Type</option>
          {typeList.map(t=><option key={t}>{t}</option>)}
        </select>
        <input style={inputStyle} value={newLog.name} onChange={e => setNewLog(l => ({ ...l, name: e.target.value }))} placeholder="Event/Entry Name" />
        <input style={inputStyle} type="date" value={newLog.date} onChange={e => setNewLog(l => ({ ...l, date: e.target.value }))} />
        <input style={inputStyle} value={newLog.by} onChange={e => setNewLog(l => ({ ...l, by: e.target.value }))} placeholder="By (who)" />
        <input style={inputStyle} type="date" value={newLog.expiry} onChange={e => setNewLog(l => ({ ...l, expiry: e.target.value }))} placeholder="Expiry (if any)" />
        {/* Demo evidence upload */}
        <label style={{ ...inputStyle, display: "flex", alignItems: "center", background: "#fff", color: "#232a2e", cursor: "pointer", width: 150, marginBottom: 0 }}>
          <FaUpload style={{ marginRight: 8 }} />
          {newLog.evidence ? newLog.evidence : "Attach file"}
          <input type="file" style={{ display: "none" }} onChange={e => setNewLog(l => ({ ...l, evidence: e.target.files[0]?.name }))} />
        </label>
        <button style={miniBtn} onClick={handleAddLog}>Add</button>
      </div>
      {/* Log Table */}
      <div style={{
        background: "#232a2e", borderRadius: 13, padding: "10px 18px", marginBottom: 17, maxHeight: 370, overflow: "auto"
      }}>
        <table style={{ width: "100%", fontSize: 16, color: "#FFD700", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Entry</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>By</th>
              <th style={thStyle}>Expiry</th>
              <th style={thStyle}>Evidence</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((l, i) => (
              <tr key={i} style={{ background: STATUS_COLORS[l.status] + "22" }}>
                <td style={tdStyle}>{l.type}</td>
                <td style={tdStyle}>{l.name}</td>
                <td style={tdStyle}>{l.date}</td>
                <td style={tdStyle}>{l.by}</td>
                <td style={{
                  ...tdStyle, color: l.expiry && daysUntil(l.expiry) < 60 && daysUntil(l.expiry) >= 0 ? "#FFD700" : "#FFD700bb", fontWeight:900
                }}>
                  {l.expiry ? `${l.expiry} (${daysUntil(l.expiry)}d)` : "--"}
                  {l.expiry && daysUntil(l.expiry) < 60 && daysUntil(l.expiry) >= 0 &&
                    <FaExclamationTriangle style={{color:"#FFD700",marginLeft:4}} />}
                  {l.expiry && <button style={{ ...miniBtn, background: "#1de682", color: "#232a2e", marginLeft: 7 }} onClick={()=>handleRenew(i)}><FaRedoAlt/> Renew</button>}
                </td>
                <td style={{...tdStyle, fontWeight: 900, display:"flex",alignItems:"center"}}>
                  {l.evidence ? (
                    <>
                      <FaFileAlt style={{marginRight:5}}/>
                      <span style={{cursor:"pointer"}} onClick={()=>window.open("#")}>{l.evidence}</span>
                      <FaEye title="Preview (demo)" style={{color:"#1de682",marginLeft:5}}/>
                    </>
                  ) : "--"}
                  <input type="file" style={{ display: "none" }} id={`evup${i}`} onChange={e=>handleEvidence(i, e.target.files[0])} />
                  <label htmlFor={`evup${i}`} style={{ color:"#1de682", cursor:"pointer", fontSize:15, marginLeft:7 }}>
                    <FaUpload style={{marginRight:2}}/>Attach
                  </label>
                </td>
                <td style={{
                  ...tdStyle,
                  color: STATUS_COLORS[l.status],
                  fontWeight: 900
                }}>
                  {l.status}
                  <button style={{marginLeft:8, background:"none", border:"none", color:"#FFD700", cursor:"pointer"}} onClick={()=>openStatusEdit(i)}>
                    <FaEdit/>
                  </button>
                </td>
                <td style={{...tdStyle, fontWeight:700, display:"flex",alignItems:"center",gap:5}}>
                  <button style={{...miniBtn, background:"#FFD70011", color:"#FFD700"}} onClick={()=>openTimeline(i)}><FaHistory/> Timeline</button>
                  <div style={{marginLeft:3}}></div>
                  {/* Board notes */}
                  <FaRegCommentDots style={{color:"#FFD700",marginRight:4}}/>
                  <input style={{...inputStyle,width:75,padding:"3px 7px",margin:0,fontSize:14}} value={notesDraft[i]||""} onChange={e=>setNotesDraft(n=>({...n,[i]:e.target.value}))} placeholder="Note..." />
                  <button style={{...miniBtn,background:"#FFD700",color:"#232a2e",fontSize:14,padding:"2px 7px"}} onClick={()=>addNote(i)}>Add</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Timeline Modal */}
      {timelineIdx !== null && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "#232a2ecc", zIndex: 99, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#232a2e", borderRadius: 19, padding: 28, minWidth: 370, maxWidth: 600, boxShadow: "0 0 40px #FFD70055", maxHeight: "80vh", overflowY: "auto"
          }} ref={scrollRef}>
            <b style={{fontSize:18, color:"#FFD700"}}>Timeline</b>
            <div style={{marginTop:11}}>
              {logs[timelineIdx].history.length === 0 && <div>No timeline entries yet.</div>}
              {logs[timelineIdx].history.map((h,j)=>
                <div key={j} style={{
                  background: "#181e23", color: "#FFD700", borderRadius: 10, padding: "8px 13px",
                  marginBottom: 7, fontWeight: 700, fontSize: 15
                }}>
                  <FaHistory style={{marginRight:7}}/>
                  [{h.date}] <b>{h.status}</b> — {h.by} {h.detail ? `| ${h.detail}`:""}
                </div>
              )}
              {logs[timelineIdx].notes && logs[timelineIdx].notes.map((n,j)=>
                <div key={j} style={{
                  background: "#1de68222", color: "#1de682", borderRadius: 8, padding: "6px 10px",
                  marginBottom: 7, fontWeight: 700, fontSize: 14
                }}>
                  <FaRegCommentDots style={{marginRight:7}}/>[{n.date}] <b>{n.by}</b>: {n.text}
                </div>
              )}
            </div>
            <button style={{...miniBtn,marginTop:11}} onClick={closeTimeline}>Close</button>
          </div>
        </div>
      )}
      {/* Status Update Modal */}
      {editIdx !== null && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "#232a2ecc", zIndex: 99, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#232a2e", borderRadius: 19, padding: 28, minWidth: 310, maxWidth: 400, boxShadow: "0 0 40px #FFD70055"
          }}>
            <b>Update Status</b>
            <select style={{...inputStyle, marginTop: 11}} value={statusEdit} onChange={e=>setStatusEdit(e.target.value)}>
              {statusList.map(s=><option key={s}>{s}</option>)}
            </select>
            <button style={{...miniBtn, marginTop:12}} onClick={()=>saveStatus(editIdx)}>Save</button>
            <button style={{...miniBtn, background:"#e82e2e", color:"#fff", marginLeft:8, marginTop:12}} onClick={()=>setEditIdx(null)}>Cancel</button>
          </div>
        </div>
      )}
      {/* Info/Final Advisory */}
      <div style={{
        background: "#181e23", color: "#FFD700", borderRadius: 10,
        padding: "12px 14px", fontWeight: 700, fontSize: 15, marginTop: 14
      }}>
        <FaBalanceScale style={{ marginRight: 7, verticalAlign: -2 }} />
        <b>Boardroom Guidance:</b> Real-time dashboard for every privacy/ethics risk. Full timeline, expiry reminders, upload/preview, compliance calendar, notes and evidence. Board- and sponsor-audit ready.
      </div>
      {/* Info line */}
      <div style={{ color: "#FFD70099", fontSize: 13, marginTop: 8, display: "flex", alignItems: "center" }}>
        <FaInfoCircle style={{ marginRight: 7 }} />
        * Items with expiry within 60 days get a warning. Timeline/notes/calendar for 360° audit. No missed renewals, incidents, or board notes. All exportable.
      </div>
    </div>
  );
}

const thStyle = {
  color: "#FFD700",
  background: "#232a2e",
  fontWeight: 900,
  padding: "11px 10px",
  textAlign: "center",
  borderRadius: "10px 10px 0 0"
};
const tdStyle = {
  padding: "10px 7px",
  color: "#FFD700",
  fontWeight: 700
};
const miniBtn = {
  background: "#FFD700",
  color: "#232a2e",
  border: "none",
  borderRadius: 7,
  fontWeight: 900,
  fontSize: 15,
  padding: "7px 13px",
  cursor: "pointer"
};
const inputStyle = {
  background: "#fff",
  color: "#232a2e",
  border: "1.5px solid #FFD700",
  borderRadius: 7,
  fontWeight: 700,
  fontSize: 15,
  padding: "6px 8px",
  margin: "7px 0"
};
