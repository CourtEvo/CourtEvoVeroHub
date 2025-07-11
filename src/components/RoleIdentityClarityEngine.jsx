import React, { useState } from "react";
import { FaCrown, FaSync, FaUsers, FaBolt, FaUndo, FaExclamationTriangle, FaRobot, FaFlag, FaFileExport, FaLayerGroup, FaPlus, FaEdit, FaTrash, FaTable, FaEye, FaUserTie, FaUserCheck, FaUserShield, FaHistory, FaStar, FaHeartbeat, FaArrowRight, FaLightbulb, FaWrench, FaBalanceScale, FaSearch, FaShieldAlt, FaCloudDownloadAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- BUTTON ---
const Button = ({ children, onClick, style = {}, size, pulse, ...props }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.95 }}
    style={{
      border: 'none', borderRadius: 9,
      padding: size === 'sm' ? '8px 14px' : '16px 22px',
      background: pulse
        ? "radial-gradient(circle,#FFD700 55%,#1de682 100%)"
        : 'linear-gradient(135deg,#FFD700 70%,#1de682 100%)',
      color: '#181e23', fontWeight: 900, fontSize: size === 'sm' ? 15 : 18,
      cursor: 'pointer', letterSpacing: 0.5, boxShadow: "0 2px 14px #FFD70044",
      outline: "none", ...style
    }}
    animate={pulse ? { scale: [1, 1.06, 1] } : false}
    transition={pulse ? { duration: 1, repeat: Infinity, repeatType: "mirror" } : undefined}
    {...props}
  >{children}</motion.button>
);

// --- AVATAR ---
const Avatar = ({ name, color }) => {
  const initials = name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{
      width: 42, height: 42, borderRadius: 21, background: color,
      color: "#fff", fontWeight: 900, fontSize: 21, display: "flex",
      alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px #FFD70055", border: "3px solid #fff"
    }}>{initials}</div>
  );
};

const allRoles = [
  "SCORER", "CREATOR", "DEFENSIVE ANCHOR", "SHADOW LEADER", "BENCH SPARK", "GLUE GUY", "ROLE UNKNOWN"
];
const skillTags = ["3PT", "POST", "ISO", "LEADER", "CLUTCH", "DEFENSE", "VISION", "PASS", "MOTIVATOR", "RUNNER"];
const demoRoster = [
  { id: 1, name: "Luka Vuković", color: "#1de682", assignments: ["SCORER", "GLUE GUY"], fitScore: 93, core: true, shadow: false, skills: ["3PT", "CLUTCH", "RUNNER"], perf: 8.8, conf: 92, view: "all" },
  { id: 2, name: "Ivan Horvat", color: "#FFD700", assignments: ["CREATOR", "SHADOW LEADER"], fitScore: 82, core: true, shadow: true, skills: ["VISION", "PASS"], perf: 7.1, conf: 86, view: "all" },
  { id: 3, name: "Tomislav Šarić", color: "#17a861", assignments: ["DEFENSIVE ANCHOR"], fitScore: 89, core: true, shadow: false, skills: ["DEFENSE", "ENERGY"], perf: 9.0, conf: 95, view: "all" },
  { id: 4, name: "Marko Jurić", color: "#0fbe9f", assignments: ["SHADOW LEADER"], fitScore: 74, core: false, shadow: true, skills: ["LEADER", "MOTIVATOR"], perf: 7.5, conf: 80, view: "all" },
  { id: 5, name: "Petar Božić", color: "#3f8cfa", assignments: ["BENCH SPARK"], fitScore: 63, core: false, shadow: false, skills: ["ENERGY"], perf: 6.2, conf: 65, view: "all" },
  { id: 6, name: "Nikola Dukić", color: "#f09e00", assignments: ["ROLE UNKNOWN"], fitScore: 32, core: false, shadow: false, skills: [], perf: 5.1, conf: 45, view: "all" },
];

// Cell color, pulse, and micro-metrics
function cellColor(roster, row, role) {
  const isAssigned = row.assignments.includes(role);
  if (!isAssigned) return "#181e23";
  if (row.assignments.filter(r => r === role).length > 1) return "#FF4848";
  if (role === "ROLE UNKNOWN" || row.assignments.includes("ROLE UNKNOWN")) return "#FFD70022";
  if (row.fitScore > 85) return "#1de682";
  if (row.fitScore > 70) return "#FFD700";
  if (row.fitScore > 50) return "#f09e00";
  return "#FF4848";
}
function cellPulse(row, role) {
  if (row.assignments.filter(r => r === role).length > 1) return true;
  if (role === "ROLE UNKNOWN" || row.assignments.includes("ROLE UNKNOWN")) return true;
  return false;
}
function cellMicro(row, role) {
  // Micro-metrics: performance and confidence (colored dots/bars)
  const isAssigned = row.assignments.includes(role);
  if (!isAssigned) return null;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:3}}>
      <FaStar style={{fontSize:13,color:row.perf>8?"#FFD700":row.perf>7?"#1de682":"#FF4848"}} title={`Perf: ${row.perf}`}/>
      <FaHeartbeat style={{fontSize:13,color:row.conf>90?"#1de682":row.conf>75?"#FFD700":"#FF4848"}} title={`Conf: ${row.conf}`}/>
    </span>
  );
}
function calcHeatIndex(roster) {
  const coverage = allRoles.map(role => {
    const assigned = roster.filter(r => r.assignments.includes(role));
    return { role, count: assigned.length, risk: assigned.filter(r => cellColor(roster, r, role) === "#FF4848").length };
  });
  const ghost = roster.filter(r => r.assignments.includes("ROLE UNKNOWN"));
  return { coverage, ghost };
}

const RoleIdentityClarityEngine = () => {
  const [roster, setRoster] = useState(demoRoster);
  const [roleFilter, setRoleFilter] = useState("");
  const [activeCell, setActiveCell] = useState(null);
  const [aiLog, setAiLog] = useState([
    "Overlap: Luka Vuković is both SCORER and GLUE GUY—check for load risk.",
    "Nikola Dukić: ROLE UNKNOWN. Board should assign or review.",
    "SHADOW LEADER: Multiple candidates—define hierarchy for crisis moments.",
    "GLUE GUY: Only one. Succession alert: cross-train bench player."
  ]);
  const [scenarioLog, setScenarioLog] = useState([]);
  const [view, setView] = useState("all");
  const [showExport, setShowExport] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [editCell, setEditCell] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [timelineType, setTimelineType] = useState("all");
  const [timeline, setTimeline] = useState([{type:"assign",msg:"Roster initialized",icon:<FaHistory color="#FFD700"/>}]);
  const [healthAI, setHealthAI] = useState({
    clarity: 87,
    overload: 11,
    ghost: 4,
    succession: 73
  });

  let displayRoster = roster.filter(r => !roleFilter || r.assignments.includes(roleFilter));
  if (view !== "all") displayRoster = displayRoster.filter(r => r.view === "all" || r.view === view);
  const heatIndex = calcHeatIndex(roster);

  // Assign/unassign role (with timeline)
  function toggleAssignment(rowId, role) {
    setRoster(roster.map(r =>
      r.id === rowId
        ? {
            ...r,
            assignments: r.assignments.includes(role)
              ? r.assignments.filter(x => x !== role)
              : [...r.assignments, role]
          }
        : r
    ));
    setScenarioLog([...scenarioLog, `${roster.find(r => r.id === rowId).name} ${roster.find(r => r.id === rowId).assignments.includes(role) ? "unassigned" : "assigned"} as ${role}`]);
    setTimeline([{type:"assign",msg:`${roster.find(r=>r.id===rowId).name}: ${roster.find(r=>r.id===rowId).assignments.includes(role)?"Removed":"Assigned"} ${role}`,icon:<FaBolt color="#1de682"/>},...timeline]);
  }
  // Bulk shuffle
  function massShuffle() {
    setRoster(roster.map(r => r.assignments.includes("ROLE UNKNOWN") ? r : {...r, assignments: ["SCORER","CREATOR"]}));
    setScenarioLog([...scenarioLog, "Mass shuffle: All set to SCORER/CREATOR"]);
    setTimeline([{type:"shuffle",msg:"Mass role shuffle (all SCORER/CREATOR)",icon:<FaSync color="#FFD700"/>},...timeline]);
  }
  // AI auto-balance
  function aiBalance() {
    setRoster(roster.map((r,i) => ({
      ...r,
      assignments: [allRoles[i%allRoles.length]]
    })));
    setScenarioLog([...scenarioLog, "AI auto-balanced all assignments"]);
    setTimeline([{type:"ai",msg:"AI auto-balanced assignments",icon:<FaRobot color="#1de682"/>},...timeline]);
  }
  // Crisis simulate (injury)
  function simulateCrisis() {
    setRoster(roster.map(r=>r.id===1?{...r, assignments:["ROLE UNKNOWN"]}:r));
    setScenarioLog([...scenarioLog, "Simulated: Luka Vuković injury (set to ROLE UNKNOWN)"]);
    setTimeline([{type:"crisis",msg:"Luka Vuković crisis simulated (set to ROLE UNKNOWN)",icon:<FaFlag color="#FF4848"/>},...timeline]);
  }
  // Export (stub)
  const exportReport = () => {
    setShowExport(true);
    setTimeout(() => setShowExport(false), 1800);
  };
  // Undo (just reverts last assignment action, for demo)
  function undoLast() {
    setTimeline([{type:"undo",msg:"UNDO last action (not implemented in demo)",icon:<FaUndo color="#FFD700"/>},...timeline]);
    setScenarioLog([...scenarioLog, "UNDO (visual only, not live)"]);
  }

  // Add/edit logic as before
  const [newRow, setNewRow] = useState({ name: "", assignments: [], skills: [], color: "#FFD700", fitScore: 55, core: false, shadow: false, view: "all", perf: 7.0, conf: 70 });
  function saveEditRow() {
    if (editCell !== null) {
      setRoster(roster.map(r => r.id === editCell ? { ...newRow, id: editCell } : r));
      setEditCell(null);
      setNewRow({ name: "", assignments: [], skills: [], color: "#FFD700", fitScore: 55, core: false, shadow: false, view: "all", perf: 7.0, conf: 70 });
    } else {
      setRoster([...roster, { ...newRow, id: Math.max(...roster.map(r => r.id)) + 1 }]);
      setNewRow({ name: "", assignments: [], skills: [], color: "#FFD700", fitScore: 55, core: false, shadow: false, view: "all", perf: 7.0, conf: 70 });
    }
  }
  function startEdit(row) {
    setEditCell(row.id);
    setNewRow({ ...row });
  }
  function deleteRow(rowId) {
    setRoster(roster.filter(r => r.id !== rowId));
    setScenarioLog([...scenarioLog, `Deleted: ${roster.find(r => r.id === rowId)?.name}`]);
    setTimeline([{type:"delete",msg:`Deleted: ${roster.find(r => r.id === rowId)?.name}`,icon:<FaTrash color="#FF4848"/>},...timeline]);
  }

  // Org Health AI Meter
  function HealthMeter() {
    return (
      <div style={{display:"flex",gap:25,alignItems:"center",margin:"15px 0 19px 0"}}>
        <span style={{fontWeight:900,color:"#FFD700",fontSize:17}}><FaBalanceScale/> ORG HEALTH METER:</span>
        <div style={{fontWeight:800,background:"#1de682",color:"#181e23",padding:"5px 13px",borderRadius:11}}>Clarity: {healthAI.clarity}%</div>
        <div style={{fontWeight:800,background:"#FFD700",color:"#181e23",padding:"5px 13px",borderRadius:11}}>Overload: {healthAI.overload}%</div>
        <div style={{fontWeight:800,background:"#FF4848",color:"#fff",padding:"5px 13px",borderRadius:11}}>Ghost: {healthAI.ghost}%</div>
        <div style={{fontWeight:800,background:"#3f8cfa",color:"#fff",padding:"5px 13px",borderRadius:11}}>Succession: {healthAI.succession}%</div>
      </div>
    );
  }
  // Timeline/Log
  function TimelineLog() {
    const filtered = timelineType==="all"?timeline:timeline.filter(t=>t.type===timelineType);
    return (
      <div style={{background:"#232b39",borderRadius:13,padding:"13px 19px",marginBottom:20,maxHeight:180,overflowY:"auto"}}>
        <b style={{color:"#FFD700"}}><FaHistory/> ORG TIMELINE</b>
        <div style={{margin:"6px 0",display:"flex",gap:11,alignItems:"center"}}>
          <span>Filter:</span>
          <Button size="sm" style={{background:timelineType==="all"?"#FFD700":"#1de682"}} onClick={()=>setTimelineType("all")}>All</Button>
          <Button size="sm" style={{background:timelineType==="assign"?"#FFD700":"#1de682"}} onClick={()=>setTimelineType("assign")}>Assignment</Button>
          <Button size="sm" style={{background:timelineType==="ai"?"#FFD700":"#1de682"}} onClick={()=>setTimelineType("ai")}>AI</Button>
          <Button size="sm" style={{background:timelineType==="shuffle"?"#FFD700":"#1de682"}} onClick={()=>setTimelineType("shuffle")}>Shuffle</Button>
          <Button size="sm" style={{background:timelineType==="crisis"?"#FFD700":"#1de682"}} onClick={()=>setTimelineType("crisis")}>Crisis</Button>
          <Button size="sm" style={{background:timelineType==="undo"?"#FFD700":"#1de682"}} onClick={()=>setTimelineType("undo")}>Undo</Button>
          <Button size="sm" style={{background:timelineType==="delete"?"#FFD700":"#1de682"}} onClick={()=>setTimelineType("delete")}>Delete</Button>
        </div>
        <ul style={{marginTop:7}}>
          {filtered.length===0?<li style={{color:"#FFD70077"}}>No events</li>:
          filtered.map((t,i)=><li key={i} style={{color:"#FFD700",display:"flex",alignItems:"center",gap:7}}>{t.icon} {t.msg}</li>)}
        </ul>
      </div>
    );
  }

  // Quick right-click menu (in cell)
  const [cellMenu, setCellMenu] = useState(null);

  function handleCellMenu(e, row, role) {
    e.preventDefault();
    setCellMenu({x:e.clientX,y:e.clientY,row,role});
  }

  function handleCellMenuAction(action) {
    if (!cellMenu) return;
    if (action==="rotate") {
      toggleAssignment(cellMenu.row.id, cellMenu.role);
      setTimeline([{type:"assign",msg:`Rotated: ${cellMenu.row.name} <-> ${cellMenu.role}`,icon:<FaSync color="#1de682"/>},...timeline]);
    }
    if (action==="backup") {
      setScenarioLog([...scenarioLog, `${cellMenu.row.name}: Assigned backup to ${cellMenu.role}`]);
      setTimeline([{type:"ai",msg:`Backup assigned to ${cellMenu.row.name} for ${cellMenu.role}`,icon:<FaUserCheck color="#FFD700"/>},...timeline]);
    }
    if (action==="clone") {
      setRoster([...roster, {...cellMenu.row, id: Math.max(...roster.map(r=>r.id))+1, name: cellMenu.row.name+" Jr."}]);
      setTimeline([{type:"assign",msg:`Cloned: ${cellMenu.row.name} as ${cellMenu.row.name+" Jr."}`,icon:<FaPlus color="#1de682"/>},...timeline]);
    }
    if (action==="alert") {
      setScenarioLog([...scenarioLog, `${cellMenu.row.name}: Alert sent to ${cellMenu.role} group`]);
      setTimeline([{type:"ai",msg:`Alert sent for ${cellMenu.row.name} / ${cellMenu.role}`,icon:"flag"},...timeline]);

    }
    setCellMenu(null);
  }

  // AI coach assistant
  function AIQuickAssist() {
    return (
      <div style={{background:"#232b39",borderRadius:13,padding:"11px 17px",marginBottom:16}}>
        <b style={{color:"#FFD700"}}><FaRobot/> AI Coach Assistant</b>
        <div style={{display:"flex",gap:13,marginTop:8}}>
          <Button size="sm" onClick={()=>setAiLog([...aiLog,"AI: 3 biggest role risks—GLUE GUY thin, ROLE UNKNOWN unresolved, overload on SCORER."])}><FaSearch/> Top 3 Risks</Button>
          <Button size="sm" onClick={()=>setAiLog([...aiLog,"AI: Suggest bench: Rotate BENCH SPARK with DEFENSIVE ANCHOR, train SHADOW LEADER as backup."])}><FaLightbulb/> Suggest Bench</Button>
          <Button size="sm" onClick={()=>setAiLog([...aiLog,"AI: You are 87% to elite EuroLeague clarity; bridge with dual-role for Marko and backup scorer."])}><FaWrench/> EuroLeague Benchmark</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg,#181e23 0%,#0b3326 100%)", color: "#fff",
      fontFamily: "Segoe UI,sans-serif", padding: 28, overflow: "hidden"
    }}>
      {/* Health Meter */}
      <HealthMeter/>
      {/* Bulk actions */}
      <div style={{display:"flex",gap:13,marginBottom:15}}>
        <Button size="sm" onClick={massShuffle}><FaSync/> Simulate All Roles Shuffle</Button>
        <Button size="sm" onClick={aiBalance}><FaRobot/> Auto-Balance Roles (AI)</Button>
        <Button size="sm" onClick={()=>setRoleFilter("ROLE UNKNOWN")}><FaFlag/> Flag Gaps Only</Button>
        <Button size="sm" onClick={exportReport}><FaCloudDownloadAlt/> Download Full Org Report</Button>
        <Button size="sm" onClick={undoLast}><FaUndo/> Undo Last Change</Button>
        <Button size="sm" style={{background:"#FF4848",color:"#fff"}} onClick={simulateCrisis}><FaShieldAlt/> Crisis Simulation</Button>
      </div>
      {/* Timeline/Log */}
      <TimelineLog/>
      {/* AI Assistant */}
      <AIQuickAssist/>
      {/* Filters + Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 13 }}>
        <span style={{ color: "#FFD700", fontWeight: 800 }}>Highlight Role:</span>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ borderRadius: 8, padding: 8, fontWeight: 700 }}>
          <option value="">All</option>
          {allRoles.map(r => <option key={r}>{r}</option>)}
        </select>
        <div style={{ marginLeft: 15, display: "flex", gap: 8 }}>
          {allRoles.map(r => <span key={r} style={{
            background: r === "SCORER" ? "#1de682" : r === "CREATOR" ? "#FFD700" : r === "DEFENSIVE ANCHOR" ? "#17a861" : r === "SHADOW LEADER" ? "#0fbe9f" : r === "BENCH SPARK" ? "#3f8cfa" : r === "ROLE UNKNOWN" ? "#FFD70022" : "#f09e00",
            color: "#181e23", fontWeight: 900, padding: "4px 11px", borderRadius: 11, cursor: "pointer"
          }} onClick={() => setRoleFilter(r)}>{r}</span>)}
        </div>
      </div>
      {/* Heatmap-Grid */}
      <div style={{
        overflowX: "auto", marginBottom: 27, borderRadius: 22, background: "#232b39", boxShadow: "0 2px 18px #FFD70022", padding: "19px 15px"
      }}>
        <table style={{ borderCollapse: "collapse", minWidth: 870, fontSize: 16 }}>
          <thead>
            <tr>
              <th style={{ color: "#FFD700", fontWeight: 900, fontSize: 17, textAlign: "left", padding: "8px 10px" }}>Player/Coach</th>
              {allRoles.map(role => (
                <th key={role} style={{ color: "#1de682", fontWeight: 900, fontSize: 15, padding: "7px 10px" }}>{role}</th>
              ))}
              <th style={{ color: "#FFD700", fontWeight: 900, fontSize: 15 }}>FIT</th>
              <th style={{ color: "#FFD700", fontWeight: 900, fontSize: 15 }}>SKILLS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayRoster.map(row => (
              <tr key={row.id} style={{ borderBottom: "2px solid #283E51" }}>
                <td style={{ fontWeight: 900, color: "#FFD700", background: "#232b39", padding: "8px 10px" }}>
                  <span style={{
                    display: "inline-block", background: row.color, color: "#fff", borderRadius: 17, padding: "3.5px 11px", fontWeight: 900, marginRight: 6
                  }}>{row.name}</span>
                </td>
                {allRoles.map(role => {
                  const bg = cellColor(roster, row, role);
                  const pulse = cellPulse(row, role);
                  return (
                    <td key={role}
                      style={{
                        background: bg, color: "#181e23", fontWeight: 900, textAlign: "center",
                        borderRadius: 7, border: pulse ? "2.5px solid #FF4848" : "none", boxShadow: pulse ? "0 0 9px #FF4848" : "none",
                        position: "relative"
                      }}
                      onContextMenu={e => handleCellMenu(e, row, role)}
                    >
                      <motion.div
                        initial={{ scale: 0.92, opacity: 0.7 }}
                        animate={pulse ? { scale: [1, 1.13, 1], opacity: [1, 0.6, 1] } : { scale: 1, opacity: 1 }}
                        transition={pulse ? { duration: 0.9, repeat: Infinity } : { duration: 0.7 }}
                        tabIndex={0}
                        style={{ outline: "none", cursor: "pointer", borderRadius: 7, padding: "6px 0" }}
                        title={row.assignments.includes(role)
                          ? pulse
                            ? "Conflict, ghost, or overload"
                            : "Assigned, healthy"
                          : "Not assigned"}
                        onClick={() => setActiveCell({ row, role })}
                        onDoubleClick={() => toggleAssignment(row.id, role)}
                        onKeyPress={e => e.key === "Enter" && setActiveCell({ row, role })}
                      >
                        {row.assignments.includes(role)
                          ? pulse
                            ? <FaExclamationTriangle color="#FF4848" />
                            : <FaCrown color="#FFD700" />
                          : ""}
                        <div style={{ marginTop: 1 }}>{cellMicro(row, role)}</div>
                      </motion.div>
                    </td>
                  );
                })}
                <td style={{ fontWeight: 900, color: row.fitScore > 85 ? "#1de682" : row.fitScore > 70 ? "#FFD700" : "#FF4848", fontSize: 17 }}>{row.fitScore}</td>
                <td>
                  {row.skills.map((s, i) => (
                    <span key={i} style={{ background: "#FFD700", color: "#232b39", fontWeight: 700, borderRadius: 7, padding: "2px 7px", marginRight: 2 }}>{s}</span>
                  ))}
                </td>
                <td>
                  <Button size="sm" style={{ background: "#FFD700", color: "#181e23", marginRight: 4 }} onClick={() => { startEdit(row); setEditCell(row.id); }}><FaEdit /></Button>
                  <Button size="sm" style={{ background: "#FF4848", color: "#fff" }} onClick={() => deleteRow(row.id)}><FaTrash /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Boardroom Heat Index */}
      <div style={{ background: "#232b39", borderRadius: 13, padding: "12px 18px", marginBottom: 15 }}>
        <b style={{ color: "#FFD700" }}>AI Boardroom Heat Index:</b>
        <div style={{ display: "flex", gap: 25, marginTop: 8 }}>
          {heatIndex.coverage.map((c, i) => (
            <div key={i} style={{
              color: c.risk > 0 ? "#FF4848" : c.count === 0 ? "#FFD700" : "#1de682", fontWeight: 900, fontSize: 15, background: "#181e23", padding: "6px 13px", borderRadius: 9
            }}>
              {c.role}: {c.count} {c.risk > 0 ? " (RISK!)" : c.count === 0 ? " (GAP!)" : ""}
            </div>
          ))}
          {heatIndex.ghost.length > 0 && <div style={{ color: "#FFD700", fontWeight: 900 }}><FaFlag /> Ghost Roles: {heatIndex.ghost.length}</div>}
        </div>
      </div>
      {/* AI & Scenario Logs */}
      <div style={{ background: "#232b39", borderRadius: 13, padding: "12px 18px", marginBottom: 20 }}>
        <b><FaRobot style={{ marginRight: 5 }} />AI Role Design Suggestions:</b>
        <ul style={{ marginTop: 3 }}>
          {aiLog.map((s, i) => <li key={i} style={{ color: "#1de682" }}>{s}</li>)}
        </ul>
      </div>
      <div style={{ background: "#232b39", borderRadius: 13, padding: "12px 18px", marginBottom: 20 }}>
        <b><FaSync style={{ marginRight: 6 }} />Scenario Actions Log:</b>
        <ul>
          {scenarioLog.length === 0 ? <li style={{ color: "#FFD70077" }}>No scenarios run yet.</li> :
            scenarioLog.map((l, i) =>
              <li key={i} style={{ color: "#FFD700" }}>{l}</li>
            )}
        </ul>
      </div>
      {/* Edit/Add Drawer */}
      <AnimatePresence>
        {(editCell !== null || newRow.name) && (
          <motion.div
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: "spring", stiffness: 110, damping: 13 }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, width: 400, zIndex: 105, background: "#101f18", boxShadow: "-6px 0 33px #FFD70099", padding: 32, display: "flex", flexDirection: "column"
            }}>
            <div style={{ fontWeight: 900, fontSize: 23, marginBottom: 9, color: "#FFD700" }}>{editCell !== null ? "Edit" : "Add"} Player/Coach</div>
            <input value={newRow.name} onChange={e => setNewRow({ ...newRow, name: e.target.value })} placeholder="Name" style={{ fontWeight: 700, fontSize: 17, marginBottom: 7, padding: 7, borderRadius: 7 }} />
            <div style={{ margin: "8px 0", fontWeight: 800 }}>Assignments:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 7 }}>
              {allRoles.map(role =>
                <span key={role} style={{
                  background: newRow.assignments.includes(role) ? "#FFD700" : "#232b39",
                  color: newRow.assignments.includes(role) ? "#181e23" : "#FFD700",
                  padding: "4px 13px", fontWeight: 800, borderRadius: 9, cursor: "pointer"
                }}
                  onClick={() => setNewRow({
                    ...newRow,
                    assignments: newRow.assignments.includes(role)
                      ? newRow.assignments.filter(t => t !== role)
                      : [...newRow.assignments, role]
                  })}
                >{role}</span>
              )}
            </div>
            <div style={{ fontWeight: 800, margin: "5px 0" }}>Skills/Traits:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
              {skillTags.map(tag =>
                <span key={tag} style={{
                  background: newRow.skills?.includes(tag) ? "#FFD700" : "#232b39",
                  color: newRow.skills?.includes(tag) ? "#181e23" : "#FFD700",
                  padding: "4px 13px", fontWeight: 800, borderRadius: 9, cursor: "pointer"
                }}
                  onClick={() => setNewRow({
                    ...newRow,
                    skills: newRow.skills?.includes(tag) ? newRow.skills.filter(t => t !== tag) : [...(newRow.skills || []), tag]
                  })}
                >{tag}</span>
              )}
            </div>
            <Button size="sm" style={{ background: "#1de682" }} onClick={saveEditRow}><FaUserCheck /> {editCell !== null ? "Save" : "Add"}</Button>
            <Button size="sm" style={{ background: "#FFD700", marginLeft: 10 }} onClick={() => { setEditCell(null); setNewRow({ name: "", assignments: [], skills: [], color: "#FFD700", fitScore: 55, core: false, shadow: false, view: "all", perf: 7.0, conf: 70 }); }}><FaUndo /> Cancel</Button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Cell Quick Drawer */}
      <AnimatePresence>
        {activeCell && (
          <motion.div
            initial={{ x: 390, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 390, opacity: 0 }}
            transition={{ type: "spring", stiffness: 110, damping: 13 }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, width: 400, zIndex: 104, background: "#101f18", boxShadow: "-6px 0 33px #FFD70099", padding: 34, display: "flex", flexDirection: "column"
            }}>
            <div style={{ fontWeight: 900, fontSize: 23, marginBottom: 7, color: "#1de682" }}>{activeCell.row.name}</div>
            <div style={{ fontSize: 16, marginBottom: 8, fontWeight: 800, color: "#FFD700" }}>{activeCell.role}</div>
            <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 15, marginBottom: 5 }}><FaBolt /> FIT SCORE: {activeCell.row.fitScore}</div>
            <div style={{ fontSize: 13, color: "#fff", marginBottom: 8 }}>Assignments: {activeCell.row.assignments.join(", ")}</div>
            <div style={{ fontWeight: 800, margin: "5px 0" }}>Skills/Traits:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 11 }}>
              {activeCell.row.skills.map((s, i) => (
                <span key={i} style={{ background: "#FFD700", color: "#232b39", fontWeight: 700, borderRadius: 7, padding: "2px 7px", marginRight: 2 }}>{s}</span>
              ))}
            </div>
            <div style={{ marginBottom: 7 }}>
              {cellPulse(activeCell.row, activeCell.role)
                ? <span style={{ color: "#FF4848", fontWeight: 700 }}><FaExclamationTriangle /> Conflict/ghost: Review now!</span>
                : <span style={{ color: "#1de682", fontWeight: 700 }}>Healthy assignment</span>
              }
            </div>
            <Button size="sm" style={{ background: "#FFD700", color: "#181e23", marginBottom: 9 }} onClick={() => toggleAssignment(activeCell.row.id, activeCell.role)}>{activeCell.row.assignments.includes(activeCell.role) ? "Unassign" : "Assign"}</Button>
            <Button size="sm" style={{ background: "#232b39", color: "#FFD700" }} onClick={() => setActiveCell(null)}><FaUndo /> Close</Button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Quick Cell Menu */}
      {cellMenu &&
        <div style={{
          position: "fixed", top: cellMenu.y, left: cellMenu.x, zIndex: 222,
          background: "#232b39", color: "#FFD700", borderRadius: 11, boxShadow: "0 4px 22px #FFD70044", padding: 17, fontWeight: 900
        }}>
          <div onClick={()=>handleCellMenuAction("rotate")} style={{cursor:"pointer",marginBottom:9}}><FaSync/> Rotate Role</div>
          <div onClick={()=>handleCellMenuAction("backup")} style={{cursor:"pointer",marginBottom:9}}><FaUserCheck/> Assign Backup</div>
          <div onClick={()=>handleCellMenuAction("clone")} style={{cursor:"pointer",marginBottom:9}}><FaPlus/> Clone Role to Player</div>
          <div onClick={()=>handleCellMenuAction("alert")} style={{cursor:"pointer"}}><FaFlag/> Send Alert</div>
          <div style={{marginTop:7,fontWeight:700,color:"#FFD70088",cursor:"pointer"}} onClick={()=>setCellMenu(null)}>Close</div>
        </div>
      }
      {/* Export notification */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed", top: 50, right: 50, zIndex: 120, background: "#232b39", color: "#FFD700", padding: 19, borderRadius: 12, boxShadow: "0 3px 18px #FFD70088", fontWeight: 900
            }}>
            <FaFileExport style={{ marginRight: 8 }} /> Exported! (PDF/PNG/Link/Slide available soon)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleIdentityClarityEngine;
