import React, { useState } from "react";
import { FaUserTie, FaArrowUp, FaArrowDown, FaArrowRight, FaChartLine, FaRobot, FaBolt, FaSmile, FaFrown, FaUsers,
     FaCheckCircle, FaExclamationTriangle, FaPlayCircle, FaUndo, FaFileExport, FaLayerGroup, FaUserGraduate, FaStar,
      FaCrown, FaSearch, FaRedo, FaPulse, FaFlag, FaMagic, FaFire, FaShieldAlt, FaHistory } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Branded Button (with pulse effect for key actions)
const Button = ({ children, onClick, style = {}, size, pulse, ...props }) => (
  <motion.button
    onClick={onClick}
    style={{
      border: 'none', borderRadius: 9,
      padding: size === 'sm' ? '9px 15px' : '18px 23px',
      background: pulse
        ? "radial-gradient(circle,#FFD700 55%,#1de682 100%)"
        : 'linear-gradient(135deg,#0b3326 0%,#1de682 100%)',
      color: '#111', fontWeight: 900, fontSize: size === 'sm' ? 17 : 20,
      cursor: 'pointer', letterSpacing: 0.6, boxShadow: "0 2px 16px #1de68233",
      outline: "none", ...style
    }}
    animate={pulse ? { scale: [1, 1.07, 1] } : false}
    transition={pulse ? { duration: 0.9, repeat: Infinity, repeatType: "mirror" } : undefined}
    {...props}
  >{children}</motion.button>
);

// Avatar with colored border, pulse if high-potential or risk
const Avatar = ({ name, color, pulse }) => {
  const initials = name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.15, 1] } : false}
      transition={pulse ? { duration: 1.3, repeat: Infinity, repeatType: "mirror" } : undefined}
      style={{
        width: 44, height: 44, borderRadius: 20, background: color, color: "#fff",
        fontWeight: 900, fontSize: 23, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: pulse ? "0 0 12px 4px #FFD700" : "0 2px 10px #FFD70044", border: "3.5px solid #fff"
      }}>{initials}</motion.div>
  );
};

// --- Demo data (enriched)
const demoNodes = [
  { id: 1, name: "Luka Vuković", role: "SENIOR PG", type: "Athlete", team: "U18", phase: "First Team", morale: 7, readiness: 8, fit: 9, potential: 9, mentor: 3, mentee: 2, history: [7,7,8,7,9], feedback: ["Coach: Leadership improving", "Peer: Good morale last month"], color: "#17a861" },
  { id: 2, name: "Ivan Horvat", role: "ROTATION GUARD", type: "Athlete", team: "U18", phase: "First Team", morale: 5, readiness: 6, fit: 7, potential: 7, mentor: 1, mentee: null, history: [5,5,6,5,6], feedback: ["Coach: Needs focus", "Peer: Getting better"], color: "#0fbe9f" },
  { id: 3, name: "Marko Jurić", role: "HEAD COACH", type: "Coach", team: "U18", phase: "Senior", morale: 8, readiness: 10, fit: 8, potential: 8, mentor: null, mentee: 4, history: [8,9,9,10,10], feedback: ["Board: Trusted by athletes"], color: "#3f8cfa" },
  { id: 4, name: "Petar Božić", role: "ASSISTANT COACH", type: "Coach", team: "U18", phase: "Senior", morale: 6, readiness: 8, fit: 7, potential: 9, mentor: 3, mentee: null, history: [6,6,7,7,8], feedback: ["Coach: Ready for more responsibility"], color: "#ffd700" },
  { id: 5, name: "Nikola Dukić", role: "YOUTH STAR", type: "Athlete", team: "U16", phase: "Development", morale: 8, readiness: 9, fit: 6, potential: 10, mentor: null, mentee: null, history: [8,8,9,10,10], feedback: ["Coach: Needs to be challenged"], color: "#1de682" },
  { id: 6, name: "Tomislav Šarić", role: "BENCH FWD", type: "Athlete", team: "U18", phase: "First Team", morale: 4, readiness: 5, fit: 5, potential: 8, mentor: 2, mentee: null, history: [4,5,5,5,5], feedback: ["Coach: Stuck in role"], color: "#f09e00" },
  { id: 7, name: "Simec", role: "SPORTS DIRECTOR", type: "Coach", team: "Admin", phase: "Management", morale: 9, readiness: 9, fit: 10, potential: 10, mentor: null, mentee: 3, history: [9,9,10,10,10], feedback: ["Board: Key for succession"], color: "#232b39" },
];

// Constants
const phases = ["Development", "First Team", "Senior", "Management"];
const teams = ["U18", "U16", "Admin"];
const overlays = [
  {key:"constellation", label:"Org Constellation", icon:<FaLayerGroup/>},
  {key:"succession", label:"Succession Map", icon:<FaShieldAlt/>},
  {key:"morale", label:"Morale Map", icon:<FaSmile/>},
  {key:"potential", label:"Potential Heat", icon:<FaFire/>},
  {key:"flight", label:"Flight Risk Radar", icon:<FaFlag/>}
];

// Helpers
function moraleIcon(m) { return m>=8?<FaSmile style={{color:"#1de682"}}/>:m>=5?<FaSmile style={{color:"#FFD700"}}/>:<FaFrown style={{color:"#FF4848"}}/>; }
function readinessIcon(r) { return r>=8?<FaCheckCircle style={{color:"#1de682"}}/>:r>=5?<FaChartLine style={{color:"#FFD700"}}/>:<FaExclamationTriangle style={{color:"#FF4848"}}/>; }
function fitIcon(f) { return f>=8?<FaCrown style={{color:"#fff"}}/>:f>=5?<FaStar style={{color:"#FFD700"}}/>:<FaBolt style={{color:"#FF4848"}}/>; }
function getPhaseColor(p) {
  if (p==="Development") return "#0fbe9f";
  if (p==="First Team") return "#1de682";
  if (p==="Senior") return "#ffd700";
  if (p==="Management") return "#3f8cfa";
  return "#232b39";
}

function nodeEdges(nodes, laidOut) {
  let out = [];
  laidOut.forEach(n=>{
    if(n.mentor) {
      const target = laidOut.find(m=>m.id===n.mentor);
      if(target) out.push({from:n.id, to:target.id, type:"mentor"});
    }
    if(n.mentee) {
      const target = laidOut.find(m=>m.id===n.mentee);
      if(target) out.push({from:n.id, to:target.id, type:"mentee"});
    }
  });
  return out;
}

// Animated node layout (force-directed effect)
function layoutNodes(nodes, teamFilter, phaseFilter, search, overlay) {
  const cols = phases.filter(p=>!phaseFilter||phaseFilter===p);
  let filtered = nodes.filter(n=>(!teamFilter||n.team===teamFilter) && (!phaseFilter||n.phase===phaseFilter));
  if(search) filtered = filtered.filter(n=>(n.name.toLowerCase().includes(search.toLowerCase())||n.role.toLowerCase().includes(search.toLowerCase())));
  // Cluster by phase, separate y by role/morale/overlay
  return filtered.map((n,i) => {
    let y=110 + (i%4)*110 + (n.type==="Coach"?-24:0);
    // Overlay: morale/potential/flight/succession etc.
    if(overlay==="morale") y += (10-n.morale)*5;
    if(overlay==="potential") y += (10-n.potential)*9;
    if(overlay==="flight") y += (n.morale<5||n.fit<6)?40:0;
    if(overlay==="succession") y += (n.mentor||n.mentee)?-14:0;
    return {...n, x: 170+cols.indexOf(n.phase)*250, y };
  });
}

const RoleEvolutionPromotionSimulator = () => {
  const [nodes, setNodes] = useState(demoNodes);
  const [team, setTeam] = useState("");
  const [phase, setPhase] = useState("");
  const [search, setSearch] = useState("");
  const [activeNode, setActiveNode] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [scenarioLog, setScenarioLog] = useState([]);
  const [showMap, setShowMap] = useState("constellation");
  const [baseNodes, setBaseNodes] = useState(demoNodes);
  const [snapshots, setSnapshots] = useState([]);

  // Animated layout
  const laidOut = layoutNodes(nodes, team, phase, search, showMap);
  const edges = nodeEdges(nodes, laidOut);

  // Quick scenario: promote/demote
  const handleMove = (id, dir) => {
    setNodes(nodes.map(n=>{
      if(n.id!==id) return n;
      let curIdx = phases.indexOf(n.phase);
      let newIdx = dir==="up"?Math.min(phases.length-1, curIdx+1):Math.max(0, curIdx-1);
      return {...n, phase: phases[newIdx], morale: dir==="up"?Math.min(n.morale+1,10):Math.max(n.morale-1,1)};
    }));
    setScenarioLog([...scenarioLog, {
      ts: new Date().toLocaleTimeString(),
      action: `${nodes.find(x=>x.id===id).name} ${dir==="up"?"promoted":"demoted"} to ${phases[dir==="up"?Math.min(phases.length-1,phases.indexOf(nodes.find(x=>x.id===id).phase)+1):Math.max(0,phases.indexOf(nodes.find(x=>x.id===id).phase)-1)]}`,
      node: id
    }]);
  };

  // Assign mentor/flag as risk
  const handleFlagRisk = id => {
    setNodes(nodes.map(n=>n.id===id?{...n, fit:Math.max(n.fit-2,1)}:n));
    setScenarioLog([...scenarioLog, {ts: new Date().toLocaleTimeString(), action: `${nodes.find(n=>n.id===id).name} flagged as role risk`, node:id}]);
  };

  // Save org snapshot
  const handleSnapshot = () => {
    setSnapshots([...snapshots, {
      nodes: JSON.parse(JSON.stringify(nodes)),
      ts: new Date().toLocaleTimeString()
    }]);
  };

  // Export SVG (stub)
  const exportSVG = () => {
    alert("Snapshot SVG export coming soon! Will save current org constellation as PNG/SVG for the boardroom.");
  };

  // Reset
  const handleReset = () => {
    setNodes(baseNodes);
    setScenarioLog([]);
    setSnapshots([]);
    setSearch("");
    setTeam("");
    setPhase("");
    setShowMap("constellation");
  };

  // Flight risk: morale < 5 or fit < 6
  const flightRisks = nodes.filter(n=>n.morale<5||n.fit<6);

  // Legend overlays
  const overlayLabel = overlays.find(o=>o.key===showMap)?.label || "Org Constellation";

  return (
    <div style={{
      minHeight:"100vh",background:"linear-gradient(135deg,#071612 0%,#193b3a 100%)",color:"#fff",
      fontFamily:"Segoe UI,sans-serif",padding:27,overflow:"hidden"
    }}>
      <div style={{display:"flex",alignItems:"center",gap:15,marginBottom:15}}>
        <FaLayerGroup style={{fontSize:34,color:"#FFD700"}}/>
        <span style={{fontSize:31,fontWeight:900,letterSpacing:1}}>Role Evolution & Promotion Constellation</span>
        <span style={{color:"#1de682",fontWeight:900,marginLeft:13}}><FaRobot style={{marginRight:7}}/>AI Boardroom View</span>
        <Button size="sm" style={{marginLeft:15,background:"#FFD700",color:"#111"}} onClick={exportSVG}><FaFileExport style={{marginRight:4}}/>Export SVG</Button>
        <Button size="sm" style={{marginLeft:9,background:"#232b39"}} onClick={handleSnapshot}><FaMagic style={{marginRight:3}}/>Snapshot</Button>
        <Button size="sm" style={{marginLeft:9,background:"#232b39"}} onClick={handleReset}><FaRedo style={{marginRight:3}}/>Reset</Button>
      </div>
      {/* Boardroom overlays, overlays/legend */}
      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}>
        {overlays.map(o=>
          <Button key={o.key} size="sm" style={{
            background: showMap===o.key ? "#FFD700":"#0b3326",
            color: showMap===o.key ? "#111":"#fff", fontWeight:800,marginRight:7
          }} onClick={()=>setShowMap(o.key)}>{o.icon} {o.label}</Button>
        )}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name/role" style={{marginLeft:13,padding:8,borderRadius:8,width:165,fontWeight:700,background:"#fff",color:"#111"}}/>
        <span style={{color:"#FFD700",fontWeight:800,marginLeft:16}}>Team:</span>
        <select value={team} onChange={e=>setTeam(e.target.value)} style={{borderRadius:8,padding:8,fontWeight:700}}>
          <option value="">All</option>
          {teams.map(t=><option key={t}>{t}</option>)}
        </select>
        <span style={{color:"#FFD700",fontWeight:800,marginLeft:14}}>Phase:</span>
        <select value={phase} onChange={e=>setPhase(e.target.value)} style={{borderRadius:8,padding:8,fontWeight:700}}>
          <option value="">All</option>
          {phases.map(p=><option key={p}>{p}</option>)}
        </select>
      </div>
      <div style={{fontWeight:900,marginBottom:6,color:"#FFD700",fontSize:17,marginLeft:3}}>{overlayLabel}</div>
      {/* Main SVG constellation */}
      <div style={{
        width: "100%", height: 590,
        background: "#0b3326", borderRadius: 22, margin: "0 0 29px 0",
        position: "relative", boxShadow: "0 2px 22px #1de68222"
      }}>
        {/* Edges */}
        <svg width="100%" height="590" style={{position:"absolute",top:0,left:0,pointerEvents:"none"}}>
          {edges.map((e,i)=>{
            const from = laidOut.find(n=>n.id===e.from);
            const to = laidOut.find(n=>n.id===e.to);
            if(!from||!to) return null;
            return (
              <motion.line
                key={i}
                initial={{strokeDasharray:"6 8"}}
                animate={{strokeDashoffset:[0,12,0]}}
                transition={{duration:2,repeat:Infinity}}
                x1={from.x+85} y1={from.y+44}
                x2={to.x+85} y2={to.y+44}
                stroke={e.type==="mentor"?"#FFD700":"#1de682"}
                strokeWidth={e.type==="mentor"?5:3.5}
                markerEnd="url(#arrowhead)"
                opacity={0.77}
              />
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="12" markerHeight="12" refX="2" refY="6" orient="auto">
              <polygon points="0 0, 12 6, 0 12" fill="#FFD700"/>
            </marker>
          </defs>
        </svg>
        {/* Nodes */}
        {laidOut.map((n,i)=>
          <motion.div
            key={n.id}
            initial={{scale:0.92,opacity:0.2}}
            animate={{scale:1,opacity:1}}
            transition={{duration:0.75,delay:0.08*i}}
            onClick={()=>setActiveNode(n)}
            style={{
              position: "absolute",
              left: n.x, top: n.y,
              background: n.color,
              border: "5px solid #fff",
              borderRadius: 29,
              width: 180, height: 90,
              display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center",
              cursor: "pointer", boxShadow: n.potential>=9?"0 2px 24px #FFD700bb":"0 2px 14px #1de68233", zIndex: 6,
              transition: ".23s"
            }}>
            <div style={{
              fontWeight:900,fontSize:21,
              color: "#fff", textShadow:"0 1px 8px #232b3988", marginLeft: 18
            }}>
              <Avatar name={n.name} color={n.color} pulse={n.potential>=9||n.morale<5||n.fit<6}/>
              <span style={{marginLeft:17}}>{n.name}</span>
            </div>
            <div style={{
              fontSize:15,color:"#fff",fontWeight:800,marginLeft:18,marginTop:3,
              borderRadius:7,padding:"2.5px 9px",
              background: getPhaseColor(n.phase),
              boxShadow: "0 1px 7px #232b3933", display:"inline-block"
            }}>{n.role} | {n.phase}</div>
            <div style={{display:"flex",gap:13,marginLeft:18,marginTop:3,alignItems:"center"}}>
              <span title="Morale">{moraleIcon(n.morale)}</span>
              <span title="Readiness">{readinessIcon(n.readiness)}</span>
              <span title="Fit">{fitIcon(n.fit)}</span>
              <span style={{fontWeight:800}}>Pot:</span>
              <span style={{fontWeight:900}}>{n.potential}</span>
              {n.morale<5 && <FaFlag style={{color:"#FF4848"}} title="Flight Risk"/>}
              {n.potential>=9 && <FaStar style={{color:"#FFD700"}} title="High Potential"/>}
            </div>
            <div style={{marginLeft:18,marginTop:2,fontWeight:700,fontSize:12,color:"#FFD700cc"}}>
              {n.mentor&&<>Mentor: {demoNodes.find(x=>x.id===n.mentor)?.name} &nbsp;</>}
              {n.mentee&&<>Mentee: {demoNodes.find(x=>x.id===n.mentee)?.name}</>}
            </div>
          </motion.div>
        )}
      </div>
      {/* Boardroom panel */}
      <div style={{display:"flex",gap:20}}>
        <div style={{flex:1,background:"#232b39",borderRadius:14,padding:"18px 22px",marginBottom:21}}>
          <div style={{fontWeight:900,fontSize:18,color:"#FFD700",marginBottom:7}}><FaRobot style={{marginRight:6}}/>AI Boardroom Panel</div>
          <ul>
            <li style={{color:"#FFD700"}}>Succession Gaps: {nodes.filter(n=>n.mentor&&n.mentee==null).length} (add more mentees for sustainability)</li>
            <li style={{color:"#1de682"}}>High Potentials: {nodes.filter(n=>n.potential>=9).length} (ready for next phase/promotion)</li>
            <li style={{color:"#FFD700"}}>At Risk: {flightRisks.length} (low morale or fit—monitor retention!)</li>
          </ul>
        </div>
        <div style={{flex:1,background:"#232b39",borderRadius:14,padding:"18px 22px",marginBottom:21}}>
          <div style={{fontWeight:900,fontSize:18,color:"#1de682",marginBottom:7}}><FaFlag style={{marginRight:7}}/>Talent Flight & Retention Radar</div>
          <ul>
            {flightRisks.map(n=>
              <li key={n.id} style={{color:"#FF4848"}}>{n.name} ({n.role}) - morale/fit below safe threshold</li>
            )}
            {flightRisks.length===0 && <li style={{color:"#1de682"}}>No immediate flight risks.</li>}
          </ul>
        </div>
        <div style={{flex:1,background:"#232b39",borderRadius:14,padding:"18px 22px",marginBottom:21}}>
          <div style={{fontWeight:900,fontSize:18,color:"#FFD700",marginBottom:7}}><FaHistory style={{marginRight:7}}/>Scenario Timeline & Snapshots</div>
          <ul>
            {scenarioLog.length===0?<li style={{color:"#FFD70077"}}>No scenarios run yet.</li>:
              scenarioLog.map((l,i)=>
                <li key={i} style={{color:"#FFD700"}}>{l.ts}: {l.action}</li>
              )}
          </ul>
          <div style={{marginTop:8}}>
            <b style={{color:"#FFD700",fontSize:14}}>Snapshots:</b>
            {snapshots.length===0
              ? <span style={{color:"#FFD70077"}}> No snapshots yet.</span>
              : snapshots.map((s,i)=>
                <Button size="sm" key={i} style={{margin:"0 7px 0 0",background:"#FFD700",color:"#111"}} onClick={()=>setNodes(s.nodes)}>Load {s.ts}</Button>
              )}
          </div>
        </div>
      </div>
      {/* Node Quick Drawer */}
      <AnimatePresence>
      {activeNode && (
        <motion.div
          initial={{x:430,opacity:0}}
          animate={{x:0,opacity:1}}
          exit={{x:430,opacity:0}}
          transition={{type:"spring",stiffness:110,damping:14}}
          style={{
            position:"fixed",top:0,right:0,bottom:0,width:440,zIndex:102,background:"#101f18",boxShadow:"-6px 0 34px #FFD70099",padding:38,display:"flex",flexDirection:"column"
          }}>
          <div style={{fontWeight:900,fontSize:26,marginBottom:8,color:"#1de682"}}>{activeNode.name}</div>
          <div style={{fontSize:18,marginBottom:9,fontWeight:800,color:"#FFD700"}}>{activeNode.role} | {activeNode.phase}</div>
          <div style={{marginBottom:9}}>Team: <b>{activeNode.team}</b> &nbsp; Type: <b>{activeNode.type}</b></div>
          <div style={{marginBottom:13,display:"flex",gap:13,alignItems:"center"}}>
            <span title="Morale">{moraleIcon(activeNode.morale)}</span>
            <span title="Readiness">{readinessIcon(activeNode.readiness)}</span>
            <span title="Fit">{fitIcon(activeNode.fit)}</span>
            <span>Potential: <b style={{color:"#FFD700"}}>{activeNode.potential}</b></span>
          </div>
          <div style={{margin:"13px 0 11px 0"}}>
            <b>Performance History:</b>
            <svg width={170} height={38}>
              <polyline fill="none" stroke="#FFD700" strokeWidth="3" points={activeNode.history.map((v,i)=>`${17+i*32},${36-(v*3.2)}`).join(" ")}/>
              {activeNode.history.map((v,i)=>(
                <circle key={i} cx={17+i*32} cy={36-(v*3.2)} r={4.5} fill="#1de682"/>
              ))}
            </svg>
          </div>
          <div style={{margin:"10px 0"}}>
            <b>Feedback:</b>
            <ul style={{marginTop:2}}>
              {activeNode.feedback.map((f,i)=>
                <li key={i} style={{color:"#FFD700cc"}}>{f}</li>
              )}
            </ul>
          </div>
          <div style={{margin:"8px 0 14px 0"}}>
            <Button size="sm" style={{background:"#1de682",marginRight:10}} onClick={()=>handleMove(activeNode.id,"up")}><FaArrowUp/> Promote</Button>
            <Button size="sm" style={{background:"#FF4848"}} onClick={()=>handleMove(activeNode.id,"down")}><FaArrowDown/> Demote</Button>
            <Button size="sm" style={{background:"#FFD700",color:"#111",marginLeft:10}} onClick={()=>handleFlagRisk(activeNode.id)}><FaFlag/> Flag as Risk</Button>
            <Button size="sm" style={{background:"#232b39",color:"#FFD700",marginLeft:10}} onClick={()=>setActiveNode(null)}><FaUndo/> Close</Button>
          </div>
          <div style={{marginTop:6,fontSize:15}}>
            <b><FaPlayCircle/> Promotion Chain & Ripple:</b>
            <div style={{color:"#FFD700",marginTop:6}}>{activeNode.potential>=9
              ? "Promotion will trigger backfill of Development, new mentorships needed."
              : activeNode.morale<5
                ? "Low morale detected: risk of talent flight or disengagement. Assign mentor or rotate role."
                : "Mentor/mentee role solid. Succession healthy."
            }</div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default RoleEvolutionPromotionSimulator;
