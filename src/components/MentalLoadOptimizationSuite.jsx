import React, { useState } from "react";
import { FaBrain, FaBolt, FaSync, FaRobot, FaFileExport, FaHistory, FaUserCheck, FaBed, FaClipboardCheck, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaUser, FaSearch, FaTasks, FaEye, FaBell, FaEnvelope, FaChartLine, FaPlus } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// DEMO DATA (all fake, extend as needed)
const initialPlayers = [
  { id: 1, name: "Luka Vuković", pos: "PG", load: 81, focus: 88, fatigue: 22, risk: 18, status: "Optimal", events: 2 },
  { id: 2, name: "Ivan Horvat", pos: "SG", load: 70, focus: 75, fatigue: 29, risk: 28, status: "Elevated", events: 4 },
  { id: 3, name: "Tomislav Šarić", pos: "C", load: 92, focus: 59, fatigue: 48, risk: 51, status: "Critical", events: 7 },
  { id: 4, name: "Marko Jurić", pos: "SF", load: 54, focus: 70, fatigue: 13, risk: 11, status: "Optimal", events: 1 },
];

const weekSessions = [
  { day: "Mon", session: "Practice (High)", id: 1 },
  { day: "Tue", session: "Tactics/Review", id: 2 },
  { day: "Wed", session: "Game", id: 3 },
  { day: "Thu", session: "Active Recovery", id: 4 },
  { day: "Fri", session: "Practice (Mod)", id: 5 },
  { day: "Sat", session: "Game", id: 6 },
  { day: "Sun", session: "Off", id: 7 },
];

const initialEvents = [
  { id: 1, player: "Luka Vuković", type: "focus", status: "resolved", when: "Mon AM", note: "Recovered quickly after distraction (coach cue)" },
  { id: 2, player: "Tomislav Šarić", type: "lapse", status: "urgent", when: "Wed Q3", note: "Lost focus in game, turnover, not yet resolved" },
  { id: 3, player: "Ivan Horvat", type: "lapse", status: "resolved", when: "Fri PM", note: "Missed rotation in drill, fixed after rest" },
  { id: 4, player: "Marko Jurić", type: "focus", status: "resolved", when: "Sat", note: "Maintained focus under crowd pressure" },
  { id: 5, player: "Tomislav Šarić", type: "lapse", status: "unresolved", when: "Sat Q4", note: "Lapse, possible fatigue overload" },
];

const interventions = [
  "Mindfulness Drill", "Coach 1-on-1", "Nap Window", "Focused Warmup", "Nutrition Protocol", "No Tech Hour"
];

const colorByStatus = s =>
  s === "Optimal" ? "#1de682" : s === "Elevated" ? "#FFD700" : s === "Critical" ? "#FF4848" : "#232b39";

const sparkline = arr => (
  <svg width={84} height={22}>
    <polyline
      fill="none"
      stroke="#FFD700"
      strokeWidth={3}
      points={arr.map((v,ix)=>`${ix*21},${22-v/7}`).join(" ")}
    />
  </svg>
);

export default function MentalLoadAttentionSuite() {
  // Core state
  const [players, setPlayers] = useState(initialPlayers);
  const [events, setEvents] = useState(initialEvents);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("");
  const [calendar, setCalendar] = useState(() =>
    weekSessions.map(session => ({
      ...session,
      playerLoads: players.map(p => ({
        ...p,
        load: Math.max(0, Math.min(100, p.load + Math.floor(Math.random() * 18 - 8))),
        status: p.risk > 50 ? "Critical" : p.risk > 20 ? "Elevated" : "Optimal"
      }))
    }))
  );
  const [ai, setAI] = useState(null);
  const [intervAssign, setIntervAssign] = useState({ player: 1, type: interventions[0], status: "in progress" });
  const [assignments, setAssignments] = useState([]);
  const [showExport, setShowExport] = useState(false);
  const [playerDash, setPlayerDash] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [note, setNote] = useState("");
  const [playerNotes, setPlayerNotes] = useState({});
  const [compare, setCompare] = useState([]);

  // Demo spark and focusEvents for dashboard
  const demoSpark = [81, 72, 67, 80, 85, 90, 87];
  const focusEvents = [
    { time: "Mon", type: "focus", note: "Recovered after distraction" },
    { time: "Wed", type: "lapse", note: "Lost focus, turnover" },
    { time: "Thu", type: "recovery", note: "Responded to intervention" },
    { time: "Sat", type: "focus", note: "Clutch Q4" },
  ];

  // Functions for actions
  const assignIntervention = () => {
    setAssignments([
      ...assignments,
      { ...intervAssign, date: new Date().toLocaleDateString(), playerName: players.find(p => p.id === intervAssign.player)?.name }
    ]);
    setIntervAssign({ ...intervAssign, status: "in progress" });
  };

  const runAI = () => {
    // Simulate scenario: double-load on Tomislav, rest for Marko
    let nextPlayers = players.map(p =>
      p.id === 3
        ? { ...p, load: Math.min(100, p.load + 17), risk: Math.min(100, p.risk + 23), status: "Critical" }
        : p.id === 4
        ? { ...p, load: Math.max(0, p.load - 12), risk: Math.max(0, p.risk - 11), status: "Optimal" }
        : p
    );
    setPlayers(nextPlayers);
    setAI({
      summary:
        "AI: Tomislav at cognitive critical load, immediate rest/intervention needed. Marko optimized for high-focus minutes. Luka and Ivan require standard attention drills.",
      details: [
        { name: "Tomislav Šarić", action: "Rest + Mindfulness", warning: "Critical Risk" },
        { name: "Marko Jurić", action: "Ready for big moments", warning: "None" }
      ]
    });
  };

  const exportSuite = () => {
    setShowExport(true);
    setTimeout(() => setShowExport(false), 1600);
  };

  // Player dashboard open/close
  const openPlayerDash = (id) => setPlayerDash(id);
  const closePlayerDash = () => setPlayerDash(null);

  // Advanced Compare (pick up to 4)
  const toggleCompare = id => setCompare(compare.includes(id) ? compare.filter(x=>x!==id) : [...compare, id]);

  // Squad Forecast & Simulation
  const runForecast = () => {
    let base = players.map(p => ({
      ...p,
      forecast: [p.load, Math.max(0,p.load-7), Math.min(100,p.load+15), Math.max(0,p.load-4)]
    }));
    let msg = "AI: Next 2 weeks—Tomislav and Ivan will hit load threshold during double-game stretch. Schedule extra rest and mindfulness drills.";
    setForecast({ msg, base });
  };

  // Staff Note
  const addPlayerNote = (id) => {
    setPlayerNotes({
      ...playerNotes,
      [id]: [...(playerNotes[id]||[]), { note, time: new Date().toLocaleTimeString() }]
    });
    setNote("");
  };

  // Event alerting logic
  const unresolved = events.filter(e=>e.status==="urgent"||e.status==="unresolved");

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg,#283E51 0%,#0b3326 100%)", color: "#fff",
      fontFamily: "Segoe UI,sans-serif", padding: 32, overflow: "hidden"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20, flexWrap: "wrap" }}>
        <FaBrain style={{ fontSize: 31, color: "#FFD700" }} />
        <span style={{ fontSize: 25, fontWeight: 900, letterSpacing: 1 }}>Mental Load & Attention Optimization Suite</span>
        <span style={{ color: "#1de682", fontWeight: 900, marginLeft: 13 }}><FaRobot style={{ marginRight: 8 }} />AI-Driven Cognitive Board</span>
        <Button onClick={exportSuite}><FaFileExport style={{ marginRight: 7 }} />Export Report</Button>
      </div>
      {/* Elite Alerts */}
      {unresolved.length > 0 && (
        <div style={{background:"#FFD700", color:"#181e23",fontWeight:900,padding:"12px 23px",marginBottom:18,borderRadius:13,boxShadow:"0 3px 19px #FFD70055"}}>
          <FaBell style={{marginRight:9}}/>
          <span style={{fontWeight:900}}>Action Required: </span>
          {unresolved.map(e=>`${e.player}: ${e.note}`).join(" | ")}
        </div>
      )}
      {/* Status Board */}
      <div style={{ background: "#232b39", borderRadius: 18, padding: "18px 22px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <FaSearch style={{ color: "#FFD700" }} />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search athlete or position..."
            style={{ fontWeight: 700, borderRadius: 7, padding: 7, fontSize: 16, minWidth: 200 }}
          />
        </div>
        <div style={{ display: "flex", gap: 27, marginTop: 18, flexWrap: "wrap" }}>
          {players
            .filter(
              p =>
                (!filter || p.name.toLowerCase().includes(filter.toLowerCase()) || p.pos.toLowerCase().includes(filter.toLowerCase()))
            )
            .map(p =>
              <motion.div key={p.id}
                style={{
                  background: "#181e23",
                  borderRadius: 16, minWidth: 200, padding: "19px 17px", fontWeight: 900, color: "#fff", boxShadow: "0 2px 13px #FFD70044", position: "relative"
                }}>
                <div style={{ fontSize: 18, color: "#FFD700" }}>{p.name} <span style={{ color: "#1de682", fontSize: 13, marginLeft: 6 }}>{p.pos}</span></div>
                <div style={{ fontWeight: 800, fontSize: 13, color: colorByStatus(p.status), marginTop: 4 }}>
                  {p.status}
                  {p.status === "Critical" && <FaExclamationTriangle style={{ color: "#FF4848", marginLeft: 4 }} />}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 9 }}>
                  <div>Load: <span style={{ color: "#FFD700" }}>{p.load}</span></div>
                  <div>Focus: <span style={{ color: "#1de682" }}>{p.focus}</span></div>
                  <div>Fatigue: <span style={{ color: "#FF4848" }}>{p.fatigue}</span></div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#FFD700", marginTop: 2 }}>Risk Score: {p.risk}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#FFD700", marginTop: 2 }}>Events: {p.events}</div>
                <Button size="sm" style={{ background: "#1de682", color: "#181e23", position: "absolute", top: 13, right: 13 }} onClick={() => openPlayerDash(p.id)}><FaEye/> Dashboard</Button>
                <Button size="sm" style={{ background: "#FFD700", color: "#181e23", position: "absolute", top: 13, right: 110 }} onClick={() => toggleCompare(p.id)}>{compare.includes(p.id)?"Remove":"Compare"}</Button>
              </motion.div>
          )}
        </div>
      </div>
      {/* Squad Advanced Compare Table */}
      {compare.length>=2 && (
        <div style={{background:"#232b39",borderRadius:13,padding:"11px 17px",marginBottom:13}}>
          <b style={{color:"#FFD700"}}><FaTasks/> Advanced Squad Compare</b>
          <table style={{width:"100%",marginTop:9}}>
            <thead>
              <tr>
                <th style={{color:"#FFD700",fontWeight:900}}>Player</th>
                <th style={{color:"#FFD700",fontWeight:900}}>Load</th>
                <th style={{color:"#FFD700",fontWeight:900}}>Focus</th>
                <th style={{color:"#FFD700",fontWeight:900}}>Fatigue</th>
                <th style={{color:"#FFD700",fontWeight:900}}>Risk</th>
                <th style={{color:"#FFD700",fontWeight:900}}>Events</th>
              </tr>
            </thead>
            <tbody>
              {players.filter(p=>compare.includes(p.id)).map(p=>
                <tr key={p.id}>
                  <td style={{color:"#1de682",fontWeight:900}}>{p.name}</td>
                  <td style={{color:"#FFD700",fontWeight:900}}>{p.load}</td>
                  <td style={{color:"#1de682",fontWeight:900}}>{p.focus}</td>
                  <td style={{color:"#FF4848",fontWeight:900}}>{p.fatigue}</td>
                  <td style={{color:colorByStatus(p.status),fontWeight:900}}>{p.risk}</td>
                  <td style={{color:"#FFD700",fontWeight:900}}>{p.events}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Individual Cognitive Dashboard */}
      <AnimatePresence>
      {playerDash && (
        <motion.div
          initial={{x:440,opacity:0}}
          animate={{x:0,opacity:1}}
          exit={{x:440,opacity:0}}
          transition={{type:"spring",stiffness:120,damping:14}}
          style={{
            position:"fixed",top:0,right:0,bottom:0,width:460,zIndex:99,background:"#181e23",boxShadow:"-6px 0 30px #FFD70099",padding:35,overflowY:"auto",color:"#fff"
          }}>
          <div style={{fontWeight:900,fontSize:25,color:"#FFD700",marginBottom:7}}>{players.find(p=>p.id===playerDash).name}</div>
          <div style={{margin:"11px 0 14px 0"}}>{sparkline(demoSpark)}</div>
          <div style={{fontWeight:800,fontSize:15,marginBottom:6}}>Events:</div>
          <ul>
            {focusEvents.map((e,i)=>
              <li key={i} style={{color:e.type==="lapse"?"#FF4848":"#1de682",fontWeight:800}}>
                {e.time}: {e.note}
              </li>
            )}
          </ul>
          <div style={{margin:"14px 0 8px 0",color:"#FFD700",fontWeight:800}}><FaRobot style={{marginRight:5}}/>AI Profile Note:</div>
          <div style={{marginBottom:7}}>
            This player exhibits {players.find(p=>p.id===playerDash).focus>80?"elite sustained focus":"inconsistent focus"}.<br/>
            Triggers: <b>crowd noise, late game</b>. Recovery: <b>sleep, 1-on-1 coach cue</b>.
          </div>
          <div style={{fontWeight:800,margin:"11px 0 7px 0"}}>Historical Interventions:</div>
          <ul>
            <li>Fri: Mindfulness Drill (resolved)</li>
            <li>Wed: Coach 1-on-1 (pending)</li>
          </ul>
          <div style={{margin:"14px 0 8px 0",color:"#FFD700",fontWeight:800}}>Staff Notes:</div>
          <ul>
            {(playerNotes[playerDash]||[]).map((n,i)=>
              <li key={i}>{n.time}: {n.note}</li>
            )}
          </ul>
          <div style={{margin:"8px 0"}}>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Add staff note..." style={{borderRadius:7,padding:6}}/>
            <Button size="sm" style={{background:"#1de682",color:"#181e23",marginLeft:8}} onClick={()=>addPlayerNote(playerDash)}><FaPlus/> Add</Button>
          </div>
          <Button onClick={closePlayerDash} style={{background:"#FFD700",color:"#181e23",marginTop:10}}>Close</Button>
        </motion.div>
      )}
      </AnimatePresence>
      {/* Microcycle Calendar */}
      <div style={{ background: "#232b39", borderRadius: 16, padding: "15px 22px", marginBottom: 16 }}>
        <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 18, marginBottom: 8 }}><FaCalendarAlt style={{ marginRight: 7 }} />Microcycle Cognitive Load Calendar</div>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ color: "#FFD700", fontWeight: 900, fontSize: 15, padding: "8px 5px" }}>Session/Day</th>
              {players.map(p => <th key={p.id} style={{ color: "#1de682", fontWeight: 900, fontSize: 15, padding: "7px 5px" }}>{p.name.split(" ")[0]}</th>)}
            </tr>
          </thead>
          <tbody>
            {calendar.map(s => (
              <tr key={s.id} style={{ borderBottom: "2px solid #283E51" }}>
                <td style={{ fontWeight: 900, color: "#FFD700", padding: "7px 5px" }}>{s.day}<br /><span style={{ color: "#FFD700", fontWeight: 600, fontSize: 13 }}>{s.session}</span></td>
                {s.playerLoads.map((pl, i) => (
                  <td key={pl.id}
                    style={{
                      background: colorByStatus(pl.status),
                      color: "#181e23", fontWeight: 900, textAlign: "center",
                      borderRadius: 7, fontSize: 15, padding: "7px 0"
                    }}
                    title={`Load: ${pl.load} | Focus: ${pl.focus || "?"} | Risk: ${pl.risk || "?"}`}
                  >
                    {pl.load}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Attention Lapse & Focus Log */}
      <div style={{ background: "#232b39", borderRadius: 16, padding: "11px 17px", marginBottom: 14 }}>
        <b style={{ color: "#FFD700" }}><FaHistory /> Attention Lapse & Focus Recovery Log</b>
        <table style={{ width: "100%", marginTop: 7 }}>
          <thead>
            <tr>
              <th style={{ color: "#FFD700", fontWeight: 700 }}>Athlete</th>
              <th style={{ color: "#FFD700", fontWeight: 700 }}>Type</th>
              <th style={{ color: "#FFD700", fontWeight: 700 }}>Status</th>
              <th style={{ color: "#FFD700", fontWeight: 700 }}>When</th>
              <th style={{ color: "#FFD700", fontWeight: 700 }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {events.map(e => (
              <tr key={e.id}>
                <td style={{ color: "#1de682", fontWeight: 700 }}>{e.player}</td>
                <td style={{ color: e.type === "lapse" ? "#FF4848" : "#1de682", fontWeight: 700 }}>{e.type}</td>
                <td style={{ color: e.status === "urgent" ? "#FF4848" : e.status === "resolved" ? "#1de682" : "#FFD700", fontWeight: 700 }}>{e.status}</td>
                <td style={{ color: "#FFD700" }}>{e.when}</td>
                <td style={{ color: "#fff" }}>{e.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* AI Prescription & Scenario Simulator */}
      <div style={{ background: "#232b39", borderRadius: 16, padding: "12px 17px", marginBottom: 14 }}>
        <b style={{ color: "#FFD700" }}><FaRobot /> AI Prescription & Scenario Simulator</b>
        <div style={{ display: "flex", gap: 11, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
          <Button style={{ background: "#1de682", color: "#181e23" }} onClick={runAI}><FaBolt /> Simulate</Button>
          {ai && (
            <div style={{ marginLeft: 12 }}>
              <b style={{ color: "#FFD700" }}>AI Summary:</b> {ai.summary}
              <ul>
                {ai.details.map((d, i) => (
                  <li key={i} style={{ color: d.warning === "Critical Risk" ? "#FF4848" : "#1de682", fontWeight: 800 }}>
                    {d.name}: {d.action} {d.warning && <span style={{ color: "#FFD700", marginLeft: 7 }}>{d.warning}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* Task Assignment & Compliance */}
      <div style={{ background: "#232b39", borderRadius: 16, padding: "12px 17px", marginBottom: 14 }}>
        <b style={{ color: "#FFD700" }}><FaClipboardCheck /> Assign Attention Intervention</b>
        <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
          <select value={intervAssign.player} onChange={e => setIntervAssign({ ...intervAssign, player: Number(e.target.value) })} style={{ fontWeight: 700, borderRadius: 7, padding: 6 }}>
            {players.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}
          </select>
          <select value={intervAssign.type} onChange={e => setIntervAssign({ ...intervAssign, type: e.target.value })} style={{ fontWeight: 700, borderRadius: 7, padding: 6 }}>
            {interventions.map((t, i) => <option key={i}>{t}</option>)}
          </select>
          <Button size="sm" style={{ background: "#FFD700", color: "#181e23" }} onClick={assignIntervention}><FaUserCheck /> Assign</Button>
        </div>
        <div style={{ marginTop: 9 }}>
          <b style={{ color: "#FFD700" }}>Assignments:</b>
          <ul>
            {assignments.map((a, i) =>
              <li key={i} style={{ color: "#1de682", fontWeight: 800 }}>
                {a.playerName}: {a.type} ({a.status}) <span style={{ color: "#FFD700", marginLeft: 5 }}>{a.date}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      {/* Squad Cognitive Health Heatmap */}
      <div style={{ background: "#232b39", borderRadius: 16, padding: "11px 17px", marginBottom: 14 }}>
        <b style={{ color: "#FFD700" }}><FaTasks /> Squad Cognitive Health Heatmap</b>
        <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 9 }}>
          <thead>
            <tr>
              <th style={{ color: "#FFD700", fontWeight: 700 }}>Player</th>
              {weekSessions.map(s => <th key={s.id} style={{ color: "#1de682", fontWeight: 700 }}>{s.day}</th>)}
            </tr>
          </thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id}>
                <td style={{ color: "#FFD700", fontWeight: 900 }}>{p.name}</td>
                {weekSessions.map(s => {
                  let status = Math.random() > 0.85 ? "Critical" : Math.random() > 0.5 ? "Optimal" : "Elevated";
                  let color = status === "Critical" ? "#FF4848" : status === "Elevated" ? "#FFD700" : "#1de682";
                  return (
                    <td key={s.id} style={{ background: color, color: "#181e23", fontWeight: 900, borderRadius: 5, textAlign: "center" }}>
                      {status}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* SQUAD FORECAST */}
      <div style={{ background: "#232b39", borderRadius: 16, padding: "15px 22px", marginBottom: 16 }}>
        <div style={{ fontWeight: 900, color: "#FFD700", fontSize: 18, marginBottom: 8 }}><FaChartLine style={{ marginRight: 7 }} />Squad Load Forecast & Simulation</div>
        <Button style={{ background: "#FFD700", color: "#181e23" }} onClick={runForecast}><FaSync/> Run Forecast</Button>
        {forecast && (
          <div style={{marginTop:13,fontWeight:900}}>
            <div style={{color:"#FFD700",marginBottom:7}}>{forecast.msg}</div>
            <div style={{display:"flex",gap:9}}>
              {forecast.base.map(p=>
                <div key={p.id} style={{background:"#181e23",borderRadius:9,padding:"9px 8px",color:"#FFD700",fontWeight:900}}>
                  {p.name.split(" ")[0]}<br/>{p.forecast.map((f,i)=>
                    <span key={i} style={{marginRight:4,color:i===2?"#FF4848":i===3?"#1de682":"#FFD700"}}>{f}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
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
            <FaFileExport style={{ marginRight: 8 }} /> Exported! (PDF/PNG, custom report builder soon)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Button helper (optional if needed elsewhere)
function Button({ children, ...props }) {
  return (
    <button style={{
      background: "linear-gradient(90deg,#FFD700 80%,#1de682 100%)",
      border: "none", borderRadius: 11, color: "#181e23", fontWeight: 900,
      fontSize: 17, padding: "12px 20px", margin: "0 8px 0 0", cursor: "pointer", boxShadow: "0 2px 10px #FFD70044"
    }} {...props}>{children}</button>
  );
}
