import React, { useState } from "react";
import { FaUsers, FaNetworkWired, FaComments, FaHandshake, FaUserCheck, FaUserFriends, FaBell, FaExclamationTriangle, FaFileExport, FaHistory, FaPlus, FaBrain, FaRobot, FaChartBar, FaCrown, FaEye } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// DEMO NETWORK (add your real data here)
const squad = [
  { id: 1, name: "Luka Vuković", role: "PG", group: "A", influence: 92, trust: 91, isolated: false, color: "#1de682", trend: [68,77,85,92] },
  { id: 2, name: "Ivan Horvat", role: "SG", group: "A", influence: 66, trust: 80, isolated: false, color: "#FFD700", trend: [58,63,65,66] },
  { id: 3, name: "Tomislav Šarić", role: "C", group: "B", influence: 54, trust: 53, isolated: true, color: "#FF4848", trend: [61,62,56,54] },
  { id: 4, name: "Marko Jurić", role: "SF", group: "B", influence: 81, trust: 74, isolated: false, color: "#3f8cfa", trend: [70,75,78,81] },
  { id: 5, name: "Dino Grgić", role: "PF", group: "A", influence: 62, trust: 61, isolated: false, color: "#1de682", trend: [44,52,58,62] },
  { id: 6, name: "Bruno Rašić", role: "Bench", group: "B", influence: 41, trust: 50, isolated: true, color: "#FFD700", trend: [48,47,43,41] },
];

const links = [
  { from: 1, to: 2, strength: 0.88 },
  { from: 1, to: 5, strength: 0.80 },
  { from: 2, to: 5, strength: 0.83 },
  { from: 2, to: 4, strength: 0.60 },
  { from: 1, to: 3, strength: 0.20 },
  { from: 3, to: 4, strength: 0.47 },
  { from: 5, to: 4, strength: 0.52 },
  { from: 4, to: 6, strength: 0.33 },
];

const cliqueGroups = [
  { group: "A", members: [1,2,5], color: "#FFD700" },
  { group: "B", members: [3,4,6], color: "#1de682" },
];

const eventsDemo = [
  { time: "Mon", type: "conflict", who: "Tomislav / Marko", note: "Bench dispute, coach mediation" },
  { time: "Tue", type: "chemistry", who: "Ivan / Luka", note: "Breakthrough play, trust up" },
  { time: "Wed", type: "1-on-1", who: "Coach / Bruno", note: "Buddy-up, reduce isolation" },
  { time: "Thu", type: "leadership", who: "Dino", note: "Stepped up as connector in team huddle" },
];

const interventions = [
  "Team Building", "Conflict Mediation", "Leadership Session", "Buddy-Up", "Coach 1-on-1", "Parent Outreach"
];

// COMMUNICATION MATRIX DEMO
const commMatrix = [
  [0, 7, 1, 3, 6, 0],
  [7, 0, 2, 4, 5, 2],
  [1, 2, 0, 3, 2, 0],
  [3, 4, 3, 0, 3, 4],
  [6, 5, 2, 3, 0, 3],
  [0, 2, 0, 4, 3, 0],
];

// Color helpers
const nodeColor = (influence, trust, isolated) => isolated ? "#FF4848" : influence>85 ? "#FFD700" : trust>75 ? "#1de682" : "#3f8cfa";
const edgeColor = s => s>0.8?"#FFD700":s>0.6?"#1de682":s>0.45?"#3f8cfa":"#FF4848";

function SocialCohesionAnalyticsStudio() {
  // Core state
  const [highlight, setHighlight] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [alert, setAlert] = useState("Isolate detected: Tomislav & Bruno. Assign buddy-up or coach intervention.");
  const [score, setScore] = useState({ cohesion: 82, trust: 76, conflict: 18, clique: 2, trend: [70,76,81,82] });
  const [intervention, setIntervention] = useState({ who: 3, what: interventions[0], status: "planned" });
  const [actions, setActions] = useState([]);
  const [showExport, setShowExport] = useState(false);
  const [popover, setPopover] = useState(null);
  const [exportOptions, setExportOptions] = useState({
    network: true, group: true, timeline: true, interventions: true, comm: true, ai: true
  });

  // Add intervention action
  const assignIntervention = () => {
    setActions([
      ...actions,
      { ...intervention, when: new Date().toLocaleDateString(), whoName: squad.find(s=>s.id===intervention.who).name }
    ]);
    setIntervention({ ...intervention, status: "planned" });
  };

  // Export report (mock)
  const exportReport = () => {
    setShowExport(true);
    setTimeout(() => setShowExport(false), 1300);
  };

  // Network visual (SVG-based, fixed for demo)
  function SocialNetworkMap() {
    const positions = [
      { x: 270, y: 60 }, { x: 110, y: 95 }, { x: 60, y: 270 },
      { x: 470, y: 260 }, { x: 370, y: 110 }, { x: 160, y: 320 }
    ];
    return (
      <svg width={540} height={390} style={{background:"#181e23",borderRadius:19,boxShadow:"0 2px 19px #FFD70044"}}>
        {/* Edges */}
        {links.map((l,i)=>{
          const fromIdx = squad.findIndex(s=>s.id===l.from);
          const toIdx = squad.findIndex(s=>s.id===l.to);
          const active = highlight && (l.from===highlight||l.to===highlight);
          const groupActive = activeGroup && cliqueGroups.find(g=>g.group===activeGroup).members.includes(l.from) && cliqueGroups.find(g=>g.group===activeGroup).members.includes(l.to);
          return (
            <line
              key={i}
              x1={positions[fromIdx].x} y1={positions[fromIdx].y}
              x2={positions[toIdx].x} y2={positions[toIdx].y}
              stroke={groupActive ? cliqueGroups.find(g=>g.group===activeGroup).color : edgeColor(l.strength)}
              strokeWidth={7*l.strength}
              opacity={active||groupActive?0.85:0.38}
              strokeDasharray={l.strength<0.6?"12":""}
            />
          );
        })}
        {/* Nodes */}
        {squad.map((s,i)=>(
          <g key={s.id}>
            <motion.circle
              cx={positions[i].x} cy={positions[i].y} r={36}
              fill={activeGroup && cliqueGroups.find(g=>g.group===activeGroup).members.includes(s.id) ? cliqueGroups.find(g=>g.group===activeGroup).color : nodeColor(s.influence,s.trust,s.isolated)}
              stroke={highlight===s.id ? "#FFD700" : "#232b39"}
              strokeWidth={highlight===s.id ? 8 : 5}
              initial={{opacity:0.7}}
              animate={{opacity:1,scale:highlight===s.id?1.13:1}}
              transition={{duration:0.34}}
              onMouseEnter={()=>setHighlight(s.id)}
              onMouseLeave={()=>setHighlight(null)}
              onClick={()=>setPopover(s.id)}
              style={{cursor:"pointer"}}
            />
            <text x={positions[i].x} y={positions[i].y+8}
              fontSize={16} fontWeight={900}
              fill="#181e23"
              textAnchor="middle"
            >{s.name.split(" ")[0]}</text>
            {s.isolated && (
              <FaExclamationTriangle style={{position:"absolute",left:positions[i].x-9,top:positions[i].y-35,fontSize:24,color:"#FF4848"}}/>
            )}
          </g>
        ))}
      </svg>
    );
  }

  // Popover for node
  function NodePopover() {
    if (popover==null) return null;
    const s = squad.find(x=>x.id===popover);
    return (
      <motion.div initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:50}}
        style={{
          position:"fixed",top:80,right:70,zIndex:300,background:"#232b39",borderRadius:18,padding:"27px 33px",color:"#fff",fontWeight:900,boxShadow:"0 2px 19px #FFD70055"
        }}>
        <div style={{fontSize:22,color:"#FFD700",marginBottom:5}}>{s.name} <span style={{color:"#1de682",fontSize:13,marginLeft:6}}>{s.role}</span></div>
        <div>Influence: <span style={{color:"#FFD700"}}>{s.influence}</span></div>
        <div>Trust: <span style={{color:"#1de682"}}>{s.trust}</span></div>
        <div>Isolated: <span style={{color:s.isolated?"#FF4848":"#1de682"}}>{s.isolated ? "YES":"No"}</span></div>
        <div>Influence Trend: {sparkline(s.trend)}</div>
        <div style={{marginTop:8}}><Button size="sm" style={{background:"#FFD700",color:"#181e23"}} onClick={()=>setPopover(null)}>Close</Button></div>
      </motion.div>
    );
  }

  // Clique/group visual
  function GroupBar() {
    return (
      <div style={{display:"flex",gap:13,marginBottom:11}}>
        {cliqueGroups.map(g=>
          <motion.div
            key={g.group}
            style={{
              background:activeGroup===g.group?g.color:"#232b39",
              color:activeGroup===g.group?"#181e23":g.color,
              fontWeight:900,fontSize:15,borderRadius:12,cursor:"pointer",padding:"8px 18px",boxShadow:"0 2px 11px #FFD70033",border:"2px solid #FFD700"
            }}
            whileTap={{scale:0.93}}
            whileHover={{scale:1.09}}
            onClick={()=>setActiveGroup(activeGroup===g.group?null:g.group)}
          >
            Group {g.group}
          </motion.div>
        )}
        <motion.div whileTap={{scale:0.93}} whileHover={{scale:1.07}}
          style={{background:"#181e23",color:"#FFD700",borderRadius:11,border:"2px solid #FFD700",fontWeight:900,padding:"8px 18px",cursor:"pointer"}}
          onClick={()=>setActiveGroup(null)}
        >All</motion.div>
      </div>
    );
  }

  // Comm matrix
  function CommMatrix() {
    return (
      <div style={{marginTop:7}}>
        <b style={{color:"#FFD700"}}>Communication Audit</b>
        <table style={{width:"100%",marginTop:4}}>
          <thead>
            <tr>
              <th></th>
              {squad.map(s=><th key={s.id} style={{color:"#FFD700",fontWeight:700}}>{s.name.split(" ")[0]}</th>)}
            </tr>
          </thead>
          <tbody>
            {squad.map((s,i)=>(
              <tr key={i}>
                <td style={{color:"#FFD700",fontWeight:700}}>{s.name.split(" ")[0]}</td>
                {commMatrix[i].map((v,j)=>(
                  <td key={j} style={{
                    background:v>=6?"#FFD700":v>=4?"#1de682":v>=2?"#3f8cfa":"#FF4848",
                    color:"#181e23",fontWeight:900,textAlign:"center",borderRadius:4
                  }}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{marginTop:5,fontWeight:700,color:"#FFD700"}}>Red = comm gap, Gold = strongest</div>
      </div>
    );
  }

  // Cohesion trend sparkline
  const sparkline = arr => (
    <svg width={84} height={20}>
      <polyline
        fill="none"
        stroke="#FFD700"
        strokeWidth={3}
        points={arr.map((v,ix)=>`${ix*21},${20-v/5}`).join(" ")}
      />
    </svg>
  );

  // AI Coach Alert Example
  const aiCoach = (
    <div style={{fontWeight:800,color:"#FFD700",marginBottom:6}}>
      <FaRobot style={{marginRight:6}}/>AI Coach: {alert}
      <Button style={{background:"#1de682",color:"#181e23",marginLeft:8}} onClick={()=>setAlert("Assigned buddy-up, monitor status for next session.")}><FaUserCheck/> Assign Buddy-Up</Button>
      <Button style={{background:"#FFD700",color:"#181e23",marginLeft:8}} onClick={()=>setAlert("Coach intervention scheduled for Bruno.")}><FaUserFriends/> Coach 1-on-1</Button>
    </div>
  );

  // Export builder
  function ExportBuilder() {
    return (
      <div style={{background:"#181e23",padding:"9px 17px",borderRadius:11,marginTop:7,display:"flex",gap:15,alignItems:"center"}}>
        <b style={{color:"#FFD700"}}>Export Builder:</b>
        {Object.keys(exportOptions).map(k=>
          <label key={k} style={{color:"#FFD700",fontWeight:800}}>
            <input type="checkbox" checked={exportOptions[k]} onChange={e=>setExportOptions({...exportOptions,[k]:e.target.checked})}/>
            {k[0].toUpperCase()+k.slice(1)}
          </label>
        )}
        <Button onClick={exportReport}><FaFileExport/> Export</Button>
      </div>
    );
  }

  // Group/AI note
  function GroupNote() {
    if (!activeGroup) return null;
    const grp = cliqueGroups.find(g=>g.group===activeGroup);
    return (
      <div style={{background:"#232b39",borderRadius:14,padding:"10px 16px",color:"#FFD700",marginTop:7,fontWeight:900}}>
        <FaCrown style={{marginRight:8}}/>Group {grp.group} ({grp.members.length} members) <span style={{color:"#1de682"}}>AI: {grp.group==="A" ? "Very high trust, stable core" : "Some conflict, at-risk isolate"}</span>
        <Button style={{background:"#FFD700",color:"#181e23",marginLeft:9}}>Strengthen</Button>
        <Button style={{background:"#FF4848",color:"#fff",marginLeft:7}}>Break Up</Button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight:"100vh",background:"linear-gradient(135deg,#0b3326 0%,#283E51 100%)",color:"#fff",
      fontFamily:"Segoe UI,sans-serif",padding:0,overflow:"hidden"
    }}>
      <div style={{display:"flex",alignItems:"center",gap:18,padding:"28px 0 22px 38px",background:"#181e23",boxShadow:"0 1px 16px #FFD70022"}}>
        <FaUsers style={{fontSize:31,color:"#FFD700"}}/>
        <span style={{fontSize:26,fontWeight:900,letterSpacing:1}}>Team Cohesion & Social Influence Studio</span>
        <span style={{color:"#1de682",fontWeight:900,marginLeft:13}}><FaNetworkWired style={{marginRight:8}}/>Social Analytics</span>
      </div>
      <div style={{display:"flex",gap:30,padding:"18px 0 0 38px"}}>
        {/* Social Network Map + Group/Highlight */}
        <div>
          <div style={{fontWeight:900,color:"#FFD700",fontSize:18,marginBottom:8}}><FaNetworkWired style={{marginRight:7}}/>Squad Social Map</div>
          <GroupBar/>
          <SocialNetworkMap/>
          <GroupNote/>
        </div>
        {/* Analytics/Action Panel */}
        <div style={{display:"flex",flexDirection:"column",gap:13,minWidth:350}}>
          {/* Cohesion Scoreboard */}
          <div style={{background:"#232b39",borderRadius:16,padding:"16px 18px"}}>
            <b style={{color:"#FFD700",fontSize:16}}><FaChartBar/> Cohesion Scoreboard</b>
            <div style={{display:"flex",gap:22,alignItems:"center",marginTop:10}}>
              <span style={{fontWeight:900,fontSize:15,color:"#FFD700"}}>Cohesion: {score.cohesion}</span>
              <span style={{fontWeight:900,fontSize:15,color:"#1de682"}}>Trust: {score.trust}</span>
              <span style={{fontWeight:900,fontSize:15,color:"#FFD700"}}>Conflict: {score.conflict}</span>
              <span style={{fontWeight:900,fontSize:15,color:"#FFD700"}}>Cliques: {score.clique}</span>
              <span>{sparkline(score.trend)}</span>
            </div>
            <div style={{marginTop:7,color:"#FFD700",fontWeight:700}}>Benchmark: +8% vs league avg</div>
          </div>
          {/* AI Alerts */}
          {aiCoach}
          {/* Interventions Action Tracker */}
          <div style={{background:"#232b39",borderRadius:16,padding:"13px 18px",marginBottom:4}}>
            <b style={{color:"#FFD700"}}><FaHandshake/> Assign Intervention</b>
            <div style={{display:"flex",gap:7,alignItems:"center",marginTop:6,flexWrap:"wrap"}}>
              <select value={intervention.who} onChange={e=>setIntervention({...intervention,who:Number(e.target.value)})} style={{fontWeight:700,borderRadius:7,padding:6}}>
                {squad.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}
              </select>
              <select value={intervention.what} onChange={e=>setIntervention({...intervention,what:e.target.value})} style={{fontWeight:700,borderRadius:7,padding:6}}>
                {interventions.map((t,i)=><option key={i}>{t}</option>)}
              </select>
              <Button size="sm" style={{background:"#FFD700",color:"#181e23"}} onClick={assignIntervention}><FaUserCheck/> Assign</Button>
            </div>
            <div style={{marginTop:9}}>
              <b style={{color:"#FFD700"}}>Assigned:</b>
              <ul>
                {actions.map((a,i)=>
                  <li key={i} style={{color:"#1de682",fontWeight:800}}>
                    {a.whoName}: {a.what} ({a.status}) <span style={{color:"#FFD700",marginLeft:5}}>{a.when}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          {/* Communication matrix */}
          <div style={{background:"#232b39",borderRadius:16,padding:"10px 17px",marginTop:2}}>
            <CommMatrix/>
          </div>
          {/* Benchmark Export */}
          <ExportBuilder/>
        </div>
      </div>
      {/* Conversation/Event Timeline + overlays */}
      <div style={{background:"#232b39",borderRadius:16,padding:"14px 22px",margin:"34px 48px 0 48px"}}>
        <b style={{color:"#FFD700",fontSize:16}}><FaHistory/> Social Event Timeline</b>
        <table style={{width:"100%",marginTop:6}}>
          <thead>
            <tr>
              <th style={{color:"#FFD700",fontWeight:700}}>When</th>
              <th style={{color:"#FFD700",fontWeight:700}}>Type</th>
              <th style={{color:"#FFD700",fontWeight:700}}>Who</th>
              <th style={{color:"#FFD700",fontWeight:700}}>Note</th>
            </tr>
          </thead>
          <tbody>
            {eventsDemo.map((e,i)=>
              <tr key={i}>
                <td style={{color:"#FFD700",fontWeight:700}}>{e.time}</td>
                <td style={{color:e.type==="conflict"?"#FF4848":e.type==="leadership"?"#FFD700":"#1de682",fontWeight:700}}>{e.type}</td>
                <td style={{color:"#1de682",fontWeight:700}}>{e.who}</td>
                <td style={{color:"#fff"}}>{e.note}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Node popover */}
      <AnimatePresence>{popover!==null && <NodePopover/>}</AnimatePresence>
      {/* Export Notification */}
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
            <FaFileExport style={{ marginRight: 8 }} /> Exported! (PDF/PNG/Excel coming soon)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Button helper
function Button({ children, ...props }) {
  return (
    <button style={{
      background: "linear-gradient(90deg,#FFD700 80%,#1de682 100%)",
      border: "none", borderRadius: 11, color: "#181e23", fontWeight: 900,
      fontSize: 17, padding: "12px 20px", margin: "0 8px 0 0", cursor: "pointer", boxShadow: "0 2px 10px #FFD70044"
    }} {...props}>{children}</button>
  );
}

export default SocialCohesionAnalyticsStudio;
