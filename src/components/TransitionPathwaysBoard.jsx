import React, { useState } from "react";
import { FaArrowRight, FaFlagUsa, FaFlag, FaHandshake, FaUserTie, FaUserGraduate, FaStar, FaTimesCircle, FaGlobeEurope, FaExclamationTriangle, FaCheckCircle, FaFileExport, FaRobot, FaClock, FaHistory, FaFire, FaShieldAlt, FaUniversity, FaQuestionCircle, FaEye, FaUpload, FaBolt, FaBell, FaCalendarAlt, FaThumbsUp, FaThumbsDown, FaHandPaper, FaComments, FaThumbtack, FaUserCircle, FaUserFriends, FaUser, FaNewspaper, FaMicrophoneAlt, FaGavel, FaUsers, FaRegClock } from "react-icons/fa";
import { motion } from "framer-motion";

// --- Button helper
const Button = ({ children, onClick, style = {}, size, ...props }) => (
  <button
    onClick={onClick}
    style={{
      border: 'none',
      borderRadius: 9,
      padding: size === 'sm' ? '5px 10px' : '12px 18px',
      background: '#FFD700',
      color: '#181e23',
      fontWeight: 700,
      fontSize: size === 'sm' ? 14 : 16,
      cursor: 'pointer',
      margin: '2px 0',
      ...style
    }}
    {...props}
  >{children}</button>
);

// --- Presence/Role avatars (simulate live roles in room)
const roles = [
  { key: "Board", label: "Board", icon: <FaGavel />, color: "#FFD700" },
  { key: "Coach", label: "Coach", icon: <FaUserCircle />, color: "#1de682" },
  { key: "Agent", label: "Agent", icon: <FaUserTie />, color: "#FFD700" },
  { key: "Scout", label: "Scout", icon: <FaEye />, color: "#1de682" },
  { key: "Family", label: "Family", icon: <FaUserFriends />, color: "#FFD700" },
  { key: "Media", label: "Media", icon: <FaNewspaper />, color: "#FF4848" },
];

// --- DEMO ATHLETES
const demoAthletes = [
  { id: 1, name: "Luka Vuković", photo: null, stage: "Academy", proReady: 8, market: "Open", risk: "Low", status: "Target Euro Pro", agent: "Savic", agentRep: 4, contract: "Unsigned", value: 88, offers: 1, interest: { nba: 2, euro: 4, asia: 1 }, riskBadges: ["Low"], notes: [], actions: [], docs: [], ai: "Monitor Euro Pro offers", votes: { up: 2, down: 0, flag: 0 }, comments: [], pinned: false, prRisk: 1, media: ["Scout says: 'Future EuroLeague star.'"] },
  { id: 2, name: "Ivan Horvat", photo: null, stage: "Academy", proReady: 5, market: "Closing", risk: "Medium", status: "College Target", agent: "None", agentRep: 0, contract: "NCAA Bound", value: 66, offers: 0, interest: { nba: 1, euro: 2, asia: 0 }, riskBadges: ["Academic"], notes: [], actions: [], docs: [], ai: "Priority: SAT exam, NCAA window closing", votes: { up: 1, down: 1, flag: 0 }, comments: [], pinned: false, prRisk: 0, media: [] },
  { id: 3, name: "Marko Jurić", photo: null, stage: "Domestic Pro", proReady: 9, market: "Open", risk: "Low", status: "Target NBA", agent: "Simec", agentRep: 5, contract: "Expiring", value: 99, offers: 3, interest: { nba: 5, euro: 4, asia: 2 }, riskBadges: ["Contract"], notes: [], actions: [], docs: [], ai: "NBA window: prep for draft", votes: { up: 3, down: 0, flag: 1 }, comments: [], pinned: false, prRisk: 3, media: ["PR: ESPN mentions NBA readiness", "Rumor: Buyout fee rising"] },
  { id: 4, name: "Petar Božić", photo: null, stage: "College/Uni", proReady: 7, market: "Open", risk: "Low", status: "Monitor US College eligibility", agent: "None", agentRep: 0, contract: "NCAA Eligible", value: 70, offers: 1, interest: { nba: 0, euro: 2, asia: 0 }, riskBadges: ["Visa"], notes: [], actions: [], docs: [], ai: "Monitor academic status", votes: { up: 0, down: 1, flag: 1 }, comments: [], pinned: false, prRisk: 2, media: ["Compliance: Visa expiry soon"] },
  { id: 5, name: "Nikola Dukić", photo: null, stage: "Dropout/Other", proReady: 2, market: "Closed", risk: "High", status: "Dropout risk", agent: "None", agentRep: 0, contract: "Unsigned", value: 24, offers: 0, interest: { nba: 0, euro: 0, asia: 0 }, riskBadges: ["Dropout", "Family"], notes: [], actions: [], docs: [], ai: "Urgent: family meeting", votes: { up: 0, down: 2, flag: 2 }, comments: [], pinned: false, prRisk: 2, media: ["Media: Local story on family move"] },
  { id: 6, name: "Tomislav Šarić", photo: null, stage: "Euro Pro", proReady: 8, market: "Open", risk: "Medium", status: "Monitor transfer to Spain", agent: "García", agentRep: 3, contract: "Negotiation", value: 85, offers: 2, interest: { nba: 0, euro: 4, asia: 1 }, riskBadges: ["Visa"], notes: [], actions: [], docs: [], ai: "Visa docs for Spain", votes: { up: 2, down: 1, flag: 0 }, comments: [], pinned: false, prRisk: 0, media: ["PR: Marca reports imminent move"] },
];

// --- Columns/Stages
const columns = [
  { key: "Academy", label: "Academy", icon: <FaUserGraduate /> },
  { key: "College/Uni", label: "College/Uni", icon: <FaUniversity /> },
  { key: "Domestic Pro", label: "Domestic Pro", icon: <FaUserTie /> },
  { key: "Euro Pro", label: "Euro Pro", icon: <FaGlobeEurope /> },
  { key: "NBA/International", label: "NBA/Int’l", icon: <FaFlagUsa /> },
  { key: "Dropout/Other", label: "Dropout/Other", icon: <FaTimesCircle /> },
];

// --- Helper functions
const statusColor = (stage, risk) => {
  if (stage === "Dropout/Other" || risk === "High") return "#FF4848";
  if (risk === "Medium") return "#FFD700";
  return "#1de682";
};
const marketBadge = market =>
  market === "Open" ? (
    <span style={{ color: "#1de682", fontWeight: 700 }}><FaFire style={{marginRight:3}}/>Market Open</span>
  ) : market === "Closing" ? (
    <span style={{ color: "#FFD700", fontWeight: 700 }}><FaBolt style={{marginRight:3}}/>Closing Soon</span>
  ) : (
    <span style={{ color: "#FF4848", fontWeight: 700 }}><FaTimesCircle style={{marginRight:3}}/>Market Closed</span>
  );
const agentStars = rep => <span style={{ color: "#FFD700" }}>{Array(rep).fill(0).map((_,i)=><FaStar key={i} style={{marginRight:2}}/>)}</span>;
const interestIcons = (interest) => (
  <>
    {interest.nba>0 && <span title="NBA interest" style={{color:"#1de682",marginRight:5}}><FaFlagUsa/></span>}
    {interest.euro>0 && <span title="Euro interest" style={{color:"#FFD700",marginRight:5}}><FaGlobeEurope/></span>}
    {interest.asia>0 && <span title="Asia interest" style={{color:"#FFD70077",marginRight:5}}><FaFlag/></span>}
    <FaEye style={{color:"#FFD70077"}}/> {interest.nba+interest.euro+interest.asia}
  </>
);
const riskBadges = (riskArr) => riskArr.map(b =>
  b==="Academic"?<span key={b} style={{color:"#FFD700",fontWeight:700,marginRight:5}}><FaUniversity/> Academic</span>:
  b==="Visa"?<span key={b} style={{color:"#FFD700",fontWeight:700,marginRight:5}}><FaShieldAlt/> Visa</span>:
  b==="Contract"?<span key={b} style={{color:"#FFD700",fontWeight:700,marginRight:5}}><FaHandshake/> Contract</span>:
  b==="Dropout"?<span key={b} style={{color:"#FF4848",fontWeight:700,marginRight:5}}><FaExclamationTriangle/> Dropout</span>:
  b==="Family"?<span key={b} style={{color:"#FF4848",fontWeight:700,marginRight:5}}><FaUserTie/> Family</span>:
  <span key={b} style={{color:"#FFD700",marginRight:5}}><FaQuestionCircle/> {b}</span>
);

// --- Presence Bar Avatars
const StakeholderPresence = ({presentRoles,spotlight,athleteMap}) => (
  <div style={{display:"flex",gap:18,alignItems:"center"}}>
    {presentRoles.map((role,i)=>
      <span key={role.key} style={{
        display:"inline-flex",alignItems:"center",
        background:spotlight===role.key?"#FFD70033":"#181e23",
        color:role.color,fontWeight:900,padding:"5px 14px",borderRadius:12,boxShadow:spotlight===role.key?"0 0 10px #FFD700aa":"none",
        animation:"pulse .8s infinite alternate"
      }}>
        {role.icon} {role.label}
        {/* If spotlight, show athlete name */}
        {spotlight===role.key && athleteMap[role.key] && <span style={{marginLeft:9,fontWeight:800}}>{athleteMap[role.key]}</span>}
      </span>
    )}
    <style>{`
      @keyframes pulse {
        0% { box-shadow: 0 0 0 #FFD700; }
        100% { box-shadow: 0 0 14px #FFD70077; }
      }
    `}</style>
  </div>
);

const stakeholderOptions = ["Board","Coach","Agent","Family","Scout","Media"];

const newsFeed = [
  { type: "PR", msg: "ESPN: Marko Jurić in NBA mock draft.", color:"#FFD700" },
  { type: "Scout", msg: "Spanish Euroleague club scouting Tomislav Šarić.", color:"#1de682" },
  { type: "Rumor", msg: "Agent Savic linked with three new prospects.", color:"#FFD700" },
  { type: "Compliance", msg: "NCAA tightening eligibility checks this summer.", color:"#FF4848" },
];

const TransitionPathwaysBoard = () => {
  const [athletes, setAthletes] = useState(demoAthletes);
  const [dragId, setDragId] = useState(null);
  const [log, setLog] = useState([]);
  const [modal, setModal] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [actionInput, setActionInput] = useState("");
  const [actionAssign, setActionAssign] = useState("Coach");
  const [actionDeadline, setActionDeadline] = useState("");
  const [docName, setDocName] = useState("");
  const [meetingMode, setMeetingMode] = useState(false);
  const [windowTime, setWindowTime] = useState(12);
  const [globalEvent, setGlobalEvent] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [stakeholderView, setStakeholderView] = useState("Board");
  const [replayIndex, setReplayIndex] = useState(0);
  const [pinned, setPinned] = useState(null);
  const [presence, setPresence] = useState(roles.map(r=>r)); // All present
  const [spotlight, setSpotlight] = useState(null);
  const [chat, setChat] = useState([{from:"Board",text:"Welcome to CourtEvo Vero Transition Boardroom!",time:new Date().toLocaleTimeString()}]);
  const [chatInput, setChatInput] = useState("");
  const [chatDrawer, setChatDrawer] = useState(false);

  // --- Drag logic
  const onDragStart = id => setDragId(id);
  const onDrop = stage => {
    if (dragId == null) return;
    const a = athletes.find(a => a.id === dragId);
    let newRisk = a.risk;
    let ai = a.ai;
    let newRiskBadges = a.riskBadges;
    if (a.stage === "Academy" && ["Euro Pro", "NBA/International", "Dropout/Other"].includes(stage)) {
      newRisk = "High";
      ai = "AI Alert: Direct jump increases risk!";
      newRiskBadges = [...new Set([...a.riskBadges,"Dropout"])];
    }
    if (a.stage === "College/Uni" && ["Domestic Pro", "Euro Pro"].includes(stage) && a.proReady >= 7) {
      newRisk = "Low";
      ai = "AI: Smooth progression. Low risk.";
      newRiskBadges = newRiskBadges.filter(b=>b!=="Dropout");
    }
    setAthletes(
      athletes.map(x =>
        x.id === dragId
          ? { ...x, stage, risk: newRisk, ai, riskBadges: newRiskBadges }
          : x
      )
    );
    setLog([
      ...log,
      {
        date: new Date().toLocaleString(),
        athlete: a.name,
        from: a.stage,
        to: stage,
        risk: newRisk,
        ai,
      },
    ]);
    setDragId(null);
  };

  // --- Notes, actions, docs, AI, pinning
  const addNote = (id, text) => {
    setAthletes(
      athletes.map(a =>
        a.id === id ? { ...a, notes: [...a.notes, { text, date: new Date().toLocaleString() }] } : a
      )
    );
    setNoteInput("");
    setModal(null);
  };
  const addAction = (id, desc, assign, deadline) => {
    setAthletes(
      athletes.map(a =>
        a.id === id ? { ...a, actions: [...a.actions, { desc, assign, deadline, date: new Date().toLocaleString(), status: "Open" }] } : a
      )
    );
    setActionInput("");
    setActionAssign("Coach");
    setActionDeadline("");
    setModal(null);
  };
  const addDoc = (id, name) => {
    setAthletes(
      athletes.map(a =>
        a.id === id ? { ...a, docs: [...a.docs, { name, date: new Date().toLocaleString() }] } : a
      )
    );
    setDocName("");
    setModal(null);
  };
  const addVote = (id, type) => {
    setAthletes(
      athletes.map(a =>
        a.id === id ? { ...a, votes: { ...a.votes, [type]: (a.votes[type] || 0) + 1 } } : a
      )
    );
  };
  const addComment = (id, text) => {
    setAthletes(
      athletes.map(a =>
        a.id === id ? { ...a, comments: [...a.comments, { text, date: new Date().toLocaleString() }] } : a
      )
    );
    setModal(null);
  };

  // --- Pin
  const pinAthlete = id => setPinned(id);

  // --- Spotlight role/athlete
  const spotlightAthlete = (role,a) => setSpotlight(spotlight===role?null:role);

  // --- Board meeting mode toggle
  const toggleMeetingMode = () => setMeetingMode(m => !m);

  // --- Scenario Sim/Market Shock
  const globalScenario = type => {
    let changes = [];
    let newAthletes = [...athletes];
    if (type === "Global Visa Change") {
      newAthletes = newAthletes.map(a =>
        ["Euro Pro", "NBA/International"].includes(a.stage)
          ? { ...a, risk: "High", ai: "AI: Visa restriction! Delayed market entry.", riskBadges:[...new Set([...a.riskBadges,"Visa"])] }
          : a
      );
      changes = newAthletes
        .filter(a => ["Euro Pro", "NBA/International"].includes(a.stage))
        .map(a => `${a.name} (Visa)`);
    }
    if (type === "NBA Draft Rule Change") {
      newAthletes = newAthletes.map(a =>
        a.stage === "Domestic Pro"
          ? { ...a, stage: "NBA/International", ai: "AI: Declared for NBA draft by rule", risk: "Medium", riskBadges:[...a.riskBadges] }
          : a
      );
      changes = newAthletes.filter(a => a.stage === "NBA/International").map(a => `${a.name}`);
    }
    if (type === "PR Scandal") {
      newAthletes = newAthletes.map(a =>
        a.stage === "Euro Pro"
          ? { ...a, prRisk: 4, ai: "AI: Media scandal, PR crisis active.", media:[...(a.media||[]),"PR Scandal: Board under fire"] }
          : a
      );
      changes = newAthletes.filter(a=>a.stage==="Euro Pro").map(a=>a.name);
    }
    setAthletes(newAthletes);
    setLog([
      ...log,
      {
        date: new Date().toLocaleString(),
        athlete: "All/Board",
        from: type,
        to: "Scenario",
        risk: "-",
        ai: `Simulated: ${type}. Changed: ${changes.join(", ")}`,
      },
    ]);
    setGlobalEvent(type);
    setTimeout(() => setGlobalEvent(null), 2400);
  };

  // --- Export & AI summary
  const exportBoard = () => window.print();
  const unresolvedActions = athletes.reduce((acc,a)=>acc+a.actions.filter(x=>x.status!=="Resolved").length,0);

  // --- Chat
  const postChat = (msg,from="Board")=>{
    setChat([...chat,{from,text:msg,time:new Date().toLocaleTimeString()}]);
  };

  // --- Filter athletes by stakeholder view
  const filterByStakeholder = a => {
    if (stakeholderView === "Coach") return true;
    if (stakeholderView === "Agent") return a.agent !== "None";
    if (stakeholderView === "Family") return a.risk !== "Low";
    if (stakeholderView === "Scout") return a.value > 65;
    if (stakeholderView === "Media") return a.prRisk && a.prRisk>1;
    return true;
  };

  // --- Render
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #283E51 0%, #485563 100%)",
      color: "#fff",
      fontFamily: "Segoe UI, sans-serif",
      padding: 28,
      position:"relative"
    }}>
      {/* Presence Bar + Spotlight */}
      <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:5}}>
        <StakeholderPresence presentRoles={presence} spotlight={spotlight} athleteMap={{Board:"Luka Vuković"}}/>
        <Button size="sm" style={{marginLeft:13,background:"#FFD700"}} onClick={()=>setChatDrawer(v=>!v)}><FaComments style={{marginRight:5}}/>{chatDrawer?"Hide":"Open"} Chat</Button>
      </div>
      {/* Media Radar Ticker */}
      <div style={{margin:"5px 0",padding:"5px 12px",background:"#1a2334",borderRadius:9,display:"flex",gap:14,alignItems:"center"}}>
        <FaMicrophoneAlt style={{color:"#FFD700",marginRight:4}}/> 
        <span style={{fontWeight:800,color:"#FFD700"}}>Media Radar:</span>
        {newsFeed.map((n,i)=>
          <span key={i} style={{color:n.color,marginRight:15,animation:"ticker .7s infinite alternate"}}>
            {n.type==="PR" && <FaNewspaper style={{marginRight:4}}/>}
            {n.type==="Scout" && <FaEye style={{marginRight:4}}/>}
            {n.type==="Rumor" && <FaUserTie style={{marginRight:4}}/>}
            {n.type==="Compliance" && <FaExclamationTriangle style={{marginRight:4}}/>}
            {n.msg}
          </span>
        )}
        <style>{`
        @keyframes ticker { 0% {opacity:1;} 100% {opacity:.7;} }
        `}</style>
      </div>
      {/* Broadcast/War Room Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        position: "sticky",
        top: 0,
        background: "rgba(24,36,51,0.97)",
        borderRadius: 16,
        boxShadow: "0 2px 20px #181e2355",
        marginBottom: 22,
        padding: "18px 28px 10px 28px",
        zIndex: 10,
        gap: 22,
      }}>
        <FaClock style={{ fontSize: 22, color: "#FFD700" }} />
        <span style={{ color: "#FFD700", fontWeight: 800, fontSize: 21 }}>Transition Window: {windowTime} days left</span>
        <span style={{ fontWeight: 700, color: "#1de682" }}>
          <FaRobot style={{ marginRight: 8 }} />
          AI Board Alert: {
            athletes.filter(a => a.risk === "High").length > 0
              ? <span style={{ color: "#FF4848" }}>High risk transitions! Review now.</span>
              : "All stable"
          }
        </span>
        <span style={{ color: "#FFD700", fontWeight: 700 }}>
          <FaBell style={{marginRight:6}}/>Open Pro Offers: <b>{athletes.reduce((acc,a)=>acc+a.offers,0)}</b>
        </span>
        <span style={{ color: "#FF4848", fontWeight: 700 }}>
          <FaExclamationTriangle style={{marginRight:6}}/>Unresolved Actions: <b>{unresolvedActions}</b>
        </span>
        <select value={stakeholderView} onChange={e=>setStakeholderView(e.target.value)} style={{borderRadius:9,marginLeft:16,padding:6,fontWeight:800}}>
          {stakeholderOptions.map(o=><option key={o} value={o}>{o} View</option>)}
        </select>
        <Button size="sm" onClick={toggleMeetingMode} style={{marginLeft:20,background:"#1de682"}}>{meetingMode ? "Board Mode: OFF" : "Board Mode: ON"}</Button>
        <Button onClick={exportBoard} size="sm" style={{ marginLeft: "auto", background: "#FFD700" }}><FaFileExport style={{ marginRight: 6 }} />Export Board</Button>
      </div>
      {/* Market Signal Bar */}
      <div style={{margin:"10px 0",display:"flex",gap:19,alignItems:"center"}}>
        <span style={{fontWeight:900,color:"#FFD700",fontSize:17}}>Market Signals:</span>
        <span style={{color:"#FFD700"}}><FaFire/> NBA Window: <span style={{animation:"flash 1s infinite alternate"}}>HOT</span></span>
        <span style={{color:"#FFD70077"}}><FaFlagUsa/> Scout Activity: 5 live</span>
        <span style={{color:"#1de682"}}><FaBolt/> Visa Alert: Low</span>
      </div>
      {/* Market/Scenario Sim, Replay */}
      <div style={{ marginBottom: 16,display:"flex",gap:14,alignItems:"center" }}>
        <Button size="sm" style={{ background: "#FFD700", fontWeight: 800 }} onClick={() => globalScenario("Global Visa Change")}>Global Visa Change</Button>
        <Button size="sm" style={{ background: "#1de682" }} onClick={() => globalScenario("NBA Draft Rule Change")}>NBA Draft Rule Change</Button>
        <Button size="sm" style={{ background: "#FF4848" }} onClick={() => globalScenario("PR Scandal")}>PR Scandal</Button>
        {globalEvent && <span style={{fontWeight:700,color:"#FFD700",marginLeft:13}}>Simulating: {globalEvent}...</span>}
        <Button size="sm" style={{ background: "#FFD700",marginLeft:15 }} onClick={()=>setShowSummary(true)}>AI Boardroom Summary</Button>
      </div>
      {/* Kanban Columns */}
      <div style={{
        display: "flex",
        gap: meetingMode?10:18,
        alignItems: "flex-start",
        overflowX: "auto",
        minHeight: 430,
        opacity: globalEvent?0.6:1,
        pointerEvents: globalEvent?"none":"auto"
      }}>
        {columns.map(col => (
          <div key={col.key} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(col.key)} style={{
            background: "#232b39",
            borderRadius: 18,
            minWidth: meetingMode?165:250,
            padding: meetingMode?8:18,
            boxShadow: "0 2px 18px #181e2330",
            flex: "1 1 0px",
            minHeight: 480,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch"
          }}>
            <div style={{
              fontWeight: 800,
              color: "#FFD700",
              fontSize: meetingMode?15:19,
              marginBottom: 9,
              display: "flex",
              alignItems: "center",
              gap: 9
            }}>{col.icon} {col.label}</div>
            {/* Hot Market Heatmap */}
            <div style={{height:6,marginBottom:7,background:col.key==="Euro Pro"?"#FFD700":col.key==="NBA/International"?"#1de682":"#181e23",borderRadius:8}}/>
            <div style={{ flex: 1 }}>
              {[...athletes.filter(a=>a.stage===col.key && filterByStakeholder(a))]
                .sort((a,b)=>pinned===a.id?-1:0) // Pin on top
                .map(a => (
                <motion.div
                  key={a.id}
                  draggable
                  onDragStart={() => onDragStart(a.id)}
                  whileHover={{ scale: 1.05, boxShadow: "0 3px 20px #FFD70088" }}
                  style={{
                    background: "#283e51",
                    border: `2.5px solid ${statusColor(col.key, a.risk)}`,
                    borderRadius: 15,
                    padding: meetingMode?7:15,
                    marginBottom: 10,
                    cursor: "grab",
                    minHeight: meetingMode?70:140,
                    position: "relative",
                    animation: a.risk==="High"?"flash .9s infinite alternate":undefined,
                    boxShadow: a.prRisk>2?"0 0 16px #FF4848aa":""
                  }}>
                  {/* PR Risk Badge */}
                  {a.prRisk>1 && (
                    <div style={{position:"absolute",top:9,right:42,background:"#FF4848",color:"#fff",borderRadius:7,padding:"2px 10px",fontWeight:800,fontSize:13,animation:"pulse .8s infinite alternate"}}>
                      <FaMicrophoneAlt style={{marginRight:4}}/>MEDIA/PR
                    </div>
                  )}
                  <div style={{ fontWeight: 700, fontSize: meetingMode?14:17, color: "#FFD700" }}>
                    {a.name} {a.proReady >= 8 && <FaStar style={{ color: "#FFD700", marginLeft: 4 }} />}
                    <Button size="sm" style={{background:"#FFD70044",marginLeft:7,padding:"2px 7px"}} onClick={()=>pinAthlete(a.id)}><FaThumbtack/></Button>
                    <Button size="sm" style={{background:"#1de68244",marginLeft:6,padding:"2px 7px"}} onClick={()=>spotlightAthlete("Board",a)}>{spotlight==="Board"?"Unspotlight":"Spotlight"}</Button>
                  </div>
                  <div style={{ marginTop: 2, color: "#FFD700", fontWeight: 600, fontSize: 15 }}>{marketBadge(a.market)}</div>
                  <div style={{ marginTop: 2, fontWeight: 600, color: statusColor(col.key, a.risk),fontSize:meetingMode?13:15 }}>
                    Risk: {a.risk} | <span style={{ color: "#FFD700" }}>ProReady: {a.proReady}/10</span>
                  </div>
                  <div style={{ color: "#FFD700", marginTop: 2, fontSize: 13, fontWeight: 500 }}>
                    Agent: {a.agent || "None"} {agentStars(a.agentRep)}
                  </div>
                  <div style={{ color: "#FFD700cc", fontSize: 13, marginTop: 2 }}>
                    <FaRobot style={{ color: "#1de682", marginRight: 3 }} />
                    {a.ai}
                  </div>
                  <div style={{ color: "#1de682", fontWeight: 600, marginTop: 2, fontSize: 13 }}>
                    <FaHandshake style={{ marginRight: 4 }} />
                    Contract: {a.contract}
                  </div>
                  <div style={{ color: "#FFD700", fontWeight: 600, marginTop: 2, fontSize: 13 }}>
                    Value: {a.value} / 100 | Offers: <b>{a.offers}</b> {interestIcons(a.interest)}
                  </div>
                  <div style={{ marginTop: 3 }}>{riskBadges(a.riskBadges)}</div>
                  {a.stage==="College/Uni" && a.offers>0 && <span style={{color:"#FF4848",fontWeight:700,marginLeft:8}}><FaExclamationTriangle/> NCAA Compliance Risk</span>}
                  {/* Media / PR Log */}
                  {a.media && a.media.length>0 && <div style={{marginTop:4,fontSize:12,color:"#FFD700cc",fontWeight:700}}>
                    {a.media.slice(-2).map((m,i)=><div key={i}><FaNewspaper style={{marginRight:4}}/>{m}</div>)}
                  </div>}
                  <div style={{ position: "absolute", right: 10, top: 10 }}>
                    <Button size="sm" style={{ background: "#FFD700", color: "#232b39", fontSize: 13, fontWeight: 700 }} onClick={() => setModal({ id:a.id, tab:"actions" })}>⋮</Button>
                  </div>
                  {/* Stakeholder-specific info */}
                  {stakeholderView === "Agent" && (
                    <div style={{color:"#1de682",fontWeight:700,marginTop:4}}>Market: {a.market} | Competing Clubs: {["Zvezda","Real Madrid"].join(", ")}</div>
                  )}
                  {stakeholderView === "Family" && (
                    <div style={{color:"#FFD700",fontWeight:700,marginTop:4}}>Status: {a.status} | Risk: {a.risk}</div>
                  )}
                  {stakeholderView === "Scout" && (
                    <div style={{color:"#FFD700cc",marginTop:4}}>Pro Value: {a.value}/100 | Offers: {a.offers}</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Global Transition Timeline */}
      <div style={{
        marginTop: 25,
        background: "#222b37",
        borderRadius: 16,
        padding: 18,
        boxShadow: "0 2px 14px #181e2312"
      }}>
        <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 18, marginBottom: 7 }}><FaHistory style={{ marginRight: 7 }} />Transition Timeline (All Cases)</div>
        <ul style={{ fontSize: 15 }}>
          {log.slice(-12).reverse().map((l, i) => (
            <li key={i} style={{ color: l.risk === "High" ? "#FF4848" : "#FFD700" }}>
              [{l.date}] <b>{l.athlete}</b> moved from <b>{l.from}</b> to <b>{l.to}</b> {l.risk && <>| Risk: <b>{l.risk}</b></>} <span style={{ color: "#1de682", marginLeft: 5 }}>{l.ai}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* AI Boardroom Summary Modal */}
      {showSummary && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(32,32,48,0.91)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#283e51", borderRadius: 20, padding: 32, minWidth: 450,
            color: "#FFD700", boxShadow: "0 4px 32px #FFD70033"
          }}>
            <h2 style={{ fontWeight: 900, fontSize: 28, marginBottom: 14 }}><FaRobot style={{marginRight:9}}/>AI Boardroom Summary</h2>
            <ul style={{fontSize:18}}>
              <li><b>{athletes.filter(a=>a.risk==="High").length}</b> high-risk transitions. Review: {athletes.filter(a=>a.risk==="High").map(a=>a.name).join(", ")}</li>
              <li>Open Pro Offers: <b>{athletes.reduce((acc,a)=>acc+a.offers,0)}</b>. Top value: <b>{athletes.reduce((a,b)=>a.value>b.value?a:b).name}</b></li>
              <li>Unresolved Board/Agent Actions: <b>{unresolvedActions}</b></li>
              <li>Market Closing: {athletes.filter(a=>a.market==="Closing").map(a=>a.name).join(", ") || "None"}</li>
              <li>Visa issues: {athletes.filter(a=>a.riskBadges.includes("Visa")).map(a=>a.name).join(", ")||"None"}</li>
              <li>Dropout/family risk: {athletes.filter(a=>a.riskBadges.includes("Dropout")||a.riskBadges.includes("Family")).map(a=>a.name).join(", ")||"None"}</li>
              <li>PR/Media Risk: {athletes.filter(a=>a.prRisk>2).map(a=>a.name).join(", ")||"None"}</li>
            </ul>
            <Button size="sm" style={{marginTop:14,background:"#FFD700"}} onClick={()=>setShowSummary(false)}>Close</Button>
          </div>
        </div>
      )}
      {/* Modal for Actions/Notes/Docs/Chat/Voting */}
      {modal && (() => {
        const a = athletes.find(x => x.id === modal.id);
        return (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(32,32,48,0.88)", zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{
              background: "#283e51", borderRadius: 20, padding: 28, minWidth: 400,
              color: "#FFD700", boxShadow: "0 4px 32px #FFD70033"
            }}>
              <h3 style={{ fontSize: 23, fontWeight: 900 }}>{a.name} — Actions / Notes / Docs</h3>
              <div style={{ color: "#1de682", fontWeight: 700, marginBottom: 6 }}>Status: {a.status} | Risk: {a.risk}</div>
              <div style={{ fontWeight: 600, marginBottom: 7 }}>AI: {a.ai}</div>
              {/* VOTING */}
              <div style={{marginBottom:10}}>
                <b>Board Voting:</b>
                <div style={{display:"flex",gap:8,marginTop:5}}>
                  <Button size="sm" style={{background:"#1de682"}} onClick={()=>addVote(a.id,"up")}><FaThumbsUp/> {a.votes.up||0}</Button>
                  <Button size="sm" style={{background:"#FFD700"}} onClick={()=>addVote(a.id,"down")}><FaThumbsDown/> {a.votes.down||0}</Button>
                  <Button size="sm" style={{background:"#FF4848"}} onClick={()=>addVote(a.id,"flag")}><FaHandPaper/> {a.votes.flag||0}</Button>
                </div>
              </div>
              {/* NOTES */}
              <div style={{ marginBottom: 10 }}>
                <b>Notes:</b>
                <ul>
                  {a.notes.map((n, i) => (
                    <li key={i} style={{ color: "#FFD700cc", fontSize: 15, marginBottom: 2 }}>{n.text} <span style={{ color: "#FFD70088", marginLeft: 7, fontSize: 12 }}>({n.date})</span></li>
                  ))}
                </ul>
                <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Add note..." style={{ width: "100%", borderRadius: 8, border: "1px solid #FFD700", marginBottom: 8, padding: 6 }} />
                <Button size="sm" onClick={() => addNote(a.id, noteInput)} style={{ marginBottom: 10 }}>Add Note</Button>
              </div>
              {/* ACTIONS */}
              <div style={{ marginBottom: 10 }}>
                <b>Actions / Assign:</b>
                <ul>
                  {a.actions.map((act, i) => (
                    <li key={i} style={{ color: act.status === "Resolved" ? "#1de682" : "#FFD700", fontSize: 15 }}>
                      [{act.assign}] {act.desc} <FaCalendarAlt style={{marginLeft:3}}/>{act.deadline} — <b>{act.status}</b> <span style={{ color: "#FFD700aa", fontSize: 12, marginLeft: 7 }}>({act.date})</span>
                    </li>
                  ))}
                </ul>
                <input type="text" value={actionInput} onChange={e => setActionInput(e.target.value)} placeholder="Describe action..." style={{ width: "65%", borderRadius: 8, border: "1px solid #FFD700", padding: 5, marginBottom: 7 }} />
                <select value={actionAssign} onChange={e => setActionAssign(e.target.value)} style={{ borderRadius: 7, border: "1px solid #FFD700", padding: 5, marginLeft: 5 }}>
                  <option value="Coach">Coach</option>
                  <option value="Board">Board</option>
                  <option value="Agent">Agent</option>
                  <option value="Family">Family</option>
                  <option value="Medical">Medical</option>
                  <option value="Athlete">Athlete</option>
                </select>
                <input type="date" value={actionDeadline} onChange={e=>setActionDeadline(e.target.value)} style={{marginLeft:5}}/>
                <Button size="sm" onClick={() => addAction(a.id, actionInput, actionAssign, actionDeadline)} style={{ marginLeft: 7, marginBottom: 6 }}>Add Action</Button>
              </div>
              {/* DOCS */}
              <div style={{marginBottom:8}}>
                <b>Docs:</b>
                <ul>
                  {a.docs.map((d,i)=>
                    <li key={i} style={{color:"#FFD700bb",fontSize:14}}><FaUpload style={{marginRight:5}}/>{d.name} <span style={{ color: "#FFD70077", fontSize: 11, marginLeft: 6 }}>({d.date})</span></li>
                  )}
                </ul>
                <input type="text" value={docName} onChange={e=>setDocName(e.target.value)} placeholder="Document name..." style={{width:"65%",borderRadius:8,border:"1px solid #FFD700",padding:5,marginRight:7}}/>
                <Button size="sm" onClick={()=>addDoc(a.id, docName)}><FaUpload style={{marginRight:4}}/>Attach</Button>
              </div>
              {/* BOARD CHAT/COMMENTS */}
              <div style={{marginBottom:10}}>
                <b>Board Comments:</b>
                <ul>
                  {a.comments.map((c,i)=>(
                    <li key={i} style={{color:"#FFD700bb",fontSize:14}}><FaComments style={{marginRight:6}}/>{c.text} <span style={{color:"#FFD70077",fontSize:12,marginLeft:6}}>({c.date})</span></li>
                  ))}
                </ul>
                <input type="text" placeholder="Add comment..." style={{width:"70%",borderRadius:8,border:"1px solid #FFD700",padding:5,marginRight:7}}/>
                <Button size="sm" onClick={()=>addComment(a.id,"This is a demo comment")}>Post</Button>
              </div>
              <Button onClick={() => setModal(null)} style={{ background: "#FF4848" }}>Close</Button>
            </div>
          </div>
        );
      })()}
      {/* CHAT DRAWER */}
      {chatDrawer && (
        <div style={{
          position:"fixed",top:0,right:0,bottom:0,
          width:360,background:"#232b39",color:"#FFD700",
          boxShadow:"-3px 0 32px #FFD70055",
          display:"flex",flexDirection:"column",zIndex:105
        }}>
          <div style={{padding:17,fontWeight:900,fontSize:20,borderBottom:"1.5px solid #FFD700",background:"#1a2334"}}><FaComments style={{marginRight:8}}/>Boardroom Chat</div>
          <div style={{flex:1,overflowY:"auto",padding:13}}>
            {chat.map((c,i)=>(
              <div key={i} style={{marginBottom:7,color:c.from==="Board"?"#FFD700":c.from==="Agent"?"#1de682":"#fff",fontWeight:700}}>
                <span style={{marginRight:7}}>{roles.find(r=>r.label===c.from)?.icon||<FaUser/>} <b>{c.from}</b></span> {c.text} <span style={{color:"#FFD70066",fontSize:12,marginLeft:5}}>{c.time}</span>
              </div>
            ))}
          </div>
          <div style={{padding:10,borderTop:"1.5px solid #FFD700",display:"flex",alignItems:"center"}}>
            <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Type a message..." style={{flex:1,borderRadius:8,border:"1.5px solid #FFD700",padding:7,marginRight:7}}/>
            <Button size="sm" onClick={()=>{ if(chatInput.length){ postChat(chatInput,"Board"); setChatInput("");}}}>Send</Button>
          </div>
        </div>
      )}
      {/* CSS Animation (demo) */}
      <style>{`
      @keyframes flash {
        0% { box-shadow: 0 0 0 #FFD700; }
        100% { box-shadow: 0 0 16px #FFD70099; }
      }
      @keyframes pulse {
        0% { box-shadow: 0 0 0 #FFD700; }
        100% { box-shadow: 0 0 14px #FFD70077; }
      }
      `}</style>
    </div>
  );
};

export default TransitionPathwaysBoard;
